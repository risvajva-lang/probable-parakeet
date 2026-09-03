import { MediaRequest, ServerStream } from './ServerTypes';

interface CacheEntry {
    streams: ServerStream[];
    timestamp: number;
}

export class ServerCache {
    private cache = new Map<string, CacheEntry>();
    private readonly ttlMs: number;

    constructor(ttlMs: number = 10 * 60 * 1000) { // default 10 minutes
        this.ttlMs = ttlMs;
    }

    private buildKey(request: MediaRequest): string {
        return `${request.type}:${request.tmdbId}:${request.season ?? 1}:${request.episode ?? 1}`;
    }

    get(request: MediaRequest): ServerStream[] | null {
        const key = this.buildKey(request);
        const entry = this.cache.get(key);
        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > this.ttlMs;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.streams;
    }

    set(request: MediaRequest, streams: ServerStream[]): void {
        const key = this.buildKey(request);
        this.cache.set(key, {
            streams,
            timestamp: Date.now()
        });
    }

    clear(): void {
        this.cache.clear();
    }
}
