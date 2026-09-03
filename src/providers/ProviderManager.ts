import { IProvider } from './Provider';
import { VidLinkProvider } from './VidLinkProvider';
import { CloudDirectProvider } from './CloudDirectProvider';
import { AnimeProvider } from './AnimeProvider';
import { MediaType, VideoSource, Subtitle, Media } from '../types';

export class ProviderManager {
  private static instance: ProviderManager;
  private providers: Map<string, IProvider> = new Map();

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  private registerDefaultProviders(): void {
    this.register(new VidLinkProvider());
    this.register(new CloudDirectProvider());
    this.register(new AnimeProvider());
  }

  register(provider: IProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  getProvider(providerId: string): IProvider | undefined {
    return this.providers.get(providerId);
  }

  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
  }

  getEnabledProviders(): IProvider[] {
    return this.getAllProviders().filter((p) => p.enabled);
  }

  setProviderEnabled(providerId: string, enabled: boolean): void {
    const p = this.providers.get(providerId);
    if (p) {
      p.enabled = enabled;
    }
  }

  setProviderPriority(providerId: string, priority: number): void {
    const p = this.providers.get(providerId);
    if (p) {
      p.priority = priority;
    }
  }

  /**
   * Resolves sources across all eligible enabled providers in priority order
   */
  async resolveAll(request: {
    tmdbId: number;
    type: MediaType;
    season?: number;
    episode?: number;
    imdbId?: string;
  }): Promise<VideoSource[]> {
    const eligible = this.getEnabledProviders().filter((p) => {
      if (request.type === 'movie') return p.capabilities.supportsMovies;
      if (request.type === 'tv') return p.capabilities.supportsTv;
      if (request.type === 'anime') return p.capabilities.supportsAnime;
      return true;
    });

    const results: VideoSource[] = [];
    for (const provider of eligible) {
      try {
        const sources = await provider.resolve(request);
        if (sources && sources.length > 0) {
          results.push(...sources);
        }
      } catch {
        // Individual provider failures gracefully caught
      }
    }

    // Sort by priority then quality
    return results.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.quality === '4K' && b.quality !== '4K') return -1;
      return 0;
    });
  }

  /**
   * Fetch subtitles for a given title from providers
   */
  async getSubtitles(media: Media, season?: number, episode?: number): Promise<Subtitle[]> {
    const subs: Subtitle[] = [];
    for (const provider of this.getEnabledProviders()) {
      if (provider.capabilities.supportsSubtitles) {
        try {
          const providerSubs = await provider.subtitles(media, season, episode);
          subs.push(...providerSubs);
        } catch {
          // Ignore
        }
      }
    }
    return subs;
  }
}

export const providerManager = ProviderManager.getInstance();
