/**
 * Storage Service - Local cache and key-value store with fallback
 */
class LocalStorageService {
  private memoryMap = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return this.memoryMap.get(key) ?? null;
    } catch {
      return this.memoryMap.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      this.memoryMap.set(key, value);
    } catch {
      this.memoryMap.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      this.memoryMap.delete(key);
    } catch {
      this.memoryMap.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      this.memoryMap.clear();
    } catch {
      this.memoryMap.clear();
    }
  }
}

export const appStorage = new LocalStorageService();
