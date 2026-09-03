import React from 'react';
import {
  Film,
  Sparkles,
  Loader2,
  Tv,
  Flame,
  CheckCircle2,
  Play,
  Heart,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { MediaItem, CategoryFilter } from '../types';
import { MediaCard } from './MediaCard';
import { SearchResultRow } from './SearchResultRow';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSearchMode?: boolean;
  onPlay: (media: MediaItem) => void;
  onDetails: (media: MediaItem) => void;
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (media: MediaItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  currentCategory?: CategoryFilter;
  activeSubFilter?: string;
  onSelectSubFilter?: (filter: string) => void;
  onSwitchToExplore?: () => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  items,
  isLoading,
  isLoadingMore,
  isSearchMode = false,
  onPlay,
  onDetails,
  isFavorite,
  onToggleFavorite,
  onLoadMore,
  hasMore = false,
  currentCategory = 'all',
  activeSubFilter = 'popular',
  onSelectSubFilter,
  onSwitchToExplore
}) => {
  const safeItems: MediaItem[] = Array.isArray(items)
    ? items
    : (items && Array.isArray((items as any).items) ? (items as any).items : []);

  // Empty State matching Screenshot 5 (Watch History / Favorites)
  if (!isLoading && safeItems.length === 0) {
    return (
      <div className="w-full space-y-4 animate-in fade-in" dir="rtl">
        {/* Top Status Header Box */}
        <div className="w-full rounded-2xl bg-[#0f1424] border border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white font-['Cairo']">
                {currentCategory === 'history' ? 'سجل المشاهدة (0)' : 'قائمة المفضلة (0)'}
              </h3>
              <p className="text-[11px] text-gray-400 font-['Cairo']">
                {currentCategory === 'history' ? 'الأعمال التي شاهدتها مؤخراً' : 'الأعمال التي قمت بحفظها'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty Box as in Screenshot 5 */}
        <div className="w-full rounded-3xl bg-[#0b0f1c] border border-purple-500/20 p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-[#13192c] border border-white/10 flex items-center justify-center shadow-inner">
            <Film className="w-9 h-9 text-gray-400" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base sm:text-lg font-black text-white font-['Cairo']">
              {currentCategory === 'history'
                ? 'لم تقم بتحديد أي عمل كـ "تمت المشاهدة" بعد'
                : 'قائمتك المفضلة فارغة حالياً'}
            </h4>
            <p className="text-xs text-gray-400 font-['Cairo'] leading-relaxed">
              {currentCategory === 'history'
                ? 'عند تشغيل أي فيلم أو حلقة مسلسل، سيتم حفظ تقدمك وتاريخ مشاهدتك هنا تلقائياً.'
                : 'اضغط على رمز القلب في أي عمل لإضافته إلى قائمتك الخاصة والرجوع إليه بسهولة.'}
            </p>
          </div>

          {onSwitchToExplore && (
            <button
              id="btn-empty-explore"
              onClick={onSwitchToExplore}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs sm:text-sm font-black font-['Cairo'] shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
            >
              شاهد عرضاً الآن
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5" dir="rtl">
      {/* Section Header Controls (Screenshots 3 & 4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-white/5">
        {/* Title + Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base sm:text-xl font-black text-white font-['Cairo'] flex items-center gap-2">
            <span>{title}</span>
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          </h2>

          <span className="px-2.5 py-0.5 rounded-full bg-[#1b1528] text-pink-300 text-[11px] font-bold font-['Cairo'] border border-pink-500/30">
            TOP CINEMA
          </span>

          <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-[11px] font-mono">
            ({safeItems.length} عمل)
          </span>
        </div>

        {/* Dropdown / Filters Pill (Screenshot 3 & 4: "جميع العروض والكتالوج 🎬✨", "عرض الأحدث ▾") */}
        {onSelectSubFilter && currentCategory !== 'favorites' && currentCategory !== 'history' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectSubFilter('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all border cursor-pointer ${
                activeSubFilter === 'popular'
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                  : 'bg-[#12182a] text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>جميع العروض والكتالوج 🎬✨</span>
            </button>

            <button
              onClick={() => onSelectSubFilter('top_rated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] transition-all border cursor-pointer ${
                activeSubFilter === 'top_rated'
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                  : 'bg-[#12182a] text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>الأعلى تقييماً ⭐</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* If in Search Mode, render in Horizontal Video Row Format exactly like user screenshot */}
      {isSearchMode ? (
        <div className="space-y-3 sm:space-y-4">
          {safeItems.map((item) => (
            <SearchResultRow
              key={`search-row-${item.tmdbId}-${item.type}`}
              media={item}
              onPlay={onPlay}
              onDetails={onDetails}
              isFavorite={isFavorite(item.tmdbId)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Standard Media Cards Grid: 2 columns on mobile, 3-6 on desktop as in Screenshots */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {safeItems.map((item, index) => (
            <MediaCard
              key={`${item.tmdbId}-${item.type}-${index}`}
              media={item}
              rankIndex={index < 5 ? index + 1 : undefined}
              onPlay={onPlay}
              onDetails={onDetails}
              isFavorite={isFavorite(item.tmdbId)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        isSearchMode ? (
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-row-reverse items-center justify-between gap-4 p-3 rounded-2xl bg-[#0d1222]/60 border border-white/5 animate-pulse"
              >
                <div className="w-36 sm:w-48 aspect-[16/9] rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/3 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-3xl bg-[#0f1527] border border-white/5 animate-pulse flex flex-col justify-end p-4 space-y-2"
              >
                <div className="h-3 w-3/4 bg-white/10 rounded" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-8 pb-10">
          <button
            id="btn-load-more"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#12182b] hover:bg-purple-600 text-white text-xs sm:text-sm font-bold font-['Cairo'] border border-purple-500/30 hover:border-purple-400 shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>جاري تحميل المزيد من TMDb...</span>
              </>
            ) : (
              <>
                <span>تحميل المزيد من الأعمال</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
