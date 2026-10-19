import { Router } from 'express';
import { createRoom, getRoom, getActiveRooms } from '../controllers/rooms.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateToken, createRoom);
router.get('/active', optionalAuth, getActiveRooms);
router.get('/:roomCode', optionalAuth, getRoom);

export default router;
