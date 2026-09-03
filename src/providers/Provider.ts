import { Media, MediaType, VideoSource, Subtitle, ProviderCapabilities } from '../types';

export interface IProvider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  priority: number;
  enabled: boolean;
  healthStatus: 'available' | 'checking' | 'recommended' | 'failed' | 'cooldown';
  consecutiveFailures: number;
  lastLatencyMs?: number;

  movie(tmdbId: number, imdbId?: string): Promise<VideoSource[]>;
  tv(tmdbId: number, season: number, episode: number, imdbId?: string): Promise<VideoSource[]>;
  anime(animeId: number | string, episode: number): Promise<VideoSource[]>;
  subtitles(media: Media, season?: number, episode?: number): Promise<Subtitle[]>;
  resolve(request: { tmdbId: number; type: MediaType; season?: number; episode?: number; imdbId?: string }): Promise<VideoSource[]>;
}
