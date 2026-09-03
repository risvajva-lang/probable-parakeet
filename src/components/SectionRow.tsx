import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Media } from '../models/types';
import { MediaCard } from './MediaCard';
import { colors, typography } from '../theme/theme';
import { t } from '../i18n';

interface SectionRowProps {
  title: string;
  items: Media[];
  onMediaPress: (media: Media) => void;
  onSeeAllPress?: () => void;
}

export const SectionRow: React.FC<SectionRowProps> = ({
  title,
  items,
  onMediaPress,
  onSeeAllPress,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MediaCard media={item} onPress={onMediaPress} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    ...typography.titleMedium,
    fontSize: 16,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
