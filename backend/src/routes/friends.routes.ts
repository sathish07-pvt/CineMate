import { Router } from 'express';
import {
  searchUsers,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  respondFriendRequest,
} from '../controllers/friends.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/search', optionalAuth, searchUsers);
router.get('/', authenticateToken, getFriends);
router.get('/requests', authenticateToken, getFriendRequests);
router.post('/request', authenticateToken, sendFriendRequest);
router.post('/request/:id/respond', authenticateToken, respondFriendRequest);

export default router;
