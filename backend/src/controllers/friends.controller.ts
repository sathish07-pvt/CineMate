import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    const currentUserId = req.user?.id;

    if (!q.trim()) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q.trim(),
        },
        ...(currentUserId && {
          id: { not: currentUserId },
        }),
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
      take: 20,
    });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ success: false, message: 'Failed to search users.' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    // Fetch accepted friendships where user is sender or receiver
    const sent = await prisma.friendship.findMany({
      where: { senderId: userId, status: 'ACCEPTED' },
      include: {
        receiver: {
          select: { id: true, username: true, avatarUrl: true, bio: true, preferredRegion: true },
        },
      },
    });

    const received = await prisma.friendship.findMany({
      where: { receiverId: userId, status: 'ACCEPTED' },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true, bio: true, preferredRegion: true },
        },
      },
    });

    const friends = [
      ...sent.map((f) => ({ friendshipId: f.id, user: f.receiver, since: f.createdAt })),
      ...received.map((f) => ({ friendshipId: f.id, user: f.sender, since: f.createdAt })),
    ];

    res.status(200).json({ success: true, count: friends.length, data: friends });
  } catch (err) {
    console.error('Get friends error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve friends.' });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const incoming = await prisma.friendship.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const outgoing = await prisma.friendship.findMany({
      where: { senderId: req.user.id, status: 'PENDING' },
      include: {
        receiver: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, incoming, outgoing });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve requests.' });
  }
};

export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === req.user.id) {
      res.status(400).json({ success: false, message: 'Invalid target user ID.' });
      return;
    }

    // Check existing
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: req.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        res.status(409).json({ success: false, message: 'You are already friends with this user.' });
        return;
      }
      if (existing.status === 'PENDING') {
        res.status(409).json({ success: false, message: 'A friend request is already pending.' });
        return;
      }
    }

    const request = await prisma.friendship.create({
      data: {
        senderId: req.user.id,
        receiverId: targetUserId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json({ success: true, message: 'Friend request sent.', data: request });
  } catch (err) {
    console.error('Send request error:', err);
    res.status(500).json({ success: false, message: 'Failed to send friend request.' });
  }
};

export const respondFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'DECLINE'

    const request = await prisma.friendship.findUnique({ where: { id } });

    if (!request || request.receiverId !== req.user.id) {
      res.status(404).json({ success: false, message: 'Friend request not found.' });
      return;
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.friendship.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });
      res.status(200).json({ success: true, message: 'Friend request accepted.', data: updated });
    } else {
      await prisma.friendship.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Friend request declined.' });
    }
  } catch (err) {
    console.error('Respond request error:', err);
    res.status(500).json({ success: false, message: 'Failed to respond to request.' });
  }
};
