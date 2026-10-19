import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check, Trash2, PlusCircle } from 'lucide-react';
import { WatchlistItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const WatchlistPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWatched, setFilterWatched] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWatchlist = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const mediaType = filterType === 'all' ? undefined : filterType;
      const isWatched = filterWatched === 'all' ? undefined : filterWatched === 'watched';
      const res = await api.getWatchlist(mediaType, isWatched);
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Watchlist fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [isAuthenticated, filterType, filterWatched]);

  const handleRemove = async (id: string) => {
    try {
      await api.removeFromWatchlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const handleToggleWatched = async (item: WatchlistItem) => {
    try {
      const nextStatus = !item.isWatched;
      await api.updateWatchStatus(item.id, nextStatus);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isWatched: nextStatus } : i))
      );
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-cinemate-accent/10 border border-cinemate-accent/30 flex items-center justify-center mx-auto text-cinemate-accent">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Your Personal Watchlist</h2>
        <p className="text-xs text-slate-400">
          Sign in to save movies and TV shows, track what you've watched, and synchronize across all your devices.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all"
        >
          Sign In to View Watchlist
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-cinemate-accent" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {items.length} titles saved in your library
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Content Type Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'movie', 'tv'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  filterType === t
                    ? 'bg-cinemate-accent text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'Series'}
              </button>
            ))}
          </div>

          {/* Watch status filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'unwatched', label: 'To Watch' },
              { id: 'watched', label: 'Watched' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterWatched(s.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterWatched === s.id
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Watchlist Items */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-2xl overflow-hidden glass-panel glass-panel-hover"
            >
              <Link to={`/${item.mediaType}/${item.tmdbId}`} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
                <img
                  src={
                    item.posterPath
                      ? item.posterPath.startsWith('http')
                        ? item.posterPath
                        : `https://image.tmdb.org/t/p/w500${item.posterPath}`
                      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
                  }
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                  {item.mediaType === 'tv' ? 'Series' : 'Movie'}
                </span>

                {item.isWatched && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow">
                    Watched
                  </span>
                )}
              </Link>

              <div className="p-3 flex flex-col flex-1 justify-between">
                <Link to={`/${item.mediaType}/${item.tmdbId}`}>
                  <h3 className="font-semibold text-xs text-slate-100 group-hover:text-cinemate-accent transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </Link>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleWatched(item)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      item.isWatched
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{item.isWatched ? 'Watched' : 'Watch'}</span>
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3 max-w-md mx-auto">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Your Watchlist is empty</h3>
          <p className="text-xs text-slate-400">
            Discover movies, explore moods, and tap the bookmark button to build your personal viewing queue.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cinemate-accent text-white hover:bg-purple-600 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Discover Titles to Add</span>
          </Link>
        </div>
      )}
    </div>
  );
};
