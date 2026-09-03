import { Media, VideoSource, Subtitle, ProviderCapabilities } from '../types';
import { BaseProvider } from './BaseProvider';

export class VidLinkProvider extends BaseProvider {
  id = 'vidlink_pro';
  name = 'VidLink Pro (4K UHD)';
  priority = 1;
  healthStatus: 'available' | 'checking' | 'recommended' | 'failed' | 'cooldown' = 'recommended';

  capabilities: ProviderCapabilities = {
    supportsMovies: true,
    supportsTv: true,
    supportsAnime: false,
    supportsSubtitles: true,
    supportsDirectStream: false,
    supportsEmbed: true,
    requiresHeaders: false,
  };

  protected async fetchMovie(tmdbId: number): Promise<VideoSource[]> {
    const url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&secondaryColor=ffc107&iconColor=ffffff&autoplay=false`;
    return [
      {
        provider: this.name,
        host: 'vidlink.pro',
        url,
        type: 'embed',
        quality: '4K',
        server: 'VidLink VIP 1',
        priority: this.priority,
      },
    ];
  }

  protected async fetchTv(tmdbId: number, season: number, episode: number): Promise<VideoSource[]> {
    const url = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=e50914&secondaryColor=ffc107&iconColor=ffffff&autoplay=false`;
    return [
      {
        provider: this.name,
        host: 'vidlink.pro',
        url,
        type: 'embed',
        quality: '4K',
        server: 'VidLink VIP 1',
        priority: this.priority,
      },
    ];
  }

  protected async fetchAnime(): Promise<VideoSource[]> {
    return [];
  }

  protected async fetchSubtitles(_media: Media): Promise<Subtitle[]> {
    return [
      {
        id: 'vidlink_sub_ar',
        language: 'ar',
        label: 'العربية (مدمجة)',
        url: '',
        format: 'vtt',
        isDefault: true,
      },
      {
        id: 'vidlink_sub_en',
        language: 'en',
        label: 'English (Embedded)',
        url: '',
        format: 'vtt',
      },
    ];
  }
}
