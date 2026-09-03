/**
 * API Client - Centralized HTTP client with timeouts, retries, and normalized responses
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = 'https://api.hdoflix.com/v1', defaultTimeout: number = 8000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const timeout = options.timeoutMs || this.defaultTimeout;
    const retries = options.retries ?? 2;

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HDOFLIX-App/2.4.0 (Android)',
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (err: any) {
        attempt++;
        if (attempt > retries) {
          throw err;
        }
        await new Promise((res) => setTimeout(res, 400 * attempt));
      }
    }

    throw new Error('API Request Failed after multiple retries');
  }

  async post<T>(endpoint: string, body: any, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const apiClient = new ApiClient();
