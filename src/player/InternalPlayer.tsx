/**
 * InternalPlayer.tsx - Default in-app video playback component
 * Provides high quality internal playback with clean dark styling.
 */
import React from 'react';
import { PlaybackMedia } from './PlayerTypes';

export interface InternalPlayerProps {
  media: PlaybackMedia;
  onClose: () => void;
  onSwitchToVideoPulse?: () => void;
  isVideoPulseInstalled?: boolean;
}

export const InternalPlayer: React.FC<InternalPlayerProps> = ({
  media,
  onClose,
  onSwitchToVideoPulse,
  isVideoPulseInstalled = false,
}) => {
  const isTv = Boolean(media.isTv || media.season !== undefined);
  const displayTitle = isTv && media.seriesName
    ? `${media.seriesName} (S${media.season ?? 1}E${media.episode ?? 1}) - ${media.title}`
    : media.title;

  return (
    <div
      className="hdoflix-internal-player"
      data-testid="internal_player"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090B10',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: '#121620',
          borderBottom: '1px solid #1E2330',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#E50914',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← رجوع
          </button>
          <div>
            <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '15px', fontWeight: 700 }}>
              {displayTitle}
            </h3>
            <span style={{ fontSize: '11px', color: '#9E9E9E' }}>
              مشغل HDOFLIX المدمج (الافتراضي)
            </span>
          </div>
        </div>

        {onSwitchToVideoPulse && (
          <button
            onClick={onSwitchToVideoPulse}
            style={{
              background: '#1A2130',
              border: '1px solid #2B384E',
              color: '#40C4FF',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            تشغيل عبر Video Pulse {isVideoPulseInstalled ? '✓' : ''}
          </button>
        )}
      </div>

      {/* Video Content Canvas */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          src={media.streamUrl}
          title={media.title}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000000',
          }}
        />
      </div>
    </div>
  );
};
