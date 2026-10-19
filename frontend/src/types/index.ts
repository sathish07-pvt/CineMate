export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  preferredRegion?: string;
  preferredLanguages?: string;
  favoriteGenres?: string;
  createdAt?: string;
  stats?: {
    watchlistCount: number;
    reviewsCount: number;
    friendsCount: number;
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface ProvidersMap {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface Movie {
  id: number;
  title: string;
  name?: string;
  original_title?: string;
  original_language?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  director?: string;
  cast?: CastMember[];
  trailerKey?: string;
  providers?: ProvidersMap;
  recommendationReason?: string;
  matchScore?: number;
  rank?: number;
  ott_release_date?: string;
  ott_provider_name?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  industry: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  isWatched: boolean;
  addedAt: string;
}

export interface MovieReview {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  rating: number; // 1 to 10
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface Friend {
  friendshipId: string;
  since: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    preferredRegion?: string;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender?: { id: string; username: string; avatarUrl?: string; bio?: string };
  receiver?: { id: string; username: string; avatarUrl?: string; bio?: string };
}

export interface WatchRoom {
  id: string;
  roomCode: string;
  hostId: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  status: string;
  currentTimestamp: number;
  isSyncing: boolean;
  countdown?: number | null;
  providerName?: string | null;
  providerUrl?: string | null;
  createdAt: string;
  host: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  participants: {
    id: string;
    userId: string;
    isReady: boolean;
    joinedAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }[];
  messages: ChatMessage[];
  _count?: {
    participants: number;
  };
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  userId: string;
  content: string;
  type: 'CHAT' | 'REACTION' | 'SYSTEM';
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface MoodConfig {
  id: string;
  label: string;
  tagline: string;
  emoji: string;
  genreIds: number[];
  minRating: number;
  reasonTemplate: string;
}
