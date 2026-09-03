import { adService } from '../ads/AdService';

export interface RemoteConfig {
  adsEnabled: boolean;
  minVersion: string;
  recommendedVersion: string;
  maintenanceMode: boolean;
  announcement?: string;
  featuredSections: string[];
}

export class RemoteConfigService {
  private static instance: RemoteConfigService;
  private config: RemoteConfig = {
    adsEnabled: false,
    minVersion: '2.0.0',
    recommendedVersion: '2.4.0',
    maintenanceMode: false,
    featuredSections: ['trending', 'popularMovies', 'popularTV', 'returningSeries', 'topRated'],
  };

  public static getInstance(): RemoteConfigService {
    if (!RemoteConfigService.instance) {
      RemoteConfigService.instance = new RemoteConfigService();
    }
    return RemoteConfigService.instance;
  }

  async fetchAndActivate(): Promise<RemoteConfig> {
    try {
      // Config can be fetched from remote backend or Firebase Remote Config
      adService.setAdsEnabled(this.config.adsEnabled);
      return this.config;
    } catch {
      return this.config;
    }
  }

  getConfig(): RemoteConfig {
    return this.config;
  }
}

export const remoteConfigService = RemoteConfigService.getInstance();
