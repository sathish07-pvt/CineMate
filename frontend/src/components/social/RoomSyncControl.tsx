import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Circle, Clock, ExternalLink, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WatchRoom } from '../../types';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

interface RoomSyncControlProps {
  room: WatchRoom;
  isHost: boolean;
  onRefreshRoom?: () => void;
}

export const RoomSyncControl: React.FC<RoomSyncControlProps> = ({ room, isHost, onRefreshRoom }) => {
  const { user } = useAuth();
  const socket = getSocket();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Check if current user is ready in participants list
    if (user && room.participants) {
      const p = room.participants.find((part) => part.userId === user.id);
      if (p) setIsReady(p.isReady);
    }
  }, [user, room]);

  useEffect(() => {
    // Listen for countdown ticks
    const handleCountdownTick = ({ count, status }: { count: number; status?: string }) => {
      setCountdown(count);
      if (count === 0 || status === 'PLAY') {
        setIsPlaying(true);
        setCountdown(0);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => setCountdown(null), 3500);
      }
    };

    const handlePlaybackSynced = ({ state }: { state: 'PLAY' | 'PAUSE' }) => {
      setIsPlaying(state === 'PLAY');
    };

    const handleReadyStatusChanged = ({ userId, isReady: status }: { userId: string; isReady: boolean }) => {
      if (user && userId === user.id) {
        setIsReady(status);
      }
      if (onRefreshRoom) onRefreshRoom();
    };

    socket.on('countdown_tick', handleCountdownTick);
    socket.on('playback_synced', handlePlaybackSynced);
    socket.on('ready_status_changed', handleReadyStatusChanged);

    return () => {
      socket.off('countdown_tick', handleCountdownTick);
      socket.off('playback_synced', handlePlaybackSynced);
      socket.off('ready_status_changed', handleReadyStatusChanged);
    };
  }, [socket, user, onRefreshRoom]);

  const handleToggleReady = () => {
    if (!user) return;
    const nextStatus = !isReady;
    setIsReady(nextStatus);
    socket.emit('toggle_ready', {
      roomCode: room.roomCode,
      userId: user.id,
      isReady: nextStatus,
    });
  };

  const handleStartCountdown = () => {
    socket.emit('start_countdown', { roomCode: room.roomCode });
  };

  const handleBroadcastSync = (state: 'PLAY' | 'PAUSE') => {
    setIsPlaying(state === 'PLAY');
    socket.emit('sync_playback', {
      roomCode: room.roomCode,
      state,
      timestamp: 0,
    });
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-cinemate-border/70 space-y-6">
      {/* Countdown Big Display */}
      {countdown !== null && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cinemate-accent/30 via-cinemate-cyan/20 to-cinemate-accent/30 border border-cinemate-accent/60 text-center animate-bounce">
          <div className="text-xs uppercase font-extrabold tracking-widest text-cinemate-cyan mb-1">
            Synchronized Start Countdown
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white">
            {countdown > 0 ? countdown : '🚀 PLAY NOW!'}
          </div>
          <p className="text-xs text-slate-300 mt-2">
            {countdown > 0 ? 'Get your stream ready to press play!' : 'Start your movie playback now!'}
          </p>
        </div>
      )}

      {/* Synchronized status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-extrabold text-base text-white">Synchronized Viewing Hub</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sync playback status across remote screens with your watch-party friends
          </p>
        </div>

        {/* Ready status toggle */}
        <button
          onClick={handleToggleReady}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isReady
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
          }`}
        >
          {isReady ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
          <span>{isReady ? 'You Are Ready!' : 'Mark as Ready'}</span>
        </button>
      </div>

      {/* OTT Launch Button */}
      {room.providerUrl && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinemate-accent/10 border border-cinemate-accent/20">
              <Zap className="w-5 h-5 text-cinemate-accent" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Watch on {room.providerName || 'Streaming Provider'}</p>
              <p className="text-[11px] text-slate-400">Open the title in your authorized provider window</p>
            </div>
          </div>
          <a
            href={room.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/20 transition-all"
          >
            <span>Launch Stream</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Host Controls */}
      {isHost && (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cinemate-cyan uppercase tracking-wider">
              Host Sync Controls
            </span>
            <span className="text-[10px] text-slate-400">You are the room host</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleStartCountdown}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cinemate-accent to-purple-600 text-white shadow-lg shadow-cinemate-accent/30 hover:scale-105 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>5s Sync Countdown</span>
            </button>

            <button
              onClick={() => handleBroadcastSync(isPlaying ? 'PAUSE' : 'PLAY')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Broadcast Pause' : 'Broadcast Play'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Participants Ready Matrix */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Participants ({room.participants?.length || 1})
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {room.participants?.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border ${
                p.isReady
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <img
                src={p.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user?.username}`}
                alt={p.user?.username}
                className="w-5 h-5 rounded-md object-cover"
              />
              <span className="font-semibold text-slate-200">{p.user?.username}</span>
              <span className="text-[10px]">{p.isReady ? '✓ Ready' : '• Preparing'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
