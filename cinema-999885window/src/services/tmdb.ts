import { MediaItem, MediaType, Season, Episode, CastMember, CrewMember, MediaVideo, MediaKeyword, ProductionCompany, DiscoverFilterParams } from '../types';
import { TvmazeService } from './tvmaze';
import { slugify, removeArabicTashkeel } from '../utils/slugify';

// Fallback pool of active TMDB API Keys for 100% reliable failover in static/client environments
const DEFAULT_TMDB_API_KEYS = [
  '1cf50e6248dc270629e802686245c2c8',
  '844dba0bfd8f3a4f3799f6130ef9e335',
  'c0b0a88006bfdc37f6a7d5cf59de96dc',
  '39b1a511ec9cf5c777492c0ee9bc1777',
  'f7e2d9b6e828d1c9efbe4ff4be3ef3bf',
  '4e44d9029b1270a757cddc766a1bcb63',
  'b66e3ff5c13e4b77d6da0593b4a2f2ef'
];

const CUSTOM_KEY_STORAGE_KEY = 'cinem9a_custom_tmdb_key';
let currentKeyIndex = 0;

function getActiveKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
    if (custom && custom.trim().length > 10) {
      return custom.trim();
    }
  }
  return DEFAULT_TMDB_API_KEYS[currentKeyIndex % DEFAULT_TMDB_API_KEYS.length];
}

function rotateKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % DEFAULT_TMDB_API_KEYS.length;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Complete Arabic Genre mappings
export const GENRES_MAP: Record<number, string> = {
  28: 'أكشن',
  12: 'مغامرة',
  16: 'أنمي ورسوم متحركة',
  35: 'كوميديا',
  80: 'جريمة',
  99: 'وثائقي',
  18: 'دراما',
  10751: 'عائلي',
  14: 'فانتازيا وخيال',
  36: 'تاريخي',
  27: 'رعب',
  10402: 'موسيقى',
  9648: 'غموض',
  10749: 'رومانسي',
  878: 'خيال علمي',
  10770: 'فيلم تلفزيوني',
  53: 'إثارة وتشويق',
  10752: 'حرب',
  37: 'غرب أمريكي',
  10759: 'حركة ومغامرة',
  10762: 'أطفال',
  10763: 'أخبار',
  10764: 'واقعي',
  10765: 'خيال علمي وفانتازيا',
  10766: 'مسلسلات درامية',
  10767: 'حوار وبرامج',
  10768: 'حرب وسياسة'
};

export const ALL_GENRES_LIST: { id: number; name: string; type: 'all' | 'movie' | 'tv' | 'anime' }[] = [
  { id: 0, name: 'جميع التصنيفات', type: 'all' },
  { id: 28, name: 'أكشن ومطاردات', type: 'movie' },
  { id: 10759, name: 'حركة ومغامرة', type: 'tv' },
  { id: 16, name: 'أنمي ورسوم متحركة', type: 'anime' },
  { id: 35, name: 'كوميديا وضحك', type: 'all' },
  { id: 18, name: 'دراما اجتماعية', type: 'all' },
  { id: 27, name: 'رعب وإثارة مخيفة', type: 'movie' },
  { id: 878, name: 'خيال علمي وفضاء', type: 'movie' },
  { id: 10765, name: 'فانتازيا وخوارق', type: 'tv' },
  { id: 80, name: 'جريمة وتحقيق', type: 'all' },
  { id: 9648, name: 'غموض وألغاز', type: 'all' },
  { id: 10749, name: 'رومانسية وعاطفة', type: 'movie' },
  { id: 53, name: 'إثارة وتشويق حابس للأنفاس', type: 'movie' },
  { id: 12, name: 'مغامرات واستكشاف', type: 'movie' },
  { id: 14, name: 'فانتازيا وأساطير', type: 'movie' },
  { id: 36, name: 'تاريخ وسير ذاتية', type: 'movie' },
  { id: 10752, name: 'حروب ومعارك', type: 'movie' },
  { id: 99, name: 'وثائقي ومعرفي', type: 'all' },
  { id: 10751, name: 'عائلي وجميع الأعمار', type: 'all' },
  { id: 10402, name: 'موسيقى وغناء', type: 'movie' }
];

