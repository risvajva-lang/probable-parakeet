import { ServerStream, StreamQuality } from './ServerTypes';

const QUALITY_SCORES: Record<StreamQuality, number> = {
    '4K UHD': 400,
    '1080p FHD': 300,
    '720p HD': 200,
    '480p SD': 100,
    'Auto': 250
};

export class ServerSorter {
    /**
     * Sorts servers according to:
     * 1. Playable state (playable first)
     * 2. Quality rank (higher resolution first)
     * 3. Response latency (faster response time first)
     * 4. Provider priority
     * 5. Server priority
     */
    sort(streams: ServerStream[]): ServerStream[] {
        const sorted = [...streams].sort((a, b) => {
            // 1. Playability
            if (a.isPlayable !== b.isPlayable) {
                return (b.isPlayable ? 1 : 0) - (a.isPlayable ? 1 : 0);
            }

            // 2. Quality
            const qualityA = QUALITY_SCORES[a.quality] || 200;
            const qualityB = QUALITY_SCORES[b.quality] || 200;
            if (qualityA !== qualityB) {
                return qualityB - qualityA;
            }

            // 3. Response latency (lower ms is better)
            const latencyA = a.responseTimeMs ?? 9999;
            const latencyB = b.responseTimeMs ?? 9999;
            if (Math.abs(latencyA - latencyB) > 200) { // meaningful latency difference
                return latencyA - latencyB;
            }

            // 4. Provider priority (lower number = higher priority)
            if (a.providerPriority !== b.providerPriority) {
                return a.providerPriority - b.providerPriority;
            }

            // 5. Server internal priority
            return a.serverPriority - b.serverPriority;
        });

        // Tag the first playable stream as recommended
        let assigned = false;
        return sorted.map((s, index) => {
            if (!assigned && (s.isPlayable ?? true)) {
                assigned = true;
                return { ...s, isRecommended: true };
            }
            return { ...s, isRecommended: false };
        });
    }
}
