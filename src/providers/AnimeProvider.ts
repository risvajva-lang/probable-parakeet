import { Media, VideoSource, Subtitle, ProviderCapabilities } from '../types';
import { BaseProvider } from './BaseProvider';

export class AnimeProvider extends BaseProvider {
  id = 'anilist_stream';
  name = 'AniList Anime Stream';
  priority = 3;
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
        host: 'animestream.net',
        url: `https://vidsrc.icu/embed/movie/${tmdbId}`,
        type: 'embed',
        quality: '1080p',
        server: 'Anime HD Server 1',
        priority: this.priority,
      },
    ];
  }

  protected async fetchTv(tmdbId: number, season: number, episode: number): Promise<VideoSource[]> {
    return [
      {
        provider: this.name,
        host: 'animestream.net',
        url: `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Anime HD Server 1',
        priority: this.priority,
      },
    ];
  }

  protected async fetchAnime(animeId: number | string, episode: number): Promise<VideoSource[]> {
    return [
      {
        provider: this.name,
        host: 'animestream.net',
        url: `https://vidsrc.icu/embed/tv/${animeId}/1/${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Anime Direct Fast 1',
        priority: this.priority,
        audioTracks: [
          { id: 'ja', language: 'ja', label: 'Japanese Original', isDefault: true },
          { id: 'en', language: 'en', label: 'English Dub', isDub: true },
          { id: 'ar', language: 'ar', label: 'Arabic Dub', isDub: true },
        ],
      },
      {
        provider: 'Anime Cloud CDN',
        host: 'animecloud.cdn',
        url: `https://embed.su/embed/tv/${animeId}/1/${episode}`,
        type: 'embed',
        quality: '1080p',
        server: 'Anime Cloud Mirror 2',
        priority: this.priority + 1,
      },
    ];
  }

  protected async fetchSubtitles(_media: Media): Promise<Subtitle[]> {
    return [
      {
        id: 'sub_ar',
        language: 'ar',
        label: 'العربية (مترجم)',
        url: '',
        format: 'vtt',
        isDefault: true,
      },
      {
        id: 'sub_en',
        language: 'en',
        label: 'English',
        url: '',
        format: 'vtt',
      },
    ];
  }
}
