import { VideoProviderAdapter } from '../providers/types';
import { OwnedProvider } from '../providers/OwnedProvider';
import { LicensedProvider, CustomProvider } from '../providers/LicensedProvider';

export class ProviderManager {
  private static instance: ProviderManager;
  private providers: VideoProviderAdapter[] = [];

  private constructor() {
    this.providers = [
      new OwnedProvider(),
      new LicensedProvider(),
      new CustomProvider(),
    ];
  }

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  getProviders(): VideoProviderAdapter[] {
    return [...this.providers].sort((a, b) => b.priority - a.priority);
  }

  registerProvider(provider: VideoProviderAdapter): void {
    this.providers.push(provider);
  }
}

export const providerManager = ProviderManager.getInstance();
