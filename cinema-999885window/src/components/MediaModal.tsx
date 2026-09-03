import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Star,
  Heart,
  Share2,
  Film,
  Tv,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
  Video,
  Code,
  Copy,
  Check,
  DollarSign,
  Building2,
  Tag,
  Clapperboard,
  BookOpen,
  Info
} from 'lucide-react';
import { MediaItem, Season, Episode } from '../types';
import { TmdbService } from '../services/tmdb';
import { SeasonsEpisodesView } from './SeasonsEpisodesView';

interface MediaModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (media: MediaItem, season?: number, episode?: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (media: MediaItem) => void;
  onOpenShare: (media: MediaItem, season?: number, episode?: number, episodeData?: Episode) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  media,
  isOpen,
  onClose,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onOpenShare
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'details' | 'cast' | 'trailer' | 'json'>('episodes');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);
  const [detailedMedia, setDetailedMedia] = useState<MediaItem | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const currentMedia = detailedMedia || media;
  const isSeries = currentMedia ? currentMedia.type !== 'movie' : false;

  // Build robust seasons list with fallback so buttons appear instantly
  const seasons: Season[] = useMemo(() => {
    if (currentMedia?.seasons && currentMedia.seasons.length > 0) {
      return currentMedia.seasons;
    }
    const count = currentMedia?.seasonsCount && currentMedia.seasonsCount > 0 ? currentMedia.seasonsCount : 1;
    return Array.from({ length: count }, (_, i) => ({
      id: String(i + 1),
      seasonNumber: i + 1,
      title: i === 0 ? 'الموسم الأول' : i === 1 ? 'الموسم الثاني' : i === 2 ? 'الموسم الثالث' : `الموسم ${i + 1}`,
      episodesCount: 0
    }));
  }, [currentMedia]);

  // When modal opens, reset state and fetch full details
  useEffect(() => {
    if (!isOpen || !media) {
      setEpisodes([]);
      setDetailedMedia(null);
      setActiveTab('episodes');
      return;
    }

    // Default tab
    setActiveTab('episodes');

    // Set initial season to 1 or first available
    const initialSeasonNum = media.seasons && media.seasons.length > 0 ? media.seasons[0].seasonNumber : 1;
    setSelectedSeasonNumber(initialSeasonNum);

    // Fetch full enriched details from TMDb + TVmaze
    TmdbService.getMediaDetails(media.tmdbId, media.type).then((det) => {
      if (det) {
        setDetailedMedia(det);
        if (det.seasons && det.seasons.length > 0 && !det.seasons.some((s) => s.seasonNumber === initialSeasonNum)) {
          setSelectedSeasonNumber(det.seasons[0].seasonNumber);
        }
      }
    });
  }, [isOpen, media?.tmdbId]);

  // Fetch episodes when selected season changes
  useEffect(() => {
    if (!isOpen || !currentMedia || currentMedia.type === 'movie') return;

    setEpisodes([]);
    setIsLoadingEpisodes(true);
    let isCancelled = false;

    const seasonObj = currentMedia.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber);

    TmdbService.getSeasonEpisodes(currentMedia.tmdbId, selectedSeasonNumber, {
      imdbId: currentMedia.imdbId,
      tvdbId: currentMedia.tvdbId,
      title: currentMedia.title,
      originalTitle: currentMedia.originalTitle,
      seasonsCount: currentMedia.seasonsCount,
      episodesCount: seasonObj?.episodesCount
    })
      .then((eps) => {
        if (!isCancelled) {
          const sanitizedEps = (eps || []).map((ep) => ({
            ...ep,
            seasonNumber: typeof ep.seasonNumber === 'number' && ep.seasonNumber > 0 ? ep.seasonNumber : selectedSeasonNumber
          })).filter((ep) => ep.seasonNumber === selectedSeasonNumber);

          setEpisodes(sanitizedEps);
          setIsLoadingEpisodes(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setEpisodes([]);
          setIsLoadingEpisodes(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, currentMedia?.tmdbId, selectedSeasonNumber]);

  if (!isOpen || !currentMedia) return null;

  const trailerVideo = currentMedia.videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || currentMedia.videos?.[0];

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(currentMedia.rawTmdbData || currentMedia, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div
      id="modal-media-details"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-[#0e1424] border border-white/15 shadow-2xl overflow-hidden my-auto text-right text-white max-h-[92vh] flex flex-col font-['Cairo']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop & Hero Header */}
        <div className="relative h-60 sm:h-72 w-full flex-shrink-0 bg-[#070a12] overflow-hidden">
          <img
            src={currentMedia.backdropPath || currentMedia.posterPath}
            alt={currentMedia.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-[#0e1424]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e1424] via-[#0e1424]/40 to-transparent" />

          {/* Top Floating Bar: Close and Logo Badge */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Close Button with pill text */}
            <button
              id="btn-close-details"
              onClick={onClose}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#090e1c]/80 hover:bg-[#121a30] text-gray-200 hover:text-white border border-white/15 backdrop-blur-md transition-all shadow-lg text-xs font-bold font-['Cairo'] cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>إغلاق</span>
            </button>

            {/* Branded Logo Badge on the right */}
            <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#0a0f1e]/80 border border-purple-500/30 backdrop-blur-md shadow-lg shadow-purple-500/10">
              <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-pink-400 via-purple-300 to-white bg-clip-text text-transparent font-['Cairo']">
                نافذة السينما
              </span>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-sm">
                <Clapperboard className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Share & Favorite shortcuts */}
          <div className="absolute top-16 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => onOpenShare(currentMedia, selectedSeasonNumber, 1)}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 transition-colors"
              aria-label="مشاركة"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => onToggleFavorite(currentMedia)}
              className={`p-2.5 rounded-full border transition-colors ${
                isFavorite
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-black/60 text-gray-300 hover:text-white border-white/10'
              }`}
              aria-label="المفضلة"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Media Info Overlay */}
          <div className="absolute bottom-4 right-4 left-4 sm:right-8 sm:left-8 flex items-end gap-4">
            <img
              src={currentMedia.posterPath}
              alt={currentMedia.title}
              className="w-16 sm:w-24 rounded-2xl shadow-2xl border-2 border-white/20 hidden sm:block object-cover aspect-[2/3] flex-shrink-0"
            />
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-black ${
                    currentMedia.type === 'anime'
                      ? 'bg-purple-600 text-white'
                      : currentMedia.type === 'cartoon'
                      ? 'bg-cyan-500 text-black'
                      : currentMedia.type === 'tv'
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-500 text-black'
                  }`}
                >
                  {currentMedia.type === 'movie'
                    ? 'فيلم سينمائي'
                    : currentMedia.type === 'anime'
                    ? 'أنمي ياباني 🎌'
                    : currentMedia.type === 'cartoon'
                    ? 'كرتون / رسوم متحركة 🎨'
                    : 'مسلسل تلفزيوني'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono font-bold">
                  {currentMedia.quality || '4K UHD'}
                </span>
                {currentMedia.voteAverage > 0 && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{currentMedia.voteAverage}</span>
                    {currentMedia.voteCount ? (
                      <span className="text-[10px] text-gray-400 font-mono">({currentMedia.voteCount})</span>
                    ) : null}
                  </div>
                )}
                {currentMedia.year && <span className="text-xs text-gray-400 font-mono">{currentMedia.year}</span>}
                <span className="text-[10px] text-amber-400/90 font-mono bg-black/40 px-2 py-0.5 rounded border border-amber-500/20">
                  TMDb ID: {currentMedia.tmdbId}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
                {currentMedia.title}
              </h2>
              {currentMedia.originalTitle && (
                <p className="text-xs sm:text-sm text-gray-400 font-mono line-clamp-1">
                  {currentMedia.originalTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs (Episodes/Watch, Details, Cast, Trailer, JSON) */}
        <div className="flex items-center gap-2 px-4 sm:px-8 pt-3 border-b border-white/10 bg-[#0b101d] overflow-x-auto scrollbar-none">
          {/* Tab 1: Primary View (Seasons & Episodes for series/anime; Direct Play for movies) */}
          <button
            id="tab-btn-episodes"
            onClick={() => setActiveTab('episodes')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'episodes'
                ? 'border-purple-500 text-purple-400 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {isSeries ? <Tv className="w-4 h-4 text-purple-400" /> : <Play className="w-4 h-4 text-amber-400 fill-amber-400" />}
            <span>{isSeries ? 'المواسم والحلقات' : 'مشاهدة الفيلم'}</span>
          </button>

          {/* Tab 2: Story & Overview Details */}
          <button
            id="tab-btn-details"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'details'
                ? 'border-purple-500 text-purple-400 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>قصة وتفاصيل العمل</span>
          </button>

          {/* Tab 3: Cast */}
          {currentMedia.cast && currentMedia.cast.length > 0 && (
            <button
              id="tab-btn-cast"
              onClick={() => setActiveTab('cast')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'cast'
                  ? 'border-purple-500 text-purple-400 font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>طاقم التمثيل ({currentMedia.cast.length})</span>
            </button>
          )}

          {/* Tab 4: Trailer */}
          {trailerVideo && (
            <button
              id="tab-btn-trailer"
              onClick={() => setActiveTab('trailer')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'trailer'
                  ? 'border-purple-500 text-purple-400 font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>الإعلان الترويجي</span>
            </button>
          )}

          {/* Tab 5: JSON API Data */}
          <button
            id="tab-btn-json"
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'json'
                ? 'border-purple-500 text-purple-400 font-black'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>بيانات TMDb (JSON)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* TAB 1: SEASONS & EPISODES (OR MOVIE PLAY BAR) */}
          {activeTab === 'episodes' && (
            <div className="space-y-6">
              {/* For Series / Anime / Cartoons: DIRECT PROMINENT SEASONS & EPISODES EXPLORER */}
              {isSeries ? (
                <SeasonsEpisodesView
                  media={currentMedia}
                  seasons={seasons}
                  selectedSeasonNumber={selectedSeasonNumber}
                  onSelectSeason={(num) => setSelectedSeasonNumber(num)}
                  episodes={episodes}
                  isLoadingEpisodes={isLoadingEpisodes}
                  onOpenShare={onOpenShare}
                  onPlayEpisode={(sNum, epNum) => {
                    onPlay(currentMedia, sNum, epNum);
                    onClose();
                  }}
                />
              ) : (
                /* For Movies: Direct Play Actions Card */
                <div className="w-full rounded-3xl bg-[#0b1020] border border-amber-500/20 p-5 sm:p-7 shadow-xl space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md flex-shrink-0">
                      <Film className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white font-['Cairo']">
                        مشاهدة فيلم: {currentMedia.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-['Cairo']">
                        اختر التشغيل المباشر بأعلى جودة Full HD و 4K عبر 36 سيرفر بث فائق السرعة
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      id="btn-play-movie-direct"
                      onClick={() => {
                        onPlay(currentMedia);
                        onClose();
                      }}
                      className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-transform active:scale-98 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      <span>تشغيل الفيلم الآن (36 سيرفر سريع)</span>
                    </button>

                    <button
                      id="btn-share-movie-modal"
                      type="button"
                      onClick={() => onOpenShare(currentMedia)}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/15 transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>مشاركة الفيلم</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Synopsis & Metadata Card Below Episodes/Movie Player */}
              <div className="rounded-3xl bg-[#0b1020]/70 border border-white/10 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {currentMedia.genres &&
                    currentMedia.genres.map((g, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-['Cairo']"
                      >
                        {g}
                      </span>
                    ))}
                  {currentMedia.duration && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentMedia.duration}</span>
                    </span>
                  )}
                  {currentMedia.releaseDate && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{currentMedia.releaseDate}</span>
                    </span>
                  )}
                  {currentMedia.director && (
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-['Cairo']">
                      إخراج: {currentMedia.director}
                    </span>
                  )}
                </div>

                {currentMedia.tagline && (
                  <p className="text-xs italic text-amber-400/90 font-serif border-r-2 border-amber-400 pr-3">
                    "{currentMedia.tagline}"
                  </p>
                )}

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 font-['Cairo']">نبذة وقصة العمل:</h4>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-justify font-['Cairo']">
                    {currentMedia.overview || 'لا يتوفر ملخص نصي حالياً.'}
                  </p>
                </div>
              </div>

              {/* Recommendations & Similar Media Carousel at the bottom */}
              {((currentMedia.recommendations && currentMedia.recommendations.length > 0) ||
                (currentMedia.similar && currentMedia.similar.length > 0)) && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white font-['Cairo']">أعمال مشابهة وموصى بها:</h4>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono font-bold">TMDb Recommendations</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {(currentMedia.recommendations && currentMedia.recommendations.length > 0
                      ? currentMedia.recommendations
                      : currentMedia.similar || []
                    ).slice(0, 5).map((rec) => (
                      <div
                        key={rec.tmdbId}
                        onClick={() => {
                          setDetailedMedia(rec);
                          setSelectedSeasonNumber(1);
                          TmdbService.getMediaDetails(rec.tmdbId, rec.type).then((det) => {
                            if (det) setDetailedMedia(det);
                          });
                        }}
                        className="group/rec relative rounded-2xl overflow-hidden bg-[#101628] border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden bg-black/40">
                          <img
                            src={rec.posterPath}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover/rec:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>
                        <div className="p-2 space-y-1">
                          <h5 className="text-[11px] font-bold text-white line-clamp-1 group-hover/rec:text-amber-300 font-['Cairo']">
                            {rec.title}
                          </h5>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span>{rec.year}</span>
                            {rec.voteAverage > 0 && (
                              <span className="text-amber-400 flex items-center gap-0.5">
                                ★ {rec.voteAverage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL STORY & OVERVIEW DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Genres & Meta Info */}
              <div className="flex flex-wrap items-center gap-2">
                {currentMedia.genres &&
                  currentMedia.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-['Cairo']"
                    >
                      {g}
                    </span>
                  ))}
                {currentMedia.duration && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentMedia.duration}</span>
                  </span>
                )}
                {currentMedia.releaseDate && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{currentMedia.releaseDate}</span>
                  </span>
                )}
                {currentMedia.director && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-['Cairo']">
                    إخراج: {currentMedia.director}
                  </span>
                )}
              </div>

              {/* Tagline */}
              {currentMedia.tagline && (
                <p className="text-xs italic text-amber-400/90 font-serif border-r-2 border-amber-400 pr-3">
                  "{currentMedia.tagline}"
                </p>
              )}

              {/* Full Synopsis */}
              <div className="space-y-2 rounded-2xl bg-[#0b1020] border border-white/10 p-4 sm:p-5">
                <h3 className="text-sm font-bold text-amber-400 font-['Cairo']">قصة العمل بالتفصيل:</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed text-justify font-['Cairo']">
                  {currentMedia.overview || 'لا يتوفر ملخص نصي حالياً.'}
                </p>
              </div>

              {/* Keywords */}
              {currentMedia.keywords && currentMedia.keywords.length > 0 && (
                <div className="space-y-2 rounded-2xl bg-[#0b1020] border border-white/10 p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold font-['Cairo']">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>الكلمات المفتاحية في TMDb:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {currentMedia.keywords.map((k) => (
                      <span
                        key={k.id}
                        className="px-2.5 py-1 rounded-lg bg-[#141b2e] border border-white/5 text-[11px] text-gray-300 font-mono"
                      >
                        #{k.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAST & CREW */}
          {activeTab === 'cast' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-['Cairo']">
                <Users className="w-4 h-4" />
                <span>طاقم التمثيل والنجوم المسجلين في TMDb:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentMedia.cast?.map((actor) => (
                  <div
                    key={actor.id}
                    className="p-2.5 rounded-2xl bg-[#131929] border border-white/5 flex items-center gap-3 text-right"
                  >
                    {actor.profilePath ? (
                      <img
                        src={actor.profilePath}
                        alt={actor.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1 font-['Cairo']">{actor.name}</h4>
                      {actor.character && (
                        <p className="text-[10px] text-amber-400/80 line-clamp-1 font-mono">{actor.character}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL TRAILER */}
          {activeTab === 'trailer' && trailerVideo && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-['Cairo']">
                  <Video className="w-4 h-4" />
                  <span>{trailerVideo.name || 'الإعلان الترويجي الرسمي'}</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">YouTube 1080p</span>
              </div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1&rel=0`}
                  title={trailerVideo.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* TAB 5: OPEN TMDb JSON INSPECTOR */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white font-['Cairo']">البيانات الخام المفتوحة (Open API Response):</span>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'تم النسخ!' : 'نسخ JSON'}</span>
                </button>
              </div>

              {/* External IDs bar */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#141b2e] border border-white/5 text-xs font-mono">
                <span className="text-amber-400">TMDb: {currentMedia.tmdbId}</span>
                {currentMedia.imdbId && <span className="text-sky-400">IMDb: {currentMedia.imdbId}</span>}
                {currentMedia.tvdbId && <span className="text-indigo-400">TheTVDB: {currentMedia.tvdbId}</span>}
                {currentMedia.tvmazeId && <span className="text-emerald-400">TVmaze: {currentMedia.tvmazeId}</span>}
                {currentMedia.budget ? <span className="text-gray-300 font-['Cairo']">الميزانية: ${currentMedia.budget.toLocaleString()}</span> : null}
                {currentMedia.revenue ? <span className="text-emerald-300 font-['Cairo']">الإيرادات: ${currentMedia.revenue.toLocaleString()}</span> : null}
              </div>

              <pre
                dir="ltr"
                className="p-4 rounded-2xl bg-[#060a14] border border-white/10 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-96 leading-relaxed select-all"
              >
                {JSON.stringify(currentMedia.rawTmdbData || currentMedia, null, 2)}
              </pre>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


