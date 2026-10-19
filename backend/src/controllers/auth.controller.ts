import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cinemate_dev_secret_key_8923489234';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user: { id: string; username: string; email: string }) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatarUrl, preferredRegion } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { username: trimmedUsername }],
      },
    });

    if (existing) {
      if (existing.email === trimmedEmail) {
        res.status(409).json({ success: false, message: 'Email is already registered.' });
        return;
      }
      res.status(409).json({ success: false, message: 'Username is already taken.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const defaultAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedUsername}`;

    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        passwordHash,
        avatarUrl: defaultAvatar,
        preferredRegion: preferredRegion || 'US',
        bio: 'Movie enthusiast & CineMate explorer',
        favoriteGenres: '28,12,878', // Action, Adventure, Sci-Fi
        preferredLanguages: 'en',
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        preferredRegion: user.preferredRegion,
        preferredLanguages: user.preferredLanguages,
        favoriteGenres: user.favoriteGenres,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to create account.' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginKey = (identifier || email || username || '').trim();

    if (!loginKey || !password) {
      res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginKey.toLowerCase() },
          { username: loginKey },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        preferredRegion: user.preferredRegion,
        preferredLanguages: user.preferredLanguages,
        favoriteGenres: user.favoriteGenres,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            watchlist: true,
            reviews: true,
            sentFriendRequests: { where: { status: 'ACCEPTED' } },
            receivedFriendRequests: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        preferredRegion: user.preferredRegion,
        preferredLanguages: user.preferredLanguages,
        favoriteGenres: user.favoriteGenres,
        createdAt: user.createdAt,
        stats: {
          watchlistCount: user._count.watchlist,
          reviewsCount: user._count.reviews,
          friendsCount: user._count.sentFriendRequests + user._count.receivedFriendRequests,
        },
      },
    });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { bio, avatarUrl, preferredRegion, preferredLanguages, favoriteGenres } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(preferredRegion !== undefined && { preferredRegion }),
        ...(preferredLanguages !== undefined && { preferredLanguages }),
        ...(favoriteGenres !== undefined && { favoriteGenres }),
      },
    });

    res.status(200).json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        preferredRegion: updated.preferredRegion,
        preferredLanguages: updated.preferredLanguages,
        favoriteGenres: updated.favoriteGenres,
      },
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
