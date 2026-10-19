import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, HelpCircle } from 'lucide-react';
import { Movie, MoodConfig } from '../types';
import { api } from '../services/api';
import { MovieCard } from '../components/movies/MovieCard';

export const MoodPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedParam = searchParams.get('selected') || 'thriller_night';

  const [moods, setMoods] = useState<MoodConfig[]>([]);
  const [activeMood, setActiveMood] = useState<string>(selectedParam);
  const [currentMoodConfig, setCurrentMoodConfig] = useState<MoodConfig | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load mood catalog
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await api.getMoodCatalog();
        if (isMounted && res.success) {
          setMoods(res.data);
        }
      } catch (err) {
        console.error('Mood catalog load error:', err);
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  // Fetch recommendations whenever activeMood changes
  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      setIsLoading(true);
      try {
        const res = await api.getMoodRecommendations(activeMood);
        if (isMounted && res.success) {
          setRecommendations(res.data);
          setCurrentMoodConfig(res.mood);
        }
      } catch (err) {
        console.error('Mood recommendations error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRecs();
    return () => { isMounted = false; };
  }, [activeMood]);

  const handleSelectMood = (moodId: string) => {
    setActiveMood(moodId);
    setSearchParams({ selected: moodId });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinemate-accent/15 border border-cinemate-accent/30 text-cinemate-accent text-xs font-bold">
          <Brain className="w-3.5 h-3.5" />
          <span>Transparent Mood Recommendation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Find the Perfect Movie for Your State of Mind
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tell CineMate your current vibe or situation. Our engine evaluates genre synergy, audience acclaim, and your preferences to curate transparent recommendations.
        </p>
      </div>

      {/* 9 Curated Mood Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
        {moods.map((m) => {
          const isSelected = m.id === activeMood;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMood(m.id)}
              className={`text-left p-4 rounded-2xl transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-tr from-cinemate-accent/25 to-cinemate-cyan/20 border-cinemate-accent ring-2 ring-cinemate-accent/30 shadow-xl shadow-cinemate-accent/20 scale-[1.02]'
                  : 'glass-panel border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl mb-2">{m.emoji}</span>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-md bg-cinemate-accent text-white text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{m.label}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {m.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mood Explanation Banner */}
      {currentMoodConfig && (
        <div className="p-5 rounded-2xl glass-panel border border-cinemate-cyan/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentMoodConfig.emoji}</span>
            <div>
              <h2 className="text-base font-bold text-white">
                Curated Recommendations: {currentMoodConfig.label}
              </h2>
              <p className="text-xs text-cinemate-cyan mt-0.5">
                {currentMoodConfig.reasonTemplate}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Scores reflect genre weighting & high ratings</span>
          </div>
        </div>
      )}

      {/* Recommendation Results Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400">
            No titles currently available for this mood. Try another selection!
          </div>
        )}
      </div>
    </div>
  );
};
