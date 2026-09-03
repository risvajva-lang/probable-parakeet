/**
 * VideoPulseAdapter.ts - Adapter for Video Pulse external player
 * 
 * Contract extracted from previous integration:
 * - Package Name: com.videopulse.pkvideo.pulsepk
 * - Intent Action: android.intent.action.VIEW
 * - MIME Type: video/*
 * - URI Schemes: http, https, file, content
 * - Extras: title, media_title, poster_url, is_tv, series_name, season, episode, subBundle, linkBundle
 *
 * All values are fully customizable here.
 */

import {
  PlaybackMedia,
  PlayerLaunchResult,
  PlayerType,
  VideoPulseContractConfig,
} from './PlayerTypes';

// Native bridge interface for React Native / Native Android bridge
interface NativeVideoPulseBridge {
  isPackageInstalled(packageName: string): Promise<boolean>;
  getPackageVersion(packageName: string): Promise<string | null>;
  launch(intentConfig: Record<string, any>): Promise<{ success: boolean; error?: string }>;
  openStore(storeUrl: string): Promise<boolean>;
}

declare const global: any;

export class VideoPulseAdapter {
  // Configurable contract values - extracted directly from APK integration
  public static config: VideoPulseContractConfig = {
    packageName: 'com.videopulse.pkvideo.pulsepk',
    intentAction: 'android.intent.action.VIEW',
    mimeType: 'video/*',
    playStoreUrl: 'market://details?id=com.videopulse.pkvideo.pulsepk',
    webStoreUrl: 'https://play.google.com/store/apps/details?id=com.videopulse.pkvideo.pulsepk',
    titleExtraKey: 'title',
    mediaTitleExtraKey: 'media_title',
    isTvExtraKey: 'is_tv',
    seriesNameExtraKey: 'series_name',
    seasonExtraKey: 'season',
    episodeExtraKey: 'episode',
    posterUrlExtraKey: 'poster_url',
    subBundleKey: 'subBundle',
    linkBundleKey: 'linkBundle',
  };

  public static readonly APP_NAME = 'Video Pulse';

  /**
   * Allows updating the install URL dynamically via Remote Config.
   */
  public static setRemoteInstallUrl(url: string): void {
    if (url && url.trim().length > 0) {
      VideoPulseAdapter.config.webStoreUrl = url.trim();
    }
  }

  /**
   * Updates any contract configuration parameters dynamically.
   */
  public static updateConfig(partialConfig: Partial<VideoPulseContractConfig>): void {
    VideoPulseAdapter.config = {
      ...VideoPulseAdapter.config,
      ...partialConfig,
    };
  }

  private getNativeBridge(): NativeVideoPulseBridge | null {
    if (typeof global !== 'undefined') {
      const nativeModules = (global as any).NativeModules;
      if (nativeModules?.VideoPulseModule) {
        return nativeModules.VideoPulseModule;
      }
      if (nativeModules?.PlayerIntentModule) {
        return nativeModules.PlayerIntentModule;
      }
    }
    return null;
  }

