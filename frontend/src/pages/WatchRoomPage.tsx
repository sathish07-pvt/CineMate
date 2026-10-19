import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ShieldAlert } from 'lucide-react';
import { WatchRoom } from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { RoomSyncControl } from '../components/social/RoomSyncControl';
import { RoomChat } from '../components/social/RoomChat';

export const WatchRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const socket = getSocket();

  const [room, setRoom] = useState<WatchRoom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadRoom = async () => {
    if (!roomCode) return;
    try {
      const res = await api.getRoom(roomCode);
      if (res.success && res.data) {
        setRoom(res.data);
      } else {
        setErrorMsg('Watch room not found.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load room details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || !user) return;

    // Join room over websocket
    socket.emit('join_room', {
      roomCode,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    });

    const handleUserJoined = () => {
      loadRoom();
    };

    const handleUserLeft = () => {
      loadRoom();
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.emit('leave_room', {
        roomCode,
        user: {
          id: user.id,
          username: user.username,
        },
      });
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, roomCode, user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Connecting to watch party room...</p>
      </div>
    );
  }

  if (errorMsg || !room) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Room Unavailable</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'This watch room does not exist or has expired.'}</p>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rooms</span>
        </Link>
      </div>
    );
  }

  const isHost = Boolean(user && user.id === room.hostId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/rooms"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cinemate-accent/20 text-cinemate-accent text-xs font-mono font-bold border border-cinemate-accent/30">
                {room.roomCode}
              </span>
              <h1 className="text-lg font-extrabold text-white">{room.title}</h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Hosted by <span className="text-slate-200 font-semibold">@{room.host?.username}</span>
            </p>
          </div>
        </div>

        {/* Share Room Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Left (Sync Control & Movie info), Right (Real-time Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Sync Controller */}
        <div className="lg:col-span-2 space-y-6">
          <RoomSyncControl room={room} isHost={isHost} onRefreshRoom={loadRoom} />

          {/* Title Info Card */}
          <div className="glass-panel p-5 rounded-3xl border border-cinemate-border/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                <img
                  src={room.posterPath || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80'}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{room.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Selected watch party title</p>
              </div>
            </div>

            <Link
              to={`/${room.mediaType || 'movie'}/${room.tmdbId}`}
              className="text-xs font-bold text-cinemate-cyan hover:underline"
            >
              View Movie Details ↗
            </Link>
          </div>
        </div>

        {/* Right Side: Real-time Chat */}
        <div className="lg:col-span-1">
          <RoomChat roomCode={room.roomCode} initialMessages={room.messages} />
        </div>
      </div>
    </div>
  );
};
