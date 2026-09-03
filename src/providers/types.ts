import { Media, StreamResult } from '../models/types';

export interface VideoProviderAdapter {
  id: string;
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  resolve(media: Media, season?: number, episode?: number): Promise<StreamResult | null>;
}
