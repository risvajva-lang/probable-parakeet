export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
}

export class NetworkHandler {
  private static instance: NetworkHandler;
  private state: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };
  private listeners: Array<(state: NetworkState) => void> = [];

  public static getInstance(): NetworkHandler {
    if (!NetworkHandler.instance) {
      NetworkHandler.instance = new NetworkHandler();
    }
    return NetworkHandler.instance;
  }

  getState(): NetworkState {
    return { ...this.state };
  }

  setOnline(online: boolean): void {
    this.state.isConnected = online;
    this.state.isInternetReachable = online;
    this.notify();
  }

  async testConnection(testUrl: string = 'https://api.themoviedb.org/3/configuration'): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(testUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timer);
      const reachable = res.ok || res.status === 401; // 401 means reached server
      this.setOnline(reachable);
      return reachable;
    } catch {
      this.setOnline(false);
      return false;
    }
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.getState()));
  }
}

export const networkHandler = NetworkHandler.getInstance();
