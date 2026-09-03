import { MediaItem, MediaType } from '../types';
import { buildMediaSeoMetadata, updateStructuredData } from './seo';
import { getMediaSlug, slugify, isCleanLatinSlug } from './slugify';

/**
 * Builds the canonical relative path for a media item or episode
 * Formats:
 * - Movie: /movie/{latin-slug}                             -> e.g. /movie/inception
 * - TV: /tv/{latin-slug}                                   -> e.g. /tv/game-of-thrones
 * - TV Episode: /tv/{latin-slug}/season-{s}/episode-{e}    -> e.g. /tv/game-of-thrones/season-1/episode-1
 * - Anime: /anime/{latin-slug}                             -> e.g. /anime/naruto
 * - Anime Episode: /anime/{latin-slug}/season-{s}/episode-{e} -> e.g. /anime/naruto/season-1/episode-1
 * - Cartoon: /cartoon/{latin-slug}                         -> e.g. /cartoon/toy-story
 * - Cartoon Episode: /cartoon/{latin-slug}/season-{s}/episode-{e}
 */
export function getCanonicalPath(media: MediaItem, season?: number, episode?: number): string {
  const slug = getMediaSlug(media);
  const typeKey: string = media.type === 'anime' ? 'anime' : media.type === 'cartoon' ? 'cartoon' : media.type === 'movie' ? 'movie' : 'tv';
  const base = `/${typeKey}/${slug}`;

  if (media.type !== 'movie' && season !== undefined && episode !== undefined && Number(season) > 0 && Number(episode) > 0) {
    return `${base}/season-${Number(season)}/episode-${Number(episode)}`;
  }
  return base;
}

/**
 * Builds the full absolute canonical URL
 */
export function getCanonicalUrl(media: MediaItem, season?: number, episode?: number): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = getCanonicalPath(media, season, episode);
  return `${origin}${path}`;
}

/**
 * Extracts tmdbId and slug from a legacy slug-id parameter string if present
 * e.g. "inception-27205" -> { tmdbId: 27205, slug: "inception" }
 * e.g. "27205" -> { tmdbId: 27205, slug: "" }
 */
export function parseLegacySlugAndId(param: string): { tmdbId?: number; slug: string } {
  if (!param) return { slug: '' };
  const match = param.match(/^(?:(.*)-)?(\d{3,9})$/);
  if (match && match[2]) {
    return {
      tmdbId: parseInt(match[2], 10),
      slug: match[1] || ''
    };
  }
  const pureNum = parseInt(param, 10);
  if (!isNaN(pureNum) && pureNum > 0 && String(pureNum) === param) {
    return { tmdbId: pureNum, slug: '' };
  }
  return { slug: param };
}

export interface ParsedRoute {
  type: MediaType;
  slug: string;
  rawSlug?: string;
  tmdbId?: number;
  season?: number;
  episode?: number;
  isEpisode: boolean;
}

/**
 * Parses current window.location to extract media deep links
 */
