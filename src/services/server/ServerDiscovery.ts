import { MediaRequest, MediaType, ServerProvider, ServerStream } from './ServerTypes';
import { serverRegistry, ServerDefinition } from './ServerRegistry';

export class ServerDefinitionProviderAdapter implements ServerProvider {
    readonly id: string;
    readonly name: string;
    readonly priority: number;
    readonly supportedTypes: MediaType[];

    constructor(private def: ServerDefinition) {
        this.id = def.id;
        this.name = def.name;
        this.priority = def.priority;
        const types: MediaType[] = [];
        if (def.supportsMovie) types.push('movie');
        if (def.supportsTv) types.push('tv');
        if (def.supportsAnime) types.push('anime');
        this.supportedTypes = types.length > 0 ? types : ['movie', 'tv'];
    }

    async isAvailable(): Promise<boolean> {
        return this.def.enabled && this.def.healthStatus !== 'cooldown' && this.def.healthStatus !== 'failed';
    }

    async resolveStreams(request: MediaRequest): Promise<ServerStream[]> {
        const url = serverRegistry.buildPlayableUrl(this.def, request);
        if (!url) return [];

        const stream: ServerStream = {
            id: `${this.def.id}_${request.tmdbId}`,
            name: this.def.name,
            server: this.def.name,
            nameAr: this.def.nameAr,
            providerId: this.def.id,
            provider: this.def.name,
            url,
            quality: this.def.quality,
            isDirectStream: this.def.type === 'direct',
            format: this.def.type === 'direct' ? 'hls' : 'embed',
            providerPriority: this.def.priority,
            serverPriority: this.def.priority,
            isRecommended: this.def.healthStatus === 'recommended',
            isPlayable: true,
            isAvailable: true,
            available: true,
        };
        return [stream];
    }
}

export class ServerDiscovery {
    private providers: ServerProvider[] = [];

    constructor() {
        this.loadFromRegistry();
    }

    loadFromRegistry(): void {
        const definitions = serverRegistry.getAll().filter(d => 
            d.category === 'video_embed' || d.category === 'stream_host' || d.category === 'anime' || d.category === 'arabic'
        );
        for (const def of definitions) {
            this.registerProvider(new ServerDefinitionProviderAdapter(def));
        }
    }

    registerProvider(provider: ServerProvider): void {
        if (!this.providers.some(p => p.id === provider.id)) {
            this.providers.push(provider);
            this.providers.sort((a, b) => a.priority - b.priority);
        }
    }

    unregisterProvider(providerId: string): void {
        this.providers = this.providers.filter(p => p.id !== providerId);
    }

    getEligibleProviders(request: MediaRequest): ServerProvider[] {
        return this.providers.filter(p => p.supportedTypes.includes(request.type));
    }

    async getAvailableProviders(request: MediaRequest): Promise<ServerProvider[]> {
        serverRegistry.checkCooldowns();
        const eligible = this.getEligibleProviders(request);
        const checkPromises = eligible.map(async p => {
            try {
                const ok = await p.isAvailable();
                return ok ? p : null;
            } catch {
                return null;
            }
        });

        const results = await Promise.all(checkPromises);
        return results.filter((p): p is ServerProvider => p !== null);
    }
}