export const LANGUAGES_LIST: { code: string; label: string; flag: string }[] = [
  { code: '', label: 'جميع اللغات', flag: '🌐' },
  { code: 'ar', label: 'العربية (سينما ومسلسلات عربية)', flag: '🇸🇦' },
  { code: 'ja', label: 'اليابانية (الأنمي والدراما اليابانية)', flag: '🇯🇵' },
  { code: 'ko', label: 'الكورية (دراما K-Drama وسينما)', flag: '🇰🇷' },
  { code: 'tr', label: 'التركية (مسلسلات تركية مدبلجة ومترجمة)', flag: '🇹🇷' },
  { code: 'en', label: 'الإنجليزية (هوليوود وعالمي)', flag: '🇺🇸' },
  { code: 'es', label: 'الإسبانية (سينما ومسلسلات لاتينية)', flag: '🇪🇸' },
  { code: 'fr', label: 'الفرنسية', flag: '🇫🇷' },
  { code: 'hi', label: 'الهندية (بوليوود وأكشن هندي)', flag: '🇮🇳' },
  { code: 'de', label: 'الألمانية', flag: '🇩🇪' },
  { code: 'it', label: 'الإيطالية', flag: '🇮🇹' }
];

// Client-side Memory Cache
const clientCache = new Map<string, { data: any; expiresAt: number }>();

function getClientCached<T>(key: string): T | null {
  const item = clientCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    clientCache.delete(key);
    return null;
  }
  return item.data;
}

function setClientCached<T>(key: string, data: T, ttlMs = 1800000): void {
  if (clientCache.size > 500) {
    const firstKey = clientCache.keys().next().value;
    if (firstKey) clientCache.delete(firstKey);
  }
  clientCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Universal fetcher: Calls backend proxy `/api/tmdb/...` first, then falls back to direct TMDB call
 */
async function fetchSmart(proxyEndpoint: string, directEndpointBuilder: (key: string) => string): Promise<any> {
  const cacheKey = `smart_${proxyEndpoint}`;
  const cached = getClientCached(cacheKey);
  if (cached) return cached;

  // 1. Try Backend Proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(proxyEndpoint, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) {
        setClientCached(cacheKey, data);
        return data;
      }
    }
  } catch {
    // Fall back to direct
  }

  // 2. Direct Fallback
  for (let attempt = 0; attempt < DEFAULT_TMDB_API_KEYS.length; attempt++) {
    const key = getActiveKey();
    const url = directEndpointBuilder(key);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403 || res.status === 429) {
        rotateKey();
        continue;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data && data.success !== false && data.status_code !== 7) {
        setClientCached(cacheKey, data);
        return data;
      }
    } catch {
      rotateKey();
    }
  }

  throw new Error('Could not fetch TMDB content');
}

