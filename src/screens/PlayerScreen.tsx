import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Media, VideoSource, Subtitle, AudioTrack } from '../types';
import { providerManager } from '../providers/ProviderManager';
import { serverManager } from '../resolver/ServerManager';
import { subtitleService } from '../subtitles/SubtitleService';
import { ExternalPlayerHelper } from '../utils/externalPlayer';
import { useWatchProgress } from '../hooks/useWatchProgress';
import { colors, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface PlayerScreenProps {
  media: Media;
  initialSeason?: number;
  initialEpisode?: number;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onNextEpisode,
  onPrevEpisode,
}) => {
  const isTv = media.mediaType === 'tv' || media.mediaType === 'anime';
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);

  // Stream Resolution State
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [currentSource, setCurrentSource] = useState<VideoSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7200); // 2 hours default in seconds
  const [speed, setSpeed] = useState(1.0);
  const [quality, setQuality] = useState<'4K' | '1080p' | '720p' | '480p' | 'Auto'>('1080p');

  // Subtitles & Audio
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSub, setSelectedSub] = useState<Subtitle | null>(null);
  const [subDelay, setSubDelay] = useState(0); // in seconds
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);

  // Watch Progress Hook
  const { progress, saveProgress } = useWatchProgress(
    media.id,
    isTv ? currentSeason : undefined,
    isTv ? currentEpisode : undefined
  );

  // Initial stream resolution
  useEffect(() => {
    let isMounted = true;
    async function resolveStreams() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const resolved = await providerManager.resolveAll({
          tmdbId: media.id,
          type: media.mediaType,
          season: isTv ? currentSeason : undefined,
          episode: isTv ? currentEpisode : undefined,
          imdbId: media.imdbId,
        });

        if (isMounted) {
          if (resolved.length > 0) {
            setSources(resolved);
            setCurrentSource(resolved[0]);

            // Audio tracks
            if (resolved[0].audioTracks && resolved[0].audioTracks.length > 0) {
              setAudioTracks(resolved[0].audioTracks);
              setSelectedAudio(resolved[0].audioTracks[0]);
            } else {
              setAudioTracks([
                { id: 'orig', label: 'الصوت الأصلي (Original)', language: 'en', isDefault: true },
                { id: 'ar_dub', label: 'دبلجة عربية (Arabic Dub)', language: 'ar', isDub: true },
              ]);
            }
          } else {
            setErrorMessage('لم يتم العثور على خوادم نشطة لهذا العمل حالياً');
          }
        }

        // Subtitles
        const subs = subtitleService.getDefaultTracks(media);
        if (isMounted) {
          setSubtitles(subs);
          setSelectedSub(subtitleService.selectBestSubtitle(subs));
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(t('player.streamError'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    resolveStreams();

    // Resume progress if exists
    if (progress && progress.positionSeconds > 0) {
      setCurrentTime(progress.positionSeconds);
    }

    return () => {
      isMounted = false;
    };
  }, [media.id, currentSeason, currentEpisode]);

  // Periodic Watch Progress Saving & Simulation
  useEffect(() => {
    if (!isPlaying || loading || errorMessage) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = Math.min(duration, prev + 1);
        if (next % 5 === 0) {
          saveProgress(
            media.title,
            media.posterPath,
            next,
            duration,
            media.mediaType,
            media.backdropPath
          );
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, loading, errorMessage, duration]);

  // Auto Fallback on Failure
  const handleStreamErrorAndFallback = () => {
    const nextHealthy = serverManager.triggerAutoFallback();
    if (nextHealthy) {
      // Switch to next source
      const nextSource = sources.find((s) => s.server.includes(nextHealthy.name)) || sources[1] || sources[0];
      setCurrentSource(nextSource);
      setErrorMessage(null);
    } else {
      setErrorMessage('تعذر الاتصال بجميع الخوادم المتاحة. يرجى تجربة المشغل الخارجي.');
    }
  };

  const handleSkipIntro = () => {
    setCurrentTime((prev) => Math.min(duration, prev + 85));
  };

  const handleSeek = (deltaSeconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + deltaSeconds)));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Content Canvas */}
      <View style={styles.videoCanvas}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>{t('player.loadingStream')}</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.errorBtnRow}>
              <TouchableOpacity style={styles.retryBtn} onPress={handleStreamErrorAndFallback}>
                <Text style={styles.retryBtnText}>التبديل إلى سيرفر بديل ↻</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.externalBtn}
                onPress={() => setShowExternalModal(true)}
              >
                <Text style={styles.externalBtnText}>تشغيل عبر VLC / MX</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.streamPlayerBox}>
            {/* Native player canvas */}
            <View style={styles.streamMockPlayer}>
              <Text style={styles.mockPlayerLogo}>HDOFLIX 4K EXO-PLAYER</Text>
              <Text style={styles.mockServerTag}>
                {currentSource?.server} • {currentSource?.quality} • {speed}x
              </Text>

              {/* Subtitle Display */}
              {selectedSub && (
                <View style={styles.subtitleOverlay}>
                  <Text style={styles.subtitleText}>
                    [ترجمة: {selectedSub.label} • {subDelay !== 0 ? `${subDelay}ث` : ''}]
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Top Controls Bar */}
      <View style={styles.topControlBar}>
        <View style={styles.titleCol}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backBtnText}>✕ إغلاق</Text>
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.videoTitle}>
            {media.title} {isTv ? `(S${currentSeason}E${currentEpisode})` : ''}
          </Text>
        </View>

        <View style={styles.topActionsRow}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => setShowServerModal(true)}>
            <Text style={styles.topActionText}>🌐 السيرفر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => setShowSettingsModal(true)}>
            <Text style={styles.topActionText}>⚙️ الإعدادات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => setShowExternalModal(true)}>
            <Text style={styles.topActionText}>📱 خارجي</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Skip Intro Button */}
      {currentTime < 180 && !loading && (
        <TouchableOpacity style={styles.skipIntroBtn} onPress={handleSkipIntro}>
          <Text style={styles.skipIntroText}>⏩ {t('player.skipIntro')}</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Controls Bar */}
      <View style={styles.bottomControlBar}>
        {/* Progress Timeline Slider */}
        <View style={styles.timelineRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.progressBarWrapper}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (currentTime / duration) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Action Controls: Seek, Play/Pause, Episodes, Audio/Sub */}
        <View style={styles.mainControlsRow}>
          {/* Previous Episode */}
          {isTv && (
            <TouchableOpacity
              style={styles.controlIconBtn}
              onPress={() => {
                if (currentEpisode > 1) {
                  setCurrentEpisode((e) => e - 1);
                  setCurrentTime(0);
                }
              }}
            >
              <Text style={styles.controlIconText}>⏮️</Text>
            </TouchableOpacity>
          )}

          {/* Seek -10s */}
          <TouchableOpacity style={styles.controlIconBtn} onPress={() => handleSeek(-10)}>
            <Text style={styles.controlIconText}>⏪ 10ث</Text>
          </TouchableOpacity>

          {/* Play / Pause Toggle */}
          <TouchableOpacity
            style={styles.playPauseCircle}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          {/* Seek +10s */}
          <TouchableOpacity style={styles.controlIconBtn} onPress={() => handleSeek(10)}>
            <Text style={styles.controlIconText}>10ث ⏩</Text>
          </TouchableOpacity>

          {/* Next Episode */}
          {isTv && (
            <TouchableOpacity
              style={styles.controlIconBtn}
              onPress={() => {
                setCurrentEpisode((e) => e + 1);
                setCurrentTime(0);
              }}
            >
              <Text style={styles.controlIconText}>⏭️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Settings Modal (Quality, Speed, Subtitles, Audio) */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إعدادات المشغل والصوت والترجمة</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Quality Selection */}
              <Text style={styles.modalSectionLabel}>{t('player.quality')}</Text>
              <View style={styles.modalPillsRow}>
                {(['4K', '1080p', '720p', '480p', 'Auto'] as const).map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.modalPill, quality === q && styles.modalPillActive]}
                    onPress={() => setQuality(q)}
                  >
                    <Text style={[styles.modalPillText, quality === q && styles.modalPillTextActive]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Playback Speed Selection */}
              <Text style={styles.modalSectionLabel}>{t('player.speed')}</Text>
              <View style={styles.modalPillsRow}>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalPill, speed === s && styles.modalPillActive]}
                    onPress={() => setSpeed(s)}
                  >
                    <Text style={[styles.modalPillText, speed === s && styles.modalPillTextActive]}>
                      {s}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Audio & Dub Track */}
              <Text style={styles.modalSectionLabel}>{t('player.audioLanguage')}</Text>
              {audioTracks.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.trackItem, selectedAudio?.id === track.id && styles.trackItemActive]}
                  onPress={() => setSelectedAudio(track)}
                >
                  <Text style={styles.trackItemText}>
                    {track.label} {track.isDub ? '🎙️' : '🔊'}
                  </Text>
                  {selectedAudio?.id === track.id && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              ))}

              {/* Subtitle Track */}
              <Text style={styles.modalSectionLabel}>{t('player.subtitles')}</Text>
              <TouchableOpacity
                style={[styles.trackItem, selectedSub === null && styles.trackItemActive]}
                onPress={() => setSelectedSub(null)}
              >
                <Text style={styles.trackItemText}>إيقاف الترجمة (Off)</Text>
                {selectedSub === null && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
              {subtitles.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.trackItem, selectedSub?.id === sub.id && styles.trackItemActive]}
                  onPress={() => setSelectedSub(sub)}
                >
                  <Text style={styles.trackItemText}>{sub.label}</Text>
                  {selectedSub?.id === sub.id && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              ))}

              {/* Subtitle Delay Sync */}
              <Text style={styles.modalSectionLabel}>{t('player.subtitleDelay')} ({subDelay}s)</Text>
              <View style={styles.modalPillsRow}>
                {[-2, -1, 0, 1, 2].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.modalPill, subDelay === d && styles.modalPillActive]}
                    onPress={() => setSubDelay(d)}
                  >
                    <Text style={[styles.modalPillText, subDelay === d && styles.modalPillTextActive]}>
                      {d > 0 ? `+${d}s` : `${d}s`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Server Selection Modal */}
      <Modal visible={showServerModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>خوادم البث المتاحة (Servers)</Text>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {sources.map((src, idx) => (
                <TouchableOpacity
                  key={`${src.server}_${idx}`}
                  style={[styles.serverOptionRow, currentSource?.server === src.server && styles.serverOptionActive]}
                  onPress={() => {
                    setCurrentSource(src);
                    setShowServerModal(false);
                  }}
                >
                  <View>
                    <Text style={styles.serverOptionName}>{src.server}</Text>
                    <Text style={styles.serverOptionDetails}>{src.provider} • {src.quality} • فائقة السرعة</Text>
                  </View>
                  <Text style={styles.serverBadge}>{src.type.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* External Player Modal (VLC, MX, System) */}
      <Modal visible={showExternalModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: 300 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تشغيل بواسطة مشغل خارجي</Text>
              <TouchableOpacity onPress={() => setShowExternalModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, paddingVertical: 10 }}>
              <TouchableOpacity
                style={styles.externalAppBtn}
                onPress={() => {
                  if (currentSource) ExternalPlayerHelper.openWithPlayer(currentSource.url, 'vlc');
                  setShowExternalModal(false);
                }}
              >
                <Text style={styles.externalAppIcon}>🟧</Text>
                <Text style={styles.externalAppName}>تشغيل عبر VLC Player</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalAppBtn}
                onPress={() => {
                  if (currentSource) ExternalPlayerHelper.openWithPlayer(currentSource.url, 'mx');
                  setShowExternalModal(false);
                }}
              >
                <Text style={styles.externalAppIcon}>🟦</Text>
                <Text style={styles.externalAppName}>تشغيل عبر MX Player</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalAppBtn}
                onPress={() => {
                  if (currentSource) ExternalPlayerHelper.openWithPlayer(currentSource.url, 'system');
                  setShowExternalModal(false);
                }}
              >
                <Text style={styles.externalAppIcon}>📱</Text>
                <Text style={styles.externalAppName}>مشغل النظام الافتراضي (System Player)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  videoCanvas: {
    flex: 1,
    backgroundColor: '#05070B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 12,
  },
  errorOverlay: {
    padding: 24,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  externalBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  externalBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  streamPlayerBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamMockPlayer: {
    width: '90%',
    height: '75%',
    backgroundColor: '#0D111A',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#1E2536',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mockPlayerLogo: {
    color: '#FFC107',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  mockServerTag: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 6,
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subtitleText: {
    color: '#FFEA00',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  topControlBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  topActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  skipIntroBtn: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1.5,
    borderColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipIntroText: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomControlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    width: 44,
  },
  progressBarWrapper: {
    flex: 1,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  mainControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlIconBtn: {
    padding: 6,
  },
  controlIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  playPauseCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111520',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#20293A',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
    padding: 4,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalSectionLabel: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },
  modalPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  modalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#171E2D',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#26334D',
  },
  modalPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalPillTextActive: {
    color: '#FFFFFF',
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161D2A',
    padding: 10,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  trackItemActive: {
    backgroundColor: '#20293C',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  trackItemText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  checkIcon: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  serverOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161E2C',
    padding: 12,
    borderRadius: borderRadius.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222C3E',
  },
  serverOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#212A3D',
  },
  serverOptionName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  serverOptionDetails: {
    color: '#76859B',
    fontSize: 11,
    marginTop: 2,
  },
  serverBadge: {
    backgroundColor: '#E50914',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  externalAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18202D',
    padding: 12,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#28344A',
    gap: 12,
  },
  externalAppIcon: {
    fontSize: 20,
  },
  externalAppName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
