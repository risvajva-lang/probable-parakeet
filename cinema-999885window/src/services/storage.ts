import { FavoriteItem, WatchHistoryItem, MediaItem } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'cinema_window_favorites_v2',
  HISTORY: 'cinema_window_watch_history_v2',
  SETTINGS: 'cinema_window_user_settings_v2'
};

// Check if running inside WordPress theme with localized config
declare global {
  interface Window {
    CinemaWindowConfig?: {
      siteUrl: string;
      restUrl: string;
      nonce: string;
      isUserLoggedIn: boolean;
    };
  }
}

export const StorageService = {
  getFavorites(): FavoriteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(tmdbId: number): boolean {
    const list = this.getFavorites();
    return list.some(item => item.tmdbId === tmdbId);
  },

  toggleFavorite(media: MediaItem): FavoriteItem[] {
    try {
      let list = this.getFavorites();
      const exists = list.some(item => item.tmdbId === media.tmdbId);
      if (exists) {
        list = list.filter(item => item.tmdbId !== media.tmdbId);
      } else {
        const fav: FavoriteItem = {
          mediaId: media.id || media.tmdbId,
          tmdbId: media.tmdbId,
          title: media.title,
          posterPath: media.posterPath,
          backdropPath: media.backdropPath,
          type: media.type,
          voteAverage: media.voteAverage,
          year: media.year,
          addedAt: Date.now()
        };
        list.unshift(fav);
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));

      // Sync with WordPress if logged in
      if (typeof window !== 'undefined' && window.CinemaWindowConfig?.isUserLoggedIn) {
        fetch(`${window.CinemaWindowConfig.restUrl}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.CinemaWindowConfig.nonce
          },
          body: JSON.stringify(list)
        }).catch(() => {});
      }

      return list;
    } catch {
      return [];
    }
  },

  getHistory(): WatchHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(
    media: MediaItem,
    season?: number,
    episode?: number,
    progressPercentage?: number,
    currentTime?: number,
    duration?: number
  ): WatchHistoryItem[] {
    try {
      let list = this.getHistory();
      const isMovie = media.type === 'movie';
      
      // Distinct item match: match exact media + season + episode
      list = list.filter(item => {
        if (item.tmdbId !== media.tmdbId) return true;
        if (isMovie) return false;
        return !(item.season === season && item.episode === episode);
      });
      
      const record: WatchHistoryItem = {
        mediaId: media.id || media.tmdbId,
        tmdbId: media.tmdbId,
        title: media.title,
        posterPath: media.posterPath,
        backdropPath: media.backdropPath,
        type: media.type,
        season: isMovie ? undefined : (season || 1),
        episode: isMovie ? undefined : (episode || 1),
        watchedAt: Date.now(),
        progressPercentage: typeof progressPercentage === 'number' ? Math.min(100, Math.max(0, Math.round(progressPercentage))) : 0,
        currentTime: typeof currentTime === 'number' ? Math.round(currentTime) : undefined,
        duration: typeof duration === 'number' ? Math.round(duration) : undefined,
        voteAverage: media.voteAverage || 0,
        year: media.year,
        overview: media.overview || ''
      };
      
      list.unshift(record);
      if (list.length > 50) list = list.slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));

      // Sync with WordPress if logged in
      if (typeof window !== 'undefined' && window.CinemaWindowConfig?.isUserLoggedIn) {
        fetch(`${window.CinemaWindowConfig.restUrl}/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.CinemaWindowConfig.nonce
          },
          body: JSON.stringify(list)
        }).catch(() => {});
      }

      return list;
    } catch {
      return [];
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      if (typeof window !== 'undefined' && window.CinemaWindowConfig?.isUserLoggedIn) {
        fetch(`${window.CinemaWindowConfig.restUrl}/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.CinemaWindowConfig.nonce
          },
          body: JSON.stringify([])
        }).catch(() => {});
      }
    } catch {}
  }
};
