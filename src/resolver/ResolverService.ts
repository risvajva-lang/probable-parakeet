import { Media, StreamResult } from '../models/types';
import { providerManager } from './ProviderManager';

export class ResolverService {
  private static instance: ResolverService;

  public static getInstance(): ResolverService {
    if (!ResolverService.instance) {
      ResolverService.instance = new ResolverService();
    }
    return ResolverService.instance;
  }

  async resolveAll(media: Media, season?: number, episode?: number): Promise<StreamResult[]> {
    const providers = providerManager.getProviders();

    const tasks = providers.map(async (provider) => {
      try {
        const available = await provider.isAvailable();
        if (!available) return null;
        return await provider.resolve(media, season, episode);
      } catch (err) {
        return null;
      }
    });

    const settled = await Promise.allSettled(tasks);
    const results: StreamResult[] = [];

    settled.forEach((res) => {
      if (res.status === 'fulfilled' && res.value) {
        results.push(res.value);
      }
    });

    // Deduplicate and sort by priority descending
    return results.sort((a, b) => b.priority - a.priority);
  }

  async resolveBest(media: Media, season?: number, episode?: number): Promise<StreamResult | null> {
    const all = await this.resolveAll(media, season, episode);
    return all.length > 0 ? all[0] : null;
  }
}

export const resolverService = ResolverService.getInstance();
