import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { AppNotification } from '../types';
import { notificationManager } from '../notifications/NotificationManager';
import { colors, borderRadius } from '../theme/theme';
import { t } from '../i18n';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress: (notification: AppNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onNotificationPress,
}) => {
  const notifications = notificationManager.getNotifications();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>🔔 {t('notifications.title')}</Text>
              <Text style={styles.badge}>{notifications.length}</Text>
            </View>

            <View style={styles.actions}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={() => notificationManager.markAllAsRead()}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionText}>{t('notifications.markAllRead')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔕</Text>
              <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const categoryIcon =
                  item.category === 'episode_release'
                    ? '📺'
                    : item.category === 'favorite_update'
                    ? '❤️'
                    : item.category === 'anime_release'
                    ? '⛩️'
                    : '⚡';

                return (
                  <TouchableOpacity
                    style={[styles.itemCard, !item.read && styles.itemCardUnread]}
                    onPress={() => {
                      notificationManager.markAsRead(item.id);
                      onNotificationPress(item);
                    }}
                  >
                    <Text style={styles.itemIcon}>{categoryIcon}</Text>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemBody}>{item.body}</Text>
                      <Text style={styles.itemDate}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111520',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2738',
    paddingBottom: 12,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    backgroundColor: '#1C2433',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    color: '#76859B',
    fontSize: 13,
  },
  list: {
    gap: 8,
    paddingBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151A26',
    padding: 12,
    borderRadius: borderRadius.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222B3D',
  },
  itemCardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#191F2F',
  },
  itemIcon: {
    fontSize: 22,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemBody: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  itemDate: {
    color: '#64748B',
    fontSize: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
