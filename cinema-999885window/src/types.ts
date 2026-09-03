export type MediaType = 'movie' | 'tv' | 'anime' | 'cartoon' | 'arabic';

export type EpisodeStatus = 'released' | 'upcoming';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  slug?: string;
  duration?: string;
  stillPath?: string;
  airDate?: string;
  airstamp?: string;
  status?: EpisodeStatus;
  isUpcoming?: boolean;
  overview?: string;
  isSub?: boolean;
  isDub?: boolean;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodesCount?: number;
  totalScheduledEpisodes?: number;
  episodes?: Episode[];
  posterPath?: string;
  airDate?: string;
}

export interface CastMember {
  id: number;
  name: string;
  originalName?: string;
  character?: string;
  profilePath?: string;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profilePath?: string;
}

export interface MediaVideo {
  id: string;
  key: string;
  name: string;
  site: string; // 'YouTube', etc.
  type: string; // 'Trailer', 'Teaser', 'Featurette'
  official?: boolean;
}

export interface MediaKeyword {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logoPath?: string;
  originCountry?: string;
}

export interface MediaItem {
  id: string | number;
  tmdbId: number;
  imdbId?: string;
  tvdbId?: number;
  tvmazeId?: number;
  anilistId?: number;
  wikidataId?: string;
  title: string;
  originalTitle?: string;
  tagline?: string;
  type: MediaType;
  posterPath: string;
  backdropPath?: string;
  voteAverage: number;
  voteCount?: number;
  popularity?: number;
  releaseDate?: string;
  year?: number | string;
  overview: string;
  genres: string[];
  genreIds?: number[];
  duration?: string;
  seasonsCount?: number;
  episodesCount?: number;
  seasons?: Season[];
  featured?: boolean;
  quality?: string;
  isTrending?: boolean;
  isTopRated?: boolean;
  status?: string;
  divisionSource?: 'tvmaze' | 'tmdb';
  originalLanguage?: string;
  budget?: number;
  revenue?: number;
  cast?: CastMember[];
  crew?: CrewMember[];
  director?: string;
  videos?: MediaVideo[];
  keywords?: MediaKeyword[];
  productionCompanies?: ProductionCompany[];
  similar?: MediaItem[];
  recommendations?: MediaItem[];
  rawTmdbData?: any;
}

export interface DiscoverFilterParams {
  type?: 'movie' | 'tv' | 'anime' | 'cartoon' | 'all';
  genreId?: number;
  year?: number | string;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'revenue.desc' | 'vote_count.desc';
  language?: string; // 'ar', 'ja', 'ko', 'en', 'tr', 'fr', 'es', 'hi'
  minRating?: number;
  keyword?: string;
  page?: number;
}

export interface ServerProvider {
  id: string;
  name: string;
  rawLabel: string;
  nameAr: string;
  homepage: string;
  movie: string;
  tv: string;
  idType: 'tmdb' | 'imdb' | 'all';
  enabled: boolean;
  priority: number;
  quality: '4K UHD' | '1080p FHD' | '720p HD';
  hasArabicSub: boolean;
  isVip: boolean;
  isPrimary: boolean;
  group: 'vip' | 'fast' | 'vidsrc';
}

export interface WatchHistoryItem {
  mediaId: string | number;
  tmdbId: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  type: MediaType;
  season?: number;
  episode?: number;
  watchedAt: number;
  progressPercentage?: number;
  currentTime?: number;
  duration?: number;
  voteAverage?: number;
  year?: number | string;
  overview?: string;
}

export interface FavoriteItem {
  mediaId: string | number;
  tmdbId: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  type: MediaType;
  voteAverage: number;
  year?: number | string;
  addedAt: number;
}

export type CategoryFilter = 'all' | 'movie' | 'tv' | 'anime' | 'cartoon' | 'trending' | 'favorites' | 'history';
