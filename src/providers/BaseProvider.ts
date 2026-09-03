import { Media, MediaType, VideoSource, Subtitle, ProviderCapabilities } from '../types';
import { IProvider } from './Provider';

export abstract class BaseProvider implements IProvider {
  abstract id: string;
  abstract name: string;
  abstract capabilities: ProviderCapabilities;
  abstract priority: number;

  enabled: boolean = true;
  healthStatus: 'available' | 'checking' | 'recommended' | 'failed' | 'cooldown' = 'available';
  consecutiveFailures: number = 0;
  lastLatencyMs?: number;
  private cooldownUntil: number = 0;
  protected timeoutMs: number = 7000;

  async movie(tmdbId: number, imdbId?: string): Promise<VideoSource[]> {
    return this.withTimeout(this.fetchMovie(tmdbId, imdbId));
  }

  async tv(tmdbId: number, season: number, episode: number, imdbId?: string): Promise<VideoSource[]> {
    return this.withTimeout(this.fetchTv(tmdbId, season, episode, imdbId));
  }

  async anime(animeId: number | string, episode: number): Promise<VideoSource[]> {
    return this.withTimeout(this.fetchAnime(animeId, episode));
  }

  async subtitles(media: Media, season?: number, episode?: number): Promise<Subtitle[]> {
    return this.withTimeout(this.fetchSubtitles(media, season, episode));
  }

  async resolve(request: { tmdbId: number; type: MediaType; season?: number; episode?: number; imdbId?: string }): Promise<VideoSource[]> {
    if (!this.enabled || this.isCooldown()) {
      return [];
    }

    const start = Date.now();
    try {
      let sources: VideoSource[] = [];
      if (request.type === 'movie') {
        sources = await this.movie(request.tmdbId, request.imdbId);
      } else if (request.type === 'tv') {
        sources = await this.tv(request.tmdbId, request.season ?? 1, request.episode ?? 1, request.imdbId);
      } else if (request.type === 'anime') {
        sources = await this.anime(request.tmdbId, request.episode ?? 1);
      }

      this.lastLatencyMs = Date.now() - start;
      this.recordSuccess();
      return sources;
    } catch (err) {
      this.recordFailure();
      return [];
    }
  }

  protected abstract fetchMovie(tmdbId: number, imdbId?: string): Promise<VideoSource[]>;
  protected abstract fetchTv(tmdbId: number, season: number, episode: number, imdbId?: string): Promise<VideoSource[]>;
  protected abstract fetchAnime(animeId: number | string, episode: number): Promise<VideoSource[]>;
  protected abstract fetchSubtitles(media: Media, season?: number, episode?: number): Promise<Subtitle[]>;

  private isCooldown(): boolean {
    if (this.healthStatus === 'cooldown') {
      if (Date.now() > this.cooldownUntil) {
        this.healthStatus = 'available';
        this.consecutiveFailures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    if (this.healthStatus !== 'recommended') {
      this.healthStatus = 'available';
    }
  }

  recordFailure(): void {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= 3) {
      this.healthStatus = 'cooldown';
      this.cooldownUntil = Date.now() + 3 * 60 * 1000; // 3 min cooldown
    } else {
      this.healthStatus = 'failed';
    }
  }

  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Provider [${this.name}] timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
    });

    try {
      const res = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }
}
