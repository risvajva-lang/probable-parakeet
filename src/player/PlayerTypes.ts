/**
 * PlayerTypes.ts - Type definitions for HDOFLIX Player System
 * Architecture: Internal HDOFLIX Player + External Video Pulse Player
 */

export enum PlayerType {
  HDOFLIX_INTERNAL = 'HDOFLIX_INTERNAL',
  VIDEO_PULSE = 'VIDEO_PULSE',
}

export type MediaType = 'movie' | 'tv' | 'anime' | 'cartoon';

export interface SubtitleTrack {
  name: string;
  url: string;
  lang?: string;
  format?: 'vtt' | 'srt' | 'ass';
  isDefault?: boolean;
}

export interface PlaybackMedia {
  id: number | string;
  title: string;
  streamUrl: string;
  type?: MediaType;
  isTv: boolean;
  seriesName?: string;
  season?: number;
  episode?: number;
  posterUrl?: string;
  subtitles?: SubtitleTrack[];
  headers?: Record<string, string>;
}

export type PlayerLaunchResult =
  | { status: 'SUCCESS'; playerType: PlayerType }
  | { status: 'NOT_INSTALLED'; packageName: string; appName: string }
  | { status: 'LAUNCH_FAILED'; reason: string }
  | { status: 'INVALID_STREAM_URL'; url?: string };

export interface VideoPulseContractConfig {
  packageName: string;
  intentAction: string;
  mimeType: string;
  playStoreUrl: string;
  webStoreUrl: string;
  titleExtraKey: string;
  mediaTitleExtraKey: string;
  isTvExtraKey: string;
  seriesNameExtraKey: string;
  seasonExtraKey: string;
  episodeExtraKey: string;
  posterUrlExtraKey: string;
  subBundleKey: string;
  linkBundleKey: string;
}
