import { useState, useEffect } from 'react';
import { libraryManager } from '../library/LibraryManager';
import { WatchProgress } from '../types';

export function useWatchProgress(mediaId: number, season?: number, episode?: number) {
  const [progress, setProgress] = useState<WatchProgress | undefined>(
    libraryManager.getProgress(mediaId, season, episode)
  );

  useEffect(() => {
    const unsub = libraryManager.subscribe(() => {
      setProgress(libraryManager.getProgress(mediaId, season, episode));
    });
    return unsub;
  }, [mediaId, season, episode]);

  const saveProgress = (
    title: string,
    posterPath: string | null,
    positionSeconds: number,
    durationSeconds: number,
    mediaType: 'movie' | 'tv' | 'anime' = 'movie',
    backdropPath?: string | null
  ) => {
    const isCompleted = durationSeconds > 0 && positionSeconds / durationSeconds >= 0.95;
    libraryManager.updateProgress({
      mediaId,
      mediaType,
      title,
      posterPath,
      backdropPath,
      seasonNumber: season,
      episodeNumber: episode,
      positionSeconds,
      durationSeconds,
      watched: isCompleted,
      lastWatchedDate: Date.now(),
    });
  };

  return { progress, saveProgress };
}
