import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { Media, Episode, Season, CastMember, WatchProgress } from '../types';
import { tmdbService } from '../services/tmdb/TmdbService';
import { libraryManager } from '../library/LibraryManager';
import { ServerSelector } from '../components/ServerSelector';
import { MediaCard } from '../components/MediaCard';
import { colors, typography, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface DetailsScreenProps {
  media: Media;
  onBack: () => void;
  onPlay: (media: Media, season?: number, episode?: number) => void;
  onSelectSimilar: (item: Media) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  media: initialMedia,
  onBack,
  onPlay,
  onSelectSimilar,
}) => {
  const [media, setMedia] = useState<Media>(initialMedia);
  const [loading, setLoading] = useState(true);

  // Favorites & Watchlist
  const [isFav, setIsFav] = useState(libraryManager.isFavorite(initialMedia.id));
  const [isWl, setIsWl] = useState(libraryManager.isInWatchlist(initialMedia.id));

  // TV Shows & Seasons
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Active watch progress for movie or current episode
  const [watchProgress, setWatchProgress] = useState<WatchProgress | undefined>(
    libraryManager.getProgress(initialMedia.id)
  );

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      setLoading(true);
      const full = await tmdbService.getDetails(initialMedia.id, initialMedia.mediaType);
      if (isMounted) {
        if (full) {
          setMedia(full);
          if (full.seasons && full.seasons.length > 0) {
            const firstRegularSeason = full.seasons.find((s) => s.seasonNumber > 0) || full.seasons[0];
            setSelectedSeason(firstRegularSeason.seasonNumber);
          }
        }
        setLoading(false);
      }
    }
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [initialMedia.id, initialMedia.mediaType]);

  // Load episodes when season changes
  useEffect(() => {
    if (media.mediaType === 'tv' || media.mediaType === 'anime') {
      setLoadingEpisodes(true);
      tmdbService.getSeasonEpisodes(media.id, selectedSeason).then((eps) => {
        setEpisodes(eps);
        setLoadingEpisodes(false);
      });
    }
  }, [media.id, media.mediaType, selectedSeason]);

  const toggleFavorite = () => {
    const next = libraryManager.toggleFavorite(media);
    setIsFav(next);
  };

  const toggleWatchlist = () => {
    const next = libraryManager.toggleWatchlist(media);
    setIsWl(next);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch "${media.title}" on HDOFLIX in 4K HDR!`,
        url: `https://hdoflix.com/watch/${media.mediaType}/${media.id}`,
      });
    } catch {
      // Ignore
    }
  };

  const isTv = media.mediaType === 'tv' || media.mediaType === 'anime';

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Hero Backdrop Canvas */}
      <View style={styles.backdropContainer}>
        {media.backdropPath || media.posterPath ? (
          <Image
            source={{ uri: media.backdropPath || media.posterPath || '' }}
            style={styles.backdrop}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.backdrop, styles.placeholderBackdrop]} />
        )}

        <View style={styles.backdropOverlay}>
          {/* Top Floating Back & Share Buttons */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
              <Text style={styles.circleBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
              <Text style={styles.circleBtnText}>↗</Text>
            </TouchableOpacity>
          </View>

          {/* Central Play Action */}
          <TouchableOpacity
            style={styles.centralPlayBtn}
            onPress={() => onPlay(media, isTv ? selectedSeason : undefined, isTv ? 1 : undefined)}
          >
            <Text style={styles.centralPlayIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Header Info & Poster */}
      <View style={styles.headerInfoSection}>
        <View style={styles.posterWrapper}>
          {media.posterPath ? (
            <Image source={{ uri: media.posterPath }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Text style={styles.posterPlaceholderText}>HDOFLIX</Text>
            </View>
          )}
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{media.title}</Text>
          {media.originalTitle && media.originalTitle !== media.title && (
            <Text style={styles.originalTitle}>{media.originalTitle}</Text>
          )}

          {/* Metadata Badges: Year, Rating, Runtime, Quality */}
          <View style={styles.metaRow}>
            {media.releaseYear && <Text style={styles.metaBadge}>{media.releaseYear}</Text>}
            <View style={styles.ratingBadge}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingValue}>{media.voteAverage.toFixed(1)}</Text>
            </View>
            {media.runtimeMinutes && (
              <Text style={styles.metaBadge}>{media.runtimeMinutes} {t('details.minute')}</Text>
            )}
            <Text style={styles.qualityBadge}>4K UHD</Text>
          </View>

          {/* Genre Tags */}
          <View style={styles.genreTagsRow}>
            {media.genres.slice(0, 3).map((g) => (
              <View key={g.id} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{g.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick Action Buttons Row: Watch, Favorite, Watchlist, Share */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.primaryWatchBtn}
          onPress={() => onPlay(media, isTv ? selectedSeason : undefined, isTv ? 1 : undefined)}
        >
          <Text style={styles.primaryWatchIcon}>▶</Text>
          <Text style={styles.primaryWatchText}>{t('details.watchNow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryActionBtn, isFav && styles.activeActionBtn]}
          onPress={toggleFavorite}
        >
          <Text style={styles.actionIcon}>{isFav ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionBtnLabel}>{isFav ? t('details.inFavorites') : t('details.addFavorites')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryActionBtn, isWl && styles.activeActionBtn]}
          onPress={toggleWatchlist}
        >
          <Text style={styles.actionIcon}>{isWl ? '🔖' : '➕'}</Text>
          <Text style={styles.actionBtnLabel}>{isWl ? t('details.inWatchlist') : t('details.addWatchlist')}</Text>
        </TouchableOpacity>
      </View>

      {/* Server Selector Integration with Fallback */}
      <View style={styles.serverSection}>
        <ServerSelector
          media={media}
          season={isTv ? selectedSeason : undefined}
          episode={isTv ? 1 : undefined}
          onSelectServer={(_server) => {
            onPlay(media, isTv ? selectedSeason : undefined, isTv ? 1 : undefined);
          }}
        />
      </View>

      {/* Story Overview */}
      {media.overview ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{t('details.story')}</Text>
          <Text style={styles.storyText}>{media.overview}</Text>
        </View>
      ) : null}

      {/* TV Seasons & Episode List */}
      {isTv && media.seasons && media.seasons.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{t('details.seasons')}</Text>

          {/* Season Selector Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonTabs}>
            {media.seasons.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.seasonTab, selectedSeason === s.seasonNumber && styles.seasonTabActive]}
                onPress={() => setSelectedSeason(s.seasonNumber)}
              >
                <Text
                  style={[
                    styles.seasonTabText,
                    selectedSeason === s.seasonNumber && styles.seasonTabTextActive,
                  ]}
                >
                  {t('details.season')} {s.seasonNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Episodes List */}
          {loadingEpisodes ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.episodesContainer}>
              {episodes.map((ep) => {
                const epProgress = libraryManager.getProgress(media.id, selectedSeason, ep.episodeNumber);
                const isWatched = epProgress?.watched;

                return (
                  <TouchableOpacity
                    key={ep.id}
                    style={styles.episodeCard}
                    activeOpacity={0.8}
                    onPress={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                  >
                    <View style={styles.episodeStillWrapper}>
                      {ep.stillPath ? (
                        <Image source={{ uri: ep.stillPath }} style={styles.episodeStill} resizeMode="cover" />
                      ) : (
                        <View style={[styles.episodeStill, styles.placeholderStill]}>
                          <Text style={styles.stillPlayIcon}>▶</Text>
                        </View>
                      )}
                      {isWatched && (
                        <View style={styles.watchedBadge}>
                          <Text style={styles.watchedBadgeText}>✓ تم</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.episodeMeta}>
                      <Text style={styles.episodeNumber}>
                        {t('details.episode')} {ep.episodeNumber}
                      </Text>
                      <Text numberOfLines={1} style={styles.episodeTitle}>
                        {ep.title}
                      </Text>
                      <Text numberOfLines={2} style={styles.episodeOverview}>
                        {ep.overview || 'لا يوجد ملخص متاح لهذه الحلقة'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Cast Carousel */}
      {media.cast && media.cast.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{t('details.cast')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castRow}>
            {media.cast.map((actor: CastMember) => (
              <View key={actor.id} style={styles.actorCard}>
                {actor.profilePath ? (
                  <Image source={{ uri: actor.profilePath }} style={styles.actorImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.actorImage, styles.actorPlaceholder]}>
                    <Text style={styles.actorPlaceholderText}>👤</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={styles.actorName}>{actor.name}</Text>
                <Text numberOfLines={1} style={styles.characterName}>{actor.character}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Production Companies & Networks */}
      {media.companies && media.companies.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{t('details.companies')}</Text>
          <View style={styles.companyPillsRow}>
            {media.companies.map((c) => (
              <View key={c.id} style={styles.companyPill}>
                <Text style={styles.companyText}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recommendations & Similar */}
      {media.recommendations && media.recommendations.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{t('details.recommendations')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
            {media.recommendations.map((item) => (
              <MediaCard key={item.id} media={item} onPress={onSelectSimilar} width={115} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdropContainer: {
    width: SCREEN_WIDTH,
    height: Math.round(SCREEN_WIDTH * 0.62),
    position: 'relative',
    backgroundColor: '#090B10',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  placeholderBackdrop: {
    backgroundColor: '#10141D',
  },
  backdropOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(14, 16, 21, 0.45)',
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  circleBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  centralPlayBtn: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centralPlayIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 3,
  },
  headerInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -30,
    gap: 14,
  },
  posterWrapper: {
    width: 105,
    height: 155,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#252F42',
    backgroundColor: '#121620',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    color: '#4B5872',
    fontWeight: '800',
    fontSize: 11,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 2,
  },
  originalTitle: {
    color: '#8A97AC',
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  metaBadge: {
    color: '#CBD5E1',
    fontSize: 11,
    backgroundColor: '#1B2230',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starIcon: {
    color: '#FFC107',
    fontSize: 11,
    marginRight: 2,
  },
  ratingValue: {
    color: '#FFC107',
    fontSize: 11,
    fontWeight: '800',
  },
  qualityBadge: {
    backgroundColor: '#E50914',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  genreTag: {
    backgroundColor: '#161C26',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#263143',
  },
  genreTagText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 16,
    gap: 10,
  },
  primaryWatchBtn: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: borderRadius.sm,
    gap: 8,
  },
  primaryWatchIcon: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  primaryWatchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#263143',
    paddingVertical: 8,
  },
  activeActionBtn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  actionIcon: {
    fontSize: 15,
    marginBottom: 2,
  },
  actionBtnLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  serverSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionBlock: {
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  sectionHeading: {
    ...typography.titleMedium,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 10,
  },
  storyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },
  seasonTabs: {
    gap: 8,
    marginBottom: 14,
  },
  seasonTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#141822',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#222938',
  },
  seasonTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seasonTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  seasonTabTextActive: {
    color: '#FFFFFF',
  },
  episodesContainer: {
    gap: 10,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#131722',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#202738',
    padding: 8,
    gap: 10,
  },
  episodeStillWrapper: {
    width: 100,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#090B10',
  },
  episodeStill: {
    width: '100%',
    height: '100%',
  },
  placeholderStill: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stillPlayIcon: {
    color: '#55637B',
    fontSize: 16,
  },
  watchedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  watchedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  episodeMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeNumber: {
    color: '#FFC107',
    fontSize: 11,
    fontWeight: '700',
  },
  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  episodeOverview: {
    color: '#76859B',
    fontSize: 11,
    lineHeight: 15,
  },
  castRow: {
    gap: 12,
  },
  actorCard: {
    width: 75,
    alignItems: 'center',
  },
  actorImage: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#161B26',
    marginBottom: 6,
  },
  actorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actorPlaceholderText: {
    fontSize: 24,
  },
  actorName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  characterName: {
    color: '#76859B',
    fontSize: 10,
    textAlign: 'center',
  },
  companyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  companyPill: {
    backgroundColor: '#141822',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#242C3C',
  },
  companyText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  similarRow: {
    gap: 10,
  },
});