  /**
   * Checks if Video Pulse is installed on the host Android device.
   */
  public async isInstalled(): Promise<boolean> {
    const bridge = this.getNativeBridge();
    if (bridge && typeof bridge.isPackageInstalled === 'function') {
      try {
        return await bridge.isPackageInstalled(VideoPulseAdapter.config.packageName);
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Gets the installed Video Pulse version name.
   */
  public async getVersion(): Promise<string | null> {
    const bridge = this.getNativeBridge();
    if (bridge && typeof bridge.getPackageVersion === 'function') {
      try {
        return await bridge.getPackageVersion(VideoPulseAdapter.config.packageName);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Builds the subtitle bundle following the contract:
   * Array of items with { name, filename, url, lang }
   */
  public buildSubBundle(media: PlaybackMedia): Record<string, any> {
    const subs = media.subtitles || [];
    const subsList = subs.map((sub) => ({
      name: sub.name,
      filename: sub.name,
      url: sub.url,
      lang: sub.lang || 'ar',
      format: sub.format || 'vtt',
    }));

    return {
      subs: subsList,
      'subs.enable': subsList.length > 0,
    };
  }

  /**
   * Builds safe header bundle (never exposes tokens or sensitive headers)
   */
  public buildLinkBundle(media: PlaybackMedia): Record<string, any> {
    const sanitizedHeaders: Record<string, string> = {};
    if (media.headers) {
      for (const [key, value] of Object.entries(media.headers)) {
        const lowerKey = key.toLowerCase();
        // Disallow credentials, tokens, cookies, authorization
        if (
          !lowerKey.includes('token') &&
          !lowerKey.includes('auth') &&
          !lowerKey.includes('secret') &&
          !lowerKey.includes('cookie') &&
          !lowerKey.includes('key')
        ) {
          sanitizedHeaders[key] = value;
        }
      }
    }

    // Default safe stream headers
    if (!sanitizedHeaders['User-Agent']) {
      sanitizedHeaders['User-Agent'] = 'HDOFLIX-Player/2.0';
    }

    return {
      url: media.streamUrl,
      title: media.title,
      headers: sanitizedHeaders,
    };
  }

  /**
   * Builds complete intent launch payload strictly honoring the contract.
   */
  public buildIntentPayload(media: PlaybackMedia): Record<string, any> {
    const cfg = VideoPulseAdapter.config;
    const isTv = Boolean(media.isTv || media.season !== undefined || media.episode !== undefined);

    const fullTitle =
      isTv && media.seriesName
        ? `${media.seriesName} - S${media.season ?? 1}E${media.episode ?? 1}: ${media.title}`
        : media.title;

    const extras: Record<string, any> = {
      [cfg.titleExtraKey]: fullTitle,
      [cfg.mediaTitleExtraKey]: media.title,
      [cfg.isTvExtraKey]: isTv,
      [cfg.subBundleKey]: this.buildSubBundle(media),
      [cfg.linkBundleKey]: this.buildLinkBundle(media),
    };

    if (isTv) {
      extras[cfg.seriesNameExtraKey] = media.seriesName || media.title;
      extras[cfg.seasonExtraKey] = media.season ?? 1;
      extras[cfg.episodeExtraKey] = media.episode ?? 1;
    }

    if (media.posterUrl) {
      extras[cfg.posterUrlExtraKey] = media.posterUrl;
    }

    return {
      action: cfg.intentAction,
      packageName: cfg.packageName,
      data: media.streamUrl,
      type: cfg.mimeType,
      extras,
    };
  }

  /**
   * Launches playback in Video Pulse external player.
   */
  public async launch(media: PlaybackMedia): Promise<PlayerLaunchResult> {
    if (!media.streamUrl || !media.streamUrl.startsWith('http')) {
      return {
        status: 'INVALID_STREAM_URL',
        url: media.streamUrl,
      };
    }

    const installed = await this.isInstalled();
    if (!installed) {
      return {
        status: 'NOT_INSTALLED',
        packageName: VideoPulseAdapter.config.packageName,
        appName: VideoPulseAdapter.APP_NAME,
      };
    }

    const bridge = this.getNativeBridge();
    if (!bridge) {
      return {
        status: 'LAUNCH_FAILED',
        reason: 'Native VideoPulseModule bridge is not initialized',
      };
    }

    try {
      const intentPayload = this.buildIntentPayload(media);
      const res = await bridge.launch(intentPayload);
      if (res && res.success) {
        return {
          status: 'SUCCESS',
          playerType: PlayerType.VIDEO_PULSE,
        };
      } else {
        return {
          status: 'LAUNCH_FAILED',
          reason: res?.error || 'تعذر تشغيل الفيديو بواسطة Video Pulse',
        };
      }
    } catch (e: any) {
      return {
        status: 'LAUNCH_FAILED',
        reason: e?.message || 'ActivityNotFoundException: Video Pulse launch failed',
      };
    }
  }

  /**
   * Opens store installation page.
   */
  public async openStorePage(): Promise<boolean> {
    const bridge = this.getNativeBridge();
    const url = this.getInstallUrl();
    if (bridge && typeof bridge.openStore === 'function') {
      return await bridge.openStore(url);
    }
    if (typeof window !== 'undefined' && window.open) {
      window.open(url, '_blank');
      return true;
    }
    return false;
  }

  public getInstallUrl(): string {
    return VideoPulseAdapter.config.webStoreUrl;
  }
}
