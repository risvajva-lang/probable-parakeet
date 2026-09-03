/**
 * Dynamic Server Management System - Types & Interfaces
 * HDOFLIX Architecture
 */

export type MediaType = 'movie' | 'tv' | 'anime' | 'cartoon';

export interface MediaRequest {
    tmdbId: number;
    imdbId?: string;
    type: MediaType;
    title: string;
    year?: number | string;
    season?: number;
    episode?: number;
    originalTitle?: string;
    releaseDate?: string;
    mediaId?: string;
}

export type StreamQuality = '4K UHD' | '1080p FHD' | '720p HD' | '480p SD' | 'Auto';

export interface SubtitleTrack {
    name: string;
    url: string;
    lang?: string;
    isDefault?: boolean;
}

export interface ServerResult {
    id: string;
    name: string;
    server?: string;
    nameAr?: string;
    providerId: string;
    provider?: string;
    url: string;
    quality: StreamQuality;
    headers?: Record<string, string>;
    subtitles?: SubtitleTrack[];
    isDirectStream: boolean; // true for HLS / MP4, false for iframe embed
    format?: 'hls' | 'mp4' | 'mpd' | 'embed';
    responseTimeMs?: number;
    responseTime?: number;
    isPlayable?: boolean;
    isAvailable?: boolean;
    available?: boolean;
    isRecommended?: boolean;
    providerPriority: number;
    serverPriority: number;
}

export type ServerStream = ServerResult;

export interface ServerProvider {
    readonly id: string;
    readonly name: string;
    readonly priority: number;
    readonly supportedTypes: MediaType[];

    /**
     * Resolves playable streams/results for the requested media.
     * Must respect timeout signal and return available streams.
     */
    resolveStreams(request: MediaRequest, signal?: AbortSignal): Promise<ServerStream[]>;
    resolve?(request: MediaRequest, signal?: AbortSignal): Promise<ServerResult[]>;

    /**
     * Quick health check / availability ping.
     */
    isAvailable(): Promise<boolean>;

    /**
     * Checks if provider supports the given media request.
     */
    supports?(request: MediaRequest): boolean;
}

export interface ValidationResult {
    isValid: boolean;
    responseTimeMs: number;
    statusCode?: number;
    errorMessage?: string;
}

export interface ServerManagerConfig {
    timeoutPerProviderMs: number;
    maxServersToReturn: number;
    enableCache: boolean;
    cacheTtlMs: number;
    userAgent?: string;
}
