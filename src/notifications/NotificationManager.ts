import { AppNotification } from '../types';

export interface NotificationPreferences {
  enabled: boolean;
  newReleases: boolean;
  recommendations: boolean;
  favoriteUpdates: boolean;
  episodeAlerts: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: AppNotification[] = [];
  private preferences: NotificationPreferences = {
    enabled: true,
    newReleases: true,
    recommendations: true,
    favoriteUpdates: true,
    episodeAlerts: true,
  };
  private listeners: Array<() => void> = [];

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  constructor() {
    this.seedDefaultNotifications();
  }

  private seedDefaultNotifications(): void {
    this.notifications = [
      {
        id: 'notif_1',
        title: 'New Episode Available! 🎬',
        body: 'Episode 5 of your favorite series is now streaming in 4K UHD.',
        category: 'episode',
        timestamp: Date.now() - 1000 * 60 * 30,
        read: false,
      },
      {
        id: 'notif_2',
        title: 'Recommended for You ⭐',
        body: 'Based on your recent watch history, you might love "Dune: Part Two".',
        category: 'recommendation',
        timestamp: Date.now() - 1000 * 60 * 120,
        read: false,
      },
      {
        id: 'notif_3',
        title: 'New 4K Release 🔥',
        body: 'Top Gun: Maverick is now available with Arabic & English subtitles.',
        category: 'release',
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        read: true,
      },
    ];
  }

  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  markAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    if (!this.preferences.enabled) return;

    // Check category preferences
    if (notif.category === 'release' && !this.preferences.newReleases) return;
    if (notif.category === 'recommendation' && !this.preferences.recommendations) return;
    if (notif.category === 'favorite' && !this.preferences.favoriteUpdates) return;
    if (notif.category === 'episode' && !this.preferences.episodeAlerts) return;

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      read: false,
      ...notif,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notify();
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  updatePreferences(prefs: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const notificationManager = NotificationManager.getInstance();
