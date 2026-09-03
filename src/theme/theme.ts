export const colors = {
  background: '#0E1015',
  surface: '#14171E',
  surfaceCard: '#1E2330',
  surfaceElevated: '#262D3D',
  primary: '#E50914', // HDOFLIX Signature Red
  primaryDark: '#B20710',
  accentGold: '#FFC107',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.16)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

export const typography = {
  titleLarge: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  titleMedium: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  bodyLarge: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodyMedium: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '500' as const, color: colors.textMuted },
  badge: { fontSize: 10, fontWeight: '700' as const, color: colors.textPrimary },
};
