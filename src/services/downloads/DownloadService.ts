import { Media } from '../../models/types';

export interface DownloadItem {
  id: string;
  mediaId: number;
  title: string;
  posterPath: string | null;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  fileUri?: string;
}

export class DownloadService {
  private static instance: DownloadService;
  private downloads: Map<string, DownloadItem> = new Map();

  public static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  startDownload(media: Media, url: string, season?: number, episode?: number): DownloadItem {
    const id = `${media.id}_${season || 0}_${episode || 0}`;
    const item: DownloadItem = {
      id,
      mediaId: media.id,
      title: season && episode ? `${media.title} S${season}E${episode}` : media.title,
      posterPath: media.posterPath,
      progress: 0,
      status: 'downloading',
    };
    this.downloads.set(id, item);
    return item;
  }

  getDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values());
  }

  pauseDownload(id: string): void {
    const item = this.downloads.get(id);
    if (item) item.status = 'paused';
  }

  resumeDownload(id: string): void {
    const item = this.downloads.get(id);
    if (item) item.status = 'downloading';
  }

  deleteDownload(id: string): void {
    this.downloads.delete(id);
  }
}

export const downloadService = DownloadService.getInstance();
