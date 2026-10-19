import { Movie, WatchlistItem, MovieReview, Friend, FriendRequest, WatchRoom, User, MoodConfig, LanguageOption } from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cinemate_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // --- Auth Endpoints ---
  public async register(payload: { username: string; email: string; password: string; avatarUrl?: string; preferredRegion?: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async login(payload: { identifier: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMe() {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  public async updateProfile(payload: Partial<User>) {
    return this.request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // --- Movies & Discovery ---
  public async getLanguages(): Promise<{ success: boolean; data: LanguageOption[] }> {
    return this.request('/movies/languages');
  }

  public async getFeatured(language?: string): Promise<{ success: boolean; data: Movie }> {
    const query = language && language !== 'all' ? `?language=${encodeURIComponent(language)}` : '';
    return this.request(`/movies/featured${query}`);
  }

  public async getTrending(type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day', language?: string): Promise<{ success: boolean; data: Movie[] }> {
    const params = new URLSearchParams({ type, timeWindow });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/trending?${params.toString()}`);
  }

  public async getPopularMovies(page = 1, language?: string): Promise<{ success: boolean; data: Movie[] }> {
    const params = new URLSearchParams({ page: String(page) });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/popular/movies?${params.toString()}`);
  }

  public async getPopularTv(page = 1, language?: string): Promise<{ success: boolean; data: Movie[] }> {
    const params = new URLSearchParams({ page: String(page) });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/popular/tv?${params.toString()}`);
  }

  public async getTopRated(type: 'movie' | 'tv' = 'movie', page = 1, language?: string): Promise<{ success: boolean; data: Movie[] }> {
    const params = new URLSearchParams({ type, page: String(page) });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/top-rated?${params.toString()}`);
  }

  public async getUpcoming(page = 1): Promise<{ success: boolean; data: Movie[] }> {
    return this.request(`/movies/upcoming?page=${page}`);
  }

  public async discover(options: {
    language?: string;
    sortBy?: string;
    page?: number;
    genreId?: number;
    year?: string;
    minRating?: number;
    region?: string;
  }): Promise<{ success: boolean; results: Movie[]; page: number; totalPages: number; totalResults: number }> {
    const params = new URLSearchParams();
    if (options.language && options.language !== 'all') params.append('language', options.language);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.page) params.append('page', String(options.page));
    if (options.genreId) params.append('genreId', String(options.genreId));
    if (options.year) params.append('year', options.year);
    if (options.minRating) params.append('minRating', String(options.minRating));
    if (options.region) params.append('region', options.region);
    return this.request(`/movies/discover?${params.toString()}`);
  }

  public async getRankings(options: {
    language?: string;
    type?: 'top10' | 'top50';
    sortBy?: string;
    page?: number;
  }): Promise<{ success: boolean; results: Movie[]; totalCount: number; language: string; rankType: string }> {
    const params = new URLSearchParams();
    if (options.language && options.language !== 'all') params.append('language', options.language);
    if (options.type) params.append('type', options.type);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.page) params.append('page', String(options.page));
    return this.request(`/movies/rankings?${params.toString()}`);
  }

  public async getTheatricalReleases(language?: string, region = 'IN', page = 1): Promise<{ success: boolean; results: Movie[]; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), region });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/theatrical?${params.toString()}`);
  }

  public async getNewOttReleases(language?: string, region = 'IN', page = 1): Promise<{ success: boolean; results: Movie[]; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), region });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/ott-releases?${params.toString()}`);
  }

  public async search(
    query: string,
    type: 'all' | 'movie' | 'tv' = 'all',
    page = 1,
    genreId?: number,
    year?: string,
    language?: string
  ): Promise<{ success: boolean; results: Movie[]; totalPages: number; totalResults: number }> {
    const params = new URLSearchParams({
      q: query,
      type,
      page: String(page),
      ...(genreId ? { genreId: String(genreId) } : {}),
      ...(year ? { year } : {}),
    });
    if (language && language !== 'all') params.append('language', language);
    return this.request(`/movies/search?${params.toString()}`);
  }

  public async getSearchHistory(): Promise<{ success: boolean; data: { id: string; query: string; language: string | null; createdAt: string }[] }> {
    return this.request('/movies/search/history');
  }

  public async clearSearchHistory(): Promise<{ success: boolean; message: string }> {
    return this.request('/movies/search/history', { method: 'DELETE' });
  }

  public async getDetails(id: number, type: 'movie' | 'tv' = 'movie', region = 'US'): Promise<{ success: boolean; data: Movie }> {
    return this.request(`/movies/${id}?type=${type}&region=${region}`);
  }

  public async getWatchProviders(id: number, type: 'movie' | 'tv' = 'movie', region = 'US'): Promise<{ success: boolean; data: any }> {
    return this.request(`/movies/${id}/providers?type=${type}&region=${region}`);
  }

  public async getMoodCatalog(): Promise<{ success: boolean; data: MoodConfig[] }> {
    return this.request('/movies/moods');
  }

  public async getMoodRecommendations(mood: string, language?: string): Promise<{ success: boolean; mood: MoodConfig; data: Movie[] }> {
    const query = language && language !== 'all' ? `&language=${encodeURIComponent(language)}` : '';
    return this.request(`/movies/recommendations/mood?mood=${encodeURIComponent(mood)}${query}`);
  }

  // --- Watchlist ---
  public async getWatchlist(mediaType?: string, isWatched?: boolean): Promise<{ success: boolean; data: WatchlistItem[] }> {
    const params = new URLSearchParams();
    if (mediaType && mediaType !== 'all') params.append('mediaType', mediaType);
    if (isWatched !== undefined) params.append('isWatched', String(isWatched));
    return this.request(`/watchlist?${params.toString()}`);
  }

  public async addToWatchlist(item: { tmdbId: number; mediaType: string; title: string; posterPath?: string | null; backdropPath?: string | null; voteAverage?: number; releaseDate?: string }) {
    return this.request<{ success: boolean; message: string; data: WatchlistItem }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  public async removeFromWatchlist(id?: string, tmdbId?: number, mediaType?: string) {
    const endpoint = id ? `/watchlist/${id}` : `/watchlist?tmdbId=${tmdbId}&mediaType=${mediaType}`;
    return this.request<{ success: boolean; message: string }>(endpoint, {
      method: 'DELETE',
    });
  }

  public async updateWatchStatus(id: string, isWatched: boolean) {
    return this.request<{ success: boolean; message: string }>(`/watchlist/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isWatched }),
    });
  }

  public async checkWatchlistStatus(tmdbId: number, mediaType: string = 'movie'): Promise<{ success: boolean; inWatchlist: boolean; isWatched: boolean; item?: WatchlistItem }> {
    return this.request(`/watchlist/check/${tmdbId}?type=${mediaType}`);
  }

  // --- Reviews ---
  public async getMovieReviews(tmdbId: number, mediaType: string = 'movie'): Promise<{ success: boolean; count: number; communityAverage: number | null; data: MovieReview[] }> {
    return this.request(`/reviews/movie/${tmdbId}?type=${mediaType}`);
  }

  public async createReview(payload: { tmdbId: number; mediaType: string; title: string; posterPath?: string | null; rating: number; content: string }) {
    return this.request<{ success: boolean; message: string; data: MovieReview }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteReview(id: string) {
    return this.request<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  public async getRecentReviews(limit = 10): Promise<{ success: boolean; data: MovieReview[] }> {
    return this.request(`/reviews/recent?limit=${limit}`);
  }

  // --- Friends ---
  public async searchUsers(query: string): Promise<{ success: boolean; data: User[] }> {
    return this.request(`/friends/search?q=${encodeURIComponent(query)}`);
  }

  public async getFriends(): Promise<{ success: boolean; count: number; data: Friend[] }> {
    return this.request('/friends');
  }

  public async getFriendRequests(): Promise<{ success: boolean; incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
    return this.request('/friends/requests');
  }

  public async sendFriendRequest(targetUserId: string) {
    return this.request<{ success: boolean; message: string }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  public async respondFriendRequest(id: string, action: 'ACCEPT' | 'DECLINE') {
    return this.request<{ success: boolean; message: string }>(`/friends/request/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  // --- Rooms ---
  public async createRoom(payload: { tmdbId: number; mediaType?: string; title: string; posterPath?: string | null; backdropPath?: string | null; providerName?: string | null; providerUrl?: string | null }): Promise<{ success: boolean; data: WatchRoom }> {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getRoom(roomCode: string): Promise<{ success: boolean; data: WatchRoom }> {
    return this.request(`/rooms/${roomCode}`);
  }

  public async getActiveRooms(): Promise<{ success: boolean; data: WatchRoom[] }> {
    return this.request('/rooms/active');
  }
}

export const api = new ApiClient();
