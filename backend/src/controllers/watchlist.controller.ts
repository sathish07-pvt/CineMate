import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { mediaType, isWatched } = req.query;

    const whereClause: any = { userId: req.user.id };

    if (mediaType && (mediaType === 'movie' || mediaType === 'tv')) {
      whereClause.mediaType = mediaType;
    }

    if (isWatched !== undefined && isWatched !== '') {
      whereClause.isWatched = isWatched === 'true';
    }

    const items = await prisma.watchlistItem.findMany({
      where: whereClause,
      orderBy: { addedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('Get watchlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve watchlist.' });
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { tmdbId, mediaType, title, posterPath, backdropPath, voteAverage, releaseDate } = req.body;

    if (!tmdbId || !title) {
      res.status(400).json({ success: false, message: 'tmdbId and title are required.' });
      return;
    }

    const mType = mediaType || 'movie';
    const numId = parseInt(tmdbId, 10);

    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbId_mediaType: {
          userId: req.user.id,
          tmdbId: numId,
          mediaType: mType,
        },
      },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'Already in your watchlist.', data: existing });
      return;
    }

    const item = await prisma.watchlistItem.create({
      data: {
        userId: req.user.id,
        tmdbId: numId,
        mediaType: mType,
        title,
        posterPath,
        backdropPath,
        voteAverage: voteAverage ? parseFloat(voteAverage) : 0,
        releaseDate,
        isWatched: false,
      },
    });

    // Record user activity
    await prisma.userActivity.create({
      data: {
        userId: req.user.id,
        type: 'WATCHLIST',
        title: `Added "${title}" to watchlist`,
        mediaId: numId,
      },
    });

    res.status(201).json({ success: true, message: 'Added to watchlist.', data: item });
  } catch (err) {
    console.error('Add to watchlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to add to watchlist.' });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { tmdbId, mediaType } = req.query;

    if (id) {
      await prisma.watchlistItem.deleteMany({
        where: { id, userId: req.user.id },
      });
    } else if (tmdbId) {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId: req.user.id,
          tmdbId: parseInt(tmdbId as string, 10),
          ...(mediaType && { mediaType: mediaType as string }),
        },
      });
    }

    res.status(200).json({ success: true, message: 'Removed from watchlist.' });
  } catch (err) {
    console.error('Remove from watchlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove from watchlist.' });
  }
};

export const updateWatchStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { isWatched } = req.body;

    const updated = await prisma.watchlistItem.updateMany({
      where: { id, userId: req.user.id },
      data: { isWatched: Boolean(isWatched) },
    });

    res.status(200).json({ success: true, message: 'Watch status updated.', data: updated });
  } catch (err) {
    console.error('Update watch status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update watch status.' });
  }
};

export const checkWatchlistStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ success: true, inWatchlist: false, isWatched: false });
      return;
    }

    const tmdbId = parseInt(req.params.tmdbId, 10);
    const mediaType = (req.query.type as string) || 'movie';

    const item = await prisma.watchlistItem.findUnique({
      where: {
        userId_tmdbId_mediaType: {
          userId: req.user.id,
          tmdbId,
          mediaType,
        },
      },
    });

    res.status(200).json({
      success: true,
      inWatchlist: Boolean(item),
      isWatched: item ? item.isWatched : false,
      item,
    });
  } catch (err) {
    console.error('Check watchlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to check status.' });
  }
};
