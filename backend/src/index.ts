import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import moviesRoutes from './routes/movies.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import { registerRoomSockets } from './socket/room.socket.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerRoomSockets(io);

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'CineMate API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/rooms', roomsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Server error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎬 CineMate Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO connected & listening for Watch Rooms`);
    console.log(`=======================================================`);
  });
}

export { app, server };
