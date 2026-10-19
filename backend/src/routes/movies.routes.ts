import { Router } from 'express';
import {
  getLanguages,
  discover,
  getRankings,
  getTheatricalReleases,
  getNewOttReleases,
  getFeatured,
  getTrending,
  getPopularMovies,
  getPopularTv,
  getTopRated,
  getUpcoming,
  search,
  getSearchHistory,
  clearSearchHistory,
  getDetails,
  getWatchProviders,
  getMoodRecommendations,
  getMoodCatalog,
} from '../controllers/movies.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/languages', getLanguages);
router.get('/discover', discover);
router.get('/rankings', getRankings);
router.get('/theatrical', getTheatricalReleases);
router.get('/ott-releases', getNewOttReleases);
router.get('/featured', getFeatured);
router.get('/trending', getTrending);
router.get('/popular/movies', getPopularMovies);
router.get('/popular/tv', getPopularTv);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/search', optionalAuth, search);
router.get('/search/history', authenticateToken, getSearchHistory);
router.delete('/search/history', authenticateToken, clearSearchHistory);
router.get('/moods', getMoodCatalog);
router.get('/recommendations/mood', optionalAuth, getMoodRecommendations);
router.get('/:id', getDetails);
router.get('/:id/providers', getWatchProviders);

export default router;
