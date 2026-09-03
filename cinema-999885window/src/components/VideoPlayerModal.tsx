import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Share2,
  Tv,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  Film,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clapperboard,
  Server,
  Zap,
  Radio,
  ExternalLink
} from 'lucide-react';
import { MediaItem, ServerProvider, Episode, Season } from '../types';
import { SERVERS_LIST, buildServerUrl } from '../data/servers';
import { StorageService } from '../services/storage';
import { TmdbService } from '../services/tmdb';
import { TvmazeService } from '../services/tvmaze';
import { SeasonsEpisodesView } from './SeasonsEpisodesView';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  initialSeason?: number;
  initialEpisode?: number;
  onOpenShare: (media: MediaItem, season?: number, episode?: number, episodeData?: Episode) => void;
}

const SERVERS_PER_PAGE = 5; // 5 servers per page as in Screenshots 7, 8, 9, 10

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  isOpen,
  onClose,
  initialSeason = 1,
  initialEpisode = 1,
  onOpenShare
}) => {
  const [selectedServer, setSelectedServer] = useState<ServerProvider>(SERVERS_LIST[0]);
  const [seasonNumber, setSeasonNumber] = useState<number>(initialSeason);
  const [episodeNumber, setEpisodeNumber] = useState<number>(initialEpisode);
  const [serverPage, setServerPage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showEpisodePicker, setShowEpisodePicker] = useState<boolean>(false);
  const [liveEpisodes, setLiveEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);
  const [detailedMedia, setDetailedMedia] = useState<MediaItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentMedia = detailedMedia || media;

  useEffect(() => {
    if (isOpen && media) {
      let resolvedInitialSeason = initialSeason;
      let resolvedInitialEpisode = initialEpisode;

      if (media.type !== 'movie' && media.seasons && media.seasons.length > 0) {
        const curS = media.seasons.find((s) => s.seasonNumber === initialSeason);
        if (curS && curS.episodesCount && curS.episodesCount > 0 && initialEpisode > curS.episodesCount) {
          let accumulated = 0;
          for (const s of media.seasons) {
            const epCount = s.episodesCount || 0;
            if (epCount > 0 && initialEpisode > accumulated && initialEpisode <= accumulated + epCount) {
              resolvedInitialSeason = s.seasonNumber;
              resolvedInitialEpisode = initialEpisode - accumulated;
              break;
            }
            accumulated += epCount;
          }
        }
      }

      setSeasonNumber(resolvedInitialSeason);
      setEpisodeNumber(resolvedInitialEpisode);
      setIsIframeLoading(true);
      setIframeKey((prev) => prev + 1);

      // Save to watch history
      StorageService.addToHistory(media, resolvedInitialSeason, resolvedInitialEpisode);

      // Fetch full details if seasons are missing
      if (!media.seasons || media.seasons.length === 0) {
        TmdbService.getMediaDetails(media.tmdbId, media.type).then((det) => {
          if (det) {
            setDetailedMedia(det);
            if (det.seasons && det.seasons.length > 0 && det.type !== 'movie') {
              const curDetS = det.seasons.find((s) => s.seasonNumber === initialSeason);
              if (curDetS && curDetS.episodesCount && curDetS.episodesCount > 0 && initialEpisode > curDetS.episodesCount) {
                let acc = 0;
                for (const s of det.seasons) {
                  const count = s.episodesCount || 0;
                  if (count > 0 && initialEpisode > acc && initialEpisode <= acc + count) {
                    setSeasonNumber(s.seasonNumber);
                    setEpisodeNumber(initialEpisode - acc);
                    break;
                  }
                  acc += count;
                }
              }
            }
          }
        });
      } else {
        setDetailedMedia(media);
      }
    } else {
      setDetailedMedia(null);
      setLiveEpisodes([]);
    }
  }, [isOpen, media?.tmdbId, initialSeason, initialEpisode]);

  // Explicit state-based fetch of season episodes keyed strictly to currentMedia.tmdbId and seasonNumber
  useEffect(() => {
    if (!isOpen || !currentMedia || currentMedia.type === 'movie') {
      setLiveEpisodes([]);
      setIsLoadingEpisodes(false);
      return;
    }

    // Immediately clear episodes and set loading to prevent showing stale cross-season episodes
    setLiveEpisodes([]);
    setIsLoadingEpisodes(true);

    let isCancelled = false;

    const seasonObj = currentMedia.seasons?.find((s) => s.seasonNumber === seasonNumber);

    TmdbService.getSeasonEpisodes(currentMedia.tmdbId, seasonNumber, {
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
            seasonNumber: typeof ep.seasonNumber === 'number' && ep.seasonNumber > 0 ? ep.seasonNumber : seasonNumber
          })).filter((ep) => ep.seasonNumber === seasonNumber);

          setLiveEpisodes(sanitizedEps);
          setIsLoadingEpisodes(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading season episodes:', err);
        if (!isCancelled) {
          setLiveEpisodes([]);
          setIsLoadingEpisodes(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, currentMedia?.tmdbId, seasonNumber]);

  const seasons: Season[] = useMemo(() => {
    if (!currentMedia) return [];
    if (currentMedia.seasons && currentMedia.seasons.length > 0) {
      return currentMedia.seasons;
    }
    const count = currentMedia.seasonsCount && currentMedia.seasonsCount > 0 ? currentMedia.seasonsCount : 1;
    return Array.from({ length: count }, (_, i) => ({
      id: `s-${currentMedia.tmdbId}-${i + 1}`,
      seasonNumber: i + 1,
      title: TvmazeService.getArabicSeasonTitle(i + 1),
      episodesCount: 0
    }));
  }, [currentMedia]);

  if (!isOpen || !currentMedia) return null;

  const isSeries = currentMedia.type !== 'movie';
  const currentSeason = seasons.find((s) => s.seasonNumber === seasonNumber) || seasons[0];
  const episodes: Episode[] = liveEpisodes.filter((ep) => !ep.seasonNumber || ep.seasonNumber === seasonNumber);

  const totalPages = Math.ceil(SERVERS_LIST.length / SERVERS_PER_PAGE);
  const currentServers = SERVERS_LIST.slice(
    serverPage * SERVERS_PER_PAGE,
    (serverPage + 1) * SERVERS_PER_PAGE
  );

  const currentEmbedUrl = buildServerUrl(
    selectedServer,
    media.tmdbId,
    media.type,
    seasonNumber,
    episodeNumber
  );

  const handleSelectServer = (server: ServerProvider) => {
    setSelectedServer(server);
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleReload = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleNextEpisode = () => {
    if (!isSeries) return;
    const releasedEpisodes = episodes.filter((ep) => !ep.isUpcoming && ep.status !== 'upcoming');
    const maxEp = releasedEpisodes.length > 0
      ? Math.max(...releasedEpisodes.map((e) => e.episodeNumber))
      : (currentSeason?.episodesCount || 0);

    if (maxEp > 0 && episodeNumber < maxEp) {
      const nextEp = episodeNumber + 1;
      setEpisodeNumber(nextEp);
      setIsIframeLoading(true);
      setIframeKey((prev) => prev + 1);
      StorageService.addToHistory(media, seasonNumber, nextEp);
    }
  };

  const handlePrevEpisode = () => {
    if (!isSeries) return;
    if (episodeNumber > 1) {
      const prevEp = episodeNumber - 1;
      setEpisodeNumber(prevEp);
      setIsIframeLoading(true);
      setIframeKey((prev) => prev + 1);
      StorageService.addToHistory(media, seasonNumber, prevEp);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="modal-video-player"
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#050711] text-white animate-in fade-in overflow-y-auto"
      dir="rtl"
    >
      {/* Top Bar Navigation (Screenshots 7, 8, 9) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#080c1a] border-b border-white/10 flex-shrink-0 z-20">
        {/* Brand Logo with Glow */}
        <div className="flex items-center gap-2.5">
          <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 p-[1.5px] shadow-md shadow-purple-500/20">
            <div className="bg-[#0b1020] p-1 rounded-[10px]">
              <Clapperboard className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            </div>
          </div>

          <span className="text-base font-black font-['Cairo'] bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            نافذة السينما
          </span>
        </div>

        {/* Close Button Top Right */}
        <button
          id="btn-close-player-top"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-bold font-['Cairo'] transition-colors"
        >
          <X className="w-4 h-4" />
          <span>إغلاق</span>
        </button>
      </div>

      {/* Action Strip (Screenshot 7 & 8: Fast Server Pill, Reload, Fullscreen, Close Red Button) */}
      <div className="bg-[#0a0f21] border-b border-white/5 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Fast server banner */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-['Cairo']">السيرفر السريع:</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-['Cairo'] shadow-sm">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>{selectedServer.nameAr}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold font-['Cairo'] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>إغلاق</span>
          </button>

          <button
            id="btn-share-player-header"
            onClick={() => {
              const activeEp = liveEpisodes.find((e) => e.episodeNumber === episodeNumber);
              onOpenShare(media, seasonNumber, episodeNumber, activeEp);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold font-['Cairo'] transition-colors"
            title="مشاركة"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مشاركة</span>
          </button>
        </div>
      </div>

      {/* Main Video Streaming Viewport */}
      <div className="relative w-full aspect-video max-h-[55vh] sm:max-h-[60vh] bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
        {isIframeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070a14] space-y-3 pointer-events-none">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <p className="text-xs font-bold text-purple-300 font-['Cairo'] animate-pulse">
              جاري الاتصال بـ {selectedServer.nameAr}...
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          id="streaming-iframe"
          src={currentEmbedUrl}
          title={media.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setIsIframeLoading(false)}
          className="w-full h-full border-0"
        />
      </div>

      {/* Series Episode Selector & Season Dropdown (if series) */}
      {isSeries && (
        <div className="bg-[#090d1c] border-b border-white/5 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center flex-wrap gap-2">
            {/* Dedicated Season Dropdown Selector */}
            {seasons.length > 0 && (
              <div className="relative inline-flex items-center">
                <select
                  id="select-player-season"
                  value={seasonNumber}
                  onChange={(e) => {
                    const newSeasonNum = Number(e.target.value);
                    setSeasonNumber(newSeasonNum);
                    setEpisodeNumber(1);
                    setIsIframeLoading(true);
                    setIframeKey((prev) => prev + 1);
                    StorageService.addToHistory(media, newSeasonNum, 1);
                  }}
                  className="appearance-none bg-[#13192c] hover:bg-[#1a233b] text-amber-300 border border-purple-500/40 text-xs font-bold font-['Cairo'] rounded-xl py-1.5 pl-7 pr-3 focus:outline-none focus:border-purple-400 cursor-pointer transition-all shadow-sm"
                >
                  {seasons.map((s) => (
                    <option key={s.id || s.seasonNumber} value={s.seasonNumber} className="bg-[#0d1222] text-white">
                      {s.title || `الموسم ${s.seasonNumber}`}{typeof s.episodesCount === 'number' && s.episodesCount > 0 ? ` (${s.episodesCount} حلقة)` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute left-2 pointer-events-none" />
              </div>
            )}

            <button
              onClick={handlePrevEpisode}
              disabled={episodeNumber <= 1}
              className="px-3 py-1.5 rounded-xl bg-[#13192c] hover:bg-[#1b233d] disabled:opacity-30 text-xs font-bold font-['Cairo'] text-white border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>الحلقة السابقة</span>
            </button>

            <button
              onClick={() => setShowEpisodePicker(!showEpisodePicker)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold font-['Cairo'] border border-purple-500/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                الموسم {seasonNumber} : الحلقة {episodeNumber}
              </span>
            </button>

            <button
              onClick={handleNextEpisode}
              disabled={episodes.length > 0 && episodeNumber >= episodes.length}
              className="px-3 py-1.5 rounded-xl bg-[#13192c] hover:bg-[#1b233d] disabled:opacity-30 text-xs font-bold font-['Cairo'] text-white border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>الحلقة التالية</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-mono text-amber-400 flex items-center gap-2">
            <span className="hidden sm:inline text-gray-400 font-['Cairo']">جاري تشغيل:</span>
            <span>{media.title}</span>
          </div>
        </div>
      )}

      {/* Series Episodes Drawer (if toggled) */}
      {showEpisodePicker && isSeries && (
        <div className="bg-[#0b1020] p-4 sm:p-5 border-b border-purple-500/30 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm font-bold text-amber-400 font-['Cairo']">
                اختر حلقة للمشاهدة:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/40 text-[11px] font-bold font-mono">
                الموسم {seasonNumber} • {isLoadingEpisodes ? '...' : `${episodes.length} حلقة`}
              </span>
            </div>

            {/* Close episode picker drawer */}
            <button
              onClick={() => setShowEpisodePicker(false)}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dedicated Seasons Tabbed Navigation & Dropdown in Drawer */}
          {seasons.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-400 font-['Cairo']">
                  المواسم المتاحة:
                </span>
                {/* Dropdown for fast season jump */}
                <div className="relative inline-flex items-center">
                  <select
                    value={seasonNumber}
                    onChange={(e) => {
                      const newSeasonNum = Number(e.target.value);
                      setSeasonNumber(newSeasonNum);
                      setEpisodeNumber(1);
                      setIsIframeLoading(true);
                      setIframeKey((prev) => prev + 1);
                      StorageService.addToHistory(media, newSeasonNum, 1);
                    }}
                    className="appearance-none bg-[#10172e] text-purple-300 border border-purple-500/40 text-[11px] font-bold font-['Cairo'] rounded-xl py-1 pl-6 pr-2.5 focus:outline-none cursor-pointer"
                  >
                    {seasons.map((s) => (
                      <option key={s.id || s.seasonNumber} value={s.seasonNumber} className="bg-[#0d1222] text-white">
                        {s.title || `الموسم ${s.seasonNumber}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-purple-400 absolute left-1.5 pointer-events-none" />
                </div>
              </div>

              {/* Tabbed Season Navigation Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {seasons.map((s) => {
                  const isActive = s.seasonNumber === seasonNumber;
                  return (
                    <button
                      key={s.id || s.seasonNumber}
                      onClick={() => {
                        setSeasonNumber(s.seasonNumber);
                        setEpisodeNumber(1);
                        setIsIframeLoading(true);
                        setIframeKey((prev) => prev + 1);
                        StorageService.addToHistory(media, s.seasonNumber, 1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-['Cairo'] whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#10172e] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white'
                          : 'bg-[#111728] text-gray-300 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>{s.title || `الموسم ${s.seasonNumber}`}</span>
                      {typeof s.episodesCount === 'number' && s.episodesCount > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                            isActive ? 'bg-purple-600/40 text-purple-200' : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          {s.episodesCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading Indicator while fetching episodes for selected season */}
          {isLoadingEpisodes ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              <span className="text-xs text-purple-300 font-['Cairo']">
                جاري تحميل حلقات الموسم {seasonNumber}...
              </span>
            </div>
          ) : (
            /* Episode Quick Chips */
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto pr-1">
              {episodes.map((ep) => {
                const isUpcoming = ep.isUpcoming || ep.status === 'upcoming';
                const isCurrent = !isUpcoming && ep.episodeNumber === episodeNumber;
                return (
                  <button
                    key={ep.id || ep.episodeNumber}
                    disabled={isUpcoming}
                    onClick={() => {
                      if (!isUpcoming) {
                        setEpisodeNumber(ep.episodeNumber);
                        setIsIframeLoading(true);
                        setIframeKey((prev) => prev + 1);
                        setShowEpisodePicker(false);
                        StorageService.addToHistory(media, seasonNumber, ep.episodeNumber);
                      }
                    }}
                    className={`group p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isUpcoming
                        ? 'bg-[#090d1a] border-blue-500/20 text-gray-500 opacity-60 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 font-black shadow-lg shadow-purple-600/30 cursor-pointer'
                        : 'bg-[#0f1426] hover:bg-[#151c36] text-gray-300 border-white/10 hover:border-purple-500/40 cursor-pointer'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-black">
                      E{ep.episodeNumber}
                    </span>
                    <span className="text-[9px] font-['Cairo'] line-clamp-1 opacity-80 group-hover:opacity-100">
                      {isUpcoming ? 'قريباً' : `حلقة ${ep.episodeNumber}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 36 Server Selection & Seasons/Episodes Section (Matches Screenshots 1, 2, 7, 8, 9, 10) */}
      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6 pb-16">
        {/* Section Container: Server Selection */}
        <div className="rounded-3xl bg-[#090e1e] border border-purple-500/20 p-4 sm:p-5 shadow-2xl space-y-4">
          {/* Header with Server Icon */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-white font-['Cairo']">
                اختر السيرفر ({SERVERS_LIST.length})
              </h3>
            </div>
          </div>

          {/* Server Item Rows (5 per page) */}
          <div className="space-y-2.5">
            {currentServers.map((server, idx) => {
              const isSelected = selectedServer.id === server.id;
              return (
                <button
                  key={server.id}
                  id={`btn-server-item-${server.id}`}
                  onClick={() => handleSelectServer(server)}
                  className={`w-full p-3 sm:p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121830] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                      : 'bg-[#0f1424] hover:bg-[#161d33] border border-white/10'
                  }`}
                >
                  {/* Left: Quality Badge & Signal Bars 📶 */}
                  <div className="flex items-center gap-2">
                    {/* Signal bars indicator */}
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="w-1 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="w-1 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Quality Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        server.quality === '4K UHD'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                          : 'bg-[#1a233d] text-gray-300 border border-white/10'
                      }`}
                    >
                      {server.quality || '1080p FHD'}
                    </span>
                  </div>

                  {/* Right: Server Name */}
                  <div className="flex items-center gap-2 text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold font-['Cairo'] ${
                        isSelected ? 'text-white font-black' : 'text-gray-200'
                      }`}
                    >
                      {server.nameAr}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination Controls (Screenshots 7, 8, 9, 10: "السابق", "8 / 1", "التالي") */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setServerPage((prev) => Math.max(0, prev - 1))}
              disabled={serverPage === 0}
              className="px-4 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1c2640] disabled:opacity-30 text-xs font-bold font-['Cairo'] text-gray-300 border border-white/10 transition-all cursor-pointer"
            >
              السابق
            </button>

            <span className="px-4 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-mono font-bold shadow-md shadow-purple-700/30 border border-purple-500/50">
              {totalPages} / {serverPage + 1}
            </span>

            <button
              onClick={() => setServerPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={serverPage >= totalPages - 1}
              className="px-4 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1c2640] disabled:opacity-30 text-xs font-bold font-['Cairo'] text-gray-300 border border-white/10 transition-all cursor-pointer"
            >
              التالي
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-[11px] text-gray-400 font-['Cairo'] text-center pt-1">
            إذا واجهت مشكلة في التشغيل، جرب سيرفر آخر.
          </p>
        </div>

        {/* Series Seasons & Episodes Explorer (Matches Screenshots 1 & 2 on Computer and Mobile) */}
        {isSeries && (
          <div className="pt-2">
            <SeasonsEpisodesView
              media={currentMedia}
              seasons={seasons}
              selectedSeasonNumber={seasonNumber}
              onSelectSeason={(num) => {
                setSeasonNumber(num);
                setEpisodeNumber(1);
                setIsIframeLoading(true);
                setIframeKey((prev) => prev + 1);
                StorageService.addToHistory(currentMedia, num, 1);
              }}
              episodes={episodes}
              isLoadingEpisodes={isLoadingEpisodes}
              onOpenShare={onOpenShare}
              onPlayEpisode={(sNum, epNum) => {
                setSeasonNumber(sNum);
                setEpisodeNumber(epNum);
                setIsIframeLoading(true);
                setIframeKey((prev) => prev + 1);
                StorageService.addToHistory(currentMedia, sNum, epNum);
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              currentPlayingSeasonNumber={seasonNumber}
              currentPlayingEpisodeNumber={episodeNumber}
            />
          </div>
        )}
      </div>
    </div>
  );
};
