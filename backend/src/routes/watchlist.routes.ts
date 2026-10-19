import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchStatus,
  checkWatchlistStatus,
} from '../controllers/watchlist.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getWatchlist);
router.post('/', authenticateToken, addToWatchlist);
router.delete('/:id?', authenticateToken, removeFromWatchlist);
router.patch('/:id/status', authenticateToken, updateWatchStatus);
router.get('/check/:tmdbId', optionalAuth, checkWatchlistStatus);

export default router;
