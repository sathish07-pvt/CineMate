import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { tmdbService } from '../services/tmdb.service.js';
import { recommendationService, MOOD_DEFINITIONS } from '../services/recommendation.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getLanguages = (req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: tmdbService.getLanguages() });
};

export const getFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = req.query.language as string | undefined;
    const featured = await tmdbService.getFeatured(language);
    res.status(200).json({ success: true, data: featured });
  } catch (err) {
    console.error('Featured error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch featured title.' });
  }
};

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as 'all' | 'movie' | 'tv') || 'all';
    const timeWindow = (req.query.timeWindow as 'day' | 'week') || 'day';
    const language = req.query.language as string | undefined;

    const trending = await tmdbService.getTrending(timeWindow, type, language);
    res.status(200).json({ success: true, data: trending });
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trending titles.' });
  }
};

export const getPopularMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const language = req.query.language as string | undefined;

    const movies = await tmdbService.getPopularMovies(page, language);
    res.status(200).json({ success: true, data: movies });
  } catch (err) {
    console.error('Popular movies error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch popular movies.' });
  }
};

export const getPopularTv = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const language = req.query.language as string | undefined;

    const tvShows = await tmdbService.getPopularTv(page, language);
    res.status(200).json({ success: true, data: tvShows });
  } catch (err) {
    console.error('Popular TV error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch popular TV series.' });
  }
};

export const getTopRated = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as 'movie' | 'tv') || 'movie';
    const page = parseInt(req.query.page as string, 10) || 1;
    const language = req.query.language as string | undefined;

    const items = await tmdbService.getTopRated(type, page, language);
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('Top rated error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch top rated titles.' });
  }
};

export const getUpcoming = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const upcoming = await tmdbService.getUpcomingMovies(page);
    res.status(200).json({ success: true, data: upcoming });
  } catch (err) {
    console.error('Upcoming error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming titles.' });
  }
};

// Global Discover Endpoint with Language, Sort, Filter & Pagination
export const discover = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = req.query.language as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const genreId = req.query.genreId ? parseInt(req.query.genreId as string, 10) : undefined;
    const year = req.query.year as string | undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const region = (req.query.region as string) || 'IN';

    const result = await tmdbService.discoverMovies({
      language,
      sortBy,
      page,
      genreId,
      year,
      minRating,
      region,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ success: false, message: 'Failed to discover movies.' });
  }
};

// Regional Language Rankings (Top 10 / Top 50)
export const getRankings = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = (req.query.language as string) || 'ta';
    const type = (req.query.type as 'top10' | 'top50') || 'top10';
    const sortBy = (req.query.sortBy as any) || 'vote_average.desc';
    const page = parseInt(req.query.page as string, 10) || 1;

    const rankings = await tmdbService.getRankings({ language, type, sortBy, page });
    res.status(200).json({ success: true, ...rankings });
  } catch (err) {
    console.error('Rankings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch regional rankings.' });
  }
};

// New Theatrical Releases
export const getTheatricalReleases = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = req.query.language as string | undefined;
    const region = (req.query.region as string) || 'IN';
    const page = parseInt(req.query.page as string, 10) || 1;

    const data = await tmdbService.getTheatricalReleases(language, region, page);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('Theatrical releases error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch theatrical releases.' });
  }
};

// New OTT Releases
export const getNewOttReleases = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = req.query.language as string | undefined;
    const region = (req.query.region as string) || 'IN';
    const page = parseInt(req.query.page as string, 10) || 1;

    const data = await tmdbService.getNewOttReleases(language, region, page);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('OTT releases error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch OTT releases.' });
  }
};

// Universal Search with Language Priority Ranking
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    const type = (req.query.type as 'all' | 'movie' | 'tv') || 'all';
    const page = parseInt(req.query.page as string, 10) || 1;
    const genreId = req.query.genreId ? parseInt(req.query.genreId as string, 10) : undefined;
    const year = req.query.year as string | undefined;
    const language = req.query.language as string | undefined;

    const results = await tmdbService.search(q, type, page, genreId, year, language);

    // Asynchronously record search in user history if authenticated
    const authUser = (req as AuthRequest).user;
    if (authUser?.id && q.trim().length > 1) {
      prisma.searchHistory.create({
        data: {
          userId: authUser.id,
          query: q.trim(),
          language: language || null,
        },
      }).catch(err => {
        console.error('Failed to record search history:', err);
      });
    }

    res.status(200).json({ success: true, ...results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Failed to execute search.' });
  }
};

export const getSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error('Search history error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch search history.' });
  }
};

export const clearSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await prisma.searchHistory.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(200).json({ success: true, message: 'Search history cleared.' });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear search history.' });
  }
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const mediaType = (req.query.type as 'movie' | 'tv') || 'movie';
    const region = (req.query.region as string) || 'IN';

    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid movie/series ID.' });
      return;
    }

    const details = await tmdbService.getDetails(id, mediaType, region);
    if (!details) {
      res.status(404).json({ success: false, message: 'Title details not found.' });
      return;
    }

    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.error('Details error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch movie details.' });
  }
};

export const getWatchProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const mediaType = (req.query.type as 'movie' | 'tv') || 'movie';
    const region = (req.query.region as string) || 'IN';

    const providers = await tmdbService.getWatchProviders(id, mediaType, region);
    res.status(200).json({ success: true, data: providers });
  } catch (err) {
    console.error('Providers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch watch providers.' });
  }
};

export const getMoodRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mood = (req.query.mood as string) || 'happy';
    const language = req.query.language as string | undefined;
    const userId = req.user?.id;

    const recommendations = await recommendationService.getRecommendationsForMood(mood, userId, language);
    res.status(200).json({
      success: true,
      mood: MOOD_DEFINITIONS[mood.toLowerCase()] || MOOD_DEFINITIONS['happy'],
      data: recommendations,
    });
  } catch (err) {
    console.error('Mood recommendations error:', err);
    res.status(500).json({ success: false, message: 'Failed to compute mood recommendations.' });
  }
};

export const getMoodCatalog = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: Object.values(MOOD_DEFINITIONS),
  });
};
