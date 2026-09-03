import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { WatchProgress } from '../types';
import { colors, borderRadius, typography } from '../theme/theme';
import { t } from '../i18n';

interface ContinueWatchingRowProps {
  items: WatchProgress[];
  onResume: (item: WatchProgress) => void;
  onRestart: (item: WatchProgress) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.58);

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  onResume,
  onRestart,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>▶ {t('home.continueWatching')}</Text>
        <Text style={styles.badge}>{items.length}</Text>
      </View>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => `${item.mediaId}_${item.seasonNumber || 0}_${item.episodeNumber || 0}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const percent = item.durationSeconds > 0
            ? Math.min(100, Math.round((item.positionSeconds / item.durationSeconds) * 100))
            : 0;

          const episodeInfo = item.seasonNumber
            ? `S${item.seasonNumber} E${item.episodeNumber || 1}`
            : null;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => onResume(item)}
            >
              <View style={styles.imageContainer}>
                {item.backdropPath || item.posterPath ? (
                  <Image
                    source={{ uri: item.backdropPath || item.posterPath || '' }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.placeholder]}>
                    <Text style={styles.placeholderText}>HDOFLIX</Text>
                  </View>
                )}

                {/* Play Button Overlay */}
                <View style={styles.playOverlay}>
                  <View style={styles.playCircle}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>

                {/* Episode Badge if TV */}
                {episodeInfo && (
                  <View style={styles.episodeBadge}>
                    <Text style={styles.episodeText}>{episodeInfo}</Text>
                  </View>
                )}

                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                </View>
              </View>

              <View style={styles.infoContainer}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {item.title}
                </Text>
                <View style={styles.progressRow}>
                  <Text style={styles.percentText}>{percent}% مكتمل</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => onRestart(item)}
                  >
                    <Text style={styles.restartBtn}>من البداية ↺</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  title: {
    ...typography.titleMedium,
    color: colors.primary,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#1E2330',
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    backgroundColor: '#141822',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222B3D',
  },
  imageContainer: {
    width: '100%',
    height: Math.round(CARD_WIDTH * 0.56),
    position: 'relative',
    backgroundColor: '#090B10',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#333F55',
    fontWeight: '700',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 2,
  },
  episodeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeText: {
    color: '#FFC107',
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  infoContainer: {
    padding: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  restartBtn: {
    color: '#40C4FF',
    fontSize: 11,
    fontWeight: '600',
  },
});
