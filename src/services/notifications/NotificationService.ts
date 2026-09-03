export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    return true;
  }

  async handleDeepLink(url: string): Promise<{ type: string; id: number } | null> {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { type: parts[0], id: parseInt(parts[1]) };
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const notificationService = NotificationService.getInstance();
