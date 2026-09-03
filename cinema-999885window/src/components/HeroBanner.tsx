import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Info,
  Star,
  Sparkles,
  Flame,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Pause,
  RotateCw,
  Film,
  Tv,
  Clapperboard,
  Clock,
  Calendar
} from 'lucide-react';
import { MediaItem } from '../types';

export type HeroCategory = 'all' | 'movie' | 'tv' | 'anime';

interface HeroBannerProps {
  media: MediaItem;
  onPlay: (media: MediaItem) => void;
  onDetails: (media: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (media: MediaItem) => void;
  onOpenShare?: (media: MediaItem) => void;
  allHeroItems?: MediaItem[];
  onSelectHero?: (media: MediaItem) => void;
  activeCategory?: HeroCategory;
  onChangeCategory?: (cat: HeroCategory) => void;
  onRefreshHero?: () => void;
  onCycleComplete?: () => void;
  isRefreshing?: boolean;
}

const SLIDE_DURATION = 6000; // 6 seconds per slide

export const HeroBanner: React.FC<HeroBannerProps> = ({
  media,
  onPlay,
  onDetails,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  allHeroItems = [],
  onSelectHero,
  activeCategory = 'all',
  onChangeCategory,
  onRefreshHero,
  onCycleComplete,
  isRefreshing = false
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isManualPaused, setIsManualPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const currentIndex = allHeroItems.findIndex((i) => i.tmdbId === media.tmdbId);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  // Stable references for callbacks to avoid re-triggering intervals
  const allHeroItemsRef = useRef(allHeroItems);
  allHeroItemsRef.current = allHeroItems;
  const onSelectHeroRef = useRef(onSelectHero);
  onSelectHeroRef.current = onSelectHero;
  const safeCurrentIndexRef = useRef(safeCurrentIndex);
  safeCurrentIndexRef.current = safeCurrentIndex;
  const onCycleCompleteRef = useRef(onCycleComplete);
  onCycleCompleteRef.current = onCycleComplete;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const items = allHeroItemsRef.current;
    const selectHero = onSelectHeroRef.current;
    if (items.length <= 1 || !selectHero) return;
    setProgress(0);
    const prevIndex = (safeCurrentIndexRef.current - 1 + items.length) % items.length;
    selectHero(items[prevIndex]);
  }, []);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const items = allHeroItemsRef.current;
    const selectHero = onSelectHeroRef.current;
    if (items.length <= 1 || !selectHero) return;

    setProgress(0);
    const nextIndex = safeCurrentIndexRef.current + 1;

