import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getMovieReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const mediaType = (req.query.type as string) || 'movie';

    if (isNaN(tmdbId)) {
      res.status(400).json({ success: false, message: 'Invalid tmdbId' });
      return;
    }

    const reviews = await prisma.movieReview.findMany({
      where: {
        tmdbId,
        mediaType,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute CineMate community average
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const communityAverage = reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : null;

    res.status(200).json({
      success: true,
      count: reviews.length,
      communityAverage,
      data: reviews,
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { tmdbId, mediaType, title, posterPath, rating, content } = req.body;

    if (!tmdbId || !rating || !content || !title) {
      res.status(400).json({ success: false, message: 'tmdbId, title, rating, and content are required.' });
      return;
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 10.' });
      return;
    }

    if (content.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Review content must be at least 5 characters.' });
      return;
    }

    const numId = parseInt(tmdbId, 10);
    const mType = mediaType || 'movie';

    // Upsert review (allows creating or updating one's review for a title)
    const review = await prisma.movieReview.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: req.user.id,
          tmdbId: numId,
          mediaType: mType,
        },
      },
      update: {
        rating: numRating,
        content: content.trim(),
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        tmdbId: numId,
        mediaType: mType,
        title,
        posterPath,
        rating: numRating,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Record activity
    await prisma.userActivity.create({
      data: {
        userId: req.user.id,
        type: 'REVIEW',
        title: `Rated "${title}" ${numRating}/10`,
        mediaId: numId,
        details: content.trim().substring(0, 100),
      },
    });

    res.status(201).json({ success: true, message: 'Review saved.', data: review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const review = await prisma.movieReview.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    if (review.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'You can only delete your own reviews.' });
      return;
    }

    await prisma.movieReview.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

export const getRecentReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const reviews = await prisma.movieReview.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error('Recent reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch community feed.' });
  }
};
