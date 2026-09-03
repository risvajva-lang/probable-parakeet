import { getCanonicalPath } from './share';
import { MediaItem } from '../types';
import { getSeasonOrdinalWord, getEpisodeOrdinalWord } from './arabicWords';
import { getLanguageConfig, DEFAULT_LANGUAGE } from '../data/languages';

/**
 * Builds canonical SEO metadata for Cinema Window based on language config
 */
export function buildMediaSeoMetadata(media: MediaItem, season?: number, episode?: number, lang: string = DEFAULT_LANGUAGE) {
  const langConfig = getLanguageConfig(lang);
  const isMovie = media.type === 'movie';
  const typeLabel = media.type === 'anime' ? (lang === 'ar' ? 'أنمي' : 'Anime') : media.type === 'cartoon' ? (lang === 'ar' ? 'كرتون' : 'Cartoon') : (lang === 'ar' ? 'مسلسل' : 'Series');
  const cleanTitle = media.title || media.originalTitle || langConfig.ui.siteName;
  const year = media.year ? String(media.year) : (media.releaseDate ? media.releaseDate.substring(0, 4) : '');

  let title = '';
  let description = media.overview || (lang === 'ar' 
    ? `استمتع بمشاهدة ${cleanTitle} بأعلى جودة Full HD و 4K بدون إعلانات مزعجة عبر شباك السينما.`
    : `Watch ${cleanTitle} in Full HD and 4K online on Cinema Window VIP.`);

  if (isMovie) {
    title = langConfig.seo.movieTitle
      .replace('{TITLE}', cleanTitle)
      .replace('{YEAR}', year ? `(${year})` : '')
      .replace(/\s+/g, ' ')
      .trim();
  } else if (season !== undefined && episode !== undefined && season > 0 && episode > 0) {
    const seasonWord = lang === 'ar' ? getSeasonOrdinalWord(season) : String(season);
    const episodeWord = lang === 'ar' ? getEpisodeOrdinalWord(episode) : '';
    title = langConfig.seo.episodeTitle
      .replace('{TYPE_LABEL}', typeLabel)
      .replace('{TITLE}', cleanTitle)
      .replace('{SEASON}', String(season))
      .replace('{SEASON_WORD}', seasonWord)
      .replace('{EPISODE}', String(episode))
      .replace('{EPISODE_WORD}', episodeWord)
      .replace(/\s+/g, ' ')
      .trim();
    
    description = langConfig.seo.episodeDesc
      .replace('{TYPE_LABEL}', typeLabel)
      .replace('{TITLE}', cleanTitle)
      .replace('{SEASON}', String(season))
      .replace('{EPISODE}', String(episode))
      .trim();
  } else {
    const mainTpl = media.type === 'anime' ? langConfig.seo.animeTitle : langConfig.seo.tvTitle;
    title = mainTpl
      .replace('{TITLE}', cleanTitle)
      .replace('{YEAR}', year ? `(${year})` : '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return {
    title,
    description,
    image: media.backdropPath || media.posterPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
    type: isMovie ? 'video.movie' : season && episode ? 'video.episode' : 'video.tv_show'
  };
}

/**
 * Injects / updates JSON-LD structured data in the document head with genuine data
 */
export function updateStructuredData(media: MediaItem | null, season?: number, episode?: number, lang: string = DEFAULT_LANGUAGE) {
  if (typeof document === 'undefined') return;

  const existingScript = document.getElementById('cw-jsonld-schema');
  const existingBreadcrumbs = document.getElementById('cw-jsonld-breadcrumbs');

  if (!media) {
    if (existingScript) existingScript.remove();
    if (existingBreadcrumbs) existingBreadcrumbs.remove();
    return;
  }

  const isMovie = media.type === 'movie';
  const title = media.title || media.originalTitle || 'نافذة السينما';
  const origin = window.location.origin;
  const currentPath = window.location.pathname;

  let schema: Record<string, any> = {};

  if (isMovie) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      'name': title,
      'inLanguage': lang,
      'url': `${origin}${currentPath}`
    };

    if (media.overview) schema['description'] = media.overview;
    if (media.posterPath) schema['image'] = media.posterPath;
    if (media.releaseDate) schema['datePublished'] = media.releaseDate;
    if (media.director) {
      schema['director'] = {
        '@type': 'Person',
        'name': media.director
      };
    }
    if (media.cast && media.cast.length > 0) {
      schema['actor'] = media.cast.slice(0, 8).map(c => ({
        '@type': 'Person',
        'name': c.name
      }));
    }
    if (media.genres && media.genres.length > 0) {
      schema['genre'] = media.genres;
    }

    // Authentic ratings only (no fake values)
    if (typeof media.voteAverage === 'number' && media.voteAverage > 0 && typeof media.voteCount === 'number' && media.voteCount > 0) {
      schema['aggregateRating'] = {
        '@type': 'AggregateRating',
        'ratingValue': media.voteAverage,
        'bestRating': '10',
        'worstRating': '1',
        'ratingCount': media.voteCount
      };
    }
  } else if (season && episode && season > 0 && episode > 0) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'TVEpisode',
      'name': `${title} - الموسم ${season} الحلقة ${episode}`,
      'episodeNumber': episode,
      'inLanguage': lang,
      'url': `${origin}${currentPath}`,
      'partOfSeason': {
        '@type': 'TVSeason',
        'seasonNumber': season
      },
      'partOfSeries': {
        '@type': 'TVSeries',
        'name': title
      }
    };

    if (media.overview) schema['description'] = media.overview;
    if (media.posterPath || media.backdropPath) schema['image'] = media.backdropPath || media.posterPath;
  } else {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'TVSeries',
      'name': title,
      'inLanguage': lang,
      'url': `${origin}${currentPath}`
    };

    if (media.overview) schema['description'] = media.overview;
    if (media.posterPath) schema['image'] = media.posterPath;
    if (media.releaseDate) schema['startDate'] = media.releaseDate;
    if (media.seasonsCount && media.seasonsCount > 0) schema['numberOfSeasons'] = media.seasonsCount;
    if (media.episodesCount && media.episodesCount > 0) schema['numberOfEpisodes'] = media.episodesCount;

    // Authentic ratings only
    if (typeof media.voteAverage === 'number' && media.voteAverage > 0 && typeof media.voteCount === 'number' && media.voteCount > 0) {
      schema['aggregateRating'] = {
        '@type': 'AggregateRating',
        'ratingValue': media.voteAverage,
        'bestRating': '10',
        'worstRating': '1',
        'ratingCount': media.voteCount
      };
    }
  }

  // Inject Primary Media Schema
  let scriptEl = existingScript as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'cw-jsonld-schema';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(schema, null, 2);

  // Generate BreadcrumbList Schema
  const breadcrumbItems: { name: string; item: string }[] = [
    { name: lang === 'ar' ? 'الرئيسية' : 'Home', item: origin }
  ];

  const typeName = media.type === 'anime' ? (lang === 'ar' ? 'الأنمي' : 'Anime') : media.type === 'movie' ? (lang === 'ar' ? 'الأفلام' : 'Movies') : (lang === 'ar' ? 'المسلسلات' : 'TV Shows');
  breadcrumbItems.push({
    name: typeName,
    item: `${origin}/#category=${media.type}`
  });

  breadcrumbItems.push({
    name: title,
    item: `${origin}${getCanonicalPath(media)}`
  });

  if (season && episode && season > 0 && episode > 0) {
    breadcrumbItems.push({
      name: `${lang === 'ar' ? 'الموسم' : 'Season'} ${season}`,
      item: `${origin}${getCanonicalPath(media, season, 1).replace(/\/episode-1$/, '')}`
    });
    breadcrumbItems.push({
      name: `${lang === 'ar' ? 'الحلقة' : 'Episode'} ${episode}`,
      item: `${origin}${currentPath}`
    });
  }

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((b, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': b.name,
      'item': b.item
    }))
  };

  let breadcrumbsEl = existingBreadcrumbs as HTMLScriptElement | null;
  if (!breadcrumbsEl) {
    breadcrumbsEl = document.createElement('script');
    breadcrumbsEl.id = 'cw-jsonld-breadcrumbs';
    breadcrumbsEl.type = 'application/ld+json';
    document.head.appendChild(breadcrumbsEl);
  }
  breadcrumbsEl.textContent = JSON.stringify(breadcrumbsSchema, null, 2);
}
