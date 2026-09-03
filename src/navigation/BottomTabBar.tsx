import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/theme';
import { t, isRTL } from '../i18n';

export type MainTab = 'home' | 'search' | 'anime' | 'library' | 'settings';

interface BottomTabBarProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  unreadNotifications?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  unreadNotifications = 0,
}) => {
  const tabs: Array<{ id: MainTab; label: string; icon: string }> = [
    { id: 'home', label: t('tabs.home'), icon: '🏠' },
    { id: 'search', label: t('tabs.search'), icon: '🔍' },
    { id: 'anime', label: t('tabs.anime'), icon: '⛩️' },
    { id: 'library', label: t('tabs.library'), icon: '📂' },
    { id: 'settings', label: t('tabs.settings'), icon: '⚙️' },
  ];

  const orderedTabs = isRTL() ? [...tabs].reverse() : tabs;

  return (
    <View style={styles.container}>
      {orderedTabs.map((tab) => {
        const isSelected = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={styles.iconWrapper}>
              <Text style={[styles.tabIcon, isSelected && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              {tab.id === 'settings' && unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </View>

            <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
              {tab.label}
            </Text>

            {isSelected && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0A0D14',
    borderTopWidth: 1,
    borderTopColor: '#181F2C',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  iconWrapper: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.65,
    marginBottom: 3,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#717E91',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFC107',
    fontWeight: '800',
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});
