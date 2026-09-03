export class TraktService {
  private static instance: TraktService;
  private isConnected: boolean = false;

  public static getInstance(): TraktService {
    if (!TraktService.instance) {
      TraktService.instance = new TraktService();
    }
    return TraktService.instance;
  }

  isLinked(): boolean {
    return this.isConnected;
  }

  async syncWatchHistory(history: any[]): Promise<boolean> {
    if (!this.isConnected) return false;
    return true;
  }
}

export const traktService = TraktService.getInstance();
