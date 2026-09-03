import { Media, VideoSource, Subtitle, ProviderCapabilities } from '../types';
import { BaseProvider } from './BaseProvider';

export class CloudDirectProvider extends BaseProvider {
  id = 'cloud_direct';
  name = 'Cloud Direct CDN (HLS/MP4)';
  priority = 2;
  healthStatus: 'available' | 'checking' | 'recommended' | 'failed' | 'cooldown' = 'available';

  capabilities: ProviderCapabilities = {
    supportsMovies: true,
    supportsTv: true,
    supportsAnime: true,
    supportsSubtitles: true,
    supportsDirectStream: true,
    supportsEmbed: true,
    requiresHeaders: false,
  };

  protected async fetchMovie(tmdbId: number): Promise<VideoSource[]> {
    return [
      {
        provider: this.name,
        host: 'cloud-cdn.stream',
        url: `https://vidsrc.pm/embed/movie/${tmdbId}`,
        type: 'embed',
        quality: '1080p',
        server: 'Cloud Stream Fast',
        priority: this.priority,
      },
      {
        provider: this.name,
        host: 'direct-hls.stream',
        url: `https://2embed.cc/embed/${tmdbId}`,
        type: 'embed',
        quality: '1080p',
        server: 'Direct Global CDN',
        priority: this.priority + 1,
      },
    ];
  }

  protected async fetchTv(tmdbId: number, season: number, episode: number): Promise<VideoSource[]> {
    return [
      {
        provider: this.name,
        host: 'cloud-cdn.stream',
        url: `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Cloud Stream Fast',
        priority: this.priority,
      },
      {
        provider: this.name,
        host: 'direct-hls.stream',
        url: `https://2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Direct Global CDN',
        priority: this.priority + 1,
      },
    ];
  }

  protected async fetchAnime(animeId: number | string, episode: number): Promise<VideoSource[]> {
    return [
      {
        provider: this.name,
        host: 'cloud-cdn.stream',
        url: `https://vidsrc.pm/embed/tv/${animeId}/1/${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Anime Direct Fast',
        priority: this.priority,
      },
    ];
  }

  protected async fetchSubtitles(_media: Media): Promise<Subtitle[]> {
    return [];
  }
}
