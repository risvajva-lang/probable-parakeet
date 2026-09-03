import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ServerOption } from '../models/types';
import { serverManager } from '../resolver/ServerManager';
import { colors, borderRadius, spacing } from '../theme/theme';

interface ServerSelectorProps {
  servers?: ServerOption[];
  selectedIndex?: number;
  onSelectServer: (indexOrServer: any) => void;
  onAutoFallback?: () => void;
  media?: any;
  season?: number;
  episode?: number;
}

type FilterCategory = 'all' | 'vip' | 'fast' | 'anime' | 'arabic' | 'stream_host';

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  servers: initialServers,
  selectedIndex = 0,
  onSelectServer,
  onAutoFallback,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const servers = initialServers || serverManager.buildServerOptions();

  if (!servers || servers.length === 0) return null;

  // Filter servers based on user selected category
  const filteredServers = useMemo(() => {
    if (selectedCategory === 'all') return servers.map((s, idx) => ({ server: s, originalIndex: idx }));
    if (selectedCategory === 'vip') {
      return servers
        .map((s, idx) => ({ server: s, originalIndex: idx }))
        .filter(({ server }) => server.isVip || server.badge?.includes('VIP') || server.quality === '4K');
    }
    if (selectedCategory === 'anime') {
      return servers
        .map((s, idx) => ({ server: s, originalIndex: idx }))
        .filter(({ server }) => server.category === 'anime' || server.badge === 'ANIME');
    }
    if (selectedCategory === 'arabic') {
      return servers
        .map((s, idx) => ({ server: s, originalIndex: idx }))
        .filter(({ server }) => server.category === 'arabic' || server.badge === 'ARABIC');
    }
    if (selectedCategory === 'stream_host') {
      return servers
        .map((s, idx) => ({ server: s, originalIndex: idx }))
        .filter(({ server }) => server.category === 'stream_host');
    }
    if (selectedCategory === 'fast') {
      return servers
        .map((s, idx) => ({ server: s, originalIndex: idx }))
        .filter(({ server }) => server.priority <= 15 && !server.isVip);
    }
    return servers.map((s, idx) => ({ server: s, originalIndex: idx }));
  }, [servers, selectedCategory]);

  const categories: { key: FilterCategory; label: string; labelAr: string }[] = [
    { key: 'all', label: 'All', labelAr: 'الكل' },
    { key: 'vip', label: 'VIP 4K', labelAr: 'سريع VIP' },
    { key: 'fast', label: 'Fast FHD', labelAr: 'فائق' },
    { key: 'anime', label: 'Anime', labelAr: 'أنمي' },
    { key: 'arabic', label: 'Arabic', labelAr: 'عربي' },
    { key: 'stream_host', label: 'Cloud Direct', labelAr: 'سحابي مباشر' },
  ];

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'recommended':
        return colors.accentGold;
      case 'ready':
        return colors.success;
      case 'checking':
        return colors.warning;
      case 'cooldown':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.success;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recommended':
        return '★ Recommended';
      case 'checking':
        return 'Checking';
      case 'cooldown':
        return 'Cooldown';
      case 'failed':
        return 'Offline';
      default:
        return 'Online';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>سيرفرات البث المتاحة</Text>
          <Text style={styles.serverCountBadge}>{servers.length} خادم مسجل</Text>
        </View>

        {onAutoFallback && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAutoFallback}
            style={styles.fallbackButton}
            accessibilityLabel="تبديل تلقائي للسيرفر الأسرع"
          >
            <Text style={styles.fallbackText}>⚡ تبديل تلقائي</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryChip,
                isActive ? styles.categoryChipActive : styles.categoryChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                ]}
              >
                {cat.labelAr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Server Grid / Buttons */}
      <View style={styles.serverRow}>
        {filteredServers.map(({ server, originalIndex }) => {
          const isSelected = selectedIndex === originalIndex;
          const isFailed = server.status === 'failed';
          const isCooldown = server.status === 'cooldown';
          const isRecommended = server.isRecommended || server.status === 'recommended';

          return (
            <TouchableOpacity
              key={server.id}
              activeOpacity={0.8}
              onPress={() => onSelectServer(originalIndex)}
              disabled={isCooldown}
              accessibilityRole="button"
              accessibilityLabel={`${server.name} quality ${server.quality} status ${server.status}`}
              style={[
                styles.serverButton,
                isSelected ? styles.selectedButton : styles.unselectedButton,
                isRecommended && !isSelected ? styles.recommendedBorder : null,
                (isFailed || isCooldown) ? styles.dimmedButton : null,
              ]}
            >
              {/* Status indicator dot */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusDotColor(server.status) },
                ]}
              />

              <View style={styles.serverContent}>
                <View style={styles.nameRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.serverText,
                      isSelected ? styles.selectedText : styles.unselectedText,
                      isCooldown && styles.strikethroughText,
                    ]}
                  >
                    {server.name}
                  </Text>
                  {server.badge && (
                    <View
                      style={[
                        styles.badge,
                        server.badge.includes('VIP')
                          ? styles.badgeVip
                          : server.badge === 'STAR'
                          ? styles.badgeStar
                          : styles.badgeGeneric,
                      ]}
                    >
                      <Text style={styles.badgeText}>{server.badge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.qualityText}>{server.quality}</Text>
                  <Text style={styles.statusSubtext}>• {getStatusLabel(server.status)}</Text>
                  {server.latencyMs !== undefined && (
                    <Text style={styles.latencyText}>• {server.latencyMs}ms</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  serverCountBadge: {
    color: colors.accentGold,
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  fallbackButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  fallbackText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipInactive: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.border,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: colors.textSecondary,
  },
  serverRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 48,
    minWidth: '48%',
    flexGrow: 1,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselectedButton: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.border,
  },
  recommendedBorder: {
    borderColor: colors.accentGold,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  dimmedButton: {
    opacity: 0.5,
    backgroundColor: colors.surface,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serverContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverText: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: colors.textPrimary,
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusSubtext: {
    fontSize: 10,
    color: colors.textMuted,
  },
  latencyText: {
    fontSize: 10,
    color: colors.success,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    marginLeft: 6,
  },
  badgeVip: {
    backgroundColor: colors.accentGold,
  },
  badgeStar: {
    backgroundColor: colors.primary,
  },
  badgeGeneric: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  badgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
});