export function parseCurrentLocation(): ParsedRoute | null {
  if (typeof window === 'undefined') return null;

  // 1. Check if server injected route in window.CinemaWindowConfig
  const cfg = (window as any).CinemaWindowConfig?.initialRoute;
  if (cfg && cfg.type && (cfg.slug || cfg.tmdbId)) {
    const s = cfg.season ? Number(cfg.season) : undefined;
    const e = cfg.episode ? Number(cfg.episode) : undefined;
    return {
      type: cfg.type as MediaType,
      slug: cfg.slug || '',
      rawSlug: cfg.rawSlug || cfg.slug || '',
      tmdbId: cfg.tmdbId ? Number(cfg.tmdbId) : undefined,
      season: s && s > 0 ? s : (cfg.isEpisode ? 1 : undefined),
      episode: e && e > 0 ? e : (cfg.isEpisode ? 1 : undefined),
      isEpisode: !!cfg.isEpisode && cfg.type !== 'movie'
    };
  }

  // 2. Parse Pathname
  let pathname = window.location.pathname.replace(/^\/mua\//i, '/').replace(/\/+$/, '') || '/';
  // Strip language prefix /ar/ or /en/
  pathname = pathname.replace(/^\/(?:ar|en)\//i, '/');

  // Match: /:type/:slug/season-:s/episode-:e or Arabic /:type/:slug/الموسم-:s/الحلقة-:e
  const episodePattern = /^\/(movie|tv|anime|cartoon)\/([^/]+)\/(?:season|الموسم|موسم)-?(\d+)\/(?:episode|الحلقة|حلقة)-?(\d+)$/i;
  // Match: /:type/:slug/season-:s
  const seasonOnlyPattern = /^\/(movie|tv|anime|cartoon)\/([^/]+)\/(?:season|الموسم|موسم)-?(\d+)$/i;
  // Match: /:type/:slug
  const itemPattern = /^\/(movie|tv|anime|cartoon)\/([^/]+)$/i;

  const epMatch = pathname.match(episodePattern);
  if (epMatch) {
    const type = epMatch[1].toLowerCase() as MediaType;
    const rawSlug = decodeURIComponent(epMatch[2]);
    const seasonNum = parseInt(epMatch[3], 10);
    const episodeNum = parseInt(epMatch[4], 10);

    const legacy = parseLegacySlugAndId(rawSlug);
    const cleanSlug = isCleanLatinSlug(rawSlug) ? rawSlug : (legacy.slug && isCleanLatinSlug(legacy.slug) ? legacy.slug : slugify(rawSlug));

    const validSeason = !isNaN(seasonNum) && seasonNum > 0 ? seasonNum : 1;
    const validEpisode = !isNaN(episodeNum) && episodeNum > 0 ? episodeNum : 1;

    return {
      type,
      slug: cleanSlug,
      rawSlug,
      tmdbId: legacy.tmdbId,
      season: type !== 'movie' ? validSeason : undefined,
      episode: type !== 'movie' ? validEpisode : undefined,
      isEpisode: type !== 'movie'
    };
  }

  const seasonMatch = pathname.match(seasonOnlyPattern);
  if (seasonMatch) {
    const type = seasonMatch[1].toLowerCase() as MediaType;
    const rawSlug = decodeURIComponent(seasonMatch[2]);
    const seasonNum = parseInt(seasonMatch[3], 10);

    const legacy = parseLegacySlugAndId(rawSlug);
    const cleanSlug = isCleanLatinSlug(rawSlug) ? rawSlug : (legacy.slug && isCleanLatinSlug(legacy.slug) ? legacy.slug : slugify(rawSlug));
    const validSeason = !isNaN(seasonNum) && seasonNum > 0 ? seasonNum : 1;

    return {
      type,
      slug: cleanSlug,
      rawSlug,
      tmdbId: legacy.tmdbId,
      season: type !== 'movie' ? validSeason : undefined,
      isEpisode: false
    };
  }

  const itemMatch = pathname.match(itemPattern);
  if (itemMatch) {
    const type = itemMatch[1].toLowerCase() as MediaType;
    const rawSlug = decodeURIComponent(itemMatch[2]);
    const legacy = parseLegacySlugAndId(rawSlug);
    const cleanSlug = isCleanLatinSlug(rawSlug) ? rawSlug : (legacy.slug && isCleanLatinSlug(legacy.slug) ? legacy.slug : slugify(rawSlug));

    return {
      type,
      slug: cleanSlug,
      rawSlug,
      tmdbId: legacy.tmdbId,
      isEpisode: false
    };
  }

  // 3. Fallback Hash Parsing for legacy shares (#type=movie&id=123 or #movie/inception)
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    if (hash.includes('=')) {
      const params = new URLSearchParams(hash);
      const id = parseInt(params.get('id') || '', 10);
      const type = (params.get('type') as MediaType) || 'movie';
      const s = parseInt(params.get('s') || '', 10);
      const e = parseInt(params.get('e') || '', 10);
      if (id > 0) {
        return {
          type,
          slug: '',
          tmdbId: id,
          season: type !== 'movie' && s > 0 ? s : undefined,
          episode: type !== 'movie' && e > 0 ? e : undefined,
          isEpisode: type !== 'movie' && e > 0
        };
      }
    }
  }

  return null;
}

/**
 * Updates DOM OpenGraph, Canonical, and Title tags dynamically for rich preview
 */
export function updateOpenGraphMeta(media: MediaItem | null, season?: number, episode?: number): void {
  if (typeof document === 'undefined') return;

  if (!media) {
    document.title = 'نافذة السينما VIP | أكبر منصة عربية للأفلام والمسلسلات والأنمي';
    updateStructuredData(null);
    return;
  }

  const cleanTitle = media.title || media.originalTitle || 'نافذة السينما';
  const isMovie = media.type === 'movie';
  const typeLabel = media.type === 'anime' ? 'أنمي' : media.type === 'cartoon' ? 'كرتون' : 'مسلسل';
  const year = media.year ? ` (${media.year})` : (media.releaseDate ? ` (${media.releaseDate.substring(0, 4)})` : '');

  let dynamicTitle = '';
  let dynamicDesc = '';

  if (isMovie) {
    dynamicTitle = `مشاهدة فيلم ${cleanTitle}${year} مترجم HD اون لاين | نافذة السينما VIP`;
    dynamicDesc = media.overview || `مشاهدة فيلم ${cleanTitle}${year} كامل مترجم بأعلى جودة Full HD و 4K بدون إعلانات عبر نافذة السينما.`;
  } else if (season !== undefined && episode !== undefined && Number(season) > 0 && Number(episode) > 0) {
    dynamicTitle = `شاهد ${cleanTitle} - الموسم ${season} الحلقة ${episode} بأعلى جودة على نافذة السينما`;
    dynamicDesc = media.overview || `مشاهدة وتحميل ${typeLabel} ${cleanTitle} الموسم ${season} الحلقة ${episode} مترجمة بجودة عالية 1080p و 4K عبر سيرفرات سريعة ومباشرة.`;
  } else {
    dynamicTitle = `مشاهدة ${typeLabel} ${cleanTitle}${year} كامل ومترجم HD | نافذة السينما VIP`;
    dynamicDesc = media.overview || `مشاهدة وتحميل جميع مواسم وحلقات ${typeLabel} ${cleanTitle} كاملة ومترجمة بأعلى جودة على شباك السينما.`;
  }

  const canonicalUrl = getCanonicalUrl(media, season, episode);
  const imageUrl = media.posterPath || media.backdropPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';

  document.title = dynamicTitle;

  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement | null;
    }
    if (!el) {
      el = document.createElement('meta');
      if (property.startsWith('og:') || property.startsWith('twitter:') || property.startsWith('fb:')) {
        el.setAttribute('property', property);
      } else {
        el.setAttribute('name', property);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // OpenGraph Tags for WhatsApp & Facebook
  setMeta('og:title', dynamicTitle);
  setMeta('og:description', dynamicDesc);
  setMeta('og:image', imageUrl);
  setMeta('og:image:secure_url', imageUrl);
  setMeta('og:image:type', 'image/jpeg');
  setMeta('og:image:alt', `${cleanTitle} - بوستر`);
  setMeta('og:url', canonicalUrl);
  setMeta('og:type', isMovie ? 'video.movie' : (season && episode ? 'video.episode' : 'video.tv_show'));
  setMeta('og:site_name', 'نافذة السينما VIP');
  setMeta('og:locale', 'ar_SA');

  // Twitter Card Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', dynamicTitle);
  setMeta('twitter:description', dynamicDesc);
  setMeta('twitter:image', imageUrl);

  // Standard Meta Description
  let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', dynamicDesc);

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  updateStructuredData(media, season, episode);
}

/**
 * Synchronizes the URL in the browser address bar with the canonical clean Latin slug
 */
export function syncBrowserCanonicalUrl(media: MediaItem | null, season?: number, episode?: number, replace: boolean = false): void {
  if (typeof window === 'undefined') return;

  if (!media) {
    const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (currentPath === '/dmca' || currentPath === '/terms') {
      return;
    }
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      if (replace) {
        window.history.replaceState({}, '', '/');
      } else {
        window.history.pushState({}, '', '/');
      }
    }
    return;
  }

  const cleanPath = getCanonicalPath(media, season, episode);
  if (window.location.pathname !== cleanPath) {
    if (replace) {
      window.history.replaceState({ tmdbId: media.tmdbId, type: media.type, season, episode }, '', cleanPath);
    } else {
      window.history.pushState({ tmdbId: media.tmdbId, type: media.type, season, episode }, '', cleanPath);
    }
  }

  updateOpenGraphMeta(media, season, episode);
}
