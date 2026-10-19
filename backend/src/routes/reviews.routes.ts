import { Router } from 'express';
import {
  getMovieReviews,
  createReview,
  deleteReview,
  getRecentReviews,
} from '../controllers/reviews.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/movie/:tmdbId', getMovieReviews);
router.get('/recent', getRecentReviews);
router.post('/', authenticateToken, createReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
