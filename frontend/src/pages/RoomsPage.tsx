import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Video, Plus, KeyRound, Users, ArrowRight } from 'lucide-react';
import { WatchRoom } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RoomsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const movieIdParam = searchParams.get('movieId');
  const titleParam = searchParams.get('title') || '';
  const posterParam = searchParams.get('poster') || '';

  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [activeRooms, setActiveRooms] = useState<WatchRoom[]>([]);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(titleParam || 'Interstellar');
  const [newTmdbId, setNewTmdbId] = useState<string>(movieIdParam || '157336');
  const [newProviderUrl, setNewProviderUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadRooms = async () => {
      try {
        const res = await api.getActiveRooms();
        if (isMounted && res.success) {
          setActiveRooms(res.data);
        }
      } catch (err) {
        console.error('Failed to load active rooms:', err);
      }
    };
    loadRooms();
    return () => { isMounted = false; };
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      navigate(`/room/${roomCodeInput.trim().toUpperCase()}`);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createRoom({
        tmdbId: parseInt(newTmdbId, 10) || 157336,
        title: newTitle.trim() || 'Watch Party',
        posterPath: posterParam || null,
        providerUrl: newProviderUrl.trim() || undefined,
        providerName: newProviderUrl ? 'Streaming Provider' : undefined,
      });

      if (res.success && res.data) {
        navigate(`/room/${res.data.roomCode}`);
      }
    } catch (err) {
      console.error('Room creation failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-cinemate-border/70 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-gradient-to-tr from-cinemate-accent/20 to-cinemate-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinemate-cyan/15 border border-cinemate-cyan/30 text-cinemate-cyan text-xs font-bold">
            <Video className="w-3.5 h-3.5" />
            <span>Social Watch Together Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Watch Movies Together, Anywhere
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create synchronized watch-together parties with friends. Enjoy live chat, real-time emoji reactions, and countdown clocks to sync your playback across screens.
          </p>

          {/* Quick Join by Code */}
          <form onSubmit={handleJoinByCode} className="pt-2 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="Enter 6-char Room Code (e.g. CNM-777)..."
                className="w-full bg-slate-900/90 text-xs font-mono uppercase tracking-wider text-white placeholder-slate-500 pl-9 pr-3 py-3 rounded-xl border border-slate-700 focus:border-cinemate-accent focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all flex-shrink-0"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Room Form (Left 1 Col) */}
        <div className="glass-panel p-6 rounded-3xl border border-cinemate-border/70 space-y-4 h-fit">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-cinemate-accent" />
            <h3 className="font-extrabold text-base text-white">Create a New Room</h3>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Movie / Series Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Interstellar, Dune, Inception"
                className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-cinemate-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">TMDB ID</label>
              <input
                type="number"
                required
                value={newTmdbId}
                onChange={(e) => setNewTmdbId(e.target.value)}
                placeholder="e.g. 157336"
                className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-cinemate-accent"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Streaming Link (Optional)</label>
              <input
                type="url"
                value={newProviderUrl}
                onChange={(e) => setNewProviderUrl(e.target.value)}
                placeholder="e.g. https://www.netflix.com/..."
                className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-cinemate-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cinemate-accent to-purple-600 hover:from-purple-600 hover:to-cinemate-accent text-white shadow-xl shadow-cinemate-accent/30 transition-all disabled:opacity-50"
            >
              {isCreating ? 'Launching Room...' : 'Start Watch Party'}
            </button>
          </form>
        </div>

        {/* Active Public Rooms (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cinemate-cyan" />
              <span>Active Watch Parties</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{activeRooms.length} rooms live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                className="glass-panel p-5 rounded-2xl border border-cinemate-border/70 hover:border-cinemate-accent/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-cinemate-accent/15 text-cinemate-accent text-[10px] font-mono font-bold">
                      {room.roomCode}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1 line-clamp-1">{room.title}</h4>
                    <p className="text-[11px] text-slate-400">Host: @{room.host?.username || 'user'}</p>
                  </div>

                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{room._count?.participants || room.participants?.length || 1} watching</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Created {new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Link
                    to={`/room/${room.roomCode}`}
                    className="flex items-center gap-1 text-xs font-bold text-cinemate-cyan hover:underline"
                  >
                    <span>Enter Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
