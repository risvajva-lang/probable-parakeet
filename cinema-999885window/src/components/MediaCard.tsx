import React from 'react';
import { Play, Star, Heart, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { getCanonicalPath } from '../utils/share';
import { TmdbService } from '../services/tmdb';

interface MediaCardProps {
  media: MediaItem;
  rankIndex?: number;
  onPlay: (media: MediaItem) => void;
  onDetails: (media: MediaItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (media: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  rankIndex,
  onPlay,
  onDetails,
  isFavorite,
  onToggleFavorite
}) => {
  const canonicalPath = getCanonicalPath(media);

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-400 text-black shadow-amber-400/30';
      case 2:
        return 'bg-sky-400 text-black shadow-sky-400/30';
      case 3:
        return 'bg-orange-500 text-white shadow-orange-500/30';
      case 4:
        return 'bg-purple-500 text-white shadow-purple-500/30';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const isVip = Boolean(media.featured || (rankIndex !== undefined && rankIndex <= 3));

  return (
    <a
      href={canonicalPath}
      id={`card-media-${media.tmdbId}`}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c1122] border border-white/10 hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer no-underline block gpu-accelerated cv-auto"
      onMouseEnter={() => {
        // Silent prefetch details in background when hovering over card
        if (media.tmdbId) {
          TmdbService.getMediaDetails(media.tmdbId, media.type).catch(() => {});
        }
      }}
      onClick={(e) => {
        // Prevent full page reload on normal left clicks, allow middle/cmd-click for new tabs
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          onDetails(media);
        }
      }}
      dir="rtl"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#070a14]">
        <img
          src={media.posterPath}
          alt={media.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            id={`btn-play-card-${media.tmdbId}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center justify-center shadow-xl shadow-pink-600/40 transform scale-75 group-hover:scale-100 transition-all active:scale-90"
            aria-label="تشغيل الآن"
          >
            <Play className="w-5 h-5 fill-white mr-0.5" />
          </button>
        </div>

        {/* Top Badges (Screenshot 2: #1 / #2 Rank Badge + شائع / VIP حصري) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Top Left: Tag (شائع / VIP حصري) */}
          <div className="flex items-center gap-1">
            {isVip ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500/90 text-black font-['Cairo'] shadow-md">
                <span>VIP حصري</span>
                <Eye className="w-3 h-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 font-['Cairo'] shadow-md">
                <span>شائع</span>
                <Eye className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Top Right: Rank #1, #2, etc. */}
          {rankIndex !== undefined && (
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-lg font-mono shadow-md ${getRankBadgeColor(
                rankIndex
              )}`}
            >
              #{rankIndex}
            </span>
          )}
        </div>

        {/* Bottom Poster Overlay: Rating + Quality Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Quality Badge */}
          {media.quality && (
            <span className="px-2 py-0.5 rounded-md bg-purple-700/90 backdrop-blur-md text-white text-[9px] font-mono font-black border border-purple-400/40 shadow-sm">
              {media.quality}
            </span>
          )}

          {/* Rating */}
          {media.voteAverage > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 text-[11px] font-mono font-black border border-amber-400/20 shadow-sm">
              <span>{media.voteAverage}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
          )}
        </div>
      </div>

      {/* Card Info Body (Screenshots 2, 3, 4) */}
      <div className="p-3 sm:p-3.5 text-right flex flex-col justify-between flex-1 space-y-2">
        {/* Title with clean prefix */}
        <h3 className="text-xs sm:text-sm font-bold text-white font-['Cairo'] line-clamp-1 group-hover:text-purple-300 transition-colors">
          {(() => {
            let clean = (media.title || '').trim();
            clean = clean.replace(/^(أنمي|انمي|مسلسل|فيلم|كرتون|رسوم متحركة)\s*[:\-–]?\s*/i, '');
            if (media.type === 'anime') return `أنمي ${clean}`;
            if (media.type === 'cartoon') return `كرتون ${clean}`;
            if (media.type === 'tv') return `مسلسل ${clean}`;
            return `فيلم ${clean}`;
          })()}
        </h3>

        {/* Meta Line: Type & Release Date */}
        <div className="flex items-center justify-between text-[11px] font-['Cairo'] font-semibold">
          <span
            className={
              media.type === 'anime'
                ? 'text-purple-400 font-black'
                : media.type === 'cartoon'
                ? 'text-cyan-400 font-black'
                : 'text-amber-400'
            }
          >
            {media.type === 'anime' ? 'أنمي ياباني' : media.type === 'cartoon' ? 'كرتون' : media.type === 'tv' ? 'مسلسل' : 'فيلم'}
          </span>
          <span className="text-gray-400 font-mono text-[10px]">
            {media.year || (media.releaseDate ? media.releaseDate.substring(0, 4) : '')}
          </span>
        </div>

        {/* Bottom Action Footer: "مشاهدة ▶" + Heart Icon */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <button
            id={`btn-card-action-play-${media.tmdbId}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(media);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 font-['Cairo'] transition-colors"
          >
            <span>مشاهدة</span>
            <Play className="w-3.5 h-3.5 fill-amber-400" />
          </button>

          <button
            id={`btn-fav-card-${media.tmdbId}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(media);
            }}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              isFavorite
                ? 'text-rose-500 fill-rose-500'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="المفضلة"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    </a>
  );
};
