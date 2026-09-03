import {
    MediaRequest,
    ServerManagerConfig,
    ServerProvider,
    ServerStream
} from './ServerTypes';
import { ServerDiscovery } from './ServerDiscovery';
import { ServerResolver } from './ServerResolver';
import { ServerValidator } from './ServerValidator';
import { ServerDeduplicator } from './ServerDeduplicator';
import { ServerSorter } from './ServerSorter';
import { ServerCache } from './ServerCache';

export class ServerManager {
    private discovery = new ServerDiscovery();
    private resolver = new ServerResolver();
    private validator = new ServerValidator();
    private deduplicator = new ServerDeduplicator();
    private sorter = new ServerSorter();
    private cache: ServerCache;
    private config: ServerManagerConfig;

    constructor(config?: Partial<ServerManagerConfig>) {
        this.config = {
            timeoutPerProviderMs: 8000,
            maxServersToReturn: 10,
            enableCache: true,
            cacheTtlMs: 10 * 60 * 1000,
            ...config
        };
        this.cache = new ServerCache(this.config.cacheTtlMs);
    }

    registerProvider(provider: ServerProvider): void {
        this.discovery.registerProvider(provider);
    }

    /**
     * Complete lifecycle for discovering, resolving, validating, deduplicating and sorting servers.
     */
    async getPlayableServers(request: MediaRequest): Promise<ServerStream[]> {
        // 1. Check cache
        if (this.config.enableCache) {
            const cached = this.cache.get(request);
            if (cached && cached.length > 0) {
                return cached;
            }
        }

        // 2. Discover available providers
        const providers = await this.discovery.getAvailableProviders(request);
        if (providers.length === 0) {
            return [];
        }

        // 3. Resolve streams in parallel with timeouts
        const rawStreams = await this.resolver.resolveFromProviders(
            providers,
            request,
            this.config.timeoutPerProviderMs
        );

        if (rawStreams.length === 0) {
            return [];
        }

        // 4. Deduplicate raw streams
        const uniqueStreams = this.deduplicator.deduplicate(rawStreams);

        // 5. Validate streams (reachability & latency)
        const validatedStreams: ServerStream[] = [];
        const validationPromises = uniqueStreams.map(async stream => {
            const result = await this.validator.validateStream(stream, 4000);
            return {
                ...stream,
                isPlayable: result.isValid,
                responseTimeMs: result.responseTimeMs
            };
        });

        const validationResults = await Promise.allSettled(validationPromises);
        for (const res of validationResults) {
            if (res.status === 'fulfilled') {
                validatedStreams.push(res.value);
            }
        }

        // 6. Filter only playable streams
        const playableOnly = validatedStreams.filter(s => s.isPlayable === true);
        const candidates = playableOnly.length > 0 ? playableOnly : validatedStreams;

        // 7. Sort by playable > quality > latency > priority
        const sorted = this.sorter.sort(candidates);

        // 8. Limit by maxServersToReturn
        const finalServers = sorted.slice(0, this.config.maxServersToReturn);

        // 9. Cache valid result
        if (this.config.enableCache && finalServers.length > 0) {
            this.cache.set(request, finalServers);
        }

        return finalServers;
    }
}