export const TmdbService = {
  getCustomApiKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(CUSTOM_KEY_STORAGE_KEY) || '';
  },

  setCustomApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    if (key.trim()) {
      localStorage.setItem(CUSTOM_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(CUSTOM_KEY_STORAGE_KEY);
    }
  },

  isUsingCustomKey(): boolean {
    return !!this.getCustomApiKey();
  },

  getActiveKeySummary(): { isCustom: boolean; totalKeys: number; activePrefix: string } {
    const custom = this.getCustomApiKey();
    if (custom) {
      return {
        isCustom: true,
        totalKeys: 1,
        activePrefix: custom.substring(0, 4) + '...'
      };
    }
    const key = getActiveKey();
    return {
      isCustom: false,
      totalKeys: DEFAULT_TMDB_API_KEYS.length,
      activePrefix: key.substring(0, 4) + '...'
    };
  },

  getImageUrl(path: string | null | undefined, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) {
      return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
    }
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE}/${size}${path}`;
  },

  formatTmdbItem(item: any, forcedType?: MediaType): MediaItem {
    const isAnimation =
      item.genre_ids?.includes(16) ||
      item.genres?.some((g: any) => g.id === 16 || g.name === 'Animation' || g.name === 'رسوم متحركة' || g.name === 'أنمي');

    const isJapanese =
      item.original_language === 'ja' ||
      (Array.isArray(item.origin_country) && item.origin_country.includes('JP')) ||
      (Array.isArray(item.production_countries) && item.production_countries.some((pc: any) => pc.iso_3166_1 === 'JP'));

    let type: MediaType;
    if (forcedType) {
      if (forcedType === 'anime' && isAnimation && !isJapanese) {
        type = 'cartoon';
      } else {
        type = forcedType;
      }
    } else if (isAnimation) {
      type = isJapanese ? 'anime' : 'cartoon';
    } else {
      const isMovie = item.media_type === 'movie' || !!item.title;
      type = isMovie ? 'movie' : 'tv';
    }

    const genres: string[] = [];
    const genreIds: number[] = [];
    if (Array.isArray(item.genres) && item.genres.length > 0) {
      item.genres.forEach((g: any) => {
        genres.push(g.name);
        if (g.id) genreIds.push(g.id);
      });
    } else if (Array.isArray(item.genre_ids)) {
      item.genre_ids.forEach((id: number) => {
        genreIds.push(id);
        if (GENRES_MAP[id]) genres.push(GENRES_MAP[id]);
      });
    }

    const title = item.title || item.name || item.original_title || item.original_name || 'عمل سينمائي';
    const originalTitle = item.original_title || item.original_name;
    const releaseDate = item.release_date || item.first_air_date || '';
    const year = releaseDate ? releaseDate.substring(0, 4) : undefined;

    const rawVote = typeof item.vote_average === 'number' && item.vote_average > 0 ? item.vote_average : 0;
    const voteAverage = rawVote > 0 ? Number(rawVote.toFixed(1)) : 0;

    const overview =
      item.overview && item.overview.trim().length > 0
        ? item.overview
        : `مشاهدة وتفاصيل ${title} عبر شباك السينما بجودة عالية وسيرفرات سريعة.`;

    let cast: CastMember[] | undefined;
    let crew: CrewMember[] | undefined;
    let director: string | undefined;
    if (item.credits?.cast && Array.isArray(item.credits.cast)) {
      cast = item.credits.cast.slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        originalName: c.original_name,
        character: c.character,
        profilePath: c.profile_path ? this.getImageUrl(c.profile_path, 'w300') : undefined,
        order: c.order
      }));
    }
    if (item.credits?.crew && Array.isArray(item.credits.crew)) {
      crew = item.credits.crew.slice(0, 10).map((cr: any) => ({
        id: cr.id,
        name: cr.name,
        job: cr.job,
        department: cr.department,
        profilePath: cr.profile_path ? this.getImageUrl(cr.profile_path, 'w300') : undefined
      }));
      const dir = item.credits.crew.find((cr: any) => cr.job === 'Director');
      if (dir) director = dir.name;
    }

    let videos: MediaVideo[] | undefined;
    if (item.videos?.results && Array.isArray(item.videos.results)) {
      videos = item.videos.results
        .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
        .map((v: any) => ({
          id: v.id,
          key: v.key,
          name: v.name,
          site: v.site,
          type: v.type,
          official: v.official
        }));
    }

    let keywords: MediaKeyword[] | undefined;
    const rawKeywords = item.keywords?.keywords || item.keywords?.results;
    if (Array.isArray(rawKeywords)) {
      keywords = rawKeywords.slice(0, 12).map((k: any) => ({
        id: k.id,
        name: k.name
      }));
    }

    let productionCompanies: ProductionCompany[] | undefined;
    if (Array.isArray(item.production_companies)) {
      productionCompanies = item.production_companies.map((pc: any) => ({
        id: pc.id,
        name: pc.name,
        logoPath: pc.logo_path ? this.getImageUrl(pc.logo_path, 'w300') : undefined,
        originCountry: pc.origin_country
      }));
    }

    return {
      id: `tmdb-${item.id}`,
      tmdbId: item.id,
      imdbId: item.imdb_id || item.external_ids?.imdb_id,
      tvdbId: item.external_ids?.tvdb_id,
      wikidataId: item.external_ids?.wikidata_id,
      title,
      originalTitle,
      tagline: item.tagline,
      type,
      posterPath: this.getImageUrl(item.poster_path, 'w500'),
      backdropPath: item.backdrop_path ? this.getImageUrl(item.backdrop_path, 'original') : undefined,
      voteAverage,
      voteCount: typeof item.vote_count === 'number' ? item.vote_count : 0,
      popularity: item.popularity,
      releaseDate,
      year,
      overview,
      genres: genres.length > 0 ? genres : [type === 'movie' ? 'سينما' : type === 'anime' ? 'أنمي' : 'دراما'],
      genreIds,
      quality: voteAverage >= 8.0 ? '4K UHD' : '1080p FHD',
      isTrending: (item.popularity && item.popularity > 50) || voteAverage >= 7.5,
      isTopRated: voteAverage >= 8.0,
      duration: item.runtime && item.runtime > 0 ? `${item.runtime} دقيقة` : item.episode_run_time?.[0] && item.episode_run_time[0] > 0 ? `${item.episode_run_time[0]} دقيقة` : undefined,
      seasonsCount: item.number_of_seasons,
      episodesCount: item.number_of_episodes,
      status: item.status,
      originalLanguage: item.original_language,
      budget: item.budget,
      revenue: item.revenue,
      cast,
      crew,
      director,
      videos,
      keywords,
      productionCompanies,
      rawTmdbData: item
    };
  },

  async discoverMedia(params: DiscoverFilterParams): Promise<{ items: MediaItem[]; totalPages: number; totalResults?: number }> {
    const page = params.page || 1;
    const type = params.type || 'all';
    const endpointType = type === 'movie' ? 'movie' : type === 'anime' || type === 'tv' ? 'tv' : 'movie';

    const queryParams = new URLSearchParams();
    queryParams.set('type', type);
    queryParams.set('page', String(page));
    if (params.sortBy) queryParams.set('sort_by', params.sortBy);
    if (params.genreId && params.genreId > 0) queryParams.set('with_genres', String(params.genreId));
    if (params.year) queryParams.set('year', String(params.year));
    if (params.language) queryParams.set('language', params.language);
    if (params.minRating && params.minRating > 0) queryParams.set('vote_average_gte', String(params.minRating));

    try {
      const data = await fetchSmart(
        `/api/tmdb/discover?${queryParams.toString()}`,
        (key) => {
          const directParams = new URLSearchParams();
          directParams.set('api_key', key);
          directParams.set('language', 'ar-SA');
          directParams.set('page', String(page));
          directParams.set('include_adult', 'false');
          directParams.set('sort_by', params.sortBy || 'popularity.desc');
          if (params.genreId && params.genreId > 0) directParams.set('with_genres', String(params.genreId));
          if (params.year) {
            if (endpointType === 'movie') directParams.set('primary_release_year', String(params.year));
            else directParams.set('first_air_date_year', String(params.year));
          }
          if (params.language) directParams.set('with_original_language', params.language);
          else if (type === 'anime') {
            directParams.set('with_original_language', 'ja');
            directParams.set('with_genres', '16');
          } else if (type === 'cartoon') {
            directParams.set('without_original_language', 'ja');
            directParams.set('with_genres', '16');
          }
          if (params.minRating && params.minRating > 0) {
            directParams.set('vote_average.gte', String(params.minRating));
            directParams.set('vote_count.gte', '20');
          }
          return `${TMDB_BASE_URL}/discover/${endpointType}?${directParams.toString()}`;
        }
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, type === 'all' ? (endpointType === 'movie' ? 'movie' : 'tv') : type));

      return {
        items,
        totalPages: Math.min(data.total_pages || 1, 500),
        totalResults: data.total_results
      };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  /**
   * Fetches 24-hour daily trending content (updated daily by TMDB every 24h)
   */
  async getDailyTrending(type: 'all' | 'movie' | 'tv' | 'anime' = 'all', page: number = 1): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const data = await fetchSmart(
        `/api/tmdb/trending-daily?type=${type}&page=${page}`,
        (key) => {
          if (type === 'anime') {
            return `${TMDB_BASE_URL}/discover/tv?api_key=${key}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&language=ar-SA&page=${page}`;
          } else if (type === 'movie') {
            return `${TMDB_BASE_URL}/trending/movie/day?api_key=${key}&language=ar-SA&page=${page}`;
          } else if (type === 'tv') {
            return `${TMDB_BASE_URL}/trending/tv/day?api_key=${key}&language=ar-SA&page=${page}`;
          } else {
            return `${TMDB_BASE_URL}/trending/all/day?api_key=${key}&language=ar-SA&page=${page}`;
          }
        }
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, type === 'all' ? undefined : type));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  /**
   * Generates a 24-hour daily curated Hero pool with a new featured spotlight each day
   */
  async getDailyHeroPool(category: 'all' | 'movie' | 'tv' | 'anime' = 'all', page: number = 1): Promise<{
    hero: MediaItem | null;
    pool: MediaItem[];
    dayKey: string;
  }> {
    try {
      // Calculate today's date key: YYYY-MM-DD
      const now = new Date();
      const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // Compute numeric day index for deterministic 24-hour rotation
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

      let pool: MediaItem[] = [];

      if (category === 'all') {
        const [dailyRes, nowPlayingMovies, airingTv, animeRes] = await Promise.allSettled([
          this.getDailyTrending('all', page),
          this.getMovies('now_playing', page),
          this.getTvShows('on_the_air', page),
          this.getAnime(page)
        ]);

        const trendingItems = (dailyRes.status === 'fulfilled' ? dailyRes.value.items : []).filter((i) => i.backdropPath);
        const movieItems = (nowPlayingMovies.status === 'fulfilled' ? nowPlayingMovies.value.items : []).filter((i) => i.backdropPath);
        const tvItems = (airingTv.status === 'fulfilled' ? airingTv.value.items : []).filter((i) => i.backdropPath);
        const animeItems = (animeRes.status === 'fulfilled' ? animeRes.value.items : []).filter((i) => i.backdropPath);

        // Interleave high-rated trending items
        const combinedMap = new Map<number, MediaItem>();
        const maxLen = Math.max(trendingItems.length, movieItems.length, tvItems.length, animeItems.length);

        for (let i = 0; i < maxLen; i++) {
          if (trendingItems[i] && !combinedMap.has(trendingItems[i].tmdbId)) combinedMap.set(trendingItems[i].tmdbId, trendingItems[i]);
          if (movieItems[i] && !combinedMap.has(movieItems[i].tmdbId)) combinedMap.set(movieItems[i].tmdbId, movieItems[i]);
          if (tvItems[i] && !combinedMap.has(tvItems[i].tmdbId)) combinedMap.set(tvItems[i].tmdbId, tvItems[i]);
          if (animeItems[i] && !combinedMap.has(animeItems[i].tmdbId)) combinedMap.set(animeItems[i].tmdbId, animeItems[i]);
          if (combinedMap.size >= 16) break;
        }

        pool = Array.from(combinedMap.values());
      } else if (category === 'movie') {
        const [dailyMovies, nowPlaying] = await Promise.allSettled([
          this.getDailyTrending('movie', page),
          this.getMovies('now_playing', page)
        ]);
        const dM = (dailyMovies.status === 'fulfilled' ? dailyMovies.value.items : []).filter((i) => i.backdropPath);
        const nP = (nowPlaying.status === 'fulfilled' ? nowPlaying.value.items : []).filter((i) => i.backdropPath);
        
        const map = new Map<number, MediaItem>();
        [...dM, ...nP].forEach((m) => {
          if (!map.has(m.tmdbId)) map.set(m.tmdbId, m);
        });
        pool = Array.from(map.values()).slice(0, 16);
      } else if (category === 'tv') {
        const [dailyTv, airing] = await Promise.allSettled([
          this.getDailyTrending('tv', page),
          this.getTvShows('on_the_air', page)
        ]);
        const dT = (dailyTv.status === 'fulfilled' ? dailyTv.value.items : []).filter((i) => i.backdropPath);
        const aT = (airing.status === 'fulfilled' ? airing.value.items : []).filter((i) => i.backdropPath);
        
        const map = new Map<number, MediaItem>();
        [...dT, ...aT].forEach((t) => {
          if (!map.has(t.tmdbId)) map.set(t.tmdbId, t);
        });
        pool = Array.from(map.values()).slice(0, 16);
      } else if (category === 'anime') {
        const animeRes = await this.getAnime(page);
        pool = (animeRes?.items || []).filter((i) => i.backdropPath).slice(0, 16);
      }

      if (pool.length === 0) {
        const fallback = await this.getTrending('all', page);
        pool = (fallback?.items || []).filter((i) => i.backdropPath).slice(0, 12);
      }

      // Deterministically pick the spotlight hero based on the day of the year
      // This guarantees a fresh spotlight every single day (every 24 hours)!
      const heroIndex = pool.length > 0 ? dayOfYear % pool.length : 0;
      const hero = pool[heroIndex] || pool[0] || null;

      // Reorder pool so the daily spotlight hero is first
      let reorderedPool = pool;
      if (hero && pool.length > 1) {
        reorderedPool = [hero, ...pool.filter((i) => i.tmdbId !== hero.tmdbId)];
      }

      return {
        hero,
        pool: reorderedPool,
        dayKey
      };
    } catch {
      return { hero: null, pool: [], dayKey: '' };
    }
  },

  async getTrending(type: 'all' | 'movie' | 'tv' | 'anime' | 'cartoon' = 'all', page: number = 1): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const data = await fetchSmart(
        `/api/tmdb/trending?type=${type}&page=${page}`,
        (key) => {
          if (type === 'anime') {
            return `${TMDB_BASE_URL}/discover/tv?api_key=${key}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&language=ar-SA&page=${page}&include_null_first_air_dates=false`;
          } else if (type === 'cartoon') {
            return `${TMDB_BASE_URL}/discover/movie?api_key=${key}&with_genres=16&without_original_language=ja&sort_by=popularity.desc&language=ar-SA&page=${page}&vote_count.gte=10`;
          } else if (type === 'all') {
            return `${TMDB_BASE_URL}/trending/all/week?api_key=${key}&language=ar-SA&page=${page}`;
          } else {
            return `${TMDB_BASE_URL}/trending/${type}/week?api_key=${key}&language=ar-SA&page=${page}`;
          }
        }
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, type === 'all' ? undefined : type));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  async getMovies(category: 'popular' | 'top_rated' | 'now_playing' | 'upcoming' = 'popular', page: number = 1): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const data = await fetchSmart(
        `/api/tmdb/movie/${category}?page=${page}`,
        (key) => `${TMDB_BASE_URL}/movie/${category}?api_key=${key}&language=ar-SA&page=${page}`
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, 'movie'));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  async getTvShows(category: 'popular' | 'top_rated' | 'on_the_air' | 'airing_today' = 'popular', page: number = 1): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const data = await fetchSmart(
        `/api/tmdb/tv/${category}?page=${page}`,
        (key) => `${TMDB_BASE_URL}/tv/${category}?api_key=${key}&language=ar-SA&page=${page}`
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, 'tv'));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  async getAnime(page: number = 1, genreId?: number): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const genreParam = genreId && genreId > 0 ? `&with_genres=16,${genreId}` : '&with_genres=16';
      const data = await fetchSmart(
        `/api/tmdb/discover?type=anime&page=${page}${genreId ? `&with_genres=16,${genreId}` : ''}`,
        (key) => `${TMDB_BASE_URL}/discover/tv?api_key=${key}${genreParam}&with_original_language=ja&sort_by=popularity.desc&language=ar-SA&page=${page}&vote_count.gte=10`
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, 'anime'));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  async getCartoons(page: number = 1, genreId?: number): Promise<{ items: MediaItem[]; totalPages: number }> {
    try {
      const genreParam = genreId && genreId > 0 ? `&with_genres=16,${genreId}` : '&with_genres=16';
      const data = await fetchSmart(
        `/api/tmdb/discover?type=cartoon&page=${page}${genreId ? `&with_genres=16,${genreId}` : ''}`,
        (key) => `${TMDB_BASE_URL}/discover/movie?api_key=${key}${genreParam}&without_original_language=ja&sort_by=popularity.desc&language=ar-SA&page=${page}&vote_count.gte=10`
      );

      const items = (data.results || [])
        .filter((item: any) => item.poster_path || item.backdrop_path)
        .map((item: any) => this.formatTmdbItem(item, 'cartoon'));

      return { items, totalPages: Math.min(data.total_pages || 1, 500) };
    } catch {
      return { items: [], totalPages: 1 };
    }
  },

  async searchMulti(query: string, page: number = 1): Promise<{ items: MediaItem[]; totalPages: number }> {
    const trimmed = query.trim();
    if (!trimmed) return { items: [], totalPages: 1 };

    // Build candidate search queries for multi-lingual and anime slug resolution
    const queriesToTry = [trimmed];
    const cleanLatin = slugify(trimmed);
    if (cleanLatin && cleanLatin !== 'media' && cleanLatin !== trimmed) {
      queriesToTry.push(cleanLatin.replace(/[-_]+/g, ' '));
    }
    const noTashkeel = removeArabicTashkeel(trimmed);
    if (noTashkeel && noTashkeel !== trimmed) {
      queriesToTry.push(noTashkeel);
    }

    for (const q of queriesToTry) {
      try {
        const data = await fetchSmart(
          `/api/tmdb/search?q=${encodeURIComponent(q)}&page=${page}`,
          (key) => `${TMDB_BASE_URL}/search/multi?api_key=${key}&query=${encodeURIComponent(q)}&language=ar-SA&page=${page}&include_adult=false`
        );

        const rawResults = data.results || [];
        const items = rawResults
          .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv' || item.title || item.name) && (item.poster_path || item.backdrop_path))
          .map((item: any) => this.formatTmdbItem(item));

        if (items.length > 0) {
          return { items, totalPages: Math.min(data.total_pages || 1, 500) };
        }
      } catch (err) {
        console.warn('Search multi error for query:', q, err);
      }
    }

    // Secondary fallback: search with language=en-US if Arabic search returned nothing
    for (const q of queriesToTry) {
      try {
        const data = await fetchSmart(
          `/api/tmdb/search?q=${encodeURIComponent(q)}&page=${page}&lang=en`,
          (key) => `${TMDB_BASE_URL}/search/multi?api_key=${key}&query=${encodeURIComponent(q)}&language=en-US&page=${page}&include_adult=false`
        );

        const rawResults = data.results || [];
        const items = rawResults
          .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv' || item.title || item.name) && (item.poster_path || item.backdrop_path))
          .map((item: any) => this.formatTmdbItem(item));

        if (items.length > 0) {
          return { items, totalPages: Math.min(data.total_pages || 1, 500) };
        }
      } catch {
        // Continue
      }
    }

    return { items: [], totalPages: 1 };
  },

  async getMediaDetails(tmdbId: number, type: MediaType): Promise<MediaItem | null> {
    try {
      const tmdbType = type === 'movie' ? 'movie' : 'tv';
      const data = await fetchSmart(
        `/api/tmdb/details/${tmdbType}/${tmdbId}`,
        (key) => `${TMDB_BASE_URL}/${tmdbType}/${tmdbId}?api_key=${key}&language=ar-SA&append_to_response=credits,videos,keywords,recommendations,similar,external_ids`
      );

      const imdbId = data.imdb_id || data.external_ids?.imdb_id;
      const tvdbId = data.external_ids?.tvdb_id;

      let seasons: Season[] = [];
      if (tmdbType === 'tv' && Array.isArray(data.seasons)) {
        seasons = data.seasons
          .filter((s: any) => s.season_number > 0)
          .map((s: any) => ({
            id: `s-${tmdbId}-${s.season_number}`,
            seasonNumber: s.season_number,
            title: TvmazeService.getArabicSeasonTitle(s.season_number, s.name),
            episodesCount: typeof s.episode_count === 'number' ? s.episode_count : 0,
            posterPath: s.poster_path ? this.getImageUrl(s.poster_path) : undefined,
            airDate: s.air_date,
            episodes: []
          }));
      }

      // Check if TMDb has inaccurate single season with massive episodes or missing seasons
      const s1 = seasons.find((s) => s.seasonNumber === 1);
      const isAnimeOrSingleSeasonLumped = seasons.length <= 1 || (s1 && (s1.episodesCount || 0) > 30);

      if (tmdbType === 'tv' && isAnimeOrSingleSeasonLumped && (tvdbId || imdbId || data.name || data.original_name)) {
        try {
          const tvmazeShow = await TvmazeService.lookupShow({
            tvdbId: tvdbId ? Number(tvdbId) : undefined,
            imdbId: imdbId || undefined,
            englishTitle: data.name,
            originalTitle: data.original_name,
            title: data.name
          });

          if (tvmazeShow?.id) {
            const tvmazeSeasons = await TvmazeService.getSeasons(tvmazeShow.id);
            if (tvmazeSeasons.length > 1) {
              seasons = tvmazeSeasons;
            }
          }
        } catch (e) {
          console.warn('TVMaze fallback season lookup error:', e);
        }
      }

      const formatted = this.formatTmdbItem(data, type);
      formatted.imdbId = imdbId;
      formatted.tvdbId = tvdbId;
      formatted.seasons = seasons;
      formatted.seasonsCount = seasons.length > 0 ? seasons.length : (data.number_of_seasons || 1);

      if (data.recommendations?.results && Array.isArray(data.recommendations.results)) {
        formatted.recommendations = data.recommendations.results
          .filter((r: any) => r.poster_path || r.backdrop_path)
          .slice(0, 10)
          .map((r: any) => this.formatTmdbItem(r, type));
      }
      if (data.similar?.results && Array.isArray(data.similar.results)) {
        formatted.similar = data.similar.results
          .filter((r: any) => r.poster_path || r.backdrop_path)
          .slice(0, 10)
          .map((r: any) => this.formatTmdbItem(r, type));
      }

      return formatted;
    } catch {
      return null;
    }
  },

  async getDetails(tmdbId: number, type: MediaType): Promise<MediaItem | null> {
    return this.getMediaDetails(tmdbId, type);
  },

  isValidEpisode(ep: any): boolean {
    if (!ep || typeof ep !== 'object') return false;
    if (typeof ep.episode_number !== 'number' || ep.episode_number < 1) return false;
    return true;
  },

  async getSeasonEpisodes(
    tmdbId: number,
    seasonNumber: number,
    context?: { imdbId?: string; tvdbId?: number; title?: string; originalTitle?: string; seasonsCount?: number; episodesCount?: number }
  ): Promise<Episode[]> {
    const now = Date.now();
    const todayIso = new Date(now).toISOString().slice(0, 10);

    let tvdbId = context?.tvdbId;
    let imdbId = context?.imdbId;
    let englishTitle = context?.title;
    let originalTitle = context?.originalTitle;

    // Check if we should check TVMaze first (e.g. if known anime or multi-season requested)
    const tryTvmazeEpisodes = async (): Promise<Episode[] | null> => {
      try {
        if (!tvdbId && !imdbId && (!englishTitle || !originalTitle)) {
          try {
            const showDetails = await fetchSmart(
              `/api/tmdb/details/tv/${tmdbId}`,
              (key) => `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${key}&append_to_response=external_ids`
            );
            if (showDetails) {
              tvdbId = showDetails.external_ids?.tvdb_id || tvdbId;
              imdbId = showDetails.external_ids?.imdb_id || imdbId;
              englishTitle = showDetails.name || englishTitle;
              originalTitle = showDetails.original_name || originalTitle;
            }
          } catch {
            // Ignore
          }
        }

        const tvmazeShow = await TvmazeService.lookupShow({
          tvdbId: tvdbId ? Number(tvdbId) : undefined,
          imdbId: imdbId || undefined,
          englishTitle,
          originalTitle,
          title: englishTitle
        });

        if (tvmazeShow?.id) {
          const allEpisodes = await TvmazeService.getEpisodes(tvmazeShow.id);
          if (Array.isArray(allEpisodes) && allEpisodes.length > 0) {
            const seasonEps = allEpisodes.filter((ep) => ep.seasonNumber === seasonNumber);
            if (seasonEps.length > 0) {
              return seasonEps.map((ep) => ({
                id: `ep-${tmdbId}-${seasonNumber}-${ep.episodeNumber}`,
                episodeNumber: ep.episodeNumber,
                seasonNumber: seasonNumber,
                title: ep.title.startsWith('الحلقة') ? ep.title : `الحلقة ${ep.episodeNumber}: ${ep.title}`,
                duration: ep.duration,
                stillPath: ep.stillPath,
                airDate: ep.airDate,
                airstamp: ep.airstamp,
                status: ep.status || 'released',
                isUpcoming: ep.isUpcoming ?? (ep.status === 'upcoming'),
                overview: ep.overview,
                isSub: true,
                isDub: false
              }));
            }
          }
        }
      } catch (e) {
        console.warn('TVMaze episode lookup error:', e);
      }
      return null;
    };

    // 1. First attempt: TMDB API for the specific season
    try {
      const data = await fetchSmart(
        `/api/tmdb/season/${tmdbId}/${seasonNumber}`,
        (key) => `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${key}&language=ar-SA`
      );

      if (Array.isArray(data?.episodes) && data.episodes.length > 0) {
        const validEpisodes = data.episodes.filter((ep: any) => this.isValidEpisode(ep));
        
        // If Season 1 contains an abnormally large number of episodes (> 30), TMDb likely lumped all seasons together.
        // In that case, check TVMaze first for accurate season episode splitting!
        if (seasonNumber === 1 && validEpisodes.length > 30) {
          const tvmazeEps = await tryTvmazeEpisodes();
          if (tvmazeEps && tvmazeEps.length > 0) {
            return tvmazeEps;
          }
        }

        if (validEpisodes.length > 0) {
          return validEpisodes.map((ep: any) => {
            const rawName = ep.name || '';
            let title = `الحلقة ${ep.episode_number}`;
            if (rawName && !rawName.toLowerCase().startsWith('episode') && !rawName.startsWith('الحلقة')) {
              title = `الحلقة ${ep.episode_number}: ${rawName}`;
            } else if (rawName && rawName.startsWith('الحلقة')) {
              title = rawName;
            }

            const isFuture = ep.air_date ? ep.air_date > todayIso : false;

            return {
              id: `ep-${tmdbId}-${seasonNumber}-${ep.episode_number}`,
              episodeNumber: ep.episode_number,
              seasonNumber: seasonNumber,
              title,
              duration: ep.runtime ? `${ep.runtime} دقيقة` : undefined,
              stillPath: ep.still_path ? this.getImageUrl(ep.still_path, 'w500') : undefined,
              airDate: ep.air_date,
              status: isFuture ? 'upcoming' : 'released',
              isUpcoming: isFuture,
              overview: ep.overview || undefined,
              isSub: true,
              isDub: false
            };
          });
        }
      }
    } catch {
      // Continue to TVMaze and secondary fallbacks
    }

    // 2. Second attempt: Check TVMaze
    const tvmazeEps = await tryTvmazeEpisodes();
    if (tvmazeEps && tvmazeEps.length > 0) {
      return tvmazeEps;
    }

    // 3. Third attempt: If TMDb has Season 1 with massive episodes (e.g. 50+ episodes), check if we can map this season
    if (seasonNumber > 1) {
      try {
        const s1Data = await fetchSmart(
          `/api/tmdb/season/${tmdbId}/1`,
          (key) => `${TMDB_BASE_URL}/tv/${tmdbId}/season/1?api_key=${key}&language=ar-SA`
        );
        if (Array.isArray(s1Data?.episodes) && s1Data.episodes.length > 25) {
          // If Season 1 contains combined episodes for multiple seasons
          const allEps = s1Data.episodes;
          const epsPerSeason = 25; // Standard anime season batch size
          const startIdx = (seasonNumber - 1) * epsPerSeason;
          if (startIdx < allEps.length) {
            const sliced = allEps.slice(startIdx, startIdx + epsPerSeason);
            if (sliced.length > 0) {
              return sliced.map((ep: any, idx: number) => {
                const epNum = idx + 1;
                const rawName = ep.name || '';
                let title = `الحلقة ${epNum}`;
                if (rawName && !rawName.toLowerCase().startsWith('episode') && !rawName.startsWith('الحلقة')) {
                  title = `الحلقة ${epNum}: ${rawName}`;
                }
                const isFuture = ep.air_date ? ep.air_date > todayIso : false;
                return {
                  id: `ep-${tmdbId}-${seasonNumber}-${epNum}`,
                  episodeNumber: epNum,
                  seasonNumber: seasonNumber,
                  title,
                  duration: ep.runtime ? `${ep.runtime} دقيقة` : undefined,
                  stillPath: ep.still_path ? this.getImageUrl(ep.still_path, 'w500') : undefined,
                  airDate: ep.air_date,
                  status: isFuture ? 'upcoming' : 'released',
                  isUpcoming: isFuture,
                  overview: ep.overview || undefined,
                  isSub: true,
                  isDub: false
                };
              });
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    // No real episodes found - return empty array without generating fake data
    return [];
  }
};
