import { Media, WatchProgress } from '../types';
import { appStorage } from '../storage';

export type LibraryCategory = 'favorites' | 'watchlist' | 'history' | 'continue_watching' | 'watched_movies' | 'watched_episodes';
export type LibrarySortBy = 'latest' | 'rating' | 'title';

export class LibraryManager {
  private static instance: LibraryManager;
  private favorites: Media[] = [];
  private watchlist: Media[] = [];
  private history: WatchProgress[] = [];
  private listeners: Array<() => void> = [];

  public static getInstance(): LibraryManager {
    if (!LibraryManager.instance) {
      LibraryManager.instance = new LibraryManager();
    }
    return LibraryManager.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const favStr = await appStorage.getItem('@hdoflix_favorites');
      if (favStr) this.favorites = JSON.parse(favStr);

      const wlStr = await appStorage.getItem('@hdoflix_watchlist');
      if (wlStr) this.watchlist = JSON.parse(wlStr);

      const histStr = await appStorage.getItem('@hdoflix_history');
      if (histStr) this.history = JSON.parse(histStr);
      this.notify();
    } catch {
      // Ignore
    }
  }

  // Favorites
  getFavorites(): Media[] {
    return [...this.favorites];
  }

  isFavorite(id: number): boolean {
    return this.favorites.some((m) => m.id === id);
  }

  toggleFavorite(media: Media): boolean {
    if (this.isFavorite(media.id)) {
      this.favorites = this.favorites.filter((m) => m.id !== media.id);
      this.saveFavorites();
      this.notify();
      return false;
    } else {
      this.favorites = [media, ...this.favorites];
      this.saveFavorites();
      this.notify();
      return true;
    }
  }

  // Watchlist
  getWatchlist(): Media[] {
    return [...this.watchlist];
  }

  isInWatchlist(id: number): boolean {
    return this.watchlist.some((m) => m.id === id);
  }

  toggleWatchlist(media: Media): boolean {
    if (this.isInWatchlist(media.id)) {
      this.watchlist = this.watchlist.filter((m) => m.id !== media.id);
      this.saveWatchlist();
      this.notify();
      return false;
    } else {
      this.watchlist = [media, ...this.watchlist];
      this.saveWatchlist();
      this.notify();
      return true;
    }
  }

  // Watch Progress / History
  getHistory(): WatchProgress[] {
    return [...this.history];
  }

  getContinueWatching(): WatchProgress[] {
    return this.history.filter((h) => !h.watched && (h.positionSeconds / (h.durationSeconds || 1)) < 0.95);
  }

  getWatchedMovies(): WatchProgress[] {
    return this.history.filter((h) => h.mediaType === 'movie' && h.watched);
  }

  getWatchedEpisodes(): WatchProgress[] {
    return this.history.filter((h) => (h.mediaType === 'tv' || h.mediaType === 'anime') && h.watched);
  }

  updateProgress(item: WatchProgress): void {
    const keyMatch = (h: WatchProgress) =>
      h.mediaId === item.mediaId &&
      (h.seasonNumber || 0) === (item.seasonNumber || 0) &&
      (h.episodeNumber || 0) === (item.episodeNumber || 0);

    const filtered = this.history.filter((h) => !keyMatch(h));
    this.history = [item, ...filtered];
    this.saveHistory();
    this.notify();
  }

  getProgress(mediaId: number, season?: number, episode?: number): WatchProgress | undefined {
    return this.history.find(
      (h) =>
        h.mediaId === mediaId &&
        (h.seasonNumber || 0) === (season || 0) &&
        (h.episodeNumber || 0) === (episode || 0)
    );
  }

  clearCategory(cat: LibraryCategory): void {
    if (cat === 'favorites') {
      this.favorites = [];
      this.saveFavorites();
    } else if (cat === 'watchlist') {
      this.watchlist = [];
      this.saveWatchlist();
    } else if (cat === 'history' || cat === 'continue_watching') {
      this.history = [];
      this.saveHistory();
    }
    this.notify();
  }

  // Filter & Search inside Library
  queryItems(
    category: LibraryCategory,
    searchQuery: string = '',
    sortBy: LibrarySortBy = 'latest'
  ): Media[] {
    let items: Media[] = [];
    if (category === 'favorites') items = [...this.favorites];
    else if (category === 'watchlist') items = [...this.watchlist];
    else {
      // Map history watch progress to Media items
      let progresses: WatchProgress[] = [];
      if (category === 'history') progresses = this.getHistory();
      else if (category === 'continue_watching') progresses = this.getContinueWatching();
      else if (category === 'watched_movies') progresses = this.getWatchedMovies();
      else if (category === 'watched_episodes') progresses = this.getWatchedEpisodes();

      items = progresses.map((p) => ({
        id: p.mediaId,
        title: p.title,
        mediaType: p.mediaType,
        posterPath: p.posterPath,
        backdropPath: p.backdropPath || null,
        voteAverage: 8.5,
        overview: '',
        genres: [],
      }));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (sortBy === 'rating') {
      items.sort((a, b) => b.voteAverage - a.voteAverage);
    } else if (sortBy === 'title') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private async saveFavorites(): Promise<void> {
    await appStorage.setItem('@hdoflix_favorites', JSON.stringify(this.favorites));
  }

  private async saveWatchlist(): Promise<void> {
    await appStorage.setItem('@hdoflix_watchlist', JSON.stringify(this.watchlist));
  }

  private async saveHistory(): Promise<void> {
    await appStorage.setItem('@hdoflix_history', JSON.stringify(this.history));
  }
}

export const libraryManager = LibraryManager.getInstance();
