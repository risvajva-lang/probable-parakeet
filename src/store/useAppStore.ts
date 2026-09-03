import { create } from 'zustand';
import { Media, WatchHistoryItem } from '../models/types';
import { appStorage } from '../storage';

interface AppState {
  favorites: Media[];
  myList: Media[];
  watchHistory: WatchHistoryItem[];
  continueWatching: WatchHistoryItem[];
  selectedPlayer: string;
  autoPlayNext: boolean;
  defaultQuality: string;
  language: 'ar' | 'en';

  addFavorite: (media: Media) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;

  addToMyList: (media: Media) => void;
  removeFromMyList: (id: number) => void;
  isInMyList: (id: number) => boolean;

  updateProgress: (item: WatchHistoryItem) => void;
  clearHistory: () => void;

  setSelectedPlayer: (player: string) => void;
  setAutoPlayNext: (val: boolean) => void;
  setDefaultQuality: (val: string) => void;
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  favorites: [],
  myList: [],
  watchHistory: [],
  continueWatching: [],
  selectedPlayer: 'internal',
  autoPlayNext: true,
  defaultQuality: '1080p',
  language: 'ar',

  addFavorite: (media) => {
    const list = get().favorites;
    if (!list.some((m) => m.id === media.id)) {
      const updated = [media, ...list];
      set({ favorites: updated });
      appStorage.setItem('@hdoflix_favorites', JSON.stringify(updated));
    }
  },

  removeFavorite: (id) => {
    const updated = get().favorites.filter((m) => m.id !== id);
    set({ favorites: updated });
    appStorage.setItem('@hdoflix_favorites', JSON.stringify(updated));
  },

  isFavorite: (id) => get().favorites.some((m) => m.id === id),

  addToMyList: (media) => {
    const list = get().myList;
    if (!list.some((m) => m.id === media.id)) {
      const updated = [media, ...list];
      set({ myList: updated });
      appStorage.setItem('@hdoflix_mylist', JSON.stringify(updated));
    }
  },

  removeFromMyList: (id) => {
    const updated = get().myList.filter((m) => m.id !== id);
    set({ myList: updated });
    appStorage.setItem('@hdoflix_mylist', JSON.stringify(updated));
  },

  isInMyList: (id) => get().myList.some((m) => m.id === id),

  updateProgress: (item) => {
    const current = get().watchHistory.filter((h) => h.mediaId !== item.mediaId);
    const updated = [item, ...current];
    const continueList = updated.filter((h) => h.positionSeconds / (h.durationSeconds || 1) < 0.95);
    set({ watchHistory: updated, continueWatching: continueList });
    appStorage.setItem('@hdoflix_history', JSON.stringify(updated));
  },

  clearHistory: () => {
    set({ watchHistory: [], continueWatching: [] });
    appStorage.removeItem('@hdoflix_history');
  },

  setSelectedPlayer: (player) => {
    set({ selectedPlayer: player });
    appStorage.setItem('@hdoflix_player', player);
  },

  setAutoPlayNext: (val) => set({ autoPlayNext: val }),
  setDefaultQuality: (val) => set({ defaultQuality: val }),
  setLanguage: (lang) => set({ language: lang }),
}));
