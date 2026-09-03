import { VideoSource } from '../types';

export interface ExtractorResult {
  url: string;
  type: 'hls' | 'mp4' | 'dash' | 'embed';
  quality: string;
  headers?: Record<string, string>;
}

export class StreamExtractor {
  static isHls(url: string): boolean {
    return url.includes('.m3u8') || url.includes('/hls/');
  }

  static isDash(url: string): boolean {
    return url.includes('.mpd');
  }

  static isMp4(url: string): boolean {
    return url.includes('.mp4') || url.includes('.mkv');
  }

  static detectType(url: string): 'hls' | 'mp4' | 'dash' | 'embed' {
    if (this.isHls(url)) return 'hls';
    if (this.isDash(url)) return 'dash';
    if (this.isMp4(url)) return 'mp4';
    return 'embed';
  }

  static normalizeSource(source: Partial<VideoSource> & { url: string }): VideoSource {
    const detected = this.detectType(source.url);
    return {
      provider: source.provider || 'Stream Extractor',
      host: source.host || 'direct.stream',
      url: source.url,
      type: source.type || detected,
      quality: source.quality || '1080p',
      server: source.server || 'Direct Stream Server',
      priority: source.priority || 1,
      headers: source.headers,
      subtitles: source.subtitles || [],
      audioTracks: source.audioTracks || [],
    };
  }
}
