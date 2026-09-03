import React, { useState, useMemo, useEffect } from 'react';
import {
  Tv,
  Search,
  LayoutGrid,
  List,
  Play,
  Clock,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  Film,
  Zap,
  Volume2,
  Radio,
  Share2,
  Bell,
  BellRing,
  Calendar,
  ArrowUpDown,
  Check,
  Eye,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Season, Episode, MediaItem } from '../types';

interface SeasonsEpisodesViewProps {
  media: MediaItem;
  seasons: Season[];
  selectedSeasonNumber: number;
  onSelectSeason: (seasonNumber: number) => void;
  episodes: Episode[];
  isLoadingEpisodes: boolean;
  onPlayEpisode: (seasonNumber: number, episodeNumber: number) => void;
  onOpenShare?: (media: MediaItem, season?: number, episode?: number, episodeData?: Episode) => void;
  currentPlayingSeasonNumber?: number;
  currentPlayingEpisodeNumber?: number;
}

export const SeasonsEpisodesView: React.FC<SeasonsEpisodesViewProps> = ({
  media,
  seasons = [],
  selectedSeasonNumber,
  onSelectSeason,
  episodes = [],
  isLoadingEpisodes,
  onPlayEpisode,
  onOpenShare,
  currentPlayingSeasonNumber,
  currentPlayingEpisodeNumber
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'available' | 'upcoming'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Watched episodes state stored in localStorage
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});
  
  // Reminders for upcoming episodes stored in localStorage
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  
  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const safeSeasons = Array.isArray(seasons) ? seasons : [];
  const safeEpisodes = Array.isArray(episodes) ? episodes : [];

  const currentSeason = safeSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) || safeSeasons[0];

  // Load watched status and reminders on mount / media change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const watchedKey = `cw_watched_${media.tmdbId}`;
      const savedWatched = localStorage.getItem(watchedKey);
      if (savedWatched) {
        setWatchedEpisodes(JSON.parse(savedWatched));
      } else {
        setWatchedEpisodes({});
      }

      const remindersKey = `cw_reminders_${media.tmdbId}`;
      const savedReminders = localStorage.getItem(remindersKey);
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      } else {
        setReminders({});
      }
    } catch {
      // Ignore storage errors
    }
  }, [media.tmdbId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const toggleWatched = (sNum: number, epNum: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const key = `s${sNum}e${epNum}`;
    setWatchedEpisodes((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`cw_watched_${media.tmdbId}`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      showToast(updated[key] ? `تم تحديد الحلقة ${epNum} كمشاهدة ✓` : `تم إلغاء تحديد الحلقة ${epNum}`);
      return updated;
    });
  };

  const toggleReminder = (sNum: number, epNum: number, epTitle?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const key = `s${sNum}e${epNum}`;
    setReminders((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`cw_reminders_${media.tmdbId}`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      showToast(
        updated[key]
          ? `🔔 تم ضبط تذكير للحلقة ${epNum}: سيتم إشعارك فور صدورها!`
          : `تم إلغاء التذكير للحلقة ${epNum}`
      );
      return updated;
    });
  };

  // Strictly filter episodes belonging to the selected season
  const seasonEpisodes = useMemo(() => {
    return safeEpisodes.filter((ep) => {
      if (typeof ep.seasonNumber === 'number' && ep.seasonNumber > 0) {
        return ep.seasonNumber === selectedSeasonNumber;
      }
      return true;
    });
  }, [safeEpisodes, selectedSeasonNumber]);

  // Separate released and upcoming
  const releasedEpisodes = useMemo(() => {
    return seasonEpisodes.filter((ep) => !ep.isUpcoming && ep.status !== 'upcoming');
  }, [seasonEpisodes]);

  const upcomingEpisodes = useMemo(() => {
    return seasonEpisodes.filter((ep) => ep.isUpcoming || ep.status === 'upcoming');
  }, [seasonEpisodes]);

  const releasedCount = releasedEpisodes.length;
  const upcomingCount = upcomingEpisodes.length;

  // Watched count for this season
  const watchedCount = useMemo(() => {
    let count = 0;
    releasedEpisodes.forEach((ep) => {
      const key = `s${selectedSeasonNumber}e${ep.episodeNumber}`;
      if (watchedEpisodes[key]) count++;
    });
    return count;
  }, [releasedEpisodes, selectedSeasonNumber, watchedEpisodes]);

  const watchedPercentage = releasedCount > 0 ? Math.round((watchedCount / releasedCount) * 100) : 0;

  // Next episode to watch
  const nextEpisodeToWatch = useMemo(() => {
    if (releasedEpisodes.length === 0) return null;
    if (currentPlayingSeasonNumber === selectedSeasonNumber && currentPlayingEpisodeNumber) {
      const nextEp = releasedEpisodes.find((ep) => ep.episodeNumber === currentPlayingEpisodeNumber + 1);
      if (nextEp) return nextEp;
    }
    const firstUnwatched = releasedEpisodes.find((ep) => {
      const key = `s${selectedSeasonNumber}e${ep.episodeNumber}`;
      return !watchedEpisodes[key];
    });
    return firstUnwatched || releasedEpisodes[0];
  }, [releasedEpisodes, selectedSeasonNumber, currentPlayingSeasonNumber, currentPlayingEpisodeNumber, watchedEpisodes]);

  // Apply tab filter & search & sort
  const displayedEpisodes = useMemo(() => {
    let list = seasonEpisodes;

    if (activeFilterTab === 'available') {
      list = releasedEpisodes;
    } else if (activeFilterTab === 'upcoming') {
      list = upcomingEpisodes;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((ep) => {
        const epNumStr = ep.episodeNumber.toString();
        const titleMatch = ep.title?.toLowerCase().includes(query);
        const overviewMatch = ep.overview?.toLowerCase().includes(query);
        const numMatch = epNumStr === query || query.includes(epNumStr);
        return titleMatch || numMatch || overviewMatch;
      });
    }

    const sorted = [...list].sort((a, b) => {
      return sortOrder === 'asc' ? a.episodeNumber - b.episodeNumber : b.episodeNumber - a.episodeNumber;
    });

    return sorted;
  }, [seasonEpisodes, releasedEpisodes, upcomingEpisodes, activeFilterTab, searchQuery, sortOrder]);

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in relative" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-episode-action"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#10172e] to-[#1c1335] text-white text-xs font-bold border border-purple-500/40 shadow-2xl shadow-purple-900/40 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 pointer-events-none"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SEASONS SELECTION CARD */}
      {safeSeasons.length > 0 && (
        <div
          id="card-seasons-selection"
          className="w-full rounded-3xl bg-[#0b1020] border border-purple-500/20 p-3.5 sm:p-5 shadow-xl space-y-3 transition-all"
        >
          {/* Header Line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                المواسم ({safeSeasons.length})
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-amber-400 font-['Cairo'] flex items-center gap-1.5">
              <span>اختر الموسم لعرض حلقاته</span>
            </h3>
          </div>

          {/* Horizontal Scrollable Season Capsules */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
            {safeSeasons.map((s) => {
              const isActive = s.seasonNumber === selectedSeasonNumber;
              const epCount = typeof s.episodesCount === 'number' && s.episodesCount > 0 ? s.episodesCount : null;

              let seasonDisplayName = s.title || `الموسم ${s.seasonNumber}`;
              if (!s.title || s.title === `الموسم ${s.seasonNumber}`) {
                if (s.seasonNumber === 1) seasonDisplayName = 'الموسم الأول';
                else if (s.seasonNumber === 2) seasonDisplayName = 'الموسم الثاني';
                else if (s.seasonNumber === 3) seasonDisplayName = 'الموسم الثالث';
                else if (s.seasonNumber === 4) seasonDisplayName = 'الموسم الرابع';
                else seasonDisplayName = `الموسم ${s.seasonNumber}`;
              }

              return (
                <button
                  key={s.id || s.seasonNumber}
                  id={`btn-season-${s.seasonNumber}`}
                  onClick={() => onSelectSeason(s.seasonNumber)}
                  className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#10172e] border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.45)] text-white scale-[1.02]'
                      : 'bg-[#10162a] hover:bg-[#161f38] border border-white/10 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold font-['Cairo']">
                    {seasonDisplayName}
                  </span>

                  {epCount !== null && (
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5 rounded-xl font-bold transition-colors ${
                        isActive
                          ? 'bg-purple-600/40 text-purple-200 border border-purple-400/40'
                          : 'bg-[#182035] text-gray-400 border border-white/5'
                      }`}
                    >
                      {epCount} حلقة
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. EPISODES MAIN CONTAINER CARD */}
      <div
        id="card-episodes-container"
        className="w-full rounded-3xl bg-[#0b1020] border border-purple-500/20 p-3.5 sm:p-6 shadow-xl space-y-4 transition-all"
      >
        {/* Top Header: Season Info + Progress + Filter Tabs */}
        <div className="space-y-3 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10 flex-shrink-0">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>

              <div>
                <h3 className="text-sm sm:text-lg font-black text-white font-['Cairo'] tracking-tight">
                  حلقات {currentSeason?.title || (selectedSeasonNumber >= 1970 ? `موسم سنة ${selectedSeasonNumber}` : `الموسم ${selectedSeasonNumber}`)}
                </h3>
                {releasedCount > 0 && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-['Cairo'] mt-0.5">
                    <span>تمت مشاهدة: {watchedCount} من {releasedCount}</span>
                    <span className="text-purple-400 font-bold">({watchedPercentage}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs: All, Available, Upcoming */}
            <div className="flex items-center p-1 rounded-2xl bg-[#10162a] border border-white/10 text-xs font-['Cairo']">
              <button
                id="tab-episodes-all"
                onClick={() => setActiveFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeFilterTab === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>الكل</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-black/30">
                  {seasonEpisodes.length}
                </span>
              </button>

              <button
                id="tab-episodes-available"
                onClick={() => setActiveFilterTab('available')}
                className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                  activeFilterTab === 'available'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>المتاحة الآن</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-black/30">
                  {releasedCount}
                </span>
              </button>

              {upcomingCount > 0 && (
                <button
                  id="tab-episodes-upcoming"
                  onClick={() => setActiveFilterTab('upcoming')}
                  className={`px-3 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                    activeFilterTab === 'upcoming'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 text-blue-300" />
                  <span>قريباً</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-blue-900/50 text-blue-200 border border-blue-400/30">
                    {upcomingCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Watched Progress Bar */}
          {releasedCount > 0 && (
            <div className="w-full bg-[#10162a] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${watchedPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Dedicated "قريباً / مواعيد الحلقات القادمة" Banner (When upcoming episodes exist) */}
        {upcomingCount > 0 && activeFilterTab !== 'available' && (
          <div
            id="banner-upcoming-schedule"
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1226] to-[#0e1630] border border-blue-500/30 space-y-2 text-right"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white font-['Cairo']">
                  جدول ومواعيد بث الحلقات القادمة ({upcomingCount} حلقة مجدولة)
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold font-['Cairo']">
                بث أسبوعي رسمي
              </span>
            </div>

            <p className="text-[11px] text-gray-300 font-['Cairo'] leading-relaxed">
              يتم إضافة الحلقات وترجمتها بدقة 4K فور انتهاء البث التلفزيوني مباشرة. اضغط على أيقونة الجرس 🔔 بجانب أي حلقة لتلقي تنبيه فوري فور توفرها.
            </p>
          </div>
        )}

        {/* Search Input + Sort Order + Grid/List View Switchers */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Episode Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              id="input-search-episode"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن حلقة بالاسم أو الرقم..."
              className="w-full bg-[#10162a] text-xs sm:text-sm text-white placeholder-gray-400 rounded-2xl py-2.5 pr-10 pl-8 border border-white/10 focus:border-purple-500 focus:outline-none font-['Cairo'] transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            id="btn-toggle-sort-order"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#10162a] hover:bg-[#161f38] border border-white/10 text-gray-300 text-xs font-bold font-['Cairo'] transition-colors cursor-pointer whitespace-nowrap"
            title="تبديل الترتيب"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span>{sortOrder === 'asc' ? '1 ← N' : 'N ← 1'}</span>
          </button>

          {/* View Mode Toggle: Grid / List */}
          <div className="flex items-center p-1 rounded-2xl bg-[#10162a] border border-white/10 flex-shrink-0">
            <button
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="عرض الشبكة"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="عرض القائمة"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingEpisodes && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <p className="text-xs font-bold text-purple-300 font-['Cairo'] animate-pulse">
              جاري تحميل حلقات الموسم {selectedSeasonNumber}...
            </p>
          </div>
        )}

        {/* Empty Search / Filter State */}
        {!isLoadingEpisodes && displayedEpisodes.length === 0 && (
          <div className="py-12 text-center space-y-3 rounded-2xl bg-[#0e1426]/50 border border-white/5 p-6">
            <Info className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs sm:text-sm text-gray-300 font-['Cairo'] font-bold">
              {searchQuery.trim()
                ? `لم يتم العثور على أي حلقة مطابقة للبحث "${searchQuery}"`
                : activeFilterTab === 'upcoming'
                ? 'لا توجد حلقات قادمة مجدولة حالياً لهذا الموسم (جميع الحلقات صدرت ومتاحة).'
                : activeFilterTab === 'available'
                ? 'لا توجد حلقات متاحة للبث حالياً لهذا الموسم.'
                : `لا توجد حلقات معروضة حالياً لهذا الموسم.`}
            </p>
            {activeFilterTab !== 'all' && (
              <button
                onClick={() => setActiveFilterTab('all')}
                className="text-xs text-purple-400 hover:underline font-['Cairo'] cursor-pointer block mx-auto"
              >
                عرض كل حلقات الموسم
              </button>
            )}
          </div>
        )}

        {/* 4. EPISODES GRID VIEW */}
        {!isLoadingEpisodes && viewMode === 'grid' && displayedEpisodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
            {displayedEpisodes.map((ep) => {
              const isUpcoming = ep.isUpcoming || ep.status === 'upcoming';
              const isPlaying =
                !isUpcoming &&
                currentPlayingSeasonNumber === selectedSeasonNumber &&
                currentPlayingEpisodeNumber === ep.episodeNumber;

              const epKey = `s${selectedSeasonNumber}e${ep.episodeNumber}`;
              const isWatched = !!watchedEpisodes[epKey];
              const hasReminder = !!reminders[epKey];

              const imageSrc =
                ep.stillPath ||
                media.backdropPath ||
                media.posterPath ||
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';

              const epTitle = ep.title
                ? ep.title.startsWith('الحلقة')
                  ? ep.title
                  : `الحلقة ${ep.episodeNumber}: ${ep.title}`
                : `الحلقة ${ep.episodeNumber}: حلقة كاملة HD`;

              const epOverview =
                ep.overview && ep.overview.trim().length > 0
                  ? ep.overview
                  : isUpcoming
                  ? `الحلقة ${ep.episodeNumber} مجدولة للبث رسمياً بتاريخ ${ep.airDate || 'قريباً'}. سيتم توفيرها مترجمة فور صدورها.`
                  : `مشاهدة الحلقة ${ep.episodeNumber} بجودة عالية Full HD وترجمة احترافية عبر سيرفرات سريعة.`;

              const duration = ep.duration;

              return (
                <div
                  key={ep.id || ep.episodeNumber}
                  id={`card-episode-item-${ep.episodeNumber}`}
                  onClick={() => {
                    if (!isUpcoming) {
                      onPlayEpisode(selectedSeasonNumber, ep.episodeNumber);
                    }
                  }}
                  className={`group flex flex-col rounded-3xl overflow-hidden transition-all duration-300 ${
                    isUpcoming
                      ? 'bg-[#090d1a] border border-blue-500/30 hover:border-blue-400/50 shadow-md cursor-default'
                      : isPlaying
                      ? 'bg-[#10172e] border-2 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.4)] cursor-pointer transform hover:-translate-y-1'
                      : isWatched
                      ? 'bg-[#0b1220] border border-emerald-500/30 hover:border-emerald-400 shadow-lg cursor-pointer transform hover:-translate-y-1'
                      : 'bg-[#0e1426] border border-white/10 hover:border-purple-500/60 shadow-lg hover:shadow-2xl hover:shadow-purple-500/15 cursor-pointer transform hover:-translate-y-1'
                  }`}
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070a14]">
                    <img
                      src={imageSrc}
                      alt={epTitle}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isUpcoming ? 'opacity-70 group-hover:opacity-85 filter grayscale-[20%]' : 'group-hover:scale-105'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          media.backdropPath ||
                          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1426] via-transparent to-transparent opacity-85" />

                    {/* Top Left: Status Badges (Playing / Watched) */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      {isPlaying && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black font-['Cairo'] shadow-lg shadow-purple-600/50 border border-purple-400/40 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>جاري التشغيل</span>
                        </span>
                      )}

                      {!isUpcoming && !isPlaying && isWatched && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold font-['Cairo'] border border-emerald-500/40 shadow-md">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>تمت المشاهدة</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right Tag (Episode Number / Coming Soon Badge) */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      {isUpcoming ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/90 backdrop-blur-md text-white text-xs font-black font-['Cairo'] shadow-md border border-blue-400/40">
                          <Clock className="w-3 h-3 text-blue-200" />
                          <span>قريباً E{ep.episodeNumber}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-amber-400 text-black text-xs font-black font-['Cairo'] shadow-lg shadow-amber-400/25">
                          حلقة {ep.episodeNumber}
                        </span>
                      )}
                    </div>

                    {/* Bottom Right Duration / Air Date Badge */}
                    {duration ? (
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/10 shadow-sm">
                          <Clock className="w-3 h-3 text-purple-300" />
                          <span>{duration}</span>
                        </span>
                      </div>
                    ) : isUpcoming && ep.airDate ? (
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-950/80 backdrop-blur-md text-blue-200 text-[11px] font-mono font-bold border border-blue-400/40 shadow-sm">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span>موعد العرض: {ep.airDate}</span>
                        </span>
                      </div>
                    ) : null}

                    {/* Center Hover Overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {isUpcoming ? (
                          <div className="px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md text-blue-300 text-xs font-bold font-['Cairo'] border border-blue-400/30 flex items-center gap-2 shadow-xl">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>مجدولة للبث قريباً</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/50 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-5 h-5 fill-white mr-0.5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Episode Card Text Info */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className={`text-xs sm:text-sm font-bold font-['Cairo'] line-clamp-1 transition-colors ${
                          isPlaying
                            ? 'text-purple-300 font-black'
                            : isUpcoming
                            ? 'text-gray-300 group-hover:text-blue-300'
                            : isWatched
                            ? 'text-gray-200 group-hover:text-emerald-300'
                            : 'text-white group-hover:text-purple-300'
                        }`}
                      >
                        {epTitle}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-['Cairo'] line-clamp-2 leading-relaxed mt-1">
                        {epOverview}
                      </p>
                    </div>

                    {/* Action Bar (Bottom of card) */}
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                      {isUpcoming ? (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              id={`btn-reminder-ep-${ep.episodeNumber}`}
                              onClick={(e) => toggleReminder(selectedSeasonNumber, ep.episodeNumber, ep.title, e)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all cursor-pointer ${
                                hasReminder
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                  : 'bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {hasReminder ? (
                                <>
                                  <BellRing className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                                  <span>تم ضبط التنبيه ✓</span>
                                </>
                              ) : (
                                <>
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>تذكيري عند العرض</span>
                                </>
                              )}
                            </button>
                          </div>

                          {onOpenShare && (
                            <button
                              type="button"
                              title="مشاركة موعد الحلقة"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenShare(media, selectedSeasonNumber, ep.episodeNumber, ep);
                              }}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-blue-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Left action: Watched Toggle */}
                          <button
                            type="button"
                            id={`btn-watched-toggle-${ep.episodeNumber}`}
                            onClick={(e) => toggleWatched(selectedSeasonNumber, ep.episodeNumber, e)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold font-['Cairo'] transition-all cursor-pointer ${
                              isWatched
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5'
                            }`}
                            title={isWatched ? 'شاهدتها بالفعل' : 'تحديد كمشاهدة'}
                          >
                            <Check className={`w-3 h-3 ${isWatched ? 'text-emerald-400' : 'text-gray-500'}`} />
                            <span>{isWatched ? 'شاهدتها' : 'شوهدت؟'}</span>
                          </button>

                          {/* Right actions: Play and Share */}
                          <div className="flex items-center gap-1.5">
                            {onOpenShare && (
                              <button
                                type="button"
                                title="مشاركة الحلقة"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenShare(media, selectedSeasonNumber, ep.episodeNumber, ep);
                                }}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onPlayEpisode(selectedSeasonNumber, ep.episodeNumber)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all flex items-center gap-1 cursor-pointer ${
                                isPlaying
                                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                                  : 'bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white border border-purple-500/40'
                              }`}
                            >
                              <span>{isPlaying ? 'مشغل الآن' : 'مشاهدة'}</span>
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. EPISODES LIST VIEW */}
        {!isLoadingEpisodes && viewMode === 'list' && displayedEpisodes.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {displayedEpisodes.map((ep) => {
              const isUpcoming = ep.isUpcoming || ep.status === 'upcoming';
              const isPlaying =
                !isUpcoming &&
                currentPlayingSeasonNumber === selectedSeasonNumber &&
                currentPlayingEpisodeNumber === ep.episodeNumber;

              const epKey = `s${selectedSeasonNumber}e${ep.episodeNumber}`;
              const isWatched = !!watchedEpisodes[epKey];
              const hasReminder = !!reminders[epKey];

              const imageSrc =
                ep.stillPath ||
                media.backdropPath ||
                media.posterPath ||
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';

              const epTitle = ep.title
                ? ep.title.startsWith('الحلقة')
                  ? ep.title
                  : `الحلقة ${ep.episodeNumber}: ${ep.title}`
                : `الحلقة ${ep.episodeNumber}: حلقة كاملة HD`;

              const duration = ep.duration;

              return (
                <div
                  key={ep.id || ep.episodeNumber}
                  id={`card-episode-list-${ep.episodeNumber}`}
                  onClick={() => {
                    if (!isUpcoming) {
                      onPlayEpisode(selectedSeasonNumber, ep.episodeNumber);
                    }
                  }}
                  className={`group flex items-center justify-between p-3 rounded-2xl transition-all shadow-md gap-3.5 ${
                    isUpcoming
                      ? 'bg-[#090d1a] border border-blue-500/30 cursor-default opacity-90'
                      : isPlaying
                      ? 'bg-[#121932] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer'
                      : isWatched
                      ? 'bg-[#0c1324] border border-emerald-500/30 cursor-pointer'
                      : 'bg-[#0e1426] hover:bg-[#141d38] border border-white/10 hover:border-purple-500/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* List Thumbnail */}
                    <div className="relative w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                      <img
                        src={imageSrc}
                        alt={epTitle}
                        className={`w-full h-full object-cover ${isUpcoming ? 'opacity-70 filter grayscale-[20%]' : ''}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            media.backdropPath ||
                            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-purple-900/40 flex items-center justify-center transition-colors">
                        {isUpcoming ? (
                          <Clock className="w-4 h-4 text-blue-300" />
                        ) : (
                          <Play className="w-4 h-4 text-white group-hover:text-amber-300 fill-current" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-right min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono ${
                            isUpcoming ? 'bg-blue-600 text-white' : 'bg-amber-400 text-black'
                          }`}
                        >
                          E{ep.episodeNumber}
                        </span>

                        {isPlaying && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold font-['Cairo']">
                            جاري التشغيل
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-['Cairo']">
                            قريباً
                          </span>
                        )}

                        {isWatched && !isUpcoming && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-['Cairo'] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                            <span>شوهدت</span>
                          </span>
                        )}

                        <h4
                          className={`text-xs sm:text-sm font-bold font-['Cairo'] line-clamp-1 ${
                            isUpcoming ? 'text-gray-300' : 'text-white group-hover:text-purple-300'
                          }`}
                        >
                          {epTitle}
                        </h4>
                      </div>

                      {ep.overview && (
                        <p className="text-[11px] text-gray-400 font-['Cairo'] line-clamp-1 mt-1">
                          {ep.overview}
                        </p>
                      )}

                      {duration ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-purple-300" />
                            <span>{duration}</span>
                          </span>
                        </div>
                      ) : isUpcoming && ep.airDate ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-blue-300 font-mono flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-blue-400" />
                            <span>موعد البث: {ep.airDate}</span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isUpcoming && (
                      <button
                        type="button"
                        onClick={(e) => toggleWatched(selectedSeasonNumber, ep.episodeNumber, e)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isWatched
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10'
                        }`}
                        title={isWatched ? 'شاهدتها' : 'تحديد كمشاهدة'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isUpcoming && (
                      <button
                        type="button"
                        onClick={(e) => toggleReminder(selectedSeasonNumber, ep.episodeNumber, ep.title, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all flex items-center gap-1 cursor-pointer ${
                          hasReminder
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-blue-950 text-blue-300 border border-blue-500/30 hover:bg-blue-900'
                        }`}
                      >
                        {hasReminder ? <BellRing className="w-3 h-3 text-amber-300" /> : <Bell className="w-3 h-3" />}
                        <span>{hasReminder ? 'مُفعّل' : 'تذكيري'}</span>
                      </button>
                    )}

                    {onOpenShare && (
                      <button
                        type="button"
                        title="مشاركة الحلقة"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenShare(media, selectedSeasonNumber, ep.episodeNumber, ep);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isUpcoming && (
                      <button className="px-3 py-1.5 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white border border-purple-500/40 text-xs font-bold font-['Cairo'] transition-all flex items-center gap-1 cursor-pointer">
                        <span>{isPlaying ? 'مشغل الآن' : 'مشاهدة'}</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
