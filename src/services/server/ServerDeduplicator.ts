import { ServerStream } from './ServerTypes';

export class ServerDeduplicator {
    /**
     * Normalizes a URL for comparison (removes tracking query parameters, trailing slashes, protocol variations).
     */
    private normalizeUrl(url: string): string {
        try {
            const parsed = new URL(url);
            // Ignore common dynamic tokens and timestamps
            parsed.searchParams.delete('t');
            parsed.searchParams.delete('token');
            parsed.searchParams.delete('_');
            parsed.searchParams.delete('cb');
            return `${parsed.hostname}${parsed.pathname}`.toLowerCase().replace(/\/+$/, '');
        } catch {
            return url.trim().toLowerCase().replace(/\/+$/, '');
        }
    }

    /**
     * Deduplicates streams by normalized URL and provider identifier.
     */
    deduplicate(streams: ServerStream[]): ServerStream[] {
        const seenUrls = new Set<string>();
        const seenNames = new Set<string>();
        const result: ServerStream[] = [];

        for (const stream of streams) {
            const norm = this.normalizeUrl(stream.url);
            const nameKey = `${stream.name.toLowerCase()}:${stream.quality}`;

            if (!seenUrls.has(norm) && !seenNames.has(nameKey)) {
                seenUrls.add(norm);
                seenNames.add(nameKey);
                result.push(stream);
            }
        }

        return result;
    }
}
