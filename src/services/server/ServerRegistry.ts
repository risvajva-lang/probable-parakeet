/**
 * ServerRegistry.ts
 * Unified, extensible Server & Provider Registry for HDOFLIX
 * 
 * Aggregates all discovered video/embed providers, anime sources, stream hosts,
 * Arabic localized portals, resolver services, metadata APIs, subtitles, and updaters.
 * 
 * Supports dynamic health tracking, automated cooldowns, failover fallback,
 * and remote configuration overrides without hardcoding any secrets.
 */

import {
  MediaRequest,
  MediaType,
  ServerCategory,
  ServerDefinition,
  ServerHealthStatus,
  ServerResult,
} from './ServerTypes';

// Initial Server Registry definitions discovered across HDOFLIX ecosystem
export const DEFAULT_SERVER_DEFINITIONS: ServerDefinition[] = [
  // =========================================================================
  // 1. VIDEO / EMBED PROVIDERS
  // =========================================================================
  {
    id: 'vidlink',
    name: 'VidLink Pro',
    nameAr: 'VidLink (فائق 4K VIP)',
    baseUrl: 'https://vidlink.pro',
    mirrors: ['https://vidlink.pro'],
    category: 'video_embed',
    priority: 1,
    enabled: true,
    quality: '4K UHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: false,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'recommended',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) =>
      `https://vidlink.pro/movie/${tmdbId}?primaryColor=e50914&secondaryColor=ffc107`,
    buildEpisodeUrl: (tmdbId, s, e) =>
      `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?primaryColor=e50914&secondaryColor=ffc107`,
  },
  {
    id: 'vidfast',
    name: 'VidFast',
    nameAr: 'VidFast (سريع FHD)',
    baseUrl: 'https://vidfast.vc',
    mirrors: ['https://vidfast.pro'],
    category: 'video_embed',
    priority: 2,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: false,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidfast.vc/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidfast.vc/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'videasy',
    name: 'Videasy Player',
    nameAr: 'Videasy (سريع FHD VIP)',
    baseUrl: 'https://player.videasy.to',
    mirrors: ['https://api.videasy.to', 'https://player.videasy.net'],
    category: 'video_embed',
    priority: 3,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: false,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://player.videasy.net/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    nameAr: 'VidCore (1080p FHD)',
    baseUrl: 'https://vidcore.org',
    mirrors: ['https://vidcore.net'],
    category: 'video_embed',
    priority: 4,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: false,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidcore.org/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidcore.org/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidmoly',
    name: 'VidMoly',
    nameAr: 'VidMoly (1080p)',
    baseUrl: 'https://vidmoly.net',
    category: 'video_embed',
    priority: 5,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidmoly.net/embed-${tmdbId}.html`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidmoly.net/embed-${tmdbId}-s${s}-e${e}.html`,
  },
  {
    id: 'vidnest',
    name: 'VidNest',
    nameAr: 'VidNest (سريع 1080p)',
    baseUrl: 'https://vidnest.fun',
    category: 'video_embed',
    priority: 6,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidnest.fun/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidnest.fun/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vsembed',
    name: 'Vsembed',
    nameAr: 'Vsembed (FHD)',
    baseUrl: 'https://vsembed.ru',
    category: 'video_embed',
    priority: 7,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vsembed.ru/embed/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vsembed.ru/embed/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'movies111',
    name: '111Movies',
    nameAr: '111Movies (1080p)',
    baseUrl: 'https://111movies.net',
    mirrors: ['https://111movies.com'],
    category: 'video_embed',
    priority: 8,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://111movies.com/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://111movies.com/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'megaplay',
    name: 'MegaPlay',
    nameAr: 'MegaPlay (سريع)',
    baseUrl: 'https://megaplay.buzz',
    category: 'video_embed',
    priority: 9,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://megaplay.buzz/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://megaplay.buzz/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'moviebox',
    name: 'MovieBox',
    nameAr: 'MovieBox (FHD)',
    baseUrl: 'https://moviebox.ph',
    category: 'video_embed',
    priority: 10,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://moviebox.ph/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://moviebox.ph/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc Direct',
    nameAr: 'VidSrc (مباشر FHD)',
    baseUrl: 'https://vixsrc.to',
    mirrors: ['https://vidsrc.to', 'https://vidsrc.pm', 'https://vidsrc.in', 'https://vidsrc.icu', 'https://vidsrc.su', 'https://vidsrc.rip', 'https://vidsrc.xyz', 'https://vidsrc.nl'],
    category: 'video_embed',
    priority: 11,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidlove',
    name: 'VidLove',
    nameAr: 'VidLove (سريع)',
    baseUrl: 'https://vidlove.cc',
    mirrors: ['https://player.vidlove.cc'],
    category: 'video_embed',
    priority: 12,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://player.vidlove.cc/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://player.vidlove.cc/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidsrc_embed',
    name: 'VidSrc Embed SU',
    nameAr: 'VidSrc Embed (1080p)',
    baseUrl: 'https://vidsrc-embed.su',
    mirrors: ['https://vidsrc-embed.com'],
    category: 'video_embed',
    priority: 13,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidsrc-embed.su/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidsrc-embed.su/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'videm',
    name: 'Videm VIP',
    nameAr: 'Videm (سريع VIP)',
    baseUrl: 'https://videm.xyz',
    mirrors: ['https://videm.net'],
    category: 'video_embed',
    priority: 14,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://videm.xyz/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://videm.xyz/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'embos',
    name: 'Embos VIP',
    nameAr: 'Embos (أوتوماتيكي VIP)',
    baseUrl: 'https://embos.top',
    mirrors: ['https://embos.cc'],
    category: 'video_embed',
    priority: 15,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://embos.top/movie/?mid=${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://embos.top/tv/?mid=${tmdbId}&s=${s}&e=${e}`,
  },
  {
    id: 'vidking',
    name: 'VidKing',
    nameAr: 'VidKing (1080p)',
    baseUrl: 'https://www.vidking.net',
    category: 'video_embed',
    priority: 16,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://www.vidking.net/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://www.vidking.net/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'peachify',
    name: 'Peachify Top',
    nameAr: 'Peachify (سريع)',
    baseUrl: 'https://peachify.top',
    category: 'video_embed',
    priority: 17,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://peachify.top/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://peachify.top/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'nontongo',
    name: 'NonTongo',
    nameAr: 'NonTongo (FHD)',
    baseUrl: 'https://nontongo.win',
    category: 'video_embed',
    priority: 18,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://nontongo.win/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://nontongo.win/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'vidrock',
    name: 'VidRock',
    nameAr: 'VidRock (سريع)',
    baseUrl: 'https://vidrock.net',
    category: 'video_embed',
    priority: 19,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidrock.net/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidrock.net/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'two_embed',
    name: '2Embed Official',
    nameAr: '2Embed (شائع)',
    baseUrl: 'https://www.2embed.cc',
    mirrors: ['https://2embed.to'],
    category: 'video_embed',
    priority: 20,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed / MultiEmbed',
    nameAr: 'MultiEmbed VIP (متعدد)',
    baseUrl: 'https://multiembed.mov',
    category: 'video_embed',
    priority: 21,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'embedsu',
    name: 'EmbedSu',
    nameAr: 'EmbedSu (سريع)',
    baseUrl: 'https://embed.su',
    category: 'video_embed',
    priority: 22,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed Player',
    nameAr: 'AutoEmbed (مباشر)',
    baseUrl: 'https://autoembed.co',
    mirrors: ['https://player.autoembed.cc'],
    category: 'video_embed',
    priority: 23,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    nameAr: 'SmashyStream (مستقر)',
    baseUrl: 'https://embed.smashystream.com',
    mirrors: ['https://player.smashy.stream'],
    category: 'video_embed',
    priority: 24,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&s=${s}&e=${e}`,
  },
  {
    id: 'gomostream',
    name: 'GomoStream',
    nameAr: 'GomoStream (احتياطي)',
    baseUrl: 'https://gomostream.com',
    category: 'video_embed',
    priority: 25,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://gomostream.com/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://gomostream.com/e/${tmdbId}-s${s}-e${e}`,
  },

  // =========================================================================
  // 2. DIRECT STREAM / CLOUD HOSTS
  // =========================================================================
  {
    id: 'voe',
    name: 'VOE Cloud Host',
    nameAr: 'VOE (سحابي مباشر)',
    baseUrl: 'https://voe.sx',
    category: 'stream_host',
    priority: 30,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://voe.sx/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://voe.sx/e/${tmdbId}_${s}_${e}`,
  },
  {
    id: 'streamtape',
    name: 'StreamTape VIP',
    nameAr: 'StreamTape (سريع HD)',
    baseUrl: 'https://streamtape.com',
    category: 'stream_host',
    priority: 31,
    enabled: true,
    quality: '720p HD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://streamtape.com/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://streamtape.com/e/${tmdbId}-s${s}-e${e}`,
  },
  {
    id: 'doodstream',
    name: 'DoodStream HD',
    nameAr: 'DoodStream (مستقر)',
    baseUrl: 'https://doodstream.com',
    mirrors: ['https://dood.to', 'https://dood.so'],
    category: 'stream_host',
    priority: 32,
    enabled: true,
    quality: '720p HD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://dood.to/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://dood.to/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'filelions',
    name: 'FileLions Speed',
    nameAr: 'FileLions (سريع FHD)',
    baseUrl: 'https://filelions.to',
    category: 'stream_host',
    priority: 33,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://filelions.to/v/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://filelions.to/v/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'mixdrop',
    name: 'MixDrop Fast',
    nameAr: 'MixDrop (سريع)',
    baseUrl: 'https://mixdrop.co',
    category: 'stream_host',
    priority: 34,
    enabled: true,
    quality: '720p HD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://mixdrop.co/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://mixdrop.co/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'streamwish',
    name: 'StreamWish Pro',
    nameAr: 'StreamWish (مستقر)',
    baseUrl: 'https://streamwish.to',
    category: 'stream_host',
    priority: 35,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://streamwish.to/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://streamwish.to/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'vidguard',
    name: 'VidGuard Protect',
    nameAr: 'VidGuard (آمن VIP)',
    baseUrl: 'https://vidguard.to',
    category: 'stream_host',
    priority: 36,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://vidguard.to/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://vidguard.to/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'upstream',
    name: 'UpStream Cloud',
    nameAr: 'UpStream (سحابي)',
    baseUrl: 'https://upstream.to',
    category: 'stream_host',
    priority: 37,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://upstream.to/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://upstream.to/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'wolfstream',
    name: 'WolfStream Pro',
    nameAr: 'WolfStream (سريع)',
    baseUrl: 'https://wolfstream.tv',
    category: 'stream_host',
    priority: 38,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://wolfstream.tv/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://wolfstream.tv/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'hexupload',
    name: 'HexStream 4K',
    nameAr: 'HexStream (4K فائقة)',
    baseUrl: 'https://hexupload.net',
    category: 'stream_host',
    priority: 39,
    enabled: true,
    quality: '4K UHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://hexupload.net/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://hexupload.net/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'lulustream',
    name: 'LuluStream VIP',
    nameAr: 'LuluStream (VIP)',
    baseUrl: 'https://lulustream.com',
    category: 'stream_host',
    priority: 40,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://lulustream.com/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://lulustream.com/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'turbovid',
    name: 'TurboVid Direct',
    nameAr: 'TurboVid (خارق)',
    baseUrl: 'https://turbovid.net',
    category: 'stream_host',
    priority: 41,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://turbovid.net/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://turbovid.net/e/${tmdbId}_s${s}_e${e}`,
  },
  {
    id: 'streamdav',
    name: 'StreamDav Ultra',
    nameAr: 'StreamDav (سريع)',
    baseUrl: 'https://streamdav.com',
    category: 'stream_host',
    priority: 42,
    enabled: true,
    quality: '1080p FHD',
    type: 'direct',
    supportsMovie: true,
    supportsTv: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://streamdav.com/e/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://streamdav.com/e/${tmdbId}_s${s}_e${e}`,
  },

  // =========================================================================
  // 3. ANIME SPECIALIZED SOURCES
  // =========================================================================
  {
    id: 'kisskh',
    name: 'KissKH Anime & Drama',
    nameAr: 'KissKH (أنمي ودراما)',
    baseUrl: 'https://kisskh.co',
    mirrors: ['https://kisskh.do'],
    category: 'anime',
    priority: 50,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://kisskh.co/embed/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://kisskh.co/embed/tv/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'animeonsen',
    name: 'AnimeOnsen Pro',
    nameAr: 'AnimeOnsen (أنمي FHD)',
    baseUrl: 'https://www.animeonsen.xyz',
    mirrors: ['https://api.animeonsen.xyz'],
    category: 'anime',
    priority: 51,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: false,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://www.animeonsen.xyz/details/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://www.animeonsen.xyz/watch/${tmdbId}/${e}`,
  },
  {
    id: 'animez',
    name: 'AnimeStream Pro',
    nameAr: 'AnimeZ (أنمي مباشر)',
    baseUrl: 'https://animez.stream',
    category: 'anime',
    priority: 52,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://animez.stream/embed/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://animez.stream/embed/${tmdbId}/${s}/${e}`,
  },

  // =========================================================================
  // 4. ARABIC LOCALIZED PORTALS
  // =========================================================================
  {
    id: 'akwam',
    name: 'Akwam Portal',
    nameAr: 'أكوام (مترجم ومدبلج)',
    baseUrl: 'https://akwam.it',
    mirrors: ['https://akwam.to'],
    category: 'arabic',
    priority: 60,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://akwam.to/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://akwam.to/series/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'arabseed',
    name: 'Arabseed Direct',
    nameAr: 'عرب سيد (مترجم)',
    baseUrl: 'https://arabseed.show',
    category: 'arabic',
    priority: 61,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://arabseed.show/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://arabseed.show/series/${tmdbId}/${s}/${e}`,
  },
  {
    id: 'faselhd',
    name: 'FaselHD Club',
    nameAr: 'فاصل إعلاني (FaselHD)',
    baseUrl: 'https://faselhd.club',
    category: 'arabic',
    priority: 62,
    enabled: true,
    quality: '1080p FHD',
    type: 'embed',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: false,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://faselhd.club/movies/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://faselhd.club/series/${tmdbId}/${s}/${e}`,
  },

  // =========================================================================
  // 5. BACKEND RESOLVER & CLOUD SERVICES
  // =========================================================================
  {
    id: 'hdoflix_backend',
    name: 'HDOFLIX Backend Resolver',
    nameAr: 'خادم HDOFLIX السحابي',
    baseUrl: 'http://localhost:8080',
    category: 'backend',
    priority: 70,
    enabled: true,
    quality: '1080p FHD',
    type: 'resolver',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    isVip: true,
    healthStatus: 'recommended',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `http://localhost:8080/v1/resolve?tmdbId=${tmdbId}&type=movie`,
    buildEpisodeUrl: (tmdbId, s, e) =>
      `http://localhost:8080/v1/resolve?tmdbId=${tmdbId}&type=tv&season=${s}&episode=${e}`,
  },

  // =========================================================================
  // 6. SUBTITLE ENGINES
  // =========================================================================
  {
    id: 'opensubtitles',
    name: 'OpenSubtitles API',
    nameAr: 'OpenSubtitles (ترجمات عالمية)',
    baseUrl: 'https://api.opensubtitles.com',
    category: 'subtitle',
    priority: 80,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=${tmdbId}&languages=ar,en`,
    buildEpisodeUrl: (tmdbId, s, e) =>
      `https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=${tmdbId}&season_number=${s}&episode_number=${e}&languages=ar,en`,
  },
  {
    id: 'subdl',
    name: 'SubDL Arabic Subtitles',
    nameAr: 'SubDL (ترجمات عربية)',
    baseUrl: 'https://api.subdl.com',
    category: 'subtitle',
    priority: 81,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    hasArabicSub: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://api.subdl.com/api/v1/subtitles?tmdb_id=${tmdbId}&languages=ar`,
    buildEpisodeUrl: (tmdbId, s, e) =>
      `https://api.subdl.com/api/v1/subtitles?tmdb_id=${tmdbId}&season_number=${s}&episode_number=${e}&languages=ar`,
  },

  // =========================================================================
  // 7. METADATA PROVIDERS
  // =========================================================================
  {
    id: 'tmdb',
    name: 'The Movie Database (TMDB)',
    nameAr: 'TMDB (بيانات الأفلام والمسلسلات)',
    baseUrl: 'https://api.themoviedb.org/3',
    category: 'metadata',
    priority: 90,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    healthStatus: 'recommended',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildMovieUrl: (tmdbId) => `https://api.themoviedb.org/3/movie/${tmdbId}`,
    buildEpisodeUrl: (tmdbId, s, e) => `https://api.themoviedb.org/3/tv/${tmdbId}/season/${s}/episode/${e}`,
  },
  {
    id: 'tvmaze',
    name: 'TVMaze API',
    nameAr: 'TVMaze (جدول الحلقات)',
    baseUrl: 'https://api.tvmaze.com',
    category: 'metadata',
    priority: 91,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: false,
    supportsTv: true,
    supportsAnime: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    buildEpisodeUrl: (id, s, e) => `https://api.tvmaze.com/shows/${id}/episodebynumber?season=${s}&number=${e}`,
  },
  {
    id: 'trakt',
    name: 'Trakt.tv Engine',
    nameAr: 'Trakt (مزامنة السجل والمشاهدة)',
    baseUrl: 'https://api.trakt.tv',
    category: 'metadata',
    priority: 92,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
  },

  // =========================================================================
  // 8. ID MAPPERS
  // =========================================================================
  {
    id: 'tmdb_imdb_mapper',
    name: 'TMDB to IMDb ID Bridge',
    nameAr: 'محول المعرفات (TMDB / IMDb)',
    baseUrl: 'https://api.themoviedb.org/3/find',
    category: 'id_mapper',
    priority: 95,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
  },

  // =========================================================================
  // 9. REMOTE CONFIG & UPDATERS
  // =========================================================================
  {
    id: 'hdoflix_updater',
    name: 'HDOFLIX Remote Config & Updater',
    nameAr: 'تحديثات HDOFLIX والإعدادات السحابية',
    baseUrl: 'http://localhost:8080/v1/config',
    category: 'updater',
    priority: 99,
    enabled: true,
    quality: 'Auto',
    type: 'api',
    supportsMovie: true,
    supportsTv: true,
    supportsAnime: true,
    healthStatus: 'available',
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
  },
];

