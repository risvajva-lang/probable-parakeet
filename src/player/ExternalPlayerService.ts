/**
 * ExternalPlayerService.ts - External player dispatching service
 */
import { PlaybackMedia, PlayerLaunchResult } from './PlayerTypes';
import { VideoPulseAdapter } from './VideoPulseAdapter';

export class ExternalPlayerService {
  private videoPulseAdapter: VideoPulseAdapter;

  constructor() {
    this.videoPulseAdapter = new VideoPulseAdapter();
  }

  public async isVideoPulseInstalled(): Promise<boolean> {
    return await this.videoPulseAdapter.isInstalled();
  }

  public async getVideoPulseVersion(): Promise<string | null> {
    return await this.videoPulseAdapter.getVersion();
  }

  public async launchVideoPulse(media: PlaybackMedia): Promise<PlayerLaunchResult> {
    return await this.videoPulseAdapter.launch(media);
  }

  public getVideoPulseInstallUrl(): string {
    return this.videoPulseAdapter.getInstallUrl();
  }

  public async installVideoPulse(): Promise<boolean> {
    return await this.videoPulseAdapter.openStorePage();
  }
}
