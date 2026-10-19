import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Bookmark, Check, Share2, Users, Clapperboard } from 'lucide-react';
import { Movie } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrailerPreview } from '../components/movies/TrailerPreview';
import { StreamingProviders } from '../components/movies/StreamingProviders';
import { ReviewsSection } from '../components/movies/ReviewsSection';

export const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const isTv = location.pathname.startsWith('/tv');
  const mediaType = isTv ? 'tv' : 'movie';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareToast, setShareToast] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMovieData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const numId = parseInt(id, 10);
        const res = await api.getDetails(numId, mediaType, user?.preferredRegion || 'US');
        if (isMounted && res.success) {
          setMovie(res.data);
        }

        // Check watchlist status
        if (isAuthenticated) {
          const statusRes = await api.checkWatchlistStatus(numId, mediaType);
          if (isMounted && statusRes.success) {
            setInWatchlist(statusRes.inWatchlist);
            setIsWatched(statusRes.isWatched);
          }
        }
      } catch (err) {
        console.error('Details fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => { isMounted = false; };
  }, [id, mediaType, isAuthenticated, user]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!movie) return;

    try {
      if (inWatchlist) {
        await api.removeFromWatchlist(undefined, movie.id, movie.media_type);
        setInWatchlist(false);
        setIsWatched(false);
      } else {
        await api.addToWatchlist({
          tmdbId: movie.id,
          mediaType: movie.media_type,
          title: movie.title || movie.name || 'Untitled',
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          voteAverage: movie.vote_average,
          releaseDate: movie.release_date || movie.first_air_date,
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  const handleToggleWatched = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!movie) return;

    try {
      if (!inWatchlist) {
        await api.addToWatchlist({
          tmdbId: movie.id,
          mediaType: movie.media_type,
          title: movie.title || movie.name || 'Untitled',
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          voteAverage: movie.vote_average,
          releaseDate: movie.release_date || movie.first_air_date,
        });
        setInWatchlist(true);
      }
      const checkRes = await api.checkWatchlistStatus(movie.id, movie.media_type);
      if (checkRes.item) {
        await api.updateWatchStatus(checkRes.item.id, !isWatched);
        setIsWatched(!isWatched);
      }
    } catch (err) {
      console.error('Toggle watched error:', err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = movie?.title || movie?.name || 'CineMate Title';

    if (navigator.share) {
      try {
        await navigator.share({
          title: `CineMate – ${title}`,
          text: `Check out ${title} on CineMate!`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Loading cinematic details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Title not found</h2>
        <p className="text-xs text-slate-400">We could not retrieve details for this movie or series.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayTitle = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').substring(0, 4);

  return (
    <div className="min-h-screen pb-16">
      {/* Background Trailer Preview Area (Section 9) */}
      <TrailerPreview
        trailerKey={movie.trailerKey}
        backdropUrl={movie.backdrop_path || undefined}
        title={displayTitle}
      />

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-20 space-y-10">
        {/* Top Header Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cinemate-border/80 shadow-2xl flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-44 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-900 flex-shrink-0 mx-auto md:mx-0">
            <img
              src={movie.poster_path || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-cinemate-accent text-white shadow">
                {movie.media_type === 'tv' ? 'TV Series' : 'Movie'}
              </span>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}/10</span>
                <span className="text-[10px] text-slate-400">({movie.vote_count} votes)</span>
              </div>

              {releaseYear && (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{releaseYear}</span>
                </span>
              )}

              {movie.runtime ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {displayTitle}
            </h1>

            {movie.tagline && (
              <p className="text-sm font-medium text-cinemate-cyan italic">
                "{movie.tagline}"
              </p>
            )}

            {/* Genre Chips */}
            {movie.genres && (
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/search?genreId=${g.id}&genreName=${encodeURIComponent(g.name)}`}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cinemate-accent transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-2">
              {movie.overview}
            </p>

            {/* Director */}
            {movie.director && (
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-300">Director: </span>
                <span>{movie.director}</span>
              </p>
            )}

            {/* Action Buttons Toolbar */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {/* Watchlist Toggle */}
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  inWatchlist
                    ? 'bg-cinemate-accent text-white shadow-cinemate-accent/30'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 stroke-[3px]" /> : <Bookmark className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {/* Watched Status */}
              <button
                onClick={handleToggleWatched}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isWatched
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Check className={`w-4 h-4 ${isWatched ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{isWatched ? 'Watched' : 'Mark as Watched'}</span>
              </button>

              {/* Host Watch Together Party */}
              <Link
                to={`/rooms?movieId=${movie.id}&title=${encodeURIComponent(displayTitle)}&poster=${encodeURIComponent(movie.poster_path || '')}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cinemate-cyan to-blue-600 hover:from-blue-600 hover:to-cinemate-cyan text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <Users className="w-4 h-4" />
                <span>Watch Party with Friends</span>
              </Link>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="relative p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                title="Share Movie Link"
              >
                <Share2 className="w-4 h-4" />
                {shareToast && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-cinemate-accent text-white text-[10px] font-bold whitespace-nowrap shadow-lg">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Streaming Providers & OTT Discovery */}
        <StreamingProviders
          tmdbId={movie.id}
          mediaType={movie.media_type}
          initialProviders={movie.providers}
          userRegion={user?.preferredRegion || 'US'}
        />

        {/* Cast & Crew Row */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-cinemate-border/70 space-y-4">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-cinemate-accent" />
              <h3 className="font-extrabold text-base text-white">Top Billed Cast</h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {movie.cast.map((actor) => (
                <div
                  key={actor.id}
                  className="w-28 flex-shrink-0 text-center space-y-1.5"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto bg-slate-900 border border-slate-800 shadow">
                    <img
                      src={actor.profile_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate">{actor.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Reviews & Ratings Section */}
        <ReviewsSection
          tmdbId={movie.id}
          mediaType={movie.media_type}
          movieTitle={displayTitle}
          posterPath={movie.poster_path}
          tmdbRating={movie.vote_average}
        />
      </div>
    </div>
  );
};
