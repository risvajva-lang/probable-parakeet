export class AdService {
  private static instance: AdService;
  private adsEnabled: boolean = false;

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  setAdsEnabled(enabled: boolean): void {
    this.adsEnabled = enabled;
  }

  isAdsEnabled(): boolean {
    return this.adsEnabled;
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.adsEnabled) return false;
    return true;
  }
}

export const adService = AdService.getInstance();
