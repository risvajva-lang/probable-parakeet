/**
 * PlayerService.ts - Multi-player coordinator for HDOFLIX
 * 
 * Rules:
 * - HDOFLIX Internal Player is default.
 * - Video Pulse is optional external player.
 * - PlayerService is the sole authority deciding player dispatch.
 * - Preference is persisted via AsyncStorage (or storage fallback).
 */

import { ExternalPlayerService } from './ExternalPlayerService';
import {
  PlaybackMedia,
  PlayerLaunchResult,
  PlayerType,
  VideoPulseContractConfig,
} from './PlayerTypes';

export const STORAGE_KEY_PLAYER = '@hdoflix_selected_player';

// Generic storage abstraction (supports React Native AsyncStorage, window.localStorage, or memory)
interface StorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

declare const global: any;

const getStorage = (): StorageProvider => {
  if (typeof global !== 'undefined' && (global as any).AsyncStorage) {
    return (global as any).AsyncStorage;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (key: string) => window.localStorage.getItem(key),
      setItem: async (key: string, val: string) => window.localStorage.setItem(key, val),
    };
  }
  const memoryCache = new Map<string, string>();
  return {
    getItem: async (k) => memoryCache.get(k) ?? null,
    setItem: async (k, v) => {
      memoryCache.set(k, v);
    },
  };
};

export class PlayerService {
  private static instance: PlayerService;

  private selectedPlayer: PlayerType = PlayerType.HDOFLIX_INTERNAL;
  private externalPlayerService: ExternalPlayerService;
  private isRemoteConfigEnabled: boolean = true;
  private storage: StorageProvider;
  private initialized: boolean = false;

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  constructor() {
    this.externalPlayerService = new ExternalPlayerService();
    this.storage = getStorage();
    this.loadPreference();
  }

  /**
   * Initializes and loads saved player preference from persistent storage.
   */
  public async loadPreference(): Promise<PlayerType> {
    try {
      const saved = await this.storage.getItem(STORAGE_KEY_PLAYER);
      if (saved === PlayerType.VIDEO_PULSE) {
        this.selectedPlayer = PlayerType.VIDEO_PULSE;
      } else {
        this.selectedPlayer = PlayerType.HDOFLIX_INTERNAL;
      }
    } catch {
      this.selectedPlayer = PlayerType.HDOFLIX_INTERNAL;
    }
    this.initialized = true;
    return this.selectedPlayer;
  }

  public getSelectedPlayer(): PlayerType {
    return this.selectedPlayer;
  }

  public async setPlayerPreference(type: PlayerType): Promise<void> {
    this.selectedPlayer = type;
    try {
      await this.storage.setItem(STORAGE_KEY_PLAYER, type);
    } catch (e) {
      console.warn('Failed to persist player preference', e);
    }
  }

  public setRemoteConfigEnabled(enabled: boolean): void {
    this.isRemoteConfigEnabled = enabled;
    if (!enabled && this.selectedPlayer === PlayerType.VIDEO_PULSE) {
      this.selectedPlayer = PlayerType.HDOFLIX_INTERNAL;
    }
  }

  public isVideoPulseAllowed(): boolean {
    return this.isRemoteConfigEnabled;
  }

  public async isVideoPulseInstalled(): Promise<boolean> {
    return await this.externalPlayerService.isVideoPulseInstalled();
  }

  public async getVideoPulseVersion(): Promise<string | null> {
    return await this.externalPlayerService.getVideoPulseVersion();
  }

  public async installVideoPulse(): Promise<boolean> {
    return await this.externalPlayerService.installVideoPulse();
  }

  /**
   * Central dispatch:
   * Dispatches playback based on user preference or explicit target player.
   * UI components must NEVER invoke Android Intent directly.
   */
  public async play(
    media: PlaybackMedia,
    playerPreference?: PlayerType
  ): Promise<PlayerLaunchResult> {
    const targetPlayer = playerPreference || this.selectedPlayer;

    // Fallback to HDOFLIX Internal Player if Video Pulse is disabled remotely
    if (targetPlayer === PlayerType.VIDEO_PULSE && !this.isRemoteConfigEnabled) {
      return {
        status: 'SUCCESS',
        playerType: PlayerType.HDOFLIX_INTERNAL,
      };
    }

    if (targetPlayer === PlayerType.VIDEO_PULSE) {
      const result = await this.externalPlayerService.launchVideoPulse(media);
      return result;
    }

    // Default: Internal Player
    return {
      status: 'SUCCESS',
      playerType: PlayerType.HDOFLIX_INTERNAL,
    };
  }

  /**
   * Fallback method when external player launch fails
   */
  public async fallbackToInternalPlayer(media: PlaybackMedia): Promise<PlayerLaunchResult> {
    return {
      status: 'SUCCESS',
      playerType: PlayerType.HDOFLIX_INTERNAL,
    };
  }
}
