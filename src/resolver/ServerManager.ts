import { Media, ServerOption, StreamResult, ServerOptionStatus } from '../models/types';
import { serverRegistry, ServerDefinition } from '../services/server/ServerRegistry';
import { MediaRequest } from '../services/server/ServerTypes';
import { resolverService } from './ResolverService';

export class ServerManager {
  private static instance: ServerManager;
  private currentStreams: StreamResult[] = [];
  private currentServerDefinitions: ServerDefinition[] = [];
  private activeIndex: number = 0;
  private currentMedia: Media | null = null;
  private currentSeason: number = 1;
  private currentEpisode: number = 1;

  public static getInstance(): ServerManager {
    if (!ServerManager.instance) {
      ServerManager.instance = new ServerManager();
    }
    return ServerManager.instance;
  }

  /**
   * Loads servers dynamically from the unified ServerRegistry.
   * Also integrates any dynamic resolvers from ResolverService.
   */
  async loadServers(media: Media, season: number = 1, episode: number = 1): Promise<ServerOption[]> {
    this.currentMedia = media;
    this.currentSeason = season;
    this.currentEpisode = episode;
    this.activeIndex = 0;

    const mediaType = media.mediaType || 'movie';
    const request: MediaRequest = {
      tmdbId: media.tmdbId || media.id,
      imdbId: media.imdbId,
      type: mediaType,
      title: media.title,
      year: media.releaseYear,
      season: season,
      episode: episode,
    };

    // 1. Fetch eligible playable definitions from ServerRegistry
    const definitions = serverRegistry.getPlayableServers(mediaType);
    this.currentServerDefinitions = definitions;

    // 2. Build StreamResult list
    const registryStreams: StreamResult[] = [];
    for (const def of definitions) {
      const url = serverRegistry.buildPlayableUrl(def, request);
      if (url) {
        registryStreams.push({
          provider: def.name,
          host: def.baseUrl,
          url: url,
          type: def.type === 'direct' ? 'hls' : 'mp4',
          quality: def.quality === '4K UHD' ? '4K' : (def.quality === '720p HD' ? '720p' : '1080p'),
          server: def.name,
          priority: def.priority,
          headers: def.defaultHeaders,
        });
      }
    }

    // 3. Optional fallback/dynamic resolver check in background or alongside
    let dynamicStreams: StreamResult[] = [];
    try {
      dynamicStreams = await resolverService.resolveAll(media, season, episode);
    } catch {
      dynamicStreams = [];
    }

    // 4. Merge registry and dynamic streams, avoiding exact duplicates
    const combined = [...registryStreams];
    for (const dyn of dynamicStreams) {
      if (!combined.some(s => s.url === dyn.url || s.provider === dyn.provider)) {
        combined.push(dyn);
      }
    }

    this.currentStreams = combined;

    // 5. Transform to rich ServerOption items for UI consumption
    return this.buildServerOptions();
  }

  /**
   * Generates the ServerOption list reflecting current health and metadata.
   */
  public buildServerOptions(): ServerOption[] {
    return this.currentStreams.map((s, index) => {
      const def = this.currentServerDefinitions[index];
      const isVip = def?.isVip || s.quality === '4K';
      const isRecommended = def?.healthStatus === 'recommended' || index === 0;

      let status: ServerOptionStatus = 'ready';
      if (def) {
        if (def.healthStatus === 'cooldown') status = 'cooldown';
        else if (def.healthStatus === 'failed') status = 'failed';
        else if (def.healthStatus === 'checking') status = 'checking';
        else if (def.healthStatus === 'recommended') status = 'recommended';
      }

      let badge: string | undefined = undefined;
      if (isVip) {
        badge = 'VIP 4K';
      } else if (isRecommended) {
        badge = 'STAR';
      } else if (def?.category === 'anime') {
        badge = 'ANIME';
      } else if (def?.category === 'arabic') {
        badge = 'ARABIC';
      }

      return {
        id: def?.id || `server_${index}`,
        name: def?.nameAr || def?.name || s.server || s.provider,
        nameAr: def?.nameAr,
        quality: s.quality,
        badge,
        status,
        priority: def?.priority ?? s.priority,
        category: def?.category || 'video_embed',
        isVip,
        isRecommended,
        latencyMs: def?.lastLatencyMs,
        consecutiveFailures: def?.consecutiveFailures,
      };
    });
  }

  getActiveStream(): StreamResult | null {
    if (this.currentStreams.length === 0) return null;
    return this.currentStreams[this.activeIndex] || this.currentStreams[0];
  }

  getActiveIndex(): number {
    return this.activeIndex;
  }

  selectServer(index: number): StreamResult | null {
    if (index >= 0 && index < this.currentStreams.length) {
      this.activeIndex = index;
      return this.currentStreams[index];
    }
    return null;
  }

  /**
   * Switches to the next server sequentially.
   */
  switchToNextServer(): StreamResult | null {
    if (this.currentStreams.length <= 1) return null;
    this.activeIndex = (this.activeIndex + 1) % this.currentStreams.length;
    return this.currentStreams[this.activeIndex];
  }

  /**
   * Automated Fallback Engine:
   * Marks current active server as failed in registry, then seamlessly switches
   * to the next available healthy server (skipping servers on cooldown or failed).
   */
  fallbackToNextHealthyServer(): { stream: StreamResult | null; index: number } {
    const currentDef = this.currentServerDefinitions[this.activeIndex];
    if (currentDef) {
      serverRegistry.recordFailure(currentDef.id);
    }

    // Find next available healthy server
    const total = this.currentStreams.length;
    if (total <= 1) {
      return { stream: this.getActiveStream(), index: this.activeIndex };
    }

    for (let i = 1; i < total; i++) {
      const candidateIndex = (this.activeIndex + i) % total;
      const candidateDef = this.currentServerDefinitions[candidateIndex];
      if (!candidateDef || (candidateDef.healthStatus !== 'cooldown' && candidateDef.healthStatus !== 'failed')) {
        this.activeIndex = candidateIndex;
        return { stream: this.currentStreams[candidateIndex], index: candidateIndex };
      }
    }

    // If all have some failure flag, fall back to candidate (round-robin)
    this.activeIndex = (this.activeIndex + 1) % total;
    return { stream: this.currentStreams[this.activeIndex], index: this.activeIndex };
  }

  /**
   * Record playback success for current active server
   */
  recordActiveServerSuccess(latencyMs?: number): void {
    const currentDef = this.currentServerDefinitions[this.activeIndex];
    if (currentDef) {
      serverRegistry.recordSuccess(currentDef.id, latencyMs);
    }
  }

  /**
   * Record playback error for current active server
   */
  recordActiveServerFailure(): void {
    const currentDef = this.currentServerDefinitions[this.activeIndex];
    if (currentDef) {
      serverRegistry.recordFailure(currentDef.id);
    }
  }
}

export const serverManager = ServerManager.getInstance();
