import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, AlertCircle } from 'lucide-react';
import { Movie } from '../types';
import { api } from '../services/api';
import { MovieCard } from '../components/movies/MovieCard';

const GENRE_OPTIONS = [
  { id: '', label: 'All Genres' },
  { id: '28', label: 'Action' },
  { id: '12', label: 'Adventure' },
  { id: '16', label: 'Animation' },
  { id: '35', label: 'Comedy' },
  { id: '80', label: 'Crime' },
  { id: '99', label: 'Documentary' },
  { id: '18', label: 'Drama' },
  { id: '14', label: 'Fantasy' },
  { id: '27', label: 'Horror' },
  { id: '9648', label: 'Mystery' },
  { id: '10749', label: 'Romance' },
  { id: '878', label: 'Sci-Fi' },
  { id: '53', label: 'Thriller' },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') as 'all' | 'movie' | 'tv') || 'all';
  const genreParam = searchParams.get('genreId') || '';
  const yearParam = searchParams.get('year') || '';

  const [query, setQuery] = useState<string>(queryParam);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>(typeParam);
  const [genreId, setGenreId] = useState<string>(genreParam);
  const [year, setYear] = useState<string>(yearParam);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with URL params
  useEffect(() => {
    setQuery(queryParam);
    setMediaType(typeParam);
    setGenreId(genreParam);
    setYear(yearParam);
  }, [queryParam, typeParam, genreParam, yearParam]);

  // Execute search with 300ms debounce
  useEffect(() => {
    let isCurrent = true;
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const numGenre = genreId ? parseInt(genreId, 10) : undefined;
        const res = await api.search(query, mediaType, 1, numGenre, year || undefined);
        if (isCurrent && res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [query, mediaType, genreId, year]);

  const updateFilters = (newParams: Record<string, string>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) updated.set(k, v);
      else updated.delete(k);
    });
    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setQuery('');
    setMediaType('all');
    setGenreId('');
    setYear('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(query || mediaType !== 'all' || genreId || year);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header & Main Input */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Universe of Cinema
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search over thousands of movies, TV series, actors, and discover where to stream them.
        </p>

        <div className="relative mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateFilters({ q: e.target.value });
            }}
            placeholder="Type a movie title, franchise, or character (e.g. Inception, Dune, Stranger Things)..."
            className="w-full bg-slate-900/90 text-sm text-white placeholder-slate-400 pl-11 pr-10 py-3.5 rounded-2xl border border-slate-700/80 focus:border-cinemate-accent focus:ring-2 focus:ring-cinemate-accent/30 focus:outline-none shadow-2xl transition-all"
          />
          <SearchIcon className="w-5 h-5 text-cinemate-accent absolute left-4 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                updateFilters({ q: '' });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-cinemate-border/70 flex flex-wrap items-center justify-between gap-4">
        {/* Content Type Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['all', 'movie', 'tv'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setMediaType(t);
                updateFilters({ type: t });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                mediaType === t
                  ? 'bg-cinemate-accent text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All Content' : t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Genre Dropdown */}
          <select
            value={genreId}
            onChange={(e) => {
              setGenreId(e.target.value);
              updateFilters({ genreId: e.target.value });
            }}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cinemate-accent"
          >
            {GENRE_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>

          {/* Year Input */}
          <input
            type="number"
            min="1900"
            max="2030"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              updateFilters({ year: e.target.value });
            }}
            placeholder="Year (e.g. 2024)"
            className="w-28 bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cinemate-accent"
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-400">
            {isLoading ? 'Searching titles...' : `Showing ${results.length} titles`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No titles found</h3>
            <p className="text-xs text-slate-400">
              We couldn't find any results matching your search terms. Try adjusting your filters or spelling.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cinemate-accent text-white hover:bg-purple-600 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
