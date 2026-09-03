import { Subtitle, Media } from '../types';

export interface SubtitleSettings {
  enabled: boolean;
  preferredLanguage: string;
  size: 'small' | 'medium' | 'large';
  position: 'bottom' | 'top';
  delay: number; // in seconds, e.g. -2, 0, 1.5
}

export class SubtitleService {
  private static instance: SubtitleService;
  private currentSettings: SubtitleSettings = {
    enabled: true,
    preferredLanguage: 'ar',
    size: 'medium',
    position: 'bottom',
    delay: 0,
  };

  public static getInstance(): SubtitleService {
    if (!SubtitleService.instance) {
      SubtitleService.instance = new SubtitleService();
    }
    return SubtitleService.instance;
  }

  getSettings(): SubtitleSettings {
    return { ...this.currentSettings };
  }

  updateSettings(settings: Partial<SubtitleSettings>): void {
    this.currentSettings = { ...this.currentSettings, ...settings };
  }

  /**
   * Automatically select best subtitle track matching user preferences
   */
  selectBestSubtitle(tracks: Subtitle[]): Subtitle | null {
    if (!this.currentSettings.enabled || tracks.length === 0) return null;

    // 1. Try preferred language
    const preferred = tracks.find(
      (t) => t.language.toLowerCase() === this.currentSettings.preferredLanguage.toLowerCase()
    );
    if (preferred) return preferred;

    // 2. Try default flag
    const def = tracks.find((t) => t.isDefault);
    if (def) return def;

    // 3. Try Arabic or English fallback
    const ar = tracks.find((t) => t.language.toLowerCase() === 'ar');
    if (ar) return ar;
    const en = tracks.find((t) => t.language.toLowerCase() === 'en');
    if (en) return en;

    return tracks[0] || null;
  }

  /**
   * Generates default subtitle tracks for any media item
   */
  getDefaultTracks(media: Media): Subtitle[] {
    return [
      {
        id: `sub_ar_${media.id}`,
        language: 'ar',
        label: 'العربية (Arabic)',
        url: `https://subtitles.hdoflix.com/sub/ar/${media.tmdbId || media.id}.vtt`,
        format: 'vtt',
        isDefault: true,
      },
      {
        id: `sub_en_${media.id}`,
        language: 'en',
        label: 'English (Full)',
        url: `https://subtitles.hdoflix.com/sub/en/${media.tmdbId || media.id}.vtt`,
        format: 'vtt',
      },
      {
        id: `sub_es_${media.id}`,
        language: 'es',
        label: 'Español',
        url: `https://subtitles.hdoflix.com/sub/es/${media.tmdbId || media.id}.vtt`,
        format: 'vtt',
      },
      {
        id: `sub_fr_${media.id}`,
        language: 'fr',
        label: 'Français',
        url: `https://subtitles.hdoflix.com/sub/fr/${media.tmdbId || media.id}.vtt`,
        format: 'vtt',
      },
    ];
  }
}

export const subtitleService = SubtitleService.getInstance();
