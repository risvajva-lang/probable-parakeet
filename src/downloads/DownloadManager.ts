import { Media } from '../types';

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface DownloadTask {
  id: string;
  media: Media;
  seasonNumber?: number;
  episodeNumber?: number;
  quality: string;
  url: string;
  status: DownloadStatus;
  progressPercent: number;
  downloadedBytes: number;
  totalBytes: number;
  localFilePath?: string;
  addedAt: number;
  errorMessage?: string;
}

export class DownloadManager {
  private static instance: DownloadManager;
  private tasks: Map<string, DownloadTask> = new Map();
  private listeners: Array<() => void> = [];

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }
    return DownloadManager.instance;
  }

  getTasks(): DownloadTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.addedAt - a.addedAt);
  }

  getTask(id: string): DownloadTask | undefined {
    return this.tasks.get(id);
  }

  startDownload(media: Media, quality: string = '1080p', season?: number, episode?: number): DownloadTask | null {
    const id = `dl_${media.id}_${season || 0}_${episode || 0}`;
    if (this.tasks.has(id)) {
      return this.tasks.get(id)!;
    }

    const task: DownloadTask = {
      id,
      media,
      seasonNumber: season,
      episodeNumber: episode,
      quality,
      url: `https://download.hdoflix.com/stream/${media.id}?quality=${quality}`,
      status: 'downloading',
      progressPercent: 5,
      downloadedBytes: 15 * 1024 * 1024,
      totalBytes: 300 * 1024 * 1024,
      localFilePath: `/storage/emulated/0/Download/HDOFLIX/${media.title.replace(/[^a-zA-Z0-9]/g, '_')}_${quality}.mp4`,
      addedAt: Date.now(),
    };

    this.tasks.set(id, task);
    this.notify();

    // Simulate steady progress safely
    this.simulateDownload(id);
    return task;
  }

  pauseDownload(id: string): void {
    const task = this.tasks.get(id);
    if (task && task.status === 'downloading') {
      task.status = 'paused';
      this.notify();
    }
  }

  resumeDownload(id: string): void {
    const task = this.tasks.get(id);
    if (task && task.status === 'paused') {
      task.status = 'downloading';
      this.notify();
      this.simulateDownload(id);
    }
  }

  cancelDownload(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 'cancelled';
      this.tasks.delete(id);
      this.notify();
    }
  }

  deleteDownload(id: string): void {
    this.tasks.delete(id);
    this.notify();
  }

  getTotalStorageUsedBytes(): number {
    let total = 0;
    for (const task of this.tasks.values()) {
      if (task.status === 'completed') {
        total += task.totalBytes;
      } else {
        total += task.downloadedBytes;
      }
    }
    return total;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private simulateDownload(id: string): void {
    const interval = setInterval(() => {
      const task = this.tasks.get(id);
      if (!task || task.status !== 'downloading') {
        clearInterval(interval);
        return;
      }

      if (task.progressPercent >= 100) {
        task.status = 'completed';
        task.progressPercent = 100;
        task.downloadedBytes = task.totalBytes;
        clearInterval(interval);
        this.notify();
      } else {
        task.progressPercent = Math.min(100, task.progressPercent + 15);
        task.downloadedBytes = Math.floor((task.progressPercent / 100) * task.totalBytes);
        this.notify();
      }
    }, 1200);
  }
}

export const downloadManager = DownloadManager.getInstance();
