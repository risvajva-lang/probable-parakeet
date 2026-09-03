import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Media } from '../types';
import { tmdbService } from '../services/tmdb/TmdbService';
import { useDebounce } from '../hooks/useDebounce';
import { MediaCard } from '../components/MediaCard';
import { colors, typography, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface SearchScreenProps {
  onMediaSelect: (media: Media) => void;
}

const GENRES = [
  { id: 0, name: 'الكل' },
  { id: 28, name: 'حركة (Action)' },
  { id: 12, name: 'مغامرة' },
  { id: 16, name: 'أنمي ورسوم متحركة' },
  { id: 35, name: 'كوميديا' },
  { id: 80, name: 'جريمة' },
  { id: 18, name: 'دراما' },
  { id: 14, name: 'خيال (Fantasy)' },
  { id: 27, name: 'رعب' },
  { id: 878, name: 'خيال علمي (Sci-Fi)' },
  { id: 53, name: 'إثارة وتشويق' },
];

const YEARS = [0, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
const RATINGS = [0, 8.5, 8.0, 7.5, 7.0, 6.0];
const COUNTRIES = [
  { code: '', label: 'كل الدول' },
  { code: 'US', label: 'أمريكا' },
  { code: 'EG', label: 'مصر' },
  { code: 'KR', label: 'كوريا' },
  { code: 'JP', label: 'اليابان' },
  { code: 'TR', label: 'تركيا' },
  { code: 'IN', label: 'الهند' },
  { code: 'GB', label: 'بريطانيا' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round((SCREEN_WIDTH - 48) / 3);

export const SearchScreen: React.FC<SearchScreenProps> = ({ onMediaSelect }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = useCallback(
    async (currentPage: number, isNewSearch: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const response = await tmdbService.searchFiltered({
          query: debouncedQuery,
          mediaType: selectedType,
          genreId: selectedGenre > 0 ? selectedGenre : undefined,
          year: selectedYear > 0 ? selectedYear : undefined,
          country: selectedCountry || undefined,
          minRating: selectedRating > 0 ? selectedRating : undefined,
          page: currentPage,
        });

        if (isNewSearch) {
          setResults(response.results);
        } else {
          setResults((prev) => [...prev, ...response.results]);
        }
        setHasMore(currentPage < response.totalPages);
      } catch (err: any) {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, selectedType, selectedGenre, selectedYear, selectedCountry, selectedRating]
  );

  useEffect(() => {
    setPage(1);
    executeSearch(1, true);
  }, [executeSearch]);

  const loadNextPage = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      executeSearch(nextPage, false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.placeholder')}
          placeholderTextColor="#788293"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type Tabs: All, Movies, TV, Anime */}
      <View style={styles.typeTabsRow}>
        {(['all', 'movie', 'tv', 'anime'] as const).map((type) => {
          const isSelected = selectedType === type;
          const label =
            type === 'all'
              ? t('search.all')
              : type === 'movie'
              ? t('search.movies')
              : type === 'tv'
              ? t('search.tvShows')
              : t('search.anime');

          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeTab, isSelected && styles.typeTabActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeTabText, isSelected && styles.typeTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Horizontal Pills */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsContainer}>
          {/* Genre Filters */}
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[styles.pill, selectedGenre === g.id && styles.pillActive]}
              onPress={() => setSelectedGenre(g.id)}
            >
              <Text style={[styles.pillText, selectedGenre === g.id && styles.pillTextActive]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Secondary filter chips: Country, Year, Rating */}
      <View style={styles.secondaryFiltersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsContainer}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.smallPill, selectedCountry === c.code && styles.smallPillActive]}
              onPress={() => setSelectedCountry(c.code)}
            >
              <Text style={[styles.smallPillText, selectedCountry === c.code && styles.smallPillTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.smallPill, selectedYear === y && styles.smallPillActive]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[styles.smallPillText, selectedYear === y && styles.smallPillTextActive]}>
                {y === 0 ? 'كل السنوات' : y}
              </Text>
            </TouchableOpacity>
          ))}
          {RATINGS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.smallPill, selectedRating === r && styles.smallPillActive]}
              onPress={() => setSelectedRating(r)}
            >
              <Text style={[styles.smallPillText, selectedRating === r && styles.smallPillTextActive]}>
                {r === 0 ? 'كل التقييمات' : `★ ${r}+`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultInfoRow}>
        <Text style={styles.resultCountText}>
          {results.length} {t('search.resultsCount')}
        </Text>
      </View>

      {/* Content Area */}
      {loading && results.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>{t('search.searching')}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => executeSearch(1, true)}>
            <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.stateText}>{t('search.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <MediaCard media={item} onPress={onMediaSelect} width={CARD_WIDTH} />
          )}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    borderRadius: borderRadius.md,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#263145',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: colors.textPrimary,
    fontSize: 14,
  },
  clearIcon: {
    color: '#8A97AC',
    fontSize: 14,
    padding: 4,
  },
  typeTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#121620',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#1E2535',
  },
  typeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeTabText: {
    color: '#8A97AC',
    fontSize: 12,
    fontWeight: '700',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
  },
  filterScrollWrapper: {
    marginBottom: 6,
  },
  filterPillsContainer: {
    paddingHorizontal: 16,
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#141A25',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242E40',
  },
  pillActive: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  pillText: {
    color: '#9EABB8',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  secondaryFiltersRow: {
    marginBottom: 10,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0F141E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B2433',
  },
  smallPillActive: {
    backgroundColor: '#303D54',
    borderColor: '#4A5E82',
  },
  smallPillText: {
    color: '#7B899C',
    fontSize: 11,
  },
  smallPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultInfoRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCountText: {
    color: '#657385',
    fontSize: 11,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  stateText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
