import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Bookmark, Users } from 'lucide-react';
import { Movie } from '../../types';

interface HeroSpotlightProps {
  movie: Movie;
  onWatchlistToggle?: () => void;
  isInWatchlist?: boolean;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ movie, onWatchlistToggle, isInWatchlist = false }) => {
  const displayTitle = movie.title || movie.name || 'Featured Title';
  const releaseYear = (movie.release_date || movie.first_air_date || '').substring(0, 4);
  const backdropUrl = movie.backdrop_path
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="relative w-full h-[65vh] min-h-[480px] max-h-[720px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 mb-12">
      {/* Background Image */}
      <img
        src={backdropUrl}
        alt={displayTitle}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 animate-pulse-subtle"
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinemate-darkest via-cinemate-darkest/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinemate-darkest via-cinemate-darkest/80 to-transparent max-w-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 max-w-2xl">
        {/* Badges */}
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-cinemate-accent/90 text-white shadow-lg shadow-cinemate-accent/30">
            Featured Spotlight
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : '8.4'}</span>
          </div>
          <span className="text-xs font-medium text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
            {releaseYear}
          </span>
          {movie.runtime && (
            <span className="text-xs font-medium text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          {displayTitle}
        </h1>

        {/* Tagline */}
        {movie.tagline && (
          <p className="text-sm sm:text-base font-medium text-cinemate-cyan mb-3 italic">
            "{movie.tagline}"
          </p>
        )}

        {/* Overview */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-6 leading-relaxed max-w-xl">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={`/${movie.media_type || 'movie'}/${movie.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cinemate-accent to-purple-600 hover:from-purple-600 hover:to-cinemate-accent text-white shadow-xl shadow-cinemate-accent/30 hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch Trailer & Details</span>
          </Link>

          <Link
            to={`/rooms?movieId=${movie.id}`}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:text-white backdrop-blur-md transition-all"
          >
            <Users className="w-4 h-4 text-cinemate-cyan" />
            <span>Host Watch Party</span>
          </Link>

          {onWatchlistToggle && (
            <button
              onClick={onWatchlistToggle}
              className={`p-3 rounded-xl border backdrop-blur-md transition-all ${
                isInWatchlist
                  ? 'bg-cinemate-accent text-white border-cinemate-accent shadow-lg shadow-cinemate-accent/30'
                  : 'bg-black/60 text-slate-300 hover:text-white border-slate-700 hover:border-slate-500'
              }`}
              title={isInWatchlist ? 'In your Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
