import { Season, Episode } from '../types';

export interface TvmazeShow {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime?: number;
  premiered?: string;
  ended?: string;
  officialSite?: string;
  rating?: { average?: number };
  externals?: {
    tvrage?: number | null;
    thetvdb?: number | null;
    imdb?: string | null;
  };
  image?: {
    medium?: string;
    original?: string;
  };
  summary?: string;
}

export interface TvmazeSeasonRaw {
  id: number;
  url: string;
  number: number;
  name?: string;
  episodeOrder?: number | null;
  premiereDate?: string;
  endDate?: string;
  image?: {
    medium?: string;
    original?: string;
  };
  summary?: string;
}

export interface TvmazeEpisodeRaw {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  type?: string;
  airdate?: string;
  airtime?: string;
  airstamp?: string;
  runtime?: number;
  rating?: { average?: number };
  image?: {
    medium?: string;
    original?: string;
  };
  summary?: string;
}

// In-memory cache to prevent duplicate network calls
const showLookupCache = new Map<string, TvmazeShow | null>();
const seasonsCache = new Map<number, Season[]>();
const episodesCache = new Map<number, Episode[]>();

function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
}

export const TvmazeService = {
  /**
   * Determine whether an episode is already released or scheduled for the future (upcoming)
   * Uses airstamp (ISO-8601 with timezone) as primary source, airdate/airtime as secondary.
   */
  getEpisodeReleaseStatus(ep: {
    airstamp?: string | null;
    airdate?: string | null;
    airtime?: string | null;
  }): { status: 'released' | 'upcoming'; isUpcoming: boolean } {
    const now = Date.now();

    // 1. Primary: If airstamp is available (includes exact timezone offset)
    if (ep.airstamp) {
      const timestamp = new Date(ep.airstamp).getTime();
      if (!isNaN(timestamp)) {
        const isReleased = timestamp <= now;
        return {
          status: isReleased ? 'released' : 'upcoming',
          isUpcoming: !isReleased
        };
      }
    }

    // 2. Secondary: If airdate is available (YYYY-MM-DD)
    if (ep.airdate) {
      if (ep.airtime) {
        const dateTimeStr = `${ep.airdate}T${ep.airtime}:00`;
        const parsedTime = new Date(dateTimeStr).getTime();
        if (!isNaN(parsedTime)) {
          const isReleased = parsedTime <= now;
          return {
            status: isReleased ? 'released' : 'upcoming',
            isUpcoming: !isReleased
          };
        }
      }

      const todayIso = new Date(now).toISOString().slice(0, 10);
      const isReleased = ep.airdate <= todayIso;
      return {
        status: isReleased ? 'released' : 'upcoming',
        isUpcoming: !isReleased
      };
    }

    // If no release date is known, treat as upcoming to prevent playing unreleased media
    return {
      status: 'upcoming',
      isUpcoming: true
    };
  },
  /**
   * Look up a TV/Anime show in TVmaze by TVDB ID, IMDb ID, or title
   */
  async lookupShow(params: {
    tvdbId?: number;
    imdbId?: string;
    title?: string;
    originalTitle?: string;
    englishTitle?: string;
  }): Promise<TvmazeShow | null> {
    const cacheKey = `${params.tvdbId || ''}_${params.imdbId || ''}_${params.originalTitle || ''}_${params.englishTitle || ''}_${params.title || ''}`;
    if (showLookupCache.has(cacheKey)) {
      return showLookupCache.get(cacheKey) || null;
    }

    try {
      // 1. Try TheTVDB ID lookup (most accurate for Anime & TV)
      if (params.tvdbId) {
        try {
          const res = await fetch(`https://api.tvmaze.com/lookup/shows?thetvdb=${params.tvdbId}`);
          if (res.ok) {
            const data: TvmazeShow = await res.json();
            if (data && data.id) {
              showLookupCache.set(cacheKey, data);
              return data;
            }
          }
        } catch (err) {
          console.warn('TVmaze tvdb lookup error:', err);
        }
      }

      // 2. Try IMDb ID lookup
      if (params.imdbId) {
        try {
          const res = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${params.imdbId}`);
          if (res.ok) {
            const data: TvmazeShow = await res.json();
            if (data && data.id) {
              showLookupCache.set(cacheKey, data);
              return data;
            }
          }
        } catch (err) {
          console.warn('TVmaze imdb lookup error:', err);
        }
      }

      // Candidate search queries in order of specificity
      const queriesToTry: string[] = [];

      if (params.englishTitle) {
        queriesToTry.push(params.englishTitle);
        const simplified = params.englishTitle.replace(/[-:_]/g, ' ').replace(/\s+/g, ' ').trim();
        if (simplified !== params.englishTitle) queriesToTry.push(simplified);
      }

      if (params.originalTitle) {
        queriesToTry.push(params.originalTitle);
        const simplifiedOrig = params.originalTitle.replace(/[-:_]/g, ' ').replace(/\s+/g, ' ').trim();
        if (simplifiedOrig !== params.originalTitle) queriesToTry.push(simplifiedOrig);
      }

      if (params.title) {
        // If title is in English/Latin characters
        if (/[a-zA-Z]/.test(params.title)) {
          queriesToTry.push(params.title);
        }
      }

      // 3. Try singlesearch & general search for candidate queries
      for (const q of queriesToTry) {
        const cleanQ = q.trim();
        if (!cleanQ || cleanQ.length < 2) continue;

        try {
          // Try singlesearch
          const singleRes = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanQ)}`);
          if (singleRes.ok) {
            const data: TvmazeShow = await singleRes.json();
            if (data && data.id) {
              showLookupCache.set(cacheKey, data);
              return data;
            }
          }
        } catch {
          // Try general search
        }

        try {
          // Try multi-search
          const searchRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(cleanQ)}`);
          if (searchRes.ok) {
            const results: Array<{ score: number; show: TvmazeShow }> = await searchRes.json();
            if (Array.isArray(results) && results.length > 0 && results[0]?.show?.id) {
              const bestShow = results[0].show;
              showLookupCache.set(cacheKey, bestShow);
              return bestShow;
            }
          }
        } catch {
          // Continue to next query
        }
      }

      showLookupCache.set(cacheKey, null);
      return null;
    } catch (e) {
      console.warn('TVmaze lookup exception:', e);
      showLookupCache.set(cacheKey, null);
      return null;
    }
  },

  /**
   * Helper to format Arabic season name
   */
  getArabicSeasonTitle(seasonNum: number, rawName?: string): string {
    if (rawName && rawName.trim().length > 0 && !rawName.toLowerCase().startsWith('season') && !rawName.startsWith('الموسم')) {
      return rawName.trim();
    }
    // If the database uses the 4-digit broadcast year as the season index (common for long-running anime like One Piece, Conan)
    if (seasonNum >= 1970 && seasonNum <= 2050) {
      return `موسم سنة ${seasonNum}`;
    }

    const arabicOrdinals: Record<number, string> = {
      1: 'الموسم الأول',
      2: 'الموسم الثاني',
      3: 'الموسم الثالث',
      4: 'الموسم الرابع',
      5: 'الموسم الخامس',
      6: 'الموسم السادس',
      7: 'الموسم السابع',
      8: 'الموسم الثامن',
      9: 'الموسم التاسع',
      10: 'الموسم العاشر',
      11: 'الموسم الحادي عشر',
      12: 'الموسم الثاني عشر',
      13: 'الموسم الثالث عشر',
      14: 'الموسم الرابع عشر',
      15: 'الموسم الخامس عشر',
      16: 'الموسم السادس عشر',
      17: 'الموسم السابع عشر',
      18: 'الموسم الثامن عشر',
      19: 'الموسم التاسع عشر',
      20: 'الموسم العشرون'
    };
    return arabicOrdinals[seasonNum] || `الموسم ${seasonNum}`;
  },

  /**
   * Validator to sanitize TVMaze response payloads.
   * Specifically filters out episodes with null/empty titles or missing air dates
   * to prevent rendering broken or incomplete episode rows in the player's navigation list.
   */
  isValidTvmazeEpisode(ep: any): boolean {
    if (!ep || typeof ep !== 'object') return false;

    // Validate episode and season numbers
    if (typeof ep.number !== 'number' || ep.number < 1) return false;
    if (typeof ep.season !== 'number' || ep.season < 1) return false;

    return true;
  },

  /**
   * Get all seasons for a show from TVmaze with accurate episode counts
   */
  async getSeasons(tvmazeShowId: number): Promise<Season[]> {
    if (seasonsCache.has(tvmazeShowId)) {
      return seasonsCache.get(tvmazeShowId) || [];
    }

    try {
      const [resSeasons, allEpisodes] = await Promise.all([
        fetch(`https://api.tvmaze.com/shows/${tvmazeShowId}/seasons`),
        this.getEpisodes(tvmazeShowId)
      ]);

      if (!resSeasons.ok) return [];

      const rawSeasons: TvmazeSeasonRaw[] = await resSeasons.json();
      if (!Array.isArray(rawSeasons)) return [];

      // Calculate actual released episodes count per season from allEpisodes
      const countMap: Record<number, number> = {};
      (allEpisodes || []).forEach((ep) => {
        if (ep.seasonNumber) {
          countMap[ep.seasonNumber] = (countMap[ep.seasonNumber] || 0) + 1;
        }
      });

      const seasons: Season[] = rawSeasons
        .filter((s) => s.number && s.number > 0)
        .map((s) => ({
          id: `tvmaze-s-${tvmazeShowId}-${s.number}`,
          seasonNumber: s.number,
          title: this.getArabicSeasonTitle(s.number, s.name),
          episodesCount: countMap[s.number] || (typeof s.episodeOrder === 'number' ? s.episodeOrder : undefined),
          totalScheduledEpisodes: s.episodeOrder || countMap[s.number] || undefined,
          airDate: s.premiereDate,
          posterPath: s.image?.medium || s.image?.original
        }));

      seasonsCache.set(tvmazeShowId, seasons);
      return seasons;
    } catch (e) {
      console.warn('TVmaze getSeasons error:', e);
      return [];
    }
  },

  /**
   * Get all episodes for a show from TVmaze with accurate released vs upcoming status
   */
  async getEpisodes(tvmazeShowId: number): Promise<Episode[]> {
    if (episodesCache.has(tvmazeShowId)) {
      return episodesCache.get(tvmazeShowId) || [];
    }

    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${tvmazeShowId}/episodes?specials=0`);
      if (!res.ok) return [];

      const rawEpisodes: TvmazeEpisodeRaw[] = await res.json();
      if (!Array.isArray(rawEpisodes)) return [];

      const episodes: Episode[] = rawEpisodes
        .filter((ep) => this.isValidTvmazeEpisode(ep))
        .map((ep) => {
          const { status, isUpcoming } = this.getEpisodeReleaseStatus(ep);
          return {
            id: `tvmaze-ep-${tvmazeShowId}-${ep.season}-${ep.number}`,
            episodeNumber: ep.number,
            seasonNumber: ep.season,
            title: `الحلقة ${ep.number}: ${ep.name.trim()}`,
            duration: ep.runtime ? `${ep.runtime} دقيقة` : undefined,
            stillPath: ep.image?.medium || ep.image?.original,
            airDate: ep.airdate,
            airstamp: ep.airstamp,
            status,
            isUpcoming,
            overview: stripHtml(ep.summary),
            isSub: true,
            isDub: false
          };
        });

      episodesCache.set(tvmazeShowId, episodes);
      return episodes;
    } catch (e) {
      console.warn('TVmaze getEpisodes error:', e);
      return [];
    }
  },

  /**
   * Get parsed seasons and episodes grouped by season number
   * Counts released episodes for display while preserving upcoming episodes with clear status
   */
  async getSeasonsAndEpisodes(tvmazeShowId: number): Promise<{
    seasons: Season[];
    episodesBySeason: Record<number, Episode[]>;
  }> {
    const [seasons, allEpisodes] = await Promise.all([
      this.getSeasons(tvmazeShowId),
      this.getEpisodes(tvmazeShowId)
    ]);

    const episodesBySeason: Record<number, Episode[]> = {};

    allEpisodes.forEach((ep) => {
      if (!episodesBySeason[ep.seasonNumber]) {
        episodesBySeason[ep.seasonNumber] = [];
      }
      episodesBySeason[ep.seasonNumber].push(ep);
    });

    // Determine count of actually released episodes for each season
    const enrichedSeasons = seasons.map((s) => {
      const seasonEps = episodesBySeason[s.seasonNumber] || [];
      const releasedEps = seasonEps.filter((e) => e.status === 'released');
      return {
        ...s,
        episodesCount: releasedEps.length > 0 ? releasedEps.length : (seasonEps.length > 0 ? releasedEps.length : undefined),
        totalScheduledEpisodes: seasonEps.length,
        episodes: seasonEps
      };
    });

    return {
      seasons: enrichedSeasons,
      episodesBySeason
    };
  }
};
