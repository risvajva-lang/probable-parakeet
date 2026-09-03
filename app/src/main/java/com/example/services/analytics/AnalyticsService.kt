package com.example.services.analytics

import com.example.player.SafeLogger

class AnalyticsService {

    private val logger = SafeLogger.getLogger("Analytics")

    fun trackEvent(eventName: String, params: Map<String, Any> = emptyMap()) {
        val safeParams = params.filterKeys { !it.contains("token", true) && !it.contains("key", true) }
        logger.i("EVENT [$eventName]: $safeParams")
    }

    fun logAppOpen() = trackEvent("app_open")
    fun logSearch(query: String) = trackEvent("search", mapOf("query_length" to query.length))
    fun logMediaOpen(tmdbId: Int, mediaType: String, title: String) =
        trackEvent("media_open", mapOf("id" to tmdbId, "type" to mediaType, "title" to title))
    fun logPlayClicked(tmdbId: Int, season: Int, episode: Int) =
        trackEvent("play_clicked", mapOf("id" to tmdbId, "season" to season, "episode" to episode))
    fun logServerSelected(serverName: String, quality: String) =
        trackEvent("server_selected", mapOf("server" to serverName, "quality" to quality))
    fun logPlaybackStarted(playerType: String) =
        trackEvent("playback_started", mapOf("player" to playerType))
    fun logPlaybackFailed(reason: String) =
        trackEvent("playback_failed", mapOf("reason" to reason))
    fun logEpisodeChanged(newEpisode: Int) =
        trackEvent("episode_changed", mapOf("episode" to newEpisode))
    fun logFavoriteToggled(tmdbId: Int, isFavorite: Boolean) =
        trackEvent("favorite_toggled", mapOf("id" to tmdbId, "added" to isFavorite))
}
