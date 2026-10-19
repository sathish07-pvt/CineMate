import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Send, Award, Clock } from 'lucide-react';
import { MovieReview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface ReviewsSectionProps {
  tmdbId: number;
  mediaType: string;
  movieTitle: string;
  posterPath?: string | null;
  tmdbRating: number;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  tmdbId,
  mediaType,
  movieTitle,
  posterPath,
  tmdbRating,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [communityAverage, setCommunityAverage] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(9);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMovieReviews(tmdbId, mediaType);
      if (res.success) {
        setReviews(res.data);
        setCommunityAverage(res.communityAverage);

        // Pre-fill user's existing review if any
        if (user) {
          const userRev = res.data.find((r) => r.userId === user.id);
          if (userRev) {
            setRating(userRev.rating);
            setContent(userRev.content);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [tmdbId, mediaType, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (content.trim().length < 5) {
      setErrorMsg('Review must be at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.createReview({
        tmdbId,
        mediaType,
        title: movieTitle,
        posterPath,
        rating,
        content: content.trim(),
      });
      await loadReviews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setContent('');
      await loadReviews();
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cinemate-border/70 space-y-8">
      {/* Header & Ratings Comparison */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cinemate-accent" />
            <span>Community Reviews</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real reviews and ratings from the CineMate community</p>
        </div>

        {/* Score comparison pill */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow">
            <div className="text-[10px] uppercase font-bold text-slate-400">TMDB Rating</div>
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{tmdbRating ? tmdbRating.toFixed(1) : 'NR'}/10</span>
            </div>
          </div>

          <div className="text-center px-4 py-2 rounded-2xl bg-gradient-to-tr from-cinemate-accent/20 to-cinemate-cyan/20 border border-cinemate-accent/40 shadow-lg shadow-cinemate-accent/10">
            <div className="text-[10px] uppercase font-bold text-cinemate-cyan flex items-center justify-center gap-1">
              <Award className="w-3 h-3" />
              <span>CineMate Score</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-white">
              <Star className="w-3.5 h-3.5 fill-cinemate-accent text-cinemate-accent" />
              <span>{communityAverage !== null ? `${communityAverage}/10` : 'No reviews yet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold text-slate-200 mb-3">
          {isAuthenticated ? 'Leave Your Rating & Review' : 'Sign In to Review This Title'}
        </h4>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1-10 Star Rating Selector */}
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">
                Your Rating: <span className="font-bold text-amber-400">{rating} / 10</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      star <= rating
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Review content */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you think of the directing, pacing, cinematography, and performances? (min 5 characters)"
                rows={3}
                className="w-full bg-slate-950/80 text-sm text-slate-200 placeholder-slate-500 p-3.5 rounded-xl border border-slate-800 focus:border-cinemate-accent focus:outline-none transition-all"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-cinemate-accent hover:bg-purple-600 text-white shadow-lg shadow-cinemate-accent/30 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post Review'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-3 flex items-center justify-between">
            <p className="text-xs text-slate-400">Share your opinion and help film lovers discover cinema.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cinemate-accent text-white hover:bg-purple-600 transition-all"
            >
              Sign In to Review
            </button>
          </div>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-300">
          User Reviews ({reviews.length})
        </h4>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-500 animate-pulse">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col space-y-2.5 transition-all hover:border-slate-700/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.user.username}`}
                      alt={r.user.username}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                    />
                    <span className="text-xs font-bold text-slate-200">{r.user.username}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{r.rating}/10</span>
                    </div>
                    {user && user.id === r.userId && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete your review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-1">{r.content}</p>

                <div className="flex items-center gap-1 text-[10px] text-slate-500 pl-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No reviews yet for this title. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};
