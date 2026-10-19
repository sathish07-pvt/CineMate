import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const generateRoomCode = (): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  let code = 'CNM-';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 2; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { tmdbId, mediaType, title, posterPath, backdropPath, providerName, providerUrl } = req.body;

    if (!tmdbId || !title) {
      res.status(400).json({ success: false, message: 'Movie selection is required to create a watch room.' });
      return;
    }

    let roomCode = generateRoomCode();
    // Ensure uniqueness
    let exists = await prisma.watchRoom.findUnique({ where: { roomCode } });
    while (exists) {
      roomCode = generateRoomCode();
      exists = await prisma.watchRoom.findUnique({ where: { roomCode } });
    }

    const room = await prisma.watchRoom.create({
      data: {
        roomCode,
        hostId: req.user.id,
        tmdbId: parseInt(tmdbId, 10),
        mediaType: mediaType || 'movie',
        title,
        posterPath,
        backdropPath,
        providerName,
        providerUrl,
        participants: {
          create: {
            userId: req.user.id,
            isReady: true,
          },
        },
      },
      include: {
        host: {
          select: { id: true, username: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ success: false, message: 'Failed to create watch room.' });
  }
};

export const getRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;

    const room = await prisma.watchRoom.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        host: {
          select: { id: true, username: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Watch room not found.' });
      return;
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve watch room.' });
  }
};

export const getActiveRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.watchRoom.findMany({
      where: {
        status: { not: 'ENDED' },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { id: true, username: true, avatarUrl: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    console.error('Active rooms error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch active rooms.' });
  }
};
