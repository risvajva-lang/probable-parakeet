import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkState } from '../hooks/useNetworkState';

export const NetworkBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkState();

  if (isConnected && isInternetReachable !== false) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️ أنت غير متصل بالإنترنت. يتم تفعيل وضع عدم الاتصال (Offline Mode).</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
