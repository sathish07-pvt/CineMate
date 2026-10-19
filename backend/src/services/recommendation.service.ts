import { tmdbService, MovieItem, CURATED_CATALOG, SUPPORTED_LANGUAGES } from './tmdb.service.js';
import prisma from '../config/prisma.js';

export interface MoodConfig {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  genreIds: number[];
  minRating: number;
  reasonTemplate: string;
}

export const MOOD_DEFINITIONS: Record<string, MoodConfig> = {
  happy: {
    id: 'happy',
    label: 'Happy & Uplifting',
    tagline: 'Feel-good stories, vibrant comedies & heartwarming triumphs',
    emoji: '✨',
    genreIds: [35, 10751, 16], // Comedy, Family, Animation
    minRating: 7.0,
    reasonTemplate: 'Selected for uplifting energy and feel-good comedy score',
  },
  sad: {
    id: 'sad',
    label: 'Sad & Cathartic',
    tagline: 'Deep emotional dramas and poignant human connections',
    emoji: '🌧️',
    genreIds: [18, 10749], // Drama, Romance
    minRating: 7.5,
    reasonTemplate: 'Resonates deeply with powerful drama and emotional depth',
  },
  romantic: {
    id: 'romantic',
    label: 'Romantic & Date Night',
    tagline: 'Captivating love stories, chemistry, and romantic comedies',
    emoji: '💖',
    genreIds: [10749, 35], // Romance, Comedy
    minRating: 7.0,
    reasonTemplate: 'Perfect date-night chemistry and high audience acclaim',
  },
  bored: {
    id: 'bored',
    label: 'Bored / Need Excitement',
    tagline: 'High-octane action, plot twists, and mind-bending thrillers',
    emoji: '⚡',
    genreIds: [28, 878, 53], // Action, Sci-Fi, Thriller
    minRating: 7.4,
    reasonTemplate: 'Fast-paced thrilling storyline to instantly beat boredom',
  },
  motivated: {
    id: 'motivated',
    label: 'Motivated & Inspired',
    tagline: 'True perseverance, heroic journeys, and triumphant underdog tales',
    emoji: '🔥',
    genreIds: [18, 36, 12], // Drama, History, Adventure
    minRating: 7.8,
    reasonTemplate: 'Inspiring journey of human willpower and triumph',
  },
  thriller_night: {
    id: 'thriller_night',
    label: 'Thriller Night',
    tagline: 'Edge-of-your-seat suspense, psychological mysteries, and dark twists',
    emoji: '🕵️‍♂️',
    genreIds: [53, 9648, 80], // Thriller, Mystery, Crime
    minRating: 7.5,
    reasonTemplate: 'Matches your Thriller Night suspense and mystery craving',
  },
  family_time: {
    id: 'family_time',
    label: 'Family Time',
    tagline: 'Wholesome classics and multi-generational adventures',
    emoji: '🍿',
    genreIds: [10751, 16, 12], // Family, Animation, Adventure
    minRating: 7.2,
    reasonTemplate: 'Universally loved by all age groups for cozy family viewing',
  },
  friends_night: {
    id: 'friends_night',
    label: 'Friends Night',
    tagline: 'Popcorn blockbusters, crowd-pleasing humor, and high excitement',
    emoji: '🎉',
    genreIds: [28, 35, 12, 878], // Action, Comedy, Adventure, Sci-Fi
    minRating: 7.2,
    reasonTemplate: 'High-energy crowd favorite ideal for group viewing',
  },
  weekend_relaxation: {
    id: 'weekend_relaxation',
    label: 'Weekend Relaxation',
    tagline: 'Immersive worlds, breathtaking visuals, and captivating journeys',
    emoji: '☕',
    genreIds: [12, 14, 878, 99], // Adventure, Fantasy, Sci-Fi, Documentary
    minRating: 7.6,
    reasonTemplate: 'Immersive cinematic escape to unwind over the weekend',
  },
};

