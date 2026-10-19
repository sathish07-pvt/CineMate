import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check } from 'lucide-react';
import { Movie } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface MovieCardProps {
  movie: Movie;
  initiallyInWatchlist?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, initiallyInWatchlist = false }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(initiallyInWatchlist);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const displayTitle = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').substring(0, 4);
  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      if (inWatchlist) {
        await api.removeFromWatchlist(undefined, movie.id, movie.media_type);
        setInWatchlist(false);
      } else {
        await api.addToWatchlist({
          tmdbId: movie.id,
          mediaType: movie.media_type,
          title: displayTitle,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          voteAverage: movie.vote_average,
          releaseDate: movie.release_date || movie.first_air_date,
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden glass-panel glass-panel-hover">
      <Link to={`/${movie.media_type || 'movie'}/${movie.id}`} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={posterUrl}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinemate-darkest via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Content Type Badge */}
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60 shadow">
          {movie.media_type === 'tv' ? 'Series' : 'Movie'}
        </span>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-black/75 backdrop-blur-md border border-amber-500/30 text-amber-400 shadow">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
        </div>

        {/* Quick Watchlist Bookmark Button */}
        <button
          onClick={handleToggleWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute bottom-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all duration-200 z-10 ${
            inWatchlist
              ? 'bg-cinemate-accent text-white shadow-lg shadow-cinemate-accent/40'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-cinemate-accent hover:scale-110'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[3px]" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Match score / recommendation reason pill */}
        {movie.matchScore && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cinemate-accent/90 text-white backdrop-blur-md shadow">
            {movie.matchScore}% Match
          </div>
        )}
      </Link>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <Link to={`/${movie.media_type || 'movie'}/${movie.id}`}>
          <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cinemate-accent transition-colors line-clamp-1">
            {displayTitle}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <span>{releaseYear || 'Coming soon'}</span>
          {movie.recommendationReason && (
            <span className="text-[10px] text-cinemate-cyan truncate max-w-[120px]" title={movie.recommendationReason}>
              {movie.recommendationReason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
