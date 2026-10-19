import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma.js';

interface UserPayload {
  id: string;
  username: string;
  avatarUrl?: string;
}

export const registerRoomSockets = (io: Server) => {
  const activeRooms = new Map<string, { countdownTimer?: NodeJS.Timeout }>();

  io.on('connection', (socket: Socket) => {
    // Join room
    socket.on('join_room', async ({ roomCode, user }: { roomCode: string; user: UserPayload }) => {
      const code = roomCode.toUpperCase();
      socket.join(code);

      // Add to database participants if user exists
      try {
        const room = await prisma.watchRoom.findUnique({ where: { roomCode: code } });
        if (room && user?.id) {
          await prisma.roomParticipant.upsert({
            where: {
              roomId_userId: {
                roomId: room.id,
                userId: user.id,
              },
            },
            update: {},
            create: {
              roomId: room.id,
              userId: user.id,
              isReady: false,
            },
          });
        }
      } catch (err) {
        console.error('Socket join_room error:', err);
      }

      // Notify other participants in the room
      io.to(code).emit('user_joined', {
        user,
        message: `${user?.username || 'A viewer'} joined the room.`,
      });
    });

    // Toggle Ready status
    socket.on('toggle_ready', async ({ roomCode, userId, isReady }: { roomCode: string; userId: string; isReady: boolean }) => {
      const code = roomCode.toUpperCase();
      try {
        const room = await prisma.watchRoom.findUnique({ where: { roomCode: code } });
        if (room && userId) {
          await prisma.roomParticipant.updateMany({
            where: { roomId: room.id, userId },
            data: { isReady },
          });
        }
      } catch (err) {
        console.error('Toggle ready error:', err);
      }

      io.to(code).emit('ready_status_changed', { userId, isReady });
    });

    // Start Synchronized Countdown (5, 4, 3, 2, 1, Go!)
    socket.on('start_countdown', ({ roomCode }: { roomCode: string }) => {
      const code = roomCode.toUpperCase();
      let count = 5;

      io.to(code).emit('countdown_tick', { count });

      const roomState = activeRooms.get(code) || {};
      if (roomState.countdownTimer) {
        clearInterval(roomState.countdownTimer);
      }

      const timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          io.to(code).emit('countdown_tick', { count });
        } else if (count === 0) {
          io.to(code).emit('countdown_tick', { count: 0, status: 'PLAY' });
          clearInterval(timer);
          activeRooms.delete(code);
        }
      }, 1000);

      activeRooms.set(code, { countdownTimer: timer });
    });

    // Broadcast playback sync event (Host pressed Play / Pause or jumped to timestamp)
    socket.on('sync_playback', ({ roomCode, state, timestamp }: { roomCode: string; state: 'PLAY' | 'PAUSE'; timestamp: number }) => {
      const code = roomCode.toUpperCase();
      io.to(code).emit('playback_synced', { state, timestamp });
    });

    // Send real-time chat message or emoji reaction
    socket.on('send_message', async ({ roomCode, user, content, type = 'CHAT' }: {
      roomCode: string;
      user: UserPayload;
      content: string;
      type?: 'CHAT' | 'REACTION';
    }) => {
      const code = roomCode.toUpperCase();

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roomId: code,
        userId: user?.id,
        user: {
          id: user?.id,
          username: user?.username || 'Guest',
          avatarUrl: user?.avatarUrl,
        },
        type,
        content,
        createdAt: new Date().toISOString(),
      };

      // Persist to DB if room and user exist
      try {
        const room = await prisma.watchRoom.findUnique({ where: { roomCode: code } });
        if (room && user?.id) {
          await prisma.chatMessage.create({
            data: {
              roomId: room.id,
              userId: user.id,
              content,
              type,
            },
          });
        }
      } catch (err) {
        console.error('Persist chat message error:', err);
      }

      io.to(code).emit('new_message', messageObj);
    });

    // Leave room
    socket.on('leave_room', ({ roomCode, user }: { roomCode: string; user: UserPayload }) => {
      const code = roomCode.toUpperCase();
      socket.leave(code);
      io.to(code).emit('user_left', {
        user,
        message: `${user?.username || 'A viewer'} left the room.`,
      });
    });

    socket.on('disconnect', () => {
      // Disconnect cleanup
    });
  });
};
