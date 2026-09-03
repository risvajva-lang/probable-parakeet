package com.example.player

import android.content.Context

class InternalPlayer(private val context: Context) {

    fun launch(media: PlaybackMedia, onInternalPlay: (PlaybackMedia) -> Unit): PlayerLaunchResult {
        SafeLogger.logPlayerSelection(PlayerType.HDOFLIX_INTERNAL)
        SafeLogger.logLaunchAttempt(PlayerType.HDOFLIX_INTERNAL, media.title, false)
        return try {
            onInternalPlay(media)
            SafeLogger.logLaunchSuccess(PlayerType.HDOFLIX_INTERNAL)
            PlayerLaunchResult.Success(PlayerType.HDOFLIX_INTERNAL)
        } catch (e: Exception) {
            SafeLogger.logLaunchFailure(PlayerType.HDOFLIX_INTERNAL, "Failed to launch internal player: ${e.message}", e)
            PlayerLaunchResult.LaunchFailed("فشل تشغيل مشغل HDOFLIX الداخلي: ${e.localizedMessage ?: "Unknown error"}", e)
        }
    }
}
