import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Media } from '../models/types';
import { colors, borderRadius } from '../theme/theme';

interface MediaCardProps {
  media: Media;
  onPress: (media: Media) => void;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.32);
const CARD_HEIGHT = Math.round(DEFAULT_CARD_WIDTH * 1.5);

export const MediaCard: React.FC<MediaCardProps> = ({ media, onPress, width = DEFAULT_CARD_WIDTH }) => {
  const height = Math.round(width * 1.5);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(media)}
      style={[styles.container, { width }]}
    >
      <View style={[styles.posterContainer, { width, height }]}>
        {media.posterPath ? (
          <Image
            source={{ uri: media.posterPath }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Text style={styles.placeholderText}>HDOFLIX</Text>
          </View>
        )}

        {/* Rating Badge */}
        {media.voteAverage > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{media.voteAverage.toFixed(1)}</Text>
          </View>
        )}

        {/* Media Type Badge (TV / MOVIE) */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{media.mediaType === 'tv' ? 'TV' : 'HD'}</Text>
        </View>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {media.titleAr || media.title}
      </Text>

      {media.releaseYear && (
        <Text style={styles.year}>{media.releaseYear}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    marginBottom: 10,
  },
  posterContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  ratingStar: {
    color: colors.accentGold,
    fontSize: 10,
    marginRight: 2,
  },
  ratingText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  typeText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '900',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'left',
  },
  year: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
