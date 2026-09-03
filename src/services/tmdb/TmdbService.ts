import { apiClient } from '../../api/client';
import { Media, Season, Episode, CastMember, Company, Network, Genre } from '../../types';

export class TmdbService {
  private static instance: TmdbService;
  private baseUrl: string = 'https://api.themoviedb.org/3';

  public static getInstance(): TmdbService {
    if (!TmdbService.instance) {
      TmdbService.instance = new TmdbService();
    }
    return TmdbService.instance;
  }

  // --- Home Sections ---

  async getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all'): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/trending/${mediaType}/day`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, mediaType === 'all' ? undefined : mediaType));
    } catch {
      return [];
    }
  }

  async getNowPlaying(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/movie/now_playing`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, 'movie'));
    } catch {
      return [];
    }
  }

  async getUpcoming(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/movie/upcoming`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, 'movie'));
    } catch {
      return [];
    }
  }

  async getTopRated(type: 'movie' | 'tv'): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/${type}/top_rated`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, type));
    } catch {
      return [];
    }
  }

  async getAiringToday(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/tv/airing_today`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, 'tv'));
    } catch {
      return [];
    }
  }

  async getReturningSeries(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/tv/on_the_air`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, 'tv'));
    } catch {
      return [];
    }
  }

  async getAllTimeGreats(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/discover/movie?sort_by=vote_average.desc&vote_count.gte=5000`);
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, 'movie'));
    } catch {
      return [];
    }
  }

  // --- Regional / Country Specific Discover ---

  async getByCountry(countryCode: string, type: 'movie' | 'tv'): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(
        `${this.baseUrl}/discover/${type}?with_origin_country=${countryCode}&sort_by=popularity.desc`
      );
      return (data.results || []).map((item: any) => this.mapTmdbToMedia(item, type));
    } catch {
      return [];
    }
  }

  // --- Anime Catalog ---

  async getAnimeCatalog(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(
        `${this.baseUrl}/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc`
      );
      return (data.results || []).map((item: any) => ({
        ...this.mapTmdbToMedia(item, 'anime'),
        mediaType: 'anime' as const,
        isAnime: true,
      }));
    } catch {
      return [];
    }
  }

  async getAnimeMovies(): Promise<Media[]> {
    try {
      const data = await apiClient.get<any>(
        `${this.baseUrl}/discover/movie?with_genres=16&with_origin_country=JP&sort_by=popularity.desc`
      );
      return (data.results || []).map((item: any) => ({
        ...this.mapTmdbToMedia(item, 'movie'),
        isAnime: true,
      }));
    } catch {
      return [];
    }
  }

  // --- Search & Filters ---

  async searchFiltered(params: {
    query?: string;
    mediaType?: 'movie' | 'tv' | 'anime' | 'all';
    genreId?: number;
    year?: number;
    country?: string;
    minRating?: number;
    page?: number;
  }): Promise<{ results: Media[]; totalPages: number; totalResults: number }> {
    const page = params.page || 1;
    try {
      if (params.query && params.query.trim()) {
        const query = encodeURIComponent(params.query.trim());
        const data = await apiClient.get<any>(`${this.baseUrl}/search/multi?query=${query}&page=${page}`);
        let list: Media[] = (data.results || [])
          .filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv')
          .map((i: any) => this.mapTmdbToMedia(i));

        if (params.minRating) {
          list = list.filter((m) => m.voteAverage >= params.minRating!);
        }
        if (params.year) {
          list = list.filter((m) => m.releaseYear === params.year);
        }
        return {
          results: list,
          totalPages: data.total_pages || 1,
          totalResults: data.total_results || list.length,
        };
      }

      // Filtered Discover
      const endpoint = params.mediaType === 'tv' || params.mediaType === 'anime' ? 'tv' : 'movie';
      let url = `${this.baseUrl}/discover/${endpoint}?page=${page}&sort_by=popularity.desc`;

      if (params.genreId) url += `&with_genres=${params.genreId}`;
      if (params.year) url += endpoint === 'movie' ? `&primary_release_year=${params.year}` : `&first_air_date_year=${params.year}`;
      if (params.country) url += `&with_origin_country=${params.country}`;
      if (params.minRating) url += `&vote_average.gte=${params.minRating}`;
      if (params.mediaType === 'anime') url += `&with_genres=16&with_origin_country=JP`;

      const data = await apiClient.get<any>(url);
      const list = (data.results || []).map((i: any) => this.mapTmdbToMedia(i, endpoint === 'tv' ? 'tv' : 'movie'));
      return {
        results: list,
        totalPages: data.total_pages || 1,
        totalResults: data.total_results || list.length,
      };
    } catch {
      return { results: [], totalPages: 1, totalResults: 0 };
    }
  }

  // --- Media Details ---

  async getDetails(id: number, type: 'movie' | 'tv' | 'anime'): Promise<Media | null> {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const data = await apiClient.get<any>(
        `${this.baseUrl}/${endpoint}/${id}?append_to_response=credits,recommendations,similar,external_ids`
      );

      const media = this.mapTmdbToMedia(data, endpoint === 'movie' ? 'movie' : (type === 'anime' ? 'anime' : 'tv'));
      media.imdbId = data.external_ids?.imdb_id || data.imdb_id;

      // Cast
      if (data.credits?.cast) {
        media.cast = data.credits.cast.slice(0, 12).map((c: any): CastMember => ({
          id: c.id,
          name: c.name,
          character: c.character || '',
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
        }));
      }

      // Crew
      if (data.credits?.crew) {
        media.crew = data.credits.crew.slice(0, 6).map((c: any) => ({
          id: c.id,
          name: c.name,
          job: c.job || '',
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
        }));
      }

      // Companies
      if (data.production_companies) {
        media.companies = data.production_companies.map((co: any): Company => ({
          id: co.id,
          name: co.name,
          logoPath: co.logo_path ? `https://image.tmdb.org/t/p/w185${co.logo_path}` : null,
          originCountry: co.origin_country,
        }));
      }

      // Networks
      if (data.networks) {
        media.networks = data.networks.map((net: any): Network => ({
          id: net.id,
          name: net.name,
          logoPath: net.logo_path ? `https://image.tmdb.org/t/p/w185${net.logo_path}` : null,
          originCountry: net.origin_country,
        }));
      }

      // Recommendations & Similar
      if (data.recommendations?.results) {
        media.recommendations = data.recommendations.results.slice(0, 10).map((r: any) => this.mapTmdbToMedia(r));
      }
      if (data.similar?.results) {
        media.similar = data.similar.results.slice(0, 10).map((r: any) => this.mapTmdbToMedia(r));
      }

      // TV Seasons
      if (endpoint === 'tv' && data.seasons) {
        media.seasons = data.seasons.map((s: any): Season => ({
          id: s.id,
          seasonNumber: s.season_number,
          title: s.name,
          episodeCount: s.episode_count,
          posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : null,
        }));
      }

      return media;
    } catch {
      return null;
    }
  }

  // --- TV Seasons & Episodes ---

  async getSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/tv/${tvId}/season/${seasonNumber}`);
      return (data.episodes || []).map((ep: any): Episode => ({
        id: ep.id,
        episodeNumber: ep.episode_number,
        seasonNumber: ep.season_number,
        title: ep.name,
        overview: ep.overview || '',
        stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
        runtimeMinutes: ep.runtime || 45,
        airDate: ep.air_date,
        voteAverage: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : 0,
      }));
    } catch {
      return [];
    }
  }

  // --- Production Companies & Networks Catalog ---

  getPopularCompanies(): Company[] {
    return [
      { id: 33, name: 'Universal Pictures', logoPath: 'https://image.tmdb.org/t/p/w185/8lvHyhjr8oUKOOy2dKXoALWKdp0.png', originCountry: 'US' },
      { id: 2, name: 'Walt Disney Pictures', logoPath: 'https://image.tmdb.org/t/p/w185/wdrCwmR57qI56fQ1a15w6oU1728.png', originCountry: 'US' },
      { id: 174, name: 'Warner Bros. Pictures', logoPath: 'https://image.tmdb.org/t/p/w185/IuAlhZ0m4l1x.png', originCountry: 'US' },
      { id: 420, name: 'Marvel Studios', logoPath: 'https://image.tmdb.org/t/p/w185/hUzeosd33nzE5MCNsZxCGEKTXaQ.png', originCountry: 'US' },
      { id: 923, name: 'Legendary Pictures', logoPath: 'https://image.tmdb.org/t/p/w185/5U2521mox5023924.png', originCountry: 'US' },
      { id: 10342, name: 'Studio Ghibli', logoPath: 'https://image.tmdb.org/t/p/w185/7cwhQp2Q2w32d.png', originCountry: 'JP' },
    ];
  }

  getPopularNetworks(): Network[] {
    return [
      { id: 213, name: 'Netflix', logoPath: 'https://image.tmdb.org/t/p/w185/wwemzKWzjKYJFfCeiB57q3r4Bcm.png', originCountry: 'US' },
      { id: 1024, name: 'Amazon Prime Video', logoPath: 'https://image.tmdb.org/t/p/w185/ifhbNuuq2up0MYgnEpeaLAVZ5Fy.png', originCountry: 'US' },
      { id: 2739, name: 'Disney+', logoPath: 'https://image.tmdb.org/t/p/w185/dgPueyEdOwpQ19Rz57uQ73k6r6P.png', originCountry: 'US' },
      { id: 49, name: 'HBO', logoPath: 'https://image.tmdb.org/t/p/w185/tuomPhY2UtuPTqqFnKMVHvSb724.png', originCountry: 'US' },
      { id: 2552, name: 'Apple TV+', logoPath: 'https://image.tmdb.org/t/p/w185/4KAy345qP3d4.png', originCountry: 'US' },
      { id: 4330, name: 'Paramount+', logoPath: 'https://image.tmdb.org/t/p/w185/fi83B1VR0.png', originCountry: 'US' },
    ];
  }

  private mapTmdbToMedia(item: any, explicitType?: 'movie' | 'tv' | 'anime'): Media {
    const isTv = explicitType ? explicitType === 'tv' || explicitType === 'anime' : item.media_type === 'tv' || !item.title;
    const isAnime = explicitType === 'anime' || (item.genre_ids && item.genre_ids.includes(16) && item.origin_country?.includes('JP'));

    const genres: Genre[] = (item.genres || []).map((g: any) => ({
      id: g.id,
      name: g.name,
    }));

    return {
      id: item.id,
      tmdbId: item.id,
      title: item.title || item.name || 'Untitled',
      originalTitle: item.original_title || item.original_name,
      overview: item.overview || '',
      posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : null,
      mediaType: isAnime ? 'anime' : (isTv ? 'tv' : 'movie'),
      releaseYear: item.release_date
        ? parseInt(item.release_date.split('-')[0])
        : item.first_air_date
        ? parseInt(item.first_air_date.split('-')[0])
        : undefined,
      releaseDate: item.release_date || item.first_air_date,
      voteAverage: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 0,
      voteCount: item.vote_count || 0,
      country: item.origin_country ? item.origin_country[0] : undefined,
      genres,
      runtimeMinutes: item.runtime || (item.episode_run_time ? item.episode_run_time[0] : undefined),
      isAnime,
    };
  }
}

export const tmdbService = TmdbService.getInstance();
