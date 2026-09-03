import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  I18nManager,
} from 'react-native';
import { Header } from './src/components/Header';
import { NetworkBanner } from './src/components/NetworkBanner';
import { NotificationModal } from './src/components/NotificationModal';
import { BottomTabBar, MainTab } from './src/navigation/BottomTabBar';
import {
  HomeScreen,
  SearchScreen,
  AnimeScreen,
  LibraryScreen,
  SettingsScreen,
  DetailsScreen,
  PlayerScreen,
} from './src/screens';
import { Media, WatchProgress, AppNotification, Locale } from './src/types';
import { notificationManager } from './src/notifications/NotificationManager';
import { getLocale } from './src/i18n';
import { colors } from './src/theme/theme';

export default function App(): JSX.Element {
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Player State
  const [playingMedia, setPlayingMedia] = useState<{
    media: Media;
    season?: number;
    episode?: number;
  } | null>(null);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notificationManager.getUnreadCount());

  // Locale state
  const [_locale, setAppLocale] = useState<Locale>(getLocale());

  useEffect(() => {
    const unsub = notificationManager.subscribe(() => {
      setUnreadCount(notificationManager.getUnreadCount());
    });
    return unsub;
  }, []);

  const handleMediaSelect = (media: Media) => {
    setSelectedMedia(media);
  };

  const handleResumePlay = (item: WatchProgress) => {
    // Construct minimal media object for player
    const media: Media = {
      id: item.mediaId,
      title: item.title,
      overview: '',
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      voteAverage: 0,
      mediaType: item.mediaType,
      genres: [],
    };
    setPlayingMedia({
      media,
      season: item.seasonNumber,
      episode: item.episodeNumber,
    });
  };

  const handleStartPlay = (media: Media, season?: number, episode?: number) => {
    setPlayingMedia({
      media,
      season,
      episode,
    });
  };

  const handleNotificationPress = (notif: AppNotification) => {
    setShowNotifications(false);
    if (notif.data?.mediaId) {
      // Open media details
      setSelectedMedia({
        id: notif.data.mediaId,
        title: notif.title,
        overview: notif.body,
        mediaType: notif.category === 'anime_release' ? 'anime' : 'tv',
        genres: [],
        voteAverage: 8.5,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D14" />
      <NetworkBanner />

      {/* Top Application Header */}
      <Header
        onSearchPress={() => setCurrentTab('search')}
        onNotificationsPress={() => setShowNotifications(true)}
      />

      {/* Main Viewport Tabs */}
      <View style={styles.viewport}>
        {currentTab === 'home' && (
          <HomeScreen
            onMediaSelect={handleMediaSelect}
            onResumePlay={handleResumePlay}
          />
        )}

        {currentTab === 'search' && (
          <SearchScreen onMediaSelect={handleMediaSelect} />
        )}

        {currentTab === 'anime' && (
          <AnimeScreen onMediaSelect={handleMediaSelect} />
        )}

        {currentTab === 'library' && (
          <LibraryScreen
            onMediaSelect={handleMediaSelect}
            onResumePlay={handleResumePlay}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            onLocaleChange={(newLocale) => {
              setAppLocale(newLocale);
            }}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        unreadNotifications={unreadCount}
      />

      {/* Details Screen Modal Overlay */}
      {selectedMedia && (
        <View style={styles.detailsOverlay}>
          <DetailsScreen
            media={selectedMedia}
            onBack={() => setSelectedMedia(null)}
            onPlay={(media, season, episode) => handleStartPlay(media, season, episode)}
            onSelectSimilar={(media) => setSelectedMedia(media)}
          />
        </View>
      )}

      {/* Internal Video Player Screen Overlay */}
      {playingMedia && (
        <PlayerScreen
          media={playingMedia.media}
          initialSeason={playingMedia.season}
          initialEpisode={playingMedia.episode}
          onClose={() => setPlayingMedia(null)}
        />
      )}

      {/* Notifications Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationPress={handleNotificationPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  viewport: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
});
