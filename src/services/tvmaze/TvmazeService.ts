import { apiClient } from '../../api/client';

export class TvmazeService {
  private static instance: TvmazeService;
  private baseUrl: string = 'https://api.tvmaze.com';

  public static getInstance(): TvmazeService {
    if (!TvmazeService.instance) {
      TvmazeService.instance = new TvmazeService();
    }
    return TvmazeService.instance;
  }

  async searchShow(name: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/search/shows?q=${encodeURIComponent(name)}`);
    } catch {
      return [];
    }
  }

  async getShowEpisodes(showId: number): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/shows/${showId}/episodes`);
    } catch {
      return [];
    }
  }
}

export const tvmazeService = TvmazeService.getInstance();
