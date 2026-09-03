import { MediaRequest, ServerProvider, ServerStream } from './ServerTypes';

export class ServerResolver {
    /**
     * Resolves all streams from providers in parallel.
     * Each provider has an isolated timeout.
     * Uses Promise.allSettled so failures in one provider do not impact others.
     */
    async resolveFromProviders(
        providers: ServerProvider[],
        request: MediaRequest,
        timeoutMs: number = 8000
    ): Promise<ServerStream[]> {
        const promises = providers.map(async provider => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const streams = await provider.resolveStreams(request, controller.signal);
                clearTimeout(timer);
                return streams;
            } catch (err) {
                clearTimeout(timer);
                // Provider failure or timeout gracefully handled
                return [] as ServerStream[];
            }
        });

        const settled = await Promise.allSettled(promises);
        const aggregated: ServerStream[] = [];

        for (const result of settled) {
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                aggregated.push(...result.value);
            }
        }

        return aggregated;
    }
}
