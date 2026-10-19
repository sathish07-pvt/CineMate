import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Tv, Award, Compass, MessageSquare, ArrowRight } from 'lucide-react';
import { Movie, MovieReview, MoodConfig } from '../types';
import { api } from '../services/api';
import { HeroSpotlight } from '../components/movies/HeroSpotlight';
import { MovieCard } from '../components/movies/MovieCard';

const GENRE_CHIPS = [
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 878, name: 'Sci-Fi', emoji: '🪐' },
  { id: 53, name: 'Thriller', emoji: '🔪' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 16, name: 'Animation', emoji: '🎨' },
  { id: 10749, name: 'Romance', emoji: '💖' },
];

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [recentReviews, setRecentReviews] = useState<MovieReview[]>([]);
  const [moods, setMoods] = useState<MoodConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        const [featRes, trendRes, tvRes, topRes, revRes, moodRes] = await Promise.all([
          api.getFeatured(),
          api.getTrending('all', 'day'),
          api.getPopularTv(1),
          api.getTopRated('movie', 1),
          api.getRecentReviews(4),
          api.getMoodCatalog(),
        ]);

        if (isMounted) {
          if (featRes.success) setFeatured(featRes.data);
          if (trendRes.success) setTrending(trendRes.data);
          if (tvRes.success) setPopularTv(tvRes.data);
          if (topRes.success) setTopRated(topRes.data);
          if (revRes.success) setRecentReviews(revRes.data);
          if (moodRes.success) setMoods(moodRes.data);
        }
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Hero Spotlight */}
      {featured && <HeroSpotlight movie={featured} />}

      {/* Mood Selector Pill Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cinemate-accent" />
            <h2 className="text-xl font-extrabold text-white">How Are You Feeling Today?</h2>
          </div>
          <Link
            to="/mood"
            className="text-xs font-bold text-cinemate-cyan hover:underline flex items-center gap-1"
          >
            <span>Explore All Moods</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {moods.slice(0, 6).map((m) => (
            <Link
              key={m.id}
              to={`/mood?selected=${m.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-panel glass-panel-hover flex-shrink-0 border border-slate-800"
            >
              <span className="text-xl">{m.emoji}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-100">{m.label}</p>
                <p className="text-[10px] text-slate-400 max-w-[140px] truncate">{m.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Movies Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">Trending Right Now</h2>
          </div>
          <Link
            to="/search?type=movie"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>View More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Popular TV Shows Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-cinemate-cyan" />
            <h2 className="text-xl font-extrabold text-white">Binge-Worthy TV Series</h2>
          </div>
          <Link
            to="/search?type=tv"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>View More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularTv.slice(0, 6).map((tv) => (
            <MovieCard key={tv.id} movie={tv} />
          ))}
        </div>
      </section>

      {/* Browse by Genre Chips */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-extrabold text-white">Browse by Genre</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {GENRE_CHIPS.map((g) => (
            <Link
              key={g.id}
              to={`/search?genreId=${g.id}&genreName=${encodeURIComponent(g.name)}`}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-panel glass-panel-hover border border-slate-800/80 text-center"
            >
              <span className="text-2xl mb-1">{g.emoji}</span>
              <span className="text-xs font-bold text-slate-200">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Hall of Fame */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-extrabold text-white">Critically Acclaimed Masterpieces</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topRated.slice(0, 6).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>

      {/* Community Feed Preview */}
      {recentReviews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cinemate-accent" />
            <h2 className="text-xl font-extrabold text-white">Recent Community Buzz</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start gap-3.5"
              >
                <img
                  src={rev.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.user.username}`}
                  alt={rev.user.username}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-cinemate-accent/30 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-white truncate">{rev.user.username}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/30">
                      ★ {rev.rating}/10
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-cinemate-cyan mb-1 truncate">
                    Reviewed: {rev.title}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    "{rev.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
