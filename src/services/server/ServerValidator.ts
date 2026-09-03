import { ServerStream, ValidationResult } from './ServerTypes';

export class ServerValidator {
    /**
     * Validates a stream URL by checking protocol and doing a lightweight HEAD / GET check.
     */
    async validateStream(stream: ServerStream, timeoutMs: number = 5000): Promise<ValidationResult> {
        const startTime = Date.now();

        if (!stream.url || !stream.url.startsWith('http')) {
            return {
                isValid: false,
                responseTimeMs: Date.now() - startTime,
                errorMessage: 'Invalid URL protocol'
            };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const headers: Record<string, string> = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...(stream.headers || {})
            };

            // Embed servers or direct streams can be verified
            const response = await fetch(stream.url, {
                method: 'HEAD',
                headers,
                signal: controller.signal
            }).catch(async () => {
                // If HEAD fails/blocked, fallback to GET with range or abort early
                return await fetch(stream.url, {
                    method: 'GET',
                    headers: { ...headers, Range: 'bytes=0-100' },
                    signal: controller.signal
                });
            });

            clearTimeout(timeoutId);
            const responseTimeMs = Date.now() - startTime;

            // Accept 2xx and 3xx redirects
            const isOk = response.status >= 200 && response.status < 400;

            return {
                isValid: isOk,
                responseTimeMs,
                statusCode: response.status,
                errorMessage: isOk ? undefined : `HTTP Error ${response.status}`
            };
        } catch (error: any) {
            return {
                isValid: false,
                responseTimeMs: Date.now() - startTime,
                errorMessage: error?.message || 'Network timeout or unreachable'
            };
        }
    }
}