/**
 * ServerRegistry Class
 * Central authority managing all server and provider definitions.
 */
export class ServerRegistry {
  private static instance: ServerRegistry;
  private servers: Map<string, ServerDefinition> = new Map();
  private cooldownDurationMs: number = 3 * 60 * 1000; // 3 minutes cooldown
  private maxConsecutiveFailures: number = 3;

  private constructor() {
    this.initializeDefaultServers();
  }

  public static getInstance(): ServerRegistry {
    if (!ServerRegistry.instance) {
      ServerRegistry.instance = new ServerRegistry();
    }
    return ServerRegistry.instance;
  }

  private initializeDefaultServers(): void {
    for (const def of DEFAULT_SERVER_DEFINITIONS) {
      this.servers.set(def.id, { ...def });
    }
  }

  /**
   * Returns all registered servers.
   */
  public getAll(): ServerDefinition[] {
    return Array.from(this.servers.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Returns all servers matching a specific category.
   */
  public getByCategory(category: ServerCategory): ServerDefinition[] {
    return this.getAll().filter((s) => s.category === category);
  }

  /**
   * Returns enabled servers for playback.
   */
  public getPlayableServers(type: MediaType = 'movie'): ServerDefinition[] {
    this.checkCooldowns();
    return this.getAll().filter((s) => {
      if (!s.enabled) return false;
      if (s.category !== 'video_embed' && s.category !== 'stream_host' && s.category !== 'anime' && s.category !== 'arabic') {
        return false;
      }
      if (s.healthStatus === 'cooldown' || s.healthStatus === 'failed') {
        return false;
      }
      if (type === 'movie' && !s.supportsMovie) return false;
      if (type === 'tv' && !s.supportsTv) return false;
      if (type === 'anime' && !s.supportsAnime && !s.supportsTv && !s.supportsMovie) return false;
      return true;
    });
  }

  /**
   * Get server definition by ID.
   */
  public getById(id: string): ServerDefinition | undefined {
    return this.servers.get(id);
  }

  /**
   * Dynamically register or override a server definition.
   */
  public register(def: ServerDefinition): void {
    this.servers.set(def.id, { ...def });
  }

  /**
   * Unregister server by ID.
   */
  public unregister(id: string): boolean {
    return this.servers.delete(id);
  }

  /**
   * Enable or disable a server.
   */
  public setEnabled(id: string, enabled: boolean): void {
    const s = this.servers.get(id);
    if (s) {
      s.enabled = enabled;
    }
  }

  /**
   * Updates health status upon successful stream play.
   */
  public recordSuccess(id: string, latencyMs?: number): void {
    const s = this.servers.get(id);
    if (s) {
      s.successCount += 1;
      s.consecutiveFailures = 0;
      s.healthStatus = s.isVip || s.priority <= 3 ? 'recommended' : 'available';
      if (latencyMs !== undefined) {
        s.lastLatencyMs = latencyMs;
      }
      s.lastChecked = Date.now();
      delete s.cooldownUntil;
    }
  }

  /**
   * Updates health status upon stream error / timeout.
   * Enters cooldown if consecutive failures reach threshold.
   */
  public recordFailure(id: string): void {
    const s = this.servers.get(id);
    if (s) {
      s.failureCount += 1;
      s.consecutiveFailures += 1;
      s.lastChecked = Date.now();

      if (s.consecutiveFailures >= this.maxConsecutiveFailures) {
        s.healthStatus = 'cooldown';
        s.cooldownUntil = Date.now() + this.cooldownDurationMs;
      } else {
        s.healthStatus = 'failed';
      }
    }
  }

  /**
   * Check and lift cooldowns whose duration has elapsed.
   */
  public checkCooldowns(): void {
    const now = Date.now();
    for (const server of this.servers.values()) {
      if (server.healthStatus === 'cooldown' && server.cooldownUntil) {
        if (now >= server.cooldownUntil) {
          server.healthStatus = 'available';
          server.consecutiveFailures = 0;
          delete server.cooldownUntil;
        }
      }
    }
  }

  /**
   * Resets all server health states back to default.
   */
  public resetHealthStats(): void {
    for (const server of this.servers.values()) {
      server.successCount = 0;
      server.failureCount = 0;
      server.consecutiveFailures = 0;
      server.healthStatus = server.isVip || server.priority <= 3 ? 'recommended' : 'available';
      delete server.cooldownUntil;
      delete server.lastLatencyMs;
    }
  }

  /**
   * Syncs configuration dynamically with remote config response.
   */
  public syncRemoteConfig(config: {
    serverPriority?: string[];
    disabledServers?: string[];
    enabledServers?: string[];
  }): void {
    if (!config) return;

    if (config.disabledServers && Array.isArray(config.disabledServers)) {
      for (const id of config.disabledServers) {
        const s = this.servers.get(id);
        if (s) s.enabled = false;
      }
    }

    if (config.enabledServers && Array.isArray(config.enabledServers)) {
      for (const id of config.enabledServers) {
        const s = this.servers.get(id);
        if (s) s.enabled = true;
      }
    }

    if (config.serverPriority && Array.isArray(config.serverPriority)) {
      config.serverPriority.forEach((nameOrId, index) => {
        // match by ID or name
        for (const s of this.servers.values()) {
          if (s.id.toLowerCase() === nameOrId.toLowerCase() || s.name.toLowerCase().includes(nameOrId.toLowerCase())) {
            s.priority = index + 1;
          }
        }
      });
    }
  }

  /**
   * Builds the actual playable URL for a server definition given a MediaRequest.
   */
  public buildPlayableUrl(server: ServerDefinition, request: MediaRequest): string | null {
    const tmdbId = request.tmdbId;
    const season = request.season || 1;
    const episode = request.episode || 1;
    const isMovie = request.type === 'movie';

    if (isMovie) {
      if (server.buildMovieUrl) {
        return server.buildMovieUrl(tmdbId, request.imdbId);
      }
      return `${server.baseUrl}/movie/${tmdbId}`;
    } else {
      if (server.buildEpisodeUrl) {
        return server.buildEpisodeUrl(tmdbId, season, episode, request.imdbId);
      }
      return `${server.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
    }
  }
}

export const serverRegistry = ServerRegistry.getInstance();