export interface RecommendationResult extends MovieItem {
  recommendationReason: string;
  matchScore: number;
}

export class RecommendationService {
  public async getRecommendationsForMood(
    moodKey: string,
    userId?: string,
    language?: string
  ): Promise<RecommendationResult[]> {
    const mood = MOOD_DEFINITIONS[moodKey.toLowerCase()] || MOOD_DEFINITIONS['happy'];
    const lang = language && language !== 'all' ? language : undefined;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);

    // 1. Fetch candidates from trending, popular, and discover in the preferred language
    const [trending, popularMovies, discovered] = await Promise.all([
      tmdbService.getTrending('week', 'all', lang),
      tmdbService.getPopularMovies(1, lang),
      tmdbService.discoverMovies({ language: lang, sortBy: 'vote_average.desc', minRating: mood.minRating }),
    ]);

    const candidatesMap = new Map<number, MovieItem>();
    [...trending, ...popularMovies, ...discovered.results, ...CURATED_CATALOG].forEach((item) => {
      candidatesMap.set(item.id, item);
    });

    const candidates = Array.from(candidatesMap.values());

    // 2. Fetch user preferences if userId is provided
    let userGenreIds: number[] = [];
    let userWatchedIds = new Set<number>();

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            watchlist: true,
            reviews: true,
          },
        });

        if (user) {
          if (user.favoriteGenres) {
            userGenreIds = user.favoriteGenres
              .split(',')
              .map((id) => parseInt(id.trim(), 10))
              .filter((id) => !isNaN(id));
          }
          user.watchlist.forEach((w) => {
            if (w.isWatched) userWatchedIds.add(w.tmdbId);
          });
          user.reviews.forEach((r) => userWatchedIds.add(r.tmdbId));
        }
      } catch (err) {
        console.error('Error fetching user context for recommendations:', err);
      }
    }

    // 3. Score candidates based on mood genres, language match, rating, user preferences
    const scored: RecommendationResult[] = candidates.map((item) => {
      let score = 50; // base score

      // Match mood genres
      const moodGenreMatches = item.genre_ids.filter((g) => mood.genreIds.includes(g)).length;
      score += moodGenreMatches * 15;

      // Language boost
      const isLangMatch = lang && item.original_language === lang;
      if (isLangMatch) {
        score += 25;
      }

      // Rating boost
      if (item.vote_average >= mood.minRating) {
        score += Math.round((item.vote_average - mood.minRating) * 10);
      } else {
        score -= 10;
      }

      // User favorite genre boost
      const userGenreMatches = item.genre_ids.filter((g) => userGenreIds.includes(g)).length;
      if (userGenreMatches > 0) {
        score += userGenreMatches * 10;
      }

      // Slightly lower priority for already watched
      if (userWatchedIds.has(item.id)) {
        score -= 25;
      }

      // Determine transparent reason
      let reason = mood.reasonTemplate;
      if (isLangMatch && langObj) {
        reason += ` • Matches your ${langObj.name} (${langObj.industry}) selection`;
      }
      if (userGenreMatches > 0) {
        reason += ` + Matches your favorite genre profile`;
      }
      if (item.vote_average >= 8.0) {
        reason += ` • High critical score (${item.vote_average}/10)`;
      }

      return {
        ...item,
        matchScore: Math.min(99, Math.max(60, score)),
        recommendationReason: reason,
      };
    });

    // If a language was selected, prioritize language matches
    if (lang) {
      scored.sort((a, b) => {
        const aLang = a.original_language === lang ? 1 : 0;
        const bLang = b.original_language === lang ? 1 : 0;
        if (aLang !== bLang) return bLang - aLang;
        return b.matchScore - a.matchScore;
      });
    } else {
      scored.sort((a, b) => b.matchScore - a.matchScore);
    }

    return scored.slice(0, 20);
  }
}

export const recommendationService = new RecommendationService();
