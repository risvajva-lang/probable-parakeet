import React from 'react';
import { WatchHistoryItem, MediaItem } from '../types';
import { Play, Trash2, Clock } from 'lucide-react';

interface ContinueWatchingProps {
  history: WatchHistoryItem[];
  onPlay: (media: MediaItem, season?: number, episode?: number) => void;
  onClear: () => void;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({
  history,
  onPlay,
  onClear
}) => {
  if (!history || history.length === 0) return null;

  return (
    <section className="w-full bg-[#0d1326] border border-purple-900/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              متابعة المشاهدة
              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                {history.length}
              </span>
            </h2>
            <p className="text-xs text-gray-400">استكمل مشاهدة أعمالك المفضلة من حيث توقفت</p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          title="مسح سجل المشاهدة"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
        {history.slice(0, 10).map((item) => {
          const isMovie = item.type === 'movie';
          const subText = isMovie
            ? 'فيلم كامل'
            : `الموسم ${item.season || 1} • الحلقة ${item.episode || 1}`;

          const mediaObj: MediaItem = {
            id: item.mediaId,
            tmdbId: item.tmdbId,
            title: item.title,
            type: item.type,
            posterPath: item.posterPath,
            backdropPath: item.backdropPath,
            voteAverage: typeof item.voteAverage === 'number' ? item.voteAverage : 0,
            year: item.year,
            overview: item.overview || '',
            genres: []
          };

          return (
            <div
              key={`${item.tmdbId}-${item.season || 1}-${item.episode || 1}`}
              onClick={() => onPlay(mediaObj, item.season, item.episode)}
              className="flex-shrink-0 w-48 sm:w-56 group cursor-pointer bg-[#141b33] rounded-xl overflow-hidden border border-gray-800/80 hover:border-purple-500/50 transition-all hover:scale-[1.02] shadow-md flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                <img
                  src={item.backdropPath || item.posterPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Progress bar */}
                {typeof item.progressPercentage === 'number' && item.progressPercentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                    <div
                      className="h-full bg-purple-500 rounded-r-full"
                      style={{ width: `${Math.min(100, Math.max(0, item.progressPercentage))}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-purple-300/80 font-medium mt-0.5">{subText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
