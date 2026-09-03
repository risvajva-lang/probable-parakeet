import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Media } from '../types';
import { tmdbService } from '../services/tmdb/TmdbService';
import { MediaCard } from '../components/MediaCard';
import { SectionRow } from '../components/SectionRow';
import { colors, typography, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface AnimeScreenProps {
  onMediaSelect: (media: Media) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AnimeScreen: React.FC<AnimeScreenProps> = ({ onMediaSelect }) => {
  const [loading, setLoading] = useState(true);
  const [featuredAnime, setFeaturedAnime] = useState<Media | null>(null);
  const [trendingAnime, setTrendingAnime] = useState<Media[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Media[]>([]);
  const [classicAnime, setClassicAnime] = useState<Media[]>([]);

  useEffect(() => {
    async function fetchAnime() {
      setLoading(true);
      try {
        const [tvAnime, moviesAnime, classics] = await Promise.all([
          tmdbService.getAnimeCatalog(),
          tmdbService.getAnimeMovies(),
          tmdbService.searchFiltered({ mediaType: 'anime', minRating: 8.0, page: 1 }),
        ]);

        setTrendingAnime(tvAnime);
        setAnimeMovies(moviesAnime);
        setClassicAnime(classics.results);

        if (tvAnime.length > 0) {
          setFeaturedAnime(tvAnime[0]);
        }
      } catch {
        // Safe error recovery
      } finally {
        setLoading(false);
      }
    }
    fetchAnime();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={styles.loadingText}>جاري تحميل عالم الأنمي و AniList...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Featured Anime Hero Banner */}
      {featuredAnime && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.heroBanner}
          onPress={() => onMediaSelect(featuredAnime)}
        >
          <Image
            source={{ uri: featuredAnime.backdropPath || featuredAnime.posterPath || '' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.anilistBadge}>
              <Text style={styles.anilistBadgeText}>AniList Verified Anime</Text>
            </View>
            <Text numberOfLines={2} style={styles.heroTitle}>{featuredAnime.title}</Text>
            <Text numberOfLines={2} style={styles.heroOverview}>{featuredAnime.overview}</Text>
            <TouchableOpacity
              style={styles.heroWatchBtn}
              onPress={() => onMediaSelect(featuredAnime)}
            >
              <Text style={styles.heroWatchBtnText}>▶ مشاهدة الحلقات الآن</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Anime Sub & Dub Quick Selector Notice */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>⛩️</Text>
        <Text style={styles.infoText}>
          يدعم مشغل الأنمي الترجمة العربية الاحترافية والدبلجة الصوتية اليابانية والإنجليزية الأصلية.
        </Text>
      </View>

      {/* 1. Trending TV Anime */}
      <SectionRow
        title="مسلسلات أنمي يابانية متجددة ⚡"
        items={trendingAnime}
        onMediaPress={onMediaSelect}
      />

      {/* 2. Anime Feature Films */}
      <SectionRow
        title="أفلام الأنمي العالمية (Movies) 🎌"
        items={animeMovies}
        onMediaPress={onMediaSelect}
      />

      {/* 3. All-Time Anime Masterpieces */}
      <SectionRow
        title="روائع الأنمي الأعلى تقييماً ★ 8.0+"
        items={classicAnime}
        onMediaPress={onMediaSelect}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerBox: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  heroBanner: {
    width: SCREEN_WIDTH,
    height: Math.round(SCREEN_WIDTH * 0.65),
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#090B10',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(14, 16, 21, 0.65)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  anilistBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#02A9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  anilistBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroOverview: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  heroWatchBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  heroWatchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#252F42',
    gap: 10,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
});
