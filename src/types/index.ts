export type MediaType = 'movie' | 'tv' | 'anime';

export interface Genre {
  id: number;
  name: string;
  nameAr?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profilePath: string | null;
}

export interface Company {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry?: string;
}

export interface Network {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry?: string;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  titleAr?: string;
  overview: string;
  stillPath: string | null;
  runtimeMinutes?: number;
  airDate?: string;
  voteAverage?: number;
  watched?: boolean;
  progressSeconds?: number;
  durationSeconds?: number;
  lastWatchedDate?: string;
}

export interface Season {
  id: number;
  seasonNumber: number;
  title: string;
  episodeCount: number;
  posterPath: string | null;
  episodes?: Episode[];
}

export interface Media {
  id: number;
  tmdbId?: number;
  imdbId?: string;
  anilistId?: number;
  traktId?: number;
  title: string;
  titleAr?: string;
  originalTitle?: string;
  overview: string;
  overviewAr?: string;
  posterPath: string | null;
  backdropPath: string | null;
  mediaType: MediaType;
  releaseYear?: number;
  releaseDate?: string;
  runtimeMinutes?: number;
  voteAverage: number;
  voteCount?: number;
  country?: string;
  countryCode?: string;
  genres: Genre[];
  seasons?: Season[];
  cast?: CastMember[];
  crew?: CrewMember[];
  companies?: Company[];
  networks?: Network[];
  trailerUrl?: string;
  isTrending?: boolean;
  isVip?: boolean;
  isAnime?: boolean;
  recommendations?: Media[];
  similar?: Media[];
}

// Aliases for clear semantic usage
export type Movie = Media & { mediaType: 'movie' };
export type TVShow = Media & { mediaType: 'tv' };
export type Anime = Media & { mediaType: 'anime'; animeSeason?: string; totalEpisodes?: number; subType?: 'Sub' | 'Dub' | 'Both' };
export type Cast = CastMember;

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  isDefault?: boolean;
  isDub?: boolean;
}

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  format: 'srt' | 'vtt' | 'ass';
  isDefault?: boolean;
}

export interface VideoSource {
  provider: string;
  host: string;
  url: string;
  type: 'hls' | 'mp4' | 'dash' | 'embed';
  quality: '4K' | '1080p' | '720p' | '480p' | 'Auto';
  headers?: Record<string, string>;
  subtitles?: Subtitle[];
  audioTracks?: AudioTrack[];
  server: string;
  priority: number;
  isDirect?: boolean;
}

export type StreamResult = VideoSource;
export type SubtitleTrack = Subtitle;

export interface ProviderCapabilities {
  supportsMovies: boolean;
  supportsTv: boolean;
  supportsAnime: boolean;
  supportsSubtitles: boolean;
  supportsDirectStream: boolean;
  supportsEmbed: boolean;
  requiresHeaders: boolean;
}

export interface Provider {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  priority: number;
  enabled: boolean;
  healthStatus: 'available' | 'checking' | 'recommended' | 'failed' | 'cooldown';
  movie: (tmdbId: number, imdbId?: string) => Promise<VideoSource[]>;
  tv: (tmdbId: number, season: number, episode: number, imdbId?: string) => Promise<VideoSource[]>;
  anime: (animeId: number | string, episode: number) => Promise<VideoSource[]>;
  subtitles: (media: Media, season?: number, episode?: number) => Promise<Subtitle[]>;
  resolve: (request: { tmdbId: number; type: MediaType; season?: number; episode?: number }) => Promise<VideoSource[]>;
}

export interface WatchProgress {
  mediaId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  positionSeconds: number;
  durationSeconds: number;
  watched: boolean;
  lastWatchedDate: number;
}

export type WatchHistoryItem = WatchProgress;

export interface LibraryItem {
  id: string;
  media: Media;
  addedAt: number;
  type: 'favorite' | 'watchlist' | 'history' | 'watched_movie' | 'watched_episode';
  progress?: WatchProgress;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: 'release' | 'recommendation' | 'favorite' | 'episode' | 'general';
  mediaId?: number;
  timestamp: number;
  read: boolean;
}

export interface UserSettings {
  language: 'ar' | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'hi' | 'ur' | 'id' | 'tr';
  theme: 'dark' | 'black' | 'system';
  autoplayNext: boolean;
  skipIntro: boolean;
  defaultQuality: '4K' | '1080p' | '720p' | 'Auto';
  defaultPlayer: 'internal' | 'system' | 'vlc' | 'mx';
  subtitlesEnabled: boolean;
  preferredSubtitleLanguage: string;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitlePosition: 'bottom' | 'top';
  subtitleDelay: number; // in seconds, e.g. -2, 0, 1.5
  preferredAudioLanguage: string;
  notificationsEnabled: boolean;
  notifyNewReleases: boolean;
  notifyRecommendations: boolean;
  notifyFavorites: boolean;
  notifyEpisodes: boolean;
  anonymousAnalytics: boolean;
  crashReporting: boolean;
  traktConnected: boolean;
  traktUsername?: string;
}

export type ServerOptionStatus = 'ready' | 'loading' | 'failed' | 'checking' | 'recommended' | 'cooldown';

export interface ServerOption {
  id: string;
  name: string;
  nameAr?: string;
  badge?: string;
  quality: string;
  status: ServerOptionStatus;
  priority: number;
  category?: string;
  latencyMs?: number;
  isVip?: boolean;
  isRecommended?: boolean;
  consecutiveFailures?: number;
}
