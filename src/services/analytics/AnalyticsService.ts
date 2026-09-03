export class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  logEvent(eventName: string, params: Record<string, any> = {}): void {
    if (__DEV__) {
      console.log(`[Analytics] ${eventName}:`, params);
    }
  }

  logPlayStart(mediaId: number, title: string, quality: string): void {
    this.logEvent('play_start', { mediaId, title, quality });
  }

  logPlayComplete(mediaId: number, title: string): void {
    this.logEvent('play_complete', { mediaId, title });
  }
}

export const analyticsService = AnalyticsService.getInstance();