    if (nextIndex >= items.length) {
      // Completed full round of items -> Notify cycle complete to load more / rotate pool!
      if (onCycleCompleteRef.current) {
        onCycleCompleteRef.current();
      }
      selectHero(items[0]);
    } else {
      selectHero(items[nextIndex]);
    }
  }, []);

  const handleSelectDirect = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onSelectHero) return;
    setProgress(0);
    onSelectHero(item);
  };

  // Auto-play timer with separate interval and clean state updates
  useEffect(() => {
    if (allHeroItems.length <= 1 || isPaused || isManualPaused) {
      return;
    }

    const intervalTime = 100; // updates every 100ms
    const step = (intervalTime / SLIDE_DURATION) * 100;
    let accumulated = 0;

    const timer = setInterval(() => {
      accumulated += step;
      if (accumulated >= 100) {
        accumulated = 0;
        setProgress(0);
        handleNext();
      } else {
        setProgress(accumulated);
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
    };
  }, [allHeroItems.length, isPaused, isManualPaused, handleNext, media.tmdbId]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    // In RTL, positive distance (swipe left) moves to next, negative moves to previous
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
  };

  // Category Styling and Labels
  const getCategoryConfig = (item: MediaItem) => {
    if (item.type === 'anime') {
      return {
        badgeBg: 'from-fuchsia-600 via-pink-600 to-rose-500',
        badgeText: 'text-white',
        badgeShadow: 'shadow-fuchsia-500/30',
        label: 'أنمي ياباني جديد 🎌',
        subLabel: 'أحدث عروض الأنمي',
        glowColor: 'bg-fuchsia-600/20',
        typeIcon: '🎌',
        categoryTitle: 'أنمي'
      };
    }
    if (item.type === 'tv') {
      return {
        badgeBg: 'from-blue-600 via-indigo-600 to-cyan-500',
        badgeText: 'text-white',
        badgeShadow: 'shadow-cyan-500/30',
        label: 'مسلسل جديد وحصري 📺',
        subLabel: 'مواسم وحلقات متجددة',
        glowColor: 'bg-cyan-600/20',
        typeIcon: '📺',
        categoryTitle: 'مسلسل'
      };
    }
    if (item.type === 'cartoon') {
      return {
        badgeBg: 'from-emerald-500 via-teal-600 to-cyan-600',
        badgeText: 'text-white',
        badgeShadow: 'shadow-emerald-500/30',
        label: 'كرتون ورسوم متحركة 🎨',
        subLabel: 'مغامرات وترفيه عائلي',
        glowColor: 'bg-emerald-600/20',
        typeIcon: '🎨',
        categoryTitle: 'كرتون'
      };
    }
    return {
      badgeBg: 'from-amber-500 via-orange-500 to-rose-500',
      badgeText: 'text-black',
      badgeShadow: 'shadow-orange-500/30',
      label: 'فيلم سينمائي جديد 🎬',
      subLabel: 'أحدث عروض السينما',
      glowColor: 'bg-orange-600/20',
      typeIcon: '🎬',
      categoryTitle: 'فيلم'
    };
  };

  const catConfig = getCategoryConfig(media);

  const heroCategories: { id: HeroCategory; label: string; icon: string }[] = [
    { id: 'all', label: '🔥 مميز اليوم (24h)', icon: '✨' },
    { id: 'movie', label: '🎬 أفلام اليوم', icon: '🎬' },
    { id: 'tv', label: '📺 مسلسلات اليوم', icon: '📺' },
    { id: 'anime', label: '🎌 أنمي اليوم', icon: '🎌' }
  ];

  return (
    <div
      id="hero-cinematic-banner"
      className="relative w-full rounded-3xl overflow-hidden border border-purple-500/25 shadow-2xl bg-[#070b16] group transition-all select-none"
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Poster / Backdrop with atmospheric glow */}
      <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full min-h-[500px] sm:min-h-[540px]">
        {/* Atmosphere ambient glow */}
        <div
          className={`absolute -inset-10 ${catConfig.glowColor} blur-3xl opacity-70 pointer-events-none transition-colors duration-1000`}
        />

        {/* Backdrop Image */}
        <img
          key={`hero-bg-${media.tmdbId}`}
          src={media.backdropPath || media.posterPath}
          alt={media.title}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out will-change-transform gpu-accelerated"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80';
          }}
        />

        {/* Cinematic multi-stop gradient overlay for crisp readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/80 via-45% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060913]/95 via-[#060913]/55 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#060913]/85 to-transparent" />

        {/* Top Header Floating Bar: Category Tabs + Auto Controls */}
        <div className="absolute top-3 inset-x-3 sm:top-5 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-2">
          {/* Category Switcher Tabs inside Hero */}
          {onChangeCategory && (
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 shadow-lg overflow-x-auto no-scrollbar">
              {heroCategories.map((c) => {
                const isCatActive = activeCategory === c.id;
                return (
                  <button
                    key={`hero-tab-${c.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeCategory(c.id);
                    }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                      isCatActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Controls: Refresh button + Play/Pause auto-slide + Index counter */}
          <div className="flex items-center gap-2">
            {/* Refresh Now Button */}
            {onRefreshHero && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefreshHero();
                }}
                disabled={isRefreshing}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md flex items-center gap-1 text-xs font-bold font-['Cairo'] border border-white/20 shadow-md transition-all active:scale-95 disabled:opacity-50"
                title="تحديث وجلب أحدث الأعمال فوراً"
              >
                <RotateCw className={`w-3.5 h-3.5 text-purple-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث تلقائي</span>
              </button>
            )}

            {/* Pause / Play Auto-slide toggle button */}
            {allHeroItems.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsManualPaused((prev) => !prev);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md flex items-center gap-1 text-xs font-bold font-['Cairo'] border border-white/20 shadow-md transition-all active:scale-95"
                title={isManualPaused ? 'تشغيل الحركة التلقائية' : 'إيقاف الحركة التلقائية'}
              >
                {isManualPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    <span className="hidden sm:inline">تشغيل التلقائي</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">متحرك تلقائياً</span>
                  </>
                )}
              </button>
            )}

            {/* Current Slide Number / Total */}
            {allHeroItems.length > 1 && (
              <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-gray-200 text-xs font-mono font-bold border border-white/15 shadow-md">
                {safeCurrentIndex + 1} / {allHeroItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Previous Arrow Button */}
        {allHeroItems.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/65 hover:bg-purple-600/90 text-white backdrop-blur-md flex items-center justify-center border border-white/25 transition-all shadow-xl active:scale-90 hover:scale-110"
            aria-label="السابق"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Next Arrow Button */}
        {allHeroItems.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/65 hover:bg-purple-600/90 text-white backdrop-blur-md flex items-center justify-center border border-white/25 transition-all shadow-xl active:scale-90 hover:scale-110"
            aria-label="التالي"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Content Container (Title, Badges, Overview, Action Buttons) */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10 space-y-3 max-w-3xl">
          {/* Category & Distinction Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Category Highlight Badge */}
            <span
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r ${catConfig.badgeBg} ${catConfig.badgeText} text-xs font-black font-['Cairo'] shadow-lg ${catConfig.badgeShadow} transition-all duration-500`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {catConfig.label}
            </span>

            {/* 24-Hour Daily Spotlight Badge */}
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 text-xs font-bold font-['Cairo'] border border-amber-400/30 backdrop-blur-md shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>اختيار اليوم • يتجدد كل 24 ساعة</span>
            </span>

            {/* Sub-label badge */}
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs font-bold font-['Cairo'] border border-white/20 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              {catConfig.subLabel}
            </span>
          </div>

          {/* Meta Info Row: Year/Date, Quality Badge, Rating */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {(media.releaseDate || media.year) && (
              <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-gray-200 border border-white/15">
                {media.releaseDate || media.year}
              </span>
            )}

            {media.quality && (
              <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-purple-700 to-indigo-700 backdrop-blur-md text-white font-bold border border-purple-400/50 shadow-sm">
                {media.quality}
              </span>
            )}

            {media.voteAverage > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 font-bold border border-amber-400/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{media.voteAverage}</span>
              </div>
            )}

            {media.genres && media.genres.length > 0 && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-white/5 backdrop-blur-md text-gray-300 border border-white/10 font-['Cairo']">
                {media.genres.slice(0, 2).join(' • ')}
              </span>
            )}
          </div>

          {/* Big Cinematic Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-['Cairo'] tracking-tight drop-shadow-xl leading-snug">
            {media.title}
          </h1>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-gray-300 font-['Cairo'] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl text-shadow">
            {media.overview || 'استمتع بمشاهدة هذا العمل السينمائي بدقة عالية وبأعلى جودة وسيرفرات فائقة السرعة.'}
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pt-2">
            {/* Primary Watch Button */}
            <button
              id="btn-hero-watch-now"
              onClick={() => onPlay(media)}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white font-black text-sm sm:text-base font-['Cairo'] shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span>شاهد الآن</span>
              <Play className="w-4 h-4 fill-white ml-1" />
            </button>

            {/* Details Button */}
            <button
              id="btn-hero-show-details"
              onClick={() => onDetails(media)}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-[#141b2e]/90 hover:bg-[#1a233c] text-white font-bold text-xs sm:text-sm font-['Cairo'] border border-white/20 hover:border-purple-400/50 backdrop-blur-md transition-all active:scale-95"
            >
              <Info className="w-4 h-4 text-purple-300" />
              <span>تفاصيل العرض</span>
            </button>

            {/* Bookmark / Favorite Button */}
            <button
              id="btn-hero-toggle-fav"
              onClick={() => onToggleFavorite(media)}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-purple-600/40 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20'
                  : 'bg-[#141b2e]/90 border-white/20 text-gray-300 hover:text-white'
              }`}
              title={isFavorite ? 'تمت الإضافة للمفضلة' : 'أضف للمفضلة'}
            >
              {isFavorite ? <Check className="w-5 h-5 text-purple-400" /> : <Plus className="w-5 h-5" />}
            </button>

            {/* Share Button */}
            {onOpenShare && (
              <button
                id="btn-hero-share"
                onClick={() => onOpenShare(media)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#141b2e]/90 hover:bg-[#1a233c] text-purple-300 hover:text-white font-bold text-xs sm:text-sm font-['Cairo'] border border-white/20 hover:border-purple-400/50 backdrop-blur-md transition-all active:scale-95"
                title="مشاركة العمل"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">مشاركة</span>
              </button>
            )}
          </div>

          {/* Quick-Jump Carousel Thumbnails / Dots (Movies, Series, Anime) */}
          {allHeroItems.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 overflow-x-auto no-scrollbar py-1">
              {allHeroItems.map((item, idx) => {
                const isActive = idx === safeCurrentIndex;
                const itemConfig = getCategoryConfig(item);
                return (
                  <button
                    key={`hero-dot-${item.tmdbId || idx}`}
                    onClick={(e) => handleSelectDirect(item, e)}
                    className={`group/dot relative flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300 text-xs font-['Cairo'] ${
                      isActive
                        ? 'bg-white/20 text-white font-bold border border-purple-400/60 shadow-md shadow-purple-500/20 scale-105'
                        : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-white/10 hover:bg-white/10'
                    }`}
                    title={item.title}
                  >
                    <span>{itemConfig.typeIcon}</span>
                    <span className="hidden md:inline max-w-[90px] truncate">{item.title}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Carousel Indicator Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all ease-linear"
            style={{
              width:
                allHeroItems.length > 1 && !isPaused && !isManualPaused
                  ? `${progress}%`
                  : allHeroItems.length > 0
                  ? `${((safeCurrentIndex + 1) / allHeroItems.length) * 100}%`
                  : '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};
