import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MediaItem, CategoryFilter, FavoriteItem, WatchHistoryItem, DiscoverFilterParams, Episode } from './types';
import { StorageService } from './services/storage';
import { TmdbService } from './services/tmdb';
import {
  parseCurrentLocation,
  syncBrowserCanonicalUrl,
  getCanonicalUrl,
  updateOpenGraphMeta
} from './utils/share';
import { Header } from './components/Header';
import { HeroBanner, HeroCategory } from './components/HeroBanner';
import { TopTrendingBanner } from './components/TopTrendingBanner';
import { ContinueWatching } from './components/ContinueWatching';
import { CategoryNav } from './components/CategoryNav';
import { AdvancedFilterBar } from './components/AdvancedFilterBar';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ShareDialog } from './components/ShareDialog';
import { TmdbSettingsModal } from './components/TmdbSettingsModal';
import { LanguageModal } from './components/LanguageModal';
import { BottomNavBar } from './components/BottomNavBar';
import { Footer } from './components/Footer';
import { DmcaPage } from './components/DmcaPage';
import { TermsPage } from './components/TermsPage';
import { SeoMetaHelmet } from './components/SeoMetaHelmet';

export const App: React.FC = () => {
  // Legal Pages state ('dmca' | 'terms' | null)
  const [currentLegalPage, setCurrentLegalPage] = useState<'dmca' | 'terms' | null>(null);

  // Main data states
  const [items, setItems] = useState<MediaItem[]>([]);
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
  const [heroMediaList, setHeroMediaList] = useState<MediaItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Advanced TMDb Discover Filters
  const [discoverFilters, setDiscoverFilters] = useState<DiscoverFilterParams>({
    type: 'all',
    genreId: 0,
    year: '',
    language: '',
    minRating: 0,
    sortBy: 'popularity.desc',
    page: 1
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Active Modals state
  const [detailsMedia, setDetailsMedia] = useState<MediaItem | null>(null);
  const [playerMedia, setPlayerMedia] = useState<MediaItem | null>(null);
  const [playerSeason, setPlayerSeason] = useState<number>(1);
  const [playerEpisode, setPlayerEpisode] = useState<number>(1);

  // TMDb Open API Settings Modal
  const [isTmdbSettingsOpen, setIsTmdbSettingsOpen] = useState<boolean>(false);

  // Language Modal state
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('ar');

  // Share Dialog state
  const [shareMedia, setShareMedia] = useState<MediaItem | null>(null);
  const [shareSeason, setShareSeason] = useState<number>(1);
  const [shareEpisode, setShareEpisode] = useState<number>(1);
  const [shareEpisodeData, setShareEpisodeData] = useState<Episode | null>(null);
  const [isEpisodeShare, setIsEpisodeShare] = useState<boolean>(false);

  // Storage states
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Dynamic Hero Carousel State
  const [heroCategory, setHeroCategory] = useState<HeroCategory>('all');
  const [heroPage, setHeroPage] = useState<number>(1);
  const [isHeroRefreshing, setIsHeroRefreshing] = useState<boolean>(false);

  // Load curated 24-hour daily hero media and fresh content pool
  const loadHeroMedia = useCallback(async (cat: HeroCategory = 'all', page: number = 1, append: boolean = false) => {
    setIsHeroRefreshing(true);
    try {
      const dailyResult = await TmdbService.getDailyHeroPool(cat, page);
      const heroList = dailyResult.pool;
      const heroChosen = dailyResult.hero;

      if (heroList.length > 0) {
        if (append) {
          setHeroMediaList((prev) => {
            const existing = new Set(prev.map((i) => i.tmdbId));
            const newOnes = heroList.filter((i) => !existing.has(i.tmdbId));
            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
          });
        } else {
          setHeroMediaList(heroList);
          setHeroMedia(heroChosen || heroList[0]);
        }
      }
    } catch (err) {
      console.error('Error loading 24-hour daily hero media:', err);
    } finally {
      setIsHeroRefreshing(false);
    }
  }, []);

  const handleHeroCycleComplete = useCallback(() => {
    setHeroPage((prev) => {
      const nextPage = prev >= 5 ? 1 : prev + 1;
      loadHeroMedia(heroCategory, nextPage, false);
      return nextPage;
    });
  }, [heroCategory, loadHeroMedia]);

  const handleHeroRefresh = useCallback(() => {
    setHeroPage((prev) => {
      const nextPage = prev >= 5 ? 1 : prev + 1;
      loadHeroMedia(heroCategory, nextPage, false);
      return nextPage;
    });
  }, [heroCategory, loadHeroMedia]);

  const handleHeroCategoryChange = useCallback((cat: HeroCategory) => {
    setHeroCategory(cat);
    setHeroPage(1);
    loadHeroMedia(cat, 1, false);
  }, [loadHeroMedia]);

  // Load storage data on mount, 24-hour day rollover timer & handle URL canonical deep linking
  useEffect(() => {
    setFavorites(StorageService.getFavorites());
    setHistory(StorageService.getHistory());

    // Initial load for 24-hour daily hero media
    loadHeroMedia('all', 1, false);

    // Periodic 24-hour rollover checker: checks every 10 minutes if calendar date shifted
    let currentDayStr = new Date().toDateString();
    const dailyTimer = setInterval(() => {
      const newDayStr = new Date().toDateString();
      if (newDayStr !== currentDayStr) {
        currentDayStr = newDayStr;
        loadHeroMedia(heroCategory, 1, false);
      }
    }, 10 * 60 * 1000);

    const handleVisibilityOrFocus = () => {
      const newDayStr = new Date().toDateString();
      if (newDayStr !== currentDayStr) {
        currentDayStr = newDayStr;
        loadHeroMedia(heroCategory, 1, false);
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);

    const handleLocationChange = async () => {
      const pathname = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase().replace(/\/+$/, '');
      if (pathname.includes('/dmca')) {
        setCurrentLegalPage('dmca');
        setPlayerMedia(null);
        setDetailsMedia(null);
        return;
      }
      if (pathname.includes('/terms')) {
        setCurrentLegalPage('terms');
        setPlayerMedia(null);
        setDetailsMedia(null);
        return;
      }
      setCurrentLegalPage(null);

      const parsed = parseCurrentLocation();
      const config = (window as any).CinemaWindowConfig;
      const initialRoute = config?.initialRoute;

      const targetTmdbId = parsed?.tmdbId || (initialRoute?.tmdbId ? Number(initialRoute.tmdbId) : undefined);
      const targetType = parsed?.type || initialRoute?.type || 'movie';
      const rawTargetSeason = parsed?.season || (initialRoute?.season ? Number(initialRoute.season) : 1);
      const rawTargetEpisode = parsed?.episode || (initialRoute?.episode ? Number(initialRoute.episode) : 1);
      
      // Ensure positive valid integers for season & episode
      const targetSeason = !isNaN(rawTargetSeason) && rawTargetSeason > 0 ? rawTargetSeason : 1;
      const targetEpisode = !isNaN(rawTargetEpisode) && rawTargetEpisode > 0 ? rawTargetEpisode : 1;
      const isEpisodeRoute = (parsed?.isEpisode || initialRoute?.isEpisode || false) && targetType !== 'movie';

      if (parsed || initialRoute) {
        let details: MediaItem | null = null;
        if (targetTmdbId && targetTmdbId > 0) {
          details = await TmdbService.getMediaDetails(targetTmdbId, targetType);
        } else if (parsed) {
          // Resolve media by trying raw query, clean slug query, and fallback terms
          const searchQueries = [
            parsed.rawSlug ? parsed.rawSlug.replace(/[\-_]+/g, ' ').trim() : '',
            parsed.slug ? parsed.slug.replace(/[\-_]+/g, ' ').trim() : '',
            parsed.slug ? parsed.slug.trim() : ''
          ].filter((q) => q.length > 0);

          for (const query of searchQueries) {
            try {
              const searchRes = await TmdbService.searchMulti(query);
              if (searchRes && searchRes.items && searchRes.items.length > 0) {
                const match = searchRes.items.find((i) => i.type === parsed.type) || searchRes.items[0];
                if (match) {
                  details = await TmdbService.getMediaDetails(match.tmdbId, match.type);
                  break;
                }
              }
            } catch (searchErr) {
              console.warn('Search query resolution error:', query, searchErr);
            }
          }
        }

        if (details) {
          if (isEpisodeRoute || targetType === 'movie') {
            let activeSeason = targetType === 'movie' ? 1 : targetSeason;
            let activeEpisode = targetType === 'movie' ? 1 : targetEpisode;

            // Handle continuous cumulative anime episode indexing (e.g. Episode 41 in Re:Zero which is Season 2 Ep 16)
            if (targetType !== 'movie' && details.seasons && details.seasons.length > 0) {
              const currentS = details.seasons.find((s) => s.seasonNumber === targetSeason);
              if (currentS && currentS.episodesCount && currentS.episodesCount > 0 && targetEpisode > currentS.episodesCount) {
                let accumulated = 0;
                for (const s of details.seasons) {
                  const epCount = s.episodesCount || 0;
                  if (epCount > 0 && targetEpisode > accumulated && targetEpisode <= accumulated + epCount) {
                    activeSeason = s.seasonNumber;
                    activeEpisode = targetEpisode - accumulated;
                    break;
                  }
                  accumulated += epCount;
                }
              }
            }

            setPlayerMedia(details);
            setPlayerSeason(activeSeason);
            setPlayerEpisode(activeEpisode);
            setDetailsMedia(null);
            syncBrowserCanonicalUrl(details, targetType === 'movie' ? undefined : activeSeason, targetType === 'movie' ? undefined : activeEpisode, true);
          } else {
            setDetailsMedia(details);
            setPlayerMedia(null);
            syncBrowserCanonicalUrl(details, undefined, undefined, true);
          }
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      clearInterval(dailyTimer);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Update browser URL & OG tags whenever active media changes
  useEffect(() => {
    if (playerMedia) {
      syncBrowserCanonicalUrl(playerMedia, playerSeason, playerEpisode, false);
      updateOpenGraphMeta(playerMedia, playerSeason, playerEpisode);
    } else if (detailsMedia) {
      syncBrowserCanonicalUrl(detailsMedia, undefined, undefined, false);
      updateOpenGraphMeta(detailsMedia);
    } else {
      syncBrowserCanonicalUrl(null, undefined, undefined, false);
      updateOpenGraphMeta(null);
    }
  }, [playerMedia, detailsMedia, playerSeason, playerEpisode]);

  // Fetch TMDB content whenever Category, SubFilter, Page, or DiscoverFilters change
  const fetchCategoryData = useCallback(
    async (
      category: CategoryFilter,
      subFilter: string,
      page: number = 1,
      append: boolean = false,
      customFilters?: DiscoverFilterParams
    ) => {
      if (category === 'favorites' || category === 'history') {
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        let result: { items: MediaItem[]; totalPages: number } = { items: [], totalPages: 1 };

        const isAdvancedFilterActive =
          customFilters &&
          ((customFilters.genreId && customFilters.genreId > 0) ||
            customFilters.year ||
            customFilters.language ||
            (customFilters.minRating && customFilters.minRating > 0) ||
            (customFilters.sortBy && customFilters.sortBy !== 'popularity.desc'));

        if (isAdvancedFilterActive && customFilters) {
          const targetType =
            category === 'movie'
              ? 'movie'
              : category === 'tv'
              ? 'tv'
              : category === 'anime'
              ? 'anime'
              : category === 'cartoon'
              ? 'cartoon'
              : 'all';
          result = await TmdbService.discoverMedia({
            ...customFilters,
            type: targetType,
            page
          });
        } else {
          switch (category) {
            case 'movie':
              result = await TmdbService.getMovies(subFilter as any, page);
              break;
            case 'tv':
              result = await TmdbService.getTvShows(subFilter as any, page);
              break;
            case 'anime':
              result = await TmdbService.getAnime(page);
              break;
            case 'cartoon':
              result = await TmdbService.getCartoons(page);
              break;
            case 'trending':
              result = await TmdbService.getTrending('all', page);
              break;
            case 'all':
            default:
              result = await TmdbService.getTrending('all', page);
              break;
          }
        }

        if (append) {
          setItems((prev) => {
            const currentList = Array.isArray(prev) ? prev : [];
            const existingIds = new Set(currentList.map((i) => i.tmdbId));
            const newItems = result && Array.isArray(result.items) ? result.items : [];
            const uniqueNew = newItems.filter((i) => !existingIds.has(i.tmdbId));
            return [...currentList, ...uniqueNew];
          });
        } else {
          const freshItems = result && Array.isArray(result.items) ? result.items : [];
          setItems(freshItems);
          if (!heroMedia && freshItems.length > 0) {
            const candidate = freshItems.find((i) => i.backdropPath) || freshItems[0];
            setHeroMedia(candidate);
          }
        }
        setTotalPages(result?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching TMDB content:', err);
        if (!append) setItems([]);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [heroMedia]
  );

  // Trigger category change fetch
  useEffect(() => {
    setCurrentPage(1);
    fetchCategoryData(currentCategory, activeSubFilter, 1, false, discoverFilters);
  }, [currentCategory, activeSubFilter, discoverFilters, fetchCategoryData]);

  // Handle Search Input Debounce on TMDB live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await TmdbService.searchMulti(searchQuery.trim());
        setSearchResults(results && Array.isArray(results.items) ? results.items : []);
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const favoritesSet = useMemo(() => {
    return new Set((Array.isArray(favorites) ? favorites : []).map((f) => f.tmdbId));
  }, [favorites]);

  const handleToggleFavorite = (media: MediaItem) => {
    const updated = StorageService.toggleFavorite(media);
    setFavorites(updated);
  };

  const handleOpenPlay = (media: MediaItem, season: number = 1, episode: number = 1) => {
    setPlayerMedia(media);
    setPlayerSeason(season);
    setPlayerEpisode(episode);
    // Add to watch history
    const updatedHistory = StorageService.addToHistory(media, season, episode, 25);
    setHistory(updatedHistory);
  };

  const handleOpenDetails = async (media: MediaItem) => {
    setDetailsMedia(media);
    const full = await TmdbService.getMediaDetails(media.tmdbId, media.type);
    if (full) {
      setDetailsMedia(full);
    }
  };

  const handleOpenShare = (media: MediaItem, season?: number, episode?: number, episodeData?: Episode | null) => {
    const isEpisode = media.type !== 'movie' && season !== undefined && episode !== undefined;
    setShareMedia(media);
    setShareSeason(season || 1);
    setShareEpisode(episode || 1);
    setShareEpisodeData(episodeData || null);
    setIsEpisodeShare(Boolean(isEpisode));
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCategoryData(currentCategory, activeSubFilter, nextPage, true, discoverFilters);
    }
  };

  const handleClearHistory = () => {
    StorageService.clearHistory();
    setHistory([]);
  };

  // Build items array to display based on category
  const displayedItems = useMemo(() => {
    if (searchQuery.trim()) {
      return Array.isArray(searchResults) ? searchResults : [];
    }

    if (currentCategory === 'favorites') {
      return (Array.isArray(favorites) ? favorites : []).map((f) => ({
        id: f.mediaId,
        tmdbId: f.tmdbId,
        title: f.title,
        type: f.type,
        posterPath: f.posterPath,
        backdropPath: f.backdropPath,
        voteAverage: typeof f.voteAverage === 'number' ? f.voteAverage : 0,
        year: f.year,
        overview: 'تمت إضافته إلى قائمتك المفضلة',
        genres: ['المفضلة']
      }));
    }

    if (currentCategory === 'history') {
      return (Array.isArray(history) ? history : []).map((h) => ({
        id: h.mediaId,
        tmdbId: h.tmdbId,
        title: h.title,
        type: h.type,
        posterPath: h.posterPath,
        backdropPath: h.backdropPath,
        voteAverage: typeof h.voteAverage === 'number' ? h.voteAverage : 0,
        year: h.year,
        overview: h.overview || `تمت مشاهدته: ${h.season ? `الموسم ${h.season} - الحلقة ${h.episode}` : 'فيلم كامل'}`,
        genres: ['سجل المشاهدة']
      }));
    }

    return Array.isArray(items) ? items : [];
  }, [items, currentCategory, searchQuery, searchResults, favorites, history]);

  const getSectionTitle = () => {
    if (searchQuery.trim()) return `نتائج البحث عن "${searchQuery}" في TMDb`;
    if (discoverFilters.genreId && discoverFilters.genreId > 0) {
      return `نتائج التصفية والتصنيف المتقدم في TMDb`;
    }
    switch (currentCategory) {
      case 'movie':
        return activeSubFilter === 'top_rated'
          ? 'أعلى الأفلام تقييماً في تاريخ السينما'
          : activeSubFilter === 'now_playing'
          ? 'أفلام تعرض حالياً في دور العرض والسينما'
          : 'أحدث الأفلام المضافة بالسينما';
      case 'tv':
        return activeSubFilter === 'top_rated'
          ? 'أعلى المسلسلات تقييماً عالمياً'
          : activeSubFilter === 'on_the_air'
          ? 'مسلسلات مستمرة بالعرض حالياً'
          : 'أحدث المسلسلات التلفزيونية';
      case 'anime':
        return 'عالم الأنمي الياباني المترجم والمدبلج';
      case 'cartoon':
        return 'أفلام ومسلسلات الكرتون والرسوم المتحركة';
      case 'trending':
        return 'الأكثر مشاهدة وإقبالاً اليوم';
      case 'favorites':
        return 'قائمتي المفضلة';
      case 'history':
        return 'سجل المشاهدة الأخير';
      case 'all':
      default:
        return 'أحدث الإضافات بالسينما';
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    const normalized = path.toLowerCase().replace(/\/+$/, '');
    if (normalized.includes('/dmca')) {
      setCurrentLegalPage('dmca');
      setPlayerMedia(null);
      setDetailsMedia(null);
    } else if (normalized.includes('/terms')) {
      setCurrentLegalPage('terms');
      setPlayerMedia(null);
      setDetailsMedia(null);
    } else {
      setCurrentLegalPage(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col font-['Cairo'] antialiased selection:bg-purple-600 selection:text-white" dir="rtl">
      {/* Dynamic SEO Head with react-helmet-async */}
      <SeoMetaHelmet
        media={playerMedia || detailsMedia}
        season={playerMedia ? playerSeason : undefined}
        episode={playerMedia ? playerEpisode : undefined}
        legalPage={currentLegalPage}
      />

      {/* Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          setActiveSubFilter('popular');
          if (currentLegalPage) {
            handleNavigate('/');
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.length}
        historyCount={history.length}
        onOpenTmdbSettings={() => setIsTmdbSettingsOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        currentLanguage={currentLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 sm:pb-14 w-full space-y-6">
        {/* Render Legal Pages if active */}
        {currentLegalPage === 'dmca' && (
          <DmcaPage onNavigateHome={() => handleNavigate('/')} />
        )}

        {currentLegalPage === 'terms' && (
          <TermsPage onNavigateHome={() => handleNavigate('/')} />
        )}

        {/* Dynamic Hero Banner directly from top TMDB Trending */}
        {!currentLegalPage && !searchQuery.trim() && currentCategory === 'all' && heroMedia && (
          <HeroBanner
            media={heroMedia}
            onPlay={handleOpenPlay}
            onDetails={handleOpenDetails}
            isFavorite={favoritesSet.has(heroMedia.tmdbId)}
            onToggleFavorite={handleToggleFavorite}
            onOpenShare={handleOpenShare}
            allHeroItems={heroMediaList}
            onSelectHero={setHeroMedia}
            activeCategory={heroCategory}
            onChangeCategory={handleHeroCategoryChange}
            onRefreshHero={handleHeroRefresh}
            onCycleComplete={handleHeroCycleComplete}
            isRefreshing={isHeroRefreshing}
          />
        )}

        {/* Continue Watching Component if history exists */}
        {!currentLegalPage && !searchQuery.trim() && history.length > 0 && currentCategory === 'all' && (
          <ContinueWatching
            history={history}
            onPlay={handleOpenPlay}
            onClear={handleClearHistory}
          />
        )}

        {/* Top 5 Trending Banner */}
        {!currentLegalPage && !searchQuery.trim() && (currentCategory === 'all' || currentCategory === 'trending') && (
          <TopTrendingBanner
            isLoading={isLoading}
            onRefresh={() => fetchCategoryData(currentCategory, activeSubFilter, 1, false, discoverFilters)}
          />
        )}

        {/* Category Navigation */}
        {!currentLegalPage && (
          <CategoryNav
            currentCategory={currentCategory}
            onSelectCategory={(cat) => {
              setCurrentCategory(cat);
              setSearchQuery('');
              setActiveSubFilter('popular');
            }}
            favoritesCount={favorites.length}
            historyCount={history.length}
          />
        )}

        {/* Advanced Filter Bar for Open TMDb Discovery */}
        {!currentLegalPage && currentCategory !== 'favorites' && currentCategory !== 'history' && !searchQuery.trim() && (
          <AdvancedFilterBar
            filters={discoverFilters}
            onFilterChange={(newFilters) => setDiscoverFilters(newFilters)}
            onOpenTmdbSettings={() => setIsTmdbSettingsOpen(true)}
          />
        )}

        {/* Media Grid Connected to TMDB */}
        {!currentLegalPage && (
          <MediaGrid
            title={getSectionTitle()}
            items={displayedItems}
            isLoading={isLoading || isSearching}
            isLoadingMore={isLoadingMore}
            isSearchMode={Boolean(searchQuery.trim())}
            hasMore={!searchQuery.trim() && currentCategory !== 'favorites' && currentCategory !== 'history' && currentPage < totalPages}
            onLoadMore={handleLoadMore}
            onPlay={handleOpenPlay}
            onDetails={handleOpenDetails}
            isFavorite={(id) => favoritesSet.has(id)}
            onToggleFavorite={handleToggleFavorite}
            currentCategory={currentCategory}
            activeSubFilter={activeSubFilter}
            onSelectSubFilter={setActiveSubFilter}
            onSwitchToExplore={() => {
              setCurrentCategory('all');
              setActiveSubFilter('popular');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          setActiveSubFilter('popular');
          if (currentLegalPage) {
            handleNavigate('/');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        historyCount={history.length}
      />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Details Modal */}
      <MediaModal
        media={detailsMedia}
        isOpen={!!detailsMedia}
        onClose={() => setDetailsMedia(null)}
        onPlay={handleOpenPlay}
        isFavorite={detailsMedia ? favoritesSet.has(detailsMedia.tmdbId) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenShare={handleOpenShare}
      />

      {/* Video Player Modal with 36 Servers */}
      <VideoPlayerModal
        media={playerMedia}
        isOpen={!!playerMedia}
        onClose={() => setPlayerMedia(null)}
        initialSeason={playerSeason}
        initialEpisode={playerEpisode}
        onOpenShare={handleOpenShare}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
      />

      {/* Share Dialog */}
      <ShareDialog
        media={shareMedia}
        isOpen={!!shareMedia}
        onClose={() => {
          setShareMedia(null);
          setShareEpisodeData(null);
        }}
        selectedSeason={shareSeason}
        selectedEpisode={shareEpisode}
        isEpisodeShare={isEpisodeShare}
        episodeData={shareEpisodeData}
      />

      {/* Open TMDb Engine Settings Modal */}
      <TmdbSettingsModal
        isOpen={isTmdbSettingsOpen}
        onClose={() => setIsTmdbSettingsOpen(false)}
        onKeySaved={() => {
          fetchCategoryData(currentCategory, activeSubFilter, 1, false, discoverFilters);
        }}
      />
    </div>
  );
};

export default App;
