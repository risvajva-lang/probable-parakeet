import React from 'react';
import { Play, Star, Heart, Clock, Film, Tv, Sparkles, Video } from 'lucide-react';
import { MediaItem } from '../types';
import { getCanonicalPath } from '../utils/share';
import { TmdbService } from '../services/tmdb';

interface SearchResultRowProps {
  media: MediaItem;
  onPlay: (media: MediaItem) => void;
  onDetails: (media: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (media: MediaItem) => void;
}

export const SearchResultRow: React.FC<SearchResultRowProps> = ({
  media,
  onPlay,
  onDetails,
  isFavorite,
  onToggleFavorite
}) => {
  const canonicalPath = getCanonicalPath(media);

  // Format title and label according to Arabic media type
  const cleanTitle = (media.title || '').trim().replace(/^(أنمي|انمي|مسلسل|فيلم|كرتون|رسوم متحركة)\s*[:\-–]?\s*/i, '');
  
  const displayTitle = (() => {
    if (media.type === 'anime') return `مشاهدة أنمي ${cleanTitle}`;
    if (media.type === 'cartoon') return `مشاهدة كرتون ${cleanTitle}`;
    if (media.type === 'tv') return `مشاهدة مسلسل ${cleanTitle}`;
    return `مشاهدة فيلم ${cleanTitle}`;
  })();

  const subLabel = (() => {
    if (media.type === 'anime') return 'أنمي ياباني';
    if (media.type === 'cartoon') return 'كرتون';
    if (media.type === 'tv') {
      const sCount = media.seasonsCount ? ` (${media.seasonsCount} مواسم)` : '';
      return `مسلسل${sCount}`;
    }
    return 'فيلم سينمائي';
  })();

  // Format duration nicely (e.g. "2:24:38" or "1:45:00" or "45:00" or raw duration)
  const formattedDuration = (() => {
    if (media.duration) {
      // If duration is like "144 دقيقة" or "45 دقيقة"
      const match = media.duration.match(/(\d+)/);
      if (match) {
        const totalMinutes = parseInt(match[1], 10);
        if (!isNaN(totalMinutes) && totalMinutes > 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
          }
          return `${minutes}:00`;
        }
      }
      return media.duration;
    }
    // Fallback standard estimate based on media type
    if (media.type === 'movie') return '1:58:00';
    if (media.type === 'anime' || media.type === 'cartoon') return '24:00';
    return '45:00';
  })();

  const releaseYear = media.year || (media.releaseDate ? media.releaseDate.substring(0, 4) : '');

  return (
    <div
      id={`search-result-row-${media.tmdbId}`}
      className="group relative flex flex-row-reverse items-center justify-between gap-3 sm:gap-5 p-2.5 sm:p-3.5 rounded-2xl bg-[#0d1222]/80 hover:bg-[#141b33] border border-white/5 hover:border-purple-500/40 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:shadow-purple-950/30"
      onMouseEnter={() => {
        if (media.tmdbId) {
          TmdbService.getMediaDetails(media.tmdbId, media.type).catch(() => {});
        }
      }}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          onDetails(media);
        }
      }}
      dir="rtl"
    >
      {/* Right side: Thumbnail with Play Overlay & Duration Badge (Exact layout as User Screenshot) */}
      <div className="relative w-36 sm:w-48 md:w-56 aspect-[16/9] flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-[#060914] border border-white/10 shadow-lg group-hover:border-purple-500/50 transition-all">
        <img
          src={media.backdropPath || media.posterPath}
          alt={media.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=70';
          }}
        />

        {/* Center Play Button Circle (as seen in Screenshot) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 group-hover:border-white/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white translate-x-[-1px]" />
          </div>
        </div>

        {/* Bottom Right Duration Badge (Exact Black pill with timestamp like 2:24:38 in Screenshot) */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-white font-mono text-[11px] sm:text-xs font-bold border border-white/10 shadow-md">
          {formattedDuration}
        </div>

        {/* Top Left Quality / Rating Badge */}
        {media.voteAverage > 0 && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-amber-400 text-[10px] font-mono font-bold flex items-center gap-0.5">
            <span>{media.voteAverage}</span>
            <Star className="w-2.5 h-2.5 fill-amber-400" />
          </div>
        )}
      </div>

      {/* Left side: Information, Title, Type, Year, and Actions */}
      <div className="flex-1 flex flex-col justify-between py-0.5 sm:py-1 min-w-0 pr-1 sm:pr-2">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Main Title (e.g. مشاهدة فيلم ...) with glowing color on hover */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-pink-300 group-hover:text-pink-200 font-['Cairo'] line-clamp-1 sm:line-clamp-2 transition-colors">
            {displayTitle}
          </h3>

          {/* Subtitle / Category Label & Release Year (e.g. كيو فيلم / سنة الإنتاج) */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 font-['Cairo'] flex-wrap">
            <span className="text-gray-300 font-medium">{subLabel}</span>
            {releaseYear && (
              <>
                <span className="text-gray-600">•</span>
                <span className="font-mono text-gray-400">{releaseYear}</span>
              </>
            )}
            {media.genres && media.genres.length > 0 && (
              <>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-purple-300/80 text-[11px] hidden sm:inline">{media.genres.slice(0, 2).join(' / ')}</span>
              </>
            )}
          </div>

          {/* Short Overview snippet */}
          {media.overview && (
            <p className="text-xs text-gray-400 font-['Cairo'] line-clamp-1 sm:line-clamp-2 hidden sm:block leading-relaxed">
              {media.overview}
            </p>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 pt-2 mt-1 border-t border-white/5">
          <button
            id={`btn-search-play-${media.tmdbId}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold font-['Cairo'] transition-all shadow-sm active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>مشاهدة فورية</span>
          </button>

          <button
            id={`btn-search-fav-${media.tmdbId}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(media);
            }}
            className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-label="المفضلة"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
