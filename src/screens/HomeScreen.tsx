import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Media, WatchProgress, Company, Network } from '../types';
import { tmdbService } from '../services/tmdb/TmdbService';
import { libraryManager } from '../library/LibraryManager';
import { SectionRow } from '../components/SectionRow';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { colors, typography, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface HomeScreenProps {
  onMediaSelect: (media: Media) => void;
  onResumePlay: (progress: WatchProgress) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onMediaSelect,
  onResumePlay,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Watch Progress
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);

  // Carousels
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [trendingTV, setTrendingTV] = useState<Media[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Media[]>([]);
  const [upcoming, setUpcoming] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Media[]>([]);
  const [airingToday, setAiringToday] = useState<Media[]>([]);
  const [returningSeries, setReturningSeries] = useState<Media[]>([]);
  const [allTimeGreats, setAllTimeGreats] = useState<Media[]>([]);

  // Regional & Genre
  const [anime, setAnime] = useState<Media[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Media[]>([]);
  const [arabicMovies, setArabicMovies] = useState<Media[]>([]);
  const [arabicSeries, setArabicSeries] = useState<Media[]>([]);
  const [asianMovies, setAsianMovies] = useState<Media[]>([]);
  const [asianSeries, setAsianSeries] = useState<Media[]>([]);
  const [indianMovies, setIndianMovies] = useState<Media[]>([]);
  const [indianSeries, setIndianSeries] = useState<Media[]>([]);
  const [koreanMovies, setKoreanMovies] = useState<Media[]>([]);
  const [koreanSeries, setKoreanSeries] = useState<Media[]>([]);
  const [japaneseMovies, setJapaneseMovies] = useState<Media[]>([]);
  const [chineseMovies, setChineseMovies] = useState<Media[]>([]);
  const [mexicanMovies, setMexicanMovies] = useState<Media[]>([]);
  const [mexicanSeries, setMexicanSeries] = useState<Media[]>([]);
  const [turkishMovies, setTurkishMovies] = useState<Media[]>([]);
  const [turkishSeries, setTurkishSeries] = useState<Media[]>([]);
  const [westernMovies, setWesternMovies] = useState<Media[]>([]);
  const [westernTV, setWesternTV] = useState<Media[]>([]);

  // Companies & Networks
  const [companies, setCompanies] = useState<Company[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);

  // Hero Featured
  const [featuredItem, setFeaturedItem] = useState<Media | null>(null);

  const loadData = useCallback(async () => {
    try {
      // 1. Load Continue Watching
      setContinueWatching(libraryManager.getContinueWatching());

      // 2. Fetch primary rows
      const [
        trendMoviesRes,
        trendTvRes,
        nowPlayingRes,
        upcomingRes,
        topMoviesRes,
        topTvRes,
      ] = await Promise.all([
        tmdbService.getTrending('movie'),
        tmdbService.getTrending('tv'),
        tmdbService.getNowPlaying(),
        tmdbService.getUpcoming(),
        tmdbService.getTopRated('movie'),
        tmdbService.getTopRated('tv'),
      ]);

      setTrendingMovies(trendMoviesRes);
      setTrendingTV(trendTvRes);
      setNowPlaying(nowPlayingRes);
      setUpcoming(upcomingRes);
      setTopRatedMovies(topMoviesRes);
      setTopRatedTV(topTvRes);

      if (trendMoviesRes.length > 0) {
        setFeaturedItem(trendMoviesRes[0]);
      }

      // 3. Staggered secondary rows
      const [
        airingTodayRes,
        returningRes,
        allTimeRes,
        animeRes,
        animeMoviesRes,
        arabicMRes,
        arabicSRes,
        koreanMRes,
        koreanSRes,
        turkishMRes,
        turkishSRes,
        indianMRes,
        indianSRes,
        asianMRes,
        asianSRes,
        mexicanMRes,
        mexicanSRes,
        westernMRes,
        westernSRes,
      ] = await Promise.all([
        tmdbService.getAiringToday(),
        tmdbService.getReturningSeries(),
        tmdbService.getAllTimeGreats(),
        tmdbService.getAnimeCatalog(),
        tmdbService.getAnimeMovies(),
        tmdbService.getByCountry('EG', 'movie'),
        tmdbService.getByCountry('EG', 'tv'),
        tmdbService.getByCountry('KR', 'movie'),
        tmdbService.getByCountry('KR', 'tv'),
        tmdbService.getByCountry('TR', 'movie'),
        tmdbService.getByCountry('TR', 'tv'),
        tmdbService.getByCountry('IN', 'movie'),
        tmdbService.getByCountry('IN', 'tv'),
        tmdbService.getByCountry('JP', 'movie'),
        tmdbService.getByCountry('JP', 'tv'),
        tmdbService.getByCountry('MX', 'movie'),
        tmdbService.getByCountry('MX', 'tv'),
        tmdbService.getByCountry('US', 'movie'),
        tmdbService.getByCountry('US', 'tv'),
      ]);

      setAiringToday(airingTodayRes);
      setReturningSeries(returningRes);
      setAllTimeGreats(allTimeRes);
      setAnime(animeRes);
      setAnimeMovies(animeMoviesRes);
      setArabicMovies(arabicMRes);
      setArabicSeries(arabicSRes);
      setKoreanMovies(koreanMRes);
      setKoreanSeries(koreanSRes);
      setTurkishMovies(turkishMRes);
      setTurkishSeries(turkishSRes);
      setIndianMovies(indianMRes);
      setIndianSeries(indianSRes);
      setAsianMovies(asianMRes);
      setAsianSeries(asianSRes);
      setJapaneseMovies(asianMRes);
      setChineseMovies(asianMRes);
      setMexicanMovies(mexicanMRes);
      setMexicanSeries(mexicanSRes);
      setWesternMovies(westernMRes);
      setWesternTV(westernSRes);

      setCompanies(tmdbService.getPopularCompanies());
      setNetworks(tmdbService.getPopularNetworks());
    } catch {
      // Graceful error recovery
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = libraryManager.subscribe(() => {
      setContinueWatching(libraryManager.getContinueWatching());
    });
    return unsub;
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Hero Featured Backdrop Banner */}
      {featuredItem && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.heroContainer}
          onPress={() => onMediaSelect(featuredItem)}
        >
          <Image
            source={{ uri: featuredItem.backdropPath || featuredItem.posterPath || '' }}
            style={styles.heroBackdrop}
            resizeMode="cover"
          />
          <View style={styles.heroGradient}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.top10Badge}>
                <Text style={styles.top10Text}>🔥 الأكثر شعبية الآن</Text>
              </View>
              {featuredItem.voteAverage > 0 && (
                <View style={styles.heroRatingBadge}>
                  <Text style={styles.heroRatingStar}>★</Text>
                  <Text style={styles.heroRatingText}>{featuredItem.voteAverage.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <Text numberOfLines={2} style={styles.heroTitle}>
              {featuredItem.title}
            </Text>

            <Text numberOfLines={2} style={styles.heroOverview}>
              {featuredItem.overview}
            </Text>

            <View style={styles.heroButtonRow}>
              <TouchableOpacity
                style={styles.heroPlayButton}
                onPress={() => onMediaSelect(featuredItem)}
              >
                <Text style={styles.heroPlayIcon}>▶</Text>
                <Text style={styles.heroPlayText}>{t('details.watchNow')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroInfoButton}
                onPress={() => onMediaSelect(featuredItem)}
              >
                <Text style={styles.heroInfoText}>ℹ التفاصيل</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* 1. Continue Watching Section */}
      {continueWatching.length > 0 && (
        <ContinueWatchingRow
          items={continueWatching}
          onResume={(item) => onResumePlay(item)}
          onRestart={(item) => onResumePlay({ ...item, positionSeconds: 0 })}
        />
      )}

      {/* 2. Primary Sections */}
      <SectionRow title={t('home.trendingMovies')} items={trendingMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.trendingTV')} items={trendingTV} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.nowPlaying')} items={nowPlaying} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.upcomingMovies')} items={upcoming} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.topRatedMovies')} items={topRatedMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.topRatedTV')} items={topRatedTV} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.airingToday')} items={airingToday} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.returningSeries')} items={returningSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.allTimeGreats')} items={allTimeGreats} onMediaPress={onMediaSelect} />

      {/* 3. Anime Sections */}
      <SectionRow title={t('home.anime')} items={anime} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.animeMovies')} items={animeMovies} onMediaPress={onMediaSelect} />

      {/* 4. Regional & World Cinema */}
      <SectionRow title={t('home.arabicMovies')} items={arabicMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.arabicSeries')} items={arabicSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.koreanMovies')} items={koreanMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.koreanSeries')} items={koreanSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.turkishMovies')} items={turkishMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.turkishSeries')} items={turkishSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.indianMovies')} items={indianMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.indianSeries')} items={indianSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.asianMovies')} items={asianMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.asianSeries')} items={asianSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.japaneseMovies')} items={japaneseMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.chineseMovies')} items={chineseMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.mexicanMovies')} items={mexicanMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.mexicanSeries')} items={mexicanSeries} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.westernMovies')} items={westernMovies} onMediaPress={onMediaSelect} />
      <SectionRow title={t('home.westernTV')} items={westernTV} onMediaPress={onMediaSelect} />

      {/* 5. Production Companies Carousel */}
      {companies.length > 0 && (
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>{t('home.popularCompanies')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
            {companies.map((c) => (
              <View key={c.id} style={styles.brandCard}>
                <Image source={{ uri: c.logoPath || '' }} style={styles.brandLogo} resizeMode="contain" />
                <Text numberOfLines={1} style={styles.brandName}>{c.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 6. Streaming Networks Carousel */}
      {networks.length > 0 && (
        <View style={styles.brandSection}>
          <Text style={styles.brandTitle}>{t('home.popularNetworks')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
            {networks.map((n) => (
              <View key={n.id} style={styles.brandCard}>
                <Image source={{ uri: n.logoPath || '' }} style={styles.brandLogo} resizeMode="contain" />
                <Text numberOfLines={1} style={styles.brandName}>{n.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: Math.round(SCREEN_WIDTH * 0.72),
    position: 'relative',
    marginBottom: 20,
    backgroundColor: '#090B10',
  },
  heroBackdrop: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(14, 16, 21, 0.65)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  top10Badge: {
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  top10Text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  heroRatingStar: {
    color: '#FFC107',
    fontSize: 12,
    marginRight: 3,
  },
  heroRatingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroOverview: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  heroPlayIcon: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  heroPlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  heroInfoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  brandSection: {
    marginBottom: 24,
  },
  brandTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  brandScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brandCard: {
    width: 120,
    height: 65,
    backgroundColor: '#151A24',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#242C3C',
  },
  brandLogo: {
    width: 80,
    height: 35,
  },
  brandName: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
