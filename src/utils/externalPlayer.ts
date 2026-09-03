import { Linking, Platform } from 'react-native';

export type ExternalPlayerType = 'system' | 'vlc' | 'mx';

export interface ExternalPlayerOption {
  type: ExternalPlayerType;
  name: string;
  icon: string;
  packageName: string;
}

export const EXTERNAL_PLAYERS: ExternalPlayerOption[] = [
  {
    type: 'vlc',
    name: 'VLC Player',
    icon: '🟧',
    packageName: 'org.videolan.vlc',
  },
  {
    type: 'mx',
    name: 'MX Player',
    icon: '🟦',
    packageName: 'com.mxtech.videoplayer.ad',
  },
  {
    type: 'system',
    name: 'System Default Player',
    icon: '📱',
    packageName: '',
  },
];

export class ExternalPlayerHelper {
  /**
   * Safely opens stream URL with selected external player on Android
   */
  static async openWithPlayer(
    streamUrl: string,
    playerType: ExternalPlayerType = 'system',
    title?: string
  ): Promise<boolean> {
    if (!streamUrl) return false;

    try {
      if (Platform.OS === 'android') {
        let uri = streamUrl;
        if (playerType === 'vlc') {
          uri = `vlc://${streamUrl}`;
        } else if (playerType === 'mx') {
          uri = `intent:${streamUrl}#Intent;package=com.mxtech.videoplayer.ad;type=video/*;end`;
        }

        const canOpen = await Linking.canOpenURL(uri);
        if (canOpen) {
          await Linking.openURL(uri);
          return true;
        }
      }

      // Fallback to opening stream URL directly
      const canOpenDefault = await Linking.canOpenURL(streamUrl);
      if (canOpenDefault) {
        await Linking.openURL(streamUrl);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
