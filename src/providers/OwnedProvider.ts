import { Media, StreamResult } from '../models/types';
import { VideoProviderAdapter } from './types';

export class OwnedProvider implements VideoProviderAdapter {
  id = 'owned_cdn';
  name = 'HDO Direct VIP';
  priority = 10;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async resolve(media: Media, season?: number, episode?: number): Promise<StreamResult | null> {
    const streamPath = media.mediaType === 'tv'
      ? `tv/${media.id}_s${season || 1}e${episode || 1}.m3u8`
      : `movie/${media.id}.m3u8`;

    return {
      provider: this.name,
      host: 'cdn.hdoflix.com',
      url: `https://stream.hdoflix.com/live/${streamPath}`,
      type: 'hls',
      quality: '4K',
      server: 'Ultra Server Alpha',
      priority: this.priority,
      subtitles: [
        { id: 'ar_sub', language: 'Arabic', label: 'العربية (Arabic)', url: 'https://sub.hdoflix.com/ar.vtt', format: 'vtt', isDefault: true },
        { id: 'en_sub', language: 'English', label: 'English', url: 'https://sub.hdoflix.com/en.vtt', format: 'vtt' }
      ]
    };
  }
}
