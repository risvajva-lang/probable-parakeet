import { Media, StreamResult } from '../models/types';
import { VideoProviderAdapter } from './types';

export class LicensedProvider implements VideoProviderAdapter {
  id = 'licensed_partner';
  name = 'Licensed Cloud CDN';
  priority = 8;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async resolve(media: Media, season?: number, episode?: number): Promise<StreamResult | null> {
    const streamPath = media.mediaType === 'tv'
      ? `series/${media.id}/s${season || 1}_ep${episode || 1}.mp4`
      : `films/${media.id}/main.mp4`;

    return {
      provider: this.name,
      host: 'partner.cloudstream.io',
      url: `https://partner.cloudstream.io/content/${streamPath}`,
      type: 'mp4',
      quality: '1080p',
      server: 'Partner Edge Beta',
      priority: this.priority,
      subtitles: [
        { id: 'ar_sub', language: 'Arabic', label: 'العربية (Arabic)', url: 'https://sub.cloudstream.io/ar.vtt', format: 'vtt', isDefault: true }
      ]
    };
  }
}

export class CustomProvider implements VideoProviderAdapter {
  id = 'custom_backup';
  name = 'Backup Fast CDN';
  priority = 5;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async resolve(media: Media, season?: number, episode?: number): Promise<StreamResult | null> {
    return {
      provider: this.name,
      host: 'backup.hdoflix.net',
      url: `https://backup.hdoflix.net/vod/${media.id}.m3u8`,
      type: 'hls',
      quality: '720p',
      server: 'Backup Fast Server',
      priority: this.priority
    };
  }
}
