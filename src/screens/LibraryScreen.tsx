import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Media, WatchProgress } from '../types';
import { libraryManager, LibraryCategory, LibrarySortBy } from '../library/LibraryManager';
import { MediaCard } from '../components/MediaCard';
import { colors, typography, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface LibraryScreenProps {
  onMediaSelect: (media: Media) => void;
  onResumePlay: (progress: WatchProgress) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round((SCREEN_WIDTH - 48) / 3);

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onMediaSelect,
  onResumePlay,
}) => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('latest');
  const [items, setItems] = useState<Media[]>([]);

  const refreshList = () => {
    const list = libraryManager.queryItems(activeCategory, searchQuery, sortBy);
    setItems(list);
  };

  useEffect(() => {
    refreshList();
    const unsub = libraryManager.subscribe(() => {
      refreshList();
    });
    return unsub;
  }, [activeCategory, searchQuery, sortBy]);

  const categories: Array<{ id: LibraryCategory; label: string; icon: string }> = [
    { id: 'favorites', label: t('library.favorites'), icon: '❤️' },
    { id: 'watchlist', label: t('library.watchlist'), icon: '🔖' },
    { id: 'continue_watching', label: t('library.continueWatching'), icon: '▶' },
    { id: 'history', label: t('library.history'), icon: '🕒' },
    { id: 'watched_movies', label: t('library.watchedMovies'), icon: '🎬' },
    { id: 'watched_episodes', label: t('library.watchedEpisodes'), icon: '📺' },
  ];

  return (
    <View style={styles.container}>
      {/* Category Pills Carousel */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={styles.pillIcon}>{cat.icon}</Text>
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* In-Library Search & Sort Bar */}
      <View style={styles.toolsRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('library.searchLibrary')}
            placeholderTextColor="#717E91"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sort Trigger */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => {
            const nextSort: LibrarySortBy =
              sortBy === 'latest' ? 'rating' : sortBy === 'rating' ? 'title' : 'latest';
            setSortBy(nextSort);
          }}
        >
          <Text style={styles.sortBtnText}>
            {sortBy === 'latest' ? '⚡ الأحدث' : sortBy === 'rating' ? '★ التقييم' : '🔤 أبجدياً'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Grid or Empty State */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>
            {activeCategory === 'favorites'
              ? t('library.emptyFavorites')
              : activeCategory === 'watchlist'
              ? t('library.emptyWatchlist')
              : t('library.emptyHistory')}
          </Text>
          <Text style={styles.emptySubtitle}>
            استكشف الأفلام والمسلسلات وأضف أعمالك المفضلة إلى مكتبتك لتجدها في أي وقت!
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${activeCategory}_${item.id}`}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <MediaCard media={item} onPress={onMediaSelect} width={CARD_WIDTH} />
          )}
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
  categoryScrollWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A212E',
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141822',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222B3D',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillIcon: {
    fontSize: 13,
  },
  pillLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  pillLabelActive: {
    color: '#FFFFFF',
  },
  toolsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151922',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#232C3E',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sortBtn: {
    backgroundColor: '#181F2C',
    paddingHorizontal: 12,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#29354A',
  },
  sortBtnText: {
    color: '#FFC107',
    fontSize: 11,
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
