import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
  Globe,
  ExternalLink,
  Sparkles,
  Tv,
  Film,
  Clock,
  Star,
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MediaItem, Episode } from '../types';
import { getCanonicalUrl, getCanonicalPath, parseCurrentLocation } from '../utils/share';
import { getMediaSlug } from '../utils/slugify';
import { TmdbService } from '../services/tmdb';

interface ShareDialogProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  selectedSeason?: number;
  selectedEpisode?: number;
  isEpisodeShare?: boolean;
  episodeData?: Episode | null;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  media,
  isOpen,
  onClose,
  selectedSeason = 1,
  selectedEpisode = 1,
  isEpisodeShare = false,
  episodeData = null
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'social' | 'inspector'>('whatsapp');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Inspector state
  const [inspectUrlInput, setInspectUrlInput] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectedMedia, setInspectedMedia] = useState<MediaItem | null>(null);
  const [inspectedSeason, setInspectedSeason] = useState<number>(1);
  const [inspectedEpisode, setInspectedEpisode] = useState<number>(1);
  const [inspectedIsEpisode, setInspectedIsEpisode] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string>('');

  const [currentEpisodeDetails, setCurrentEpisodeDetails] = useState<Episode | null>(episodeData || null);

  // Fetch episode still and specific overview from TMDb if not already present
  useEffect(() => {
    if (!isOpen || !media) return;

    if (episodeData) {
      setCurrentEpisodeDetails(episodeData);
      return;
    }

    const isEp = isEpisodeShare || (media.type !== 'movie' && selectedSeason > 0 && selectedEpisode > 0);
    if (isEp && media.tmdbId) {
      TmdbService.getSeasonEpisodes(media.tmdbId, selectedSeason).then((eps) => {
        if (eps && eps.length > 0) {
          const match = eps.find((e) => e.episodeNumber === selectedEpisode) || eps[0];
          if (match) {
            setCurrentEpisodeDetails(match);
          }
        }
      });
    } else {
      setCurrentEpisodeDetails(null);
    }
  }, [isOpen, media?.tmdbId, selectedSeason, selectedEpisode, isEpisodeShare, episodeData]);

  if (!isOpen || !media) return null;

  const targetMedia = activeTab === 'inspector' && inspectedMedia ? inspectedMedia : media;
  const targetSeason = activeTab === 'inspector' && inspectedMedia ? inspectedSeason : selectedSeason;
  const targetEpisode = activeTab === 'inspector' && inspectedMedia ? inspectedEpisode : selectedEpisode;
  const isTargetEpisode = activeTab === 'inspector' && inspectedMedia 
    ? inspectedIsEpisode 
    : isEpisodeShare || (targetMedia.type !== 'movie' && targetSeason > 0 && targetEpisode > 0);

  const canonicalUrl = getCanonicalUrl(
    targetMedia,
    isTargetEpisode ? targetSeason : undefined,
    isTargetEpisode ? targetEpisode : undefined
  );
  const canonicalPath = getCanonicalPath(
    targetMedia,
    isTargetEpisode ? targetSeason : undefined,
    isTargetEpisode ? targetEpisode : undefined
  );

  // Format Display Titles & Badges
  let mainTitle = targetMedia.title;
  let workTypeLabel = targetMedia.type === 'anime' ? 'أنمي ياباني' : targetMedia.type === 'cartoon' ? 'رسوم متحركة' : targetMedia.type === 'movie' ? 'فيلم سينمائي' : 'مسلسل تلفزيوني';
  let episodeLabel = '';

  if (isTargetEpisode) {
    mainTitle = `${targetMedia.title} - الموسم ${targetSeason} الحلقة ${targetEpisode}`;
    episodeLabel = `الموسم ${targetSeason} • الحلقة ${targetEpisode}`;
  }

  // Image selection (Episode still -> Backdrop -> Poster)
  const posterImg = isTargetEpisode && currentEpisodeDetails?.stillPath 
    ? currentEpisodeDetails.stillPath 
    : targetMedia.backdropPath || targetMedia.posterPath || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';

  const rawStory = (isTargetEpisode && currentEpisodeDetails?.overview && currentEpisodeDetails.overview.trim().length > 10)
    ? currentEpisodeDetails.overview
    : targetMedia.overview || 'استمتع بمشاهدة هذا العمل السينمائي بأعلى جودة Full HD و 4K بدون إعلانات مع سيرفرات متعددة سريعة.';

  const storyExcerpt = rawStory.length > 220 ? rawStory.slice(0, 220).trim() + '...' : rawStory;

  // Build WhatsApp Rich Share Text
  const whatsAppShareText = [
    `🎬 *${targetMedia.title}*`,
    isTargetEpisode ? `📺 *الموسم ${targetSeason} • الحلقة ${targetEpisode}*` : `🍿 *${workTypeLabel}*`,
    targetMedia.year ? `📅 *سنة الإصدار:* ${targetMedia.year}` : '',
    targetMedia.voteAverage ? `⭐ *التقييم:* ${targetMedia.voteAverage} / 10` : '',
    `\n📝 *القصة:* ${storyExcerpt}`,
    `\n🌟 *شاهد الآن بجودة 4K فائقة و Full HD بدون إعلانات عبر نافذة السينما VIP:*`,
    `🔗 ${canonicalUrl}`
  ].filter(Boolean).join('\n');

  const handleCopyUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
        setCopiedUrl(true);
        setCopyError(false);
        setTimeout(() => setCopiedUrl(false), 2500);
      } else {
        const input = document.getElementById('input-canonical-share-url') as HTMLInputElement;
        if (input) {
          input.select();
          document.execCommand('copy');
          setCopiedUrl(true);
          setTimeout(() => setCopiedUrl(false), 2500);
        }
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  const handleCopyWhatsAppText = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(whatsAppShareText);
        setCopiedWhatsAppText(true);
        setTimeout(() => setCopiedWhatsAppText(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: mainTitle,
          text: `شاهد ${mainTitle} بأعلى جودة على نافذة السينما:\n${storyExcerpt}`,
          url: canonicalUrl
        });
        onClose();
      } catch (err) {
        console.log('Native share canceled', err);
      }
    }
  };

  // Inspect any pasted URL
  const handleInspectUrl = async () => {
    if (!inspectUrlInput.trim()) return;
    setIsInspecting(true);
    setInspectError('');
    setInspectedMedia(null);

    try {
      let raw = inspectUrlInput.trim();
      let urlObj: URL;
      try {
        urlObj = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      } catch (e) {
        urlObj = new URL(`https://cineview.xo.je${raw.startsWith('/') ? '' : '/'}${raw}`);
      }

      let pathname = decodeURIComponent(urlObj.pathname).replace(/^\/mua\//i, '/').replace(/\/+$/, '') || '/';
      const epMatch = pathname.match(/^\/(movie|tv|anime|cartoon)\/([^/]+)\/(?:season-(\d+)|([^/]+))\/episode-(\d+)$/i);
      const itemMatch = pathname.match(/^\/(movie|tv|anime|cartoon)\/([^/]+)$/i);

      let detectedType: any = 'movie';
      let detectedSlug = '';
      let detectedSeason = 1;
      let detectedEpisode = 1;
      let isEp = false;

      if (epMatch) {
        detectedType = epMatch[1].toLowerCase();
        detectedSlug = epMatch[2];
        detectedSeason = epMatch[3] ? parseInt(epMatch[3], 10) : 1;
        detectedEpisode = parseInt(epMatch[5], 10);
        isEp = true;
      } else if (itemMatch) {
        detectedType = itemMatch[1].toLowerCase();
        detectedSlug = itemMatch[2];
        isEp = false;
      } else {
        throw new Error('الرابط غير متطابق مع بنية روابط نافذة السينما (مثال: /anime/re-zero/season-1/episode-1)');
      }

      // Search and resolve media from TMDb
      const searchRes = await TmdbService.searchMulti(detectedSlug.replace(/[\-_]+/g, ' '));
      if (searchRes && searchRes.items && searchRes.items.length > 0) {
        const found = searchRes.items.find((i) => i.type === detectedType) || searchRes.items[0];
        const fullDetails = await TmdbService.getMediaDetails(found.tmdbId, found.type);
        if (fullDetails) {
          setInspectedMedia(fullDetails);
          setInspectedSeason(detectedSeason);
          setInspectedEpisode(detectedEpisode);
          setInspectedIsEpisode(isEp);
          return;
        }
      }

      throw new Error('لم نتمكن من جلب بيانات هذا العمل من محرك البحث.');
    } catch (err: any) {
      setInspectError(err?.message || 'تعذر فحص الرابط.');
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div
      id="modal-link-preview-share"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#0b1020] border border-purple-500/30 p-5 sm:p-6 shadow-2xl text-white text-right space-y-4 sm:space-y-5 transform animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <h3 className="text-sm sm:text-base font-black text-white font-['Cairo'] flex items-center gap-2">
                <span>معاينة الرابط وبطاقة المشاركة</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  OpenGraph VIP
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-['Cairo']">
                عرض البوستر ورقم الحلقة والقصة تلقائياً عند الإرسال
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher: WhatsApp / Telegram vs Social Card vs URL Inspector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#060913] rounded-2xl border border-white/10">
          <button
            id="tab-preview-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black font-['Cairo'] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>معاينة واتساب وتيليجرام</span>
          </button>

          <button
            id="tab-preview-social"
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black font-['Cairo'] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'social'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>بطاقة الشبكات (Large Card)</span>
          </button>

          <button
            id="tab-preview-inspector"
            onClick={() => setActiveTab('inspector')}
            className={`py-2 px-3 rounded-xl text-xs font-black font-['Cairo'] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>فاحص الروابط</span>
          </button>
        </div>

        {/* URL Inspector Input Field (When Inspector Tab is Active) */}
        {activeTab === 'inspector' && (
          <div className="p-3.5 rounded-2xl bg-[#060913] border border-amber-500/30 space-y-2.5 animate-in fade-in">
            <label className="block text-xs font-bold text-amber-300 font-['Cairo']">
              ألصق أي رابط فيلم أو أنمي أو مسلسل أو حلقة لمعاينته فورياً:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inspectUrlInput}
                onChange={(e) => setInspectUrlInput(e.target.value)}
                placeholder="https://cineview.xo.je/anime/re-zero/season-1/episode-1"
                dir="ltr"
                className="flex-1 bg-[#10162a] text-xs text-white rounded-xl px-3 py-2 border border-white/15 focus:border-amber-400 focus:outline-none font-mono"
              />
              <button
                onClick={handleInspectUrl}
                disabled={isInspecting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black font-['Cairo'] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isInspecting ? (
                  <span>جاري الفحص...</span>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>فحص الرابط</span>
                  </>
                )}
              </button>
            </div>
            {inspectError && (
              <p className="text-[11px] text-rose-400 font-['Cairo']">{inspectError}</p>
            )}
          </div>
        )}

        {/* 1. WHATSAPP & TELEGRAM LIVE PREVIEW CARD */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold font-['Cairo'] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>المعاينة التلقائية للرسالة في تطبيق واتساب:</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                WhatsApp Rich Preview
              </span>
            </div>

            {/* WhatsApp Chat Bubble Simulation (Matches exact WhatsApp mobile card) */}
            <div className="rounded-3xl bg-[#0b141a] border border-emerald-500/30 p-3.5 space-y-3 shadow-2xl">
              {/* WhatsApp Message Bubble Container */}
              <div className="rounded-2xl bg-[#005c4b] border border-emerald-400/20 overflow-hidden shadow-lg">
                {/* 1. Top Image Banner with Play Button */}
                <div className="relative aspect-[16/9] w-full bg-black/80 overflow-hidden">
                  <img
                    src={posterImg}
                    alt={targetMedia.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        targetMedia.backdropPath ||
                        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
                    }}
                  />
                  {/* Play Icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                      <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1" />
                    </div>
                  </div>

                  {/* Quality & Episode Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-black font-['Cairo'] border border-amber-400/30">
                      4K Ultra HD
                    </span>
                    {isTargetEpisode && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-black font-['Cairo'] shadow-md">
                        الموسم {targetSeason} • الحلقة {targetEpisode}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. WhatsApp Card Details Box */}
                <div className="p-3.5 space-y-2 text-right bg-[#005c4b]/95">
                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-black text-white font-['Cairo'] leading-snug">
                    مشاهدة {workTypeLabel} {targetMedia.title} {targetMedia.year ? targetMedia.year : ''} {isTargetEpisode ? `الموسم ${targetSeason} الحلقة ${targetEpisode}` : ''} مترجم HD اون لاين - نافذة السينما
                  </h4>

                  {/* Story / Synopsis Description */}
                  <p className="text-[11px] sm:text-xs text-gray-200 font-['Cairo'] leading-relaxed">
                    {targetMedia.type === 'movie' ? 'تحميل ومشاهدة الفيلم كاملاً بجودة عالية HD 720p 1080p 4K برابط مباشر. ' : `تحميل ومشاهدة ${workTypeLabel} بجودة عالية 4K. `}
                    <span className="text-amber-300 font-bold ml-1">قصة العمل:</span>
                    {storyExcerpt}
                  </p>

                  {/* Link Host footer */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-200/80 font-mono border-t border-emerald-400/20" dir="ltr">
                    <span>{typeof window !== 'undefined' ? window.location.host : 'cineview.xo.je'}</span>
                    <span className="text-emerald-300 font-bold">نافذة السينما VIP</span>
                  </div>
                </div>
              </div>

              {/* Security & Authenticity Guarantee Notice */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-2 text-right">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-[11px] text-emerald-200 font-['Cairo'] leading-tight">
                  <strong className="text-white">معاينة حقيقية 100%:</strong> عندما ترسل هذا الرابط في محادثة واتساب، سيقوم سيرفر واتساب بقراءة وسوم (OpenGraph) تلقائياً وعرض هذه البطاقة مع الصورة والعنوان والقصة فوراً.
                </p>
              </div>

              {/* Direct WhatsApp Share Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <a
                  id="btn-direct-whatsapp-share-url"
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(canonicalUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black font-['Cairo'] shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
                  title="إرسال الرابط المباشر ليقوم واتساب بتوليد بطاقة المعاينة تلقائياً"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال الرابط إلى واتساب (لتوليد البطاقة)</span>
                </a>

                <button
                  id="btn-copy-canonical-url-direct"
                  onClick={handleCopyUrl}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-black font-['Cairo'] border transition-all cursor-pointer ${
                    copiedUrl
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 active:scale-98'
                  }`}
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم نسخ رابط المعاينة الحقيقي ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>نسخ الرابط فقط لإرساله</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SOCIAL MEDIA LARGE CARD PREVIEW (Twitter/X, Facebook, Discord) */}
        {activeTab === 'social' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-purple-400 font-bold font-['Cairo'] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>معاينة البطاقة العريضة (OpenGraph / Twitter Summary Large Image):</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                1200 x 630 HD
              </span>
            </div>

            <div className="rounded-3xl bg-[#060913] border border-purple-500/30 overflow-hidden shadow-2xl">
              {/* Large Image Header */}
              <div className="relative aspect-[16/9] w-full bg-black/70 overflow-hidden">
                <img
                  src={posterImg}
                  alt={targetMedia.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      targetMedia.backdropPath ||
                      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-90" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-xs font-black font-['Cairo'] shadow-lg">
                    {workTypeLabel}
                  </span>
                  {isTargetEpisode && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-black text-xs font-black font-['Cairo'] shadow-lg">
                      الموسم {targetSeason} • الحلقة {targetEpisode}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 left-3 text-right">
                  <h4 className="text-base sm:text-lg font-black text-white font-['Cairo'] drop-shadow-md">
                    {mainTitle}
                  </h4>
                </div>
              </div>

              {/* Card Footer Text */}
              <div className="p-4 space-y-2 text-right">
                <p className="text-xs text-gray-300 font-['Cairo'] line-clamp-3 leading-relaxed">
                  <span className="text-amber-400 font-bold ml-1">ملخص الأحداث والقصة:</span>
                  {rawStory}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 font-mono" dir="ltr">
                  <span>cineview.xo.je</span>
                  <span className="text-purple-400 font-bold">نافذة السينما VIP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. INSPECTOR SIMULATION CARD (When Inspector Tab is Active & Loaded) */}
        {activeTab === 'inspector' && inspectedMedia && (
          <div className="p-4 rounded-3xl bg-[#060913] border border-amber-500/30 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-['Cairo']">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>نتيجة فحص الرابط ومعاينة البطاقة بنجاح:</span>
            </div>
            <div className="flex items-start gap-3">
              <img
                src={posterImg}
                alt={targetMedia.title}
                className="w-16 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm font-black text-white font-['Cairo'] line-clamp-1">{mainTitle}</h4>
                <p className="text-[11px] text-gray-300 font-['Cairo'] line-clamp-2">{storyExcerpt}</p>
                <span className="text-[10px] text-amber-300 font-mono truncate block" dir="ltr">{canonicalUrl}</span>
              </div>
            </div>
          </div>
        )}

        {/* Native Mobile Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            id="btn-native-web-share"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white text-xs font-black font-['Cairo'] shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الرابط والبطاقة عبر جميع تطبيقات الهاتف (Share)</span>
          </button>
        )}

        {/* Clean Canonical URL Copy Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-mono" dir="ltr">
              {canonicalPath}
            </span>
            <label className="block text-xs font-bold text-gray-300 font-['Cairo']">
              الرابط اللاتيني النظيف والمباشر:
            </label>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#060913] border border-white/15 focus-within:border-amber-400 transition-colors">
            <button
              id="btn-copy-canonical-url"
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-xl text-xs font-black font-['Cairo'] flex items-center gap-1.5 transition-all shadow-md flex-shrink-0 cursor-pointer ${
                copiedUrl
                  ? 'bg-emerald-600 text-white'
                  : copyError
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
              }`}
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم نسخ الرابط ✓</span>
                </>
              ) : copyError ? (
                <span>فشل النسخ</span>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
            <input
              id="input-canonical-share-url"
              type="text"
              readOnly
              value={canonicalUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              dir="ltr"
              className="w-full bg-transparent text-xs text-gray-300 font-mono focus:outline-none px-2 select-all"
            />
          </div>
        </div>

        {/* Social Share Shortcuts */}
        <div className="space-y-2 pt-1">
          <span className="block text-xs font-bold text-gray-400 font-['Cairo']">
            مشاركة سريعة عبر وسائل التواصل:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Telegram */}
            <a
              id="share-link-telegram"
              href={`https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(mainTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 text-sky-400 border border-sky-500/30 text-xs font-bold font-['Cairo'] transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>تيليجرام</span>
            </a>

            {/* Facebook */}
            <a
              id="share-link-facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 text-xs font-bold font-['Cairo'] transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>فيسبوك</span>
            </a>

            {/* X / Twitter */}
            <a
              id="share-link-x"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(mainTitle)}&url=${encodeURIComponent(canonicalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gray-600/15 hover:bg-gray-600/25 text-gray-200 border border-gray-500/30 text-xs font-bold font-['Cairo'] transition-colors cursor-pointer"
            >
              <span className="font-mono font-bold text-sm">𝕏</span>
              <span>تويتر</span>
            </a>
          </div>
        </div>

        {/* Footer Security Notice */}
        <div className="pt-2 text-center border-t border-white/5">
          <p className="text-[11px] text-gray-400 font-['Cairo']">
            🔒 بطاقة المعاينة متوافقة كلياً مع معايير OpenGraph و Twitter Cards لتظهر الصورة ورقم الحلقة والقصة تلقائياً في كافة التطبيقات.
          </p>
        </div>
      </div>
    </div>
  );
};
