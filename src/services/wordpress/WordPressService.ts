import { apiClient } from '../../api/client';
import { Media } from '../../models/types';

export class WordPressService {
  private static instance: WordPressService;
  private baseUrl: string = 'https://hdoflix.com/wp-json/wp/v2';

  public static getInstance(): WordPressService {
    if (!WordPressService.instance) {
      WordPressService.instance = new WordPressService();
    }
    return WordPressService.instance;
  }

  async getRecentlyAdded(): Promise<Media[]> {
    try {
      return await apiClient.get<Media[]>(`${this.baseUrl}/media?per_page=15`);
    } catch {
      return [];
    }
  }

  async getMediaDetails(id: number): Promise<Media | null> {
    try {
      return await apiClient.get<Media>(`${this.baseUrl}/media/${id}`);
    } catch {
      return null;
    }
  }

  async getEpisodes(id: number, season: number): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`${this.baseUrl}/media/${id}/season/${season}/episodes`);
    } catch {
      return [];
    }
  }
}

export const wordPressService = WordPressService.getInstance();
