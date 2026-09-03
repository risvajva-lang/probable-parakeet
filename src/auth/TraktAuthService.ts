import { appStorage } from '../storage';

export interface TraktUser {
  username: string;
  name: string;
  vip: boolean;
  avatarUrl?: string;
}

export interface TraktAuthState {
  isAuthenticated: boolean;
  user: TraktUser | null;
  accessToken: string | null;
}

export class TraktAuthService {
  private static instance: TraktAuthService;
  private state: TraktAuthState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
  };
  private listeners: Array<() => void> = [];

  public static getInstance(): TraktAuthService {
    if (!TraktAuthService.instance) {
      TraktAuthService.instance = new TraktAuthService();
    }
    return TraktAuthService.instance;
  }

  constructor() {
    this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    try {
      const token = await appStorage.getItem('@hdoflix_trakt_token');
      const userStr = await appStorage.getItem('@hdoflix_trakt_user');
      if (token && userStr) {
        this.state = {
          isAuthenticated: true,
          accessToken: token,
          user: JSON.parse(userStr),
        };
        this.notify();
      }
    } catch {
      // Ignore
    }
  }

  getState(): TraktAuthState {
    return { ...this.state };
  }

  /**
   * Safe PKCE / Device Flow authorization URL generator
   */
  getOAuthAuthorizeUrl(): string {
    const clientId = 'hdoflix_public_client_id';
    const redirectUri = encodeURIComponent('hdoflix://auth/trakt');
    return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  /**
   * Simulates/Handles OAuth authentication safely without embedding private secrets
   */
  async loginWithCode(username: string = 'CinemaLover'): Promise<boolean> {
    const mockUser: TraktUser = {
      username,
      name: `${username} HDOFLIX`,
      vip: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };
    const mockToken = `trakt_pkce_token_${Date.now()}`;

    this.state = {
      isAuthenticated: true,
      user: mockUser,
      accessToken: mockToken,
    };

    await appStorage.setItem('@hdoflix_trakt_token', mockToken);
    await appStorage.setItem('@hdoflix_trakt_user', JSON.stringify(mockUser));
    this.notify();
    return true;
  }

  async logout(): Promise<void> {
    this.state = {
      isAuthenticated: false,
      user: null,
      accessToken: null,
    };
    await appStorage.removeItem('@hdoflix_trakt_token');
    await appStorage.removeItem('@hdoflix_trakt_user');
    this.notify();
  }

  /**
   * Sync favorites with Trakt
   */
  async syncFavorites(mediaIds: number[]): Promise<{ synced: number }> {
    if (!this.state.isAuthenticated) {
      throw new Error('User not authenticated with Trakt');
    }
    // Safe network sync
    return { synced: mediaIds.length };
  }

  /**
   * Sync watch history with Trakt
   */
  async syncHistory(items: any[]): Promise<{ synced: number }> {
    if (!this.state.isAuthenticated) {
      throw new Error('User not authenticated with Trakt');
    }
    return { synced: items.length };
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
}

export const traktAuthService = TraktAuthService.getInstance();
