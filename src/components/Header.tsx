import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../theme/theme';

interface HeaderProps {
  onSearchPress: () => void;
  onNotificationsPress?: () => void;
  onCastPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onNotificationsPress,
  onCastPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Title / Logo */}
      <View style={styles.brandContainer}>
        <Text style={styles.logoTextHDO}>HDO</Text>
        <Text style={styles.logoTextFLIX}>FLIX</Text>
        <View style={styles.vipBadge}>
          <Text style={styles.vipText}>VIP</Text>
        </View>
      </View>

      {/* Action Icons */}
      <View style={styles.actionsContainer}>
        {onCastPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCastPress}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>📡</Text>
          </TouchableOpacity>
        )}

        {onNotificationsPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotificationsPress}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSearchPress}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextHDO: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  logoTextFLIX: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vipBadge: {
    backgroundColor: colors.accentGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginLeft: 8,
  },
  vipText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconText: {
    fontSize: 16,
  },
});
