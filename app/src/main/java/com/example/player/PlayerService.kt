package com.example.player

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PlayerService(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("hdoflix_player_prefs", Context.MODE_PRIVATE)

    val internalPlayer = InternalPlayer(context)
    val externalPlayerService = ExternalPlayerService(context)

    private val _selectedPlayer = MutableStateFlow(loadSavedPlayer())
    val selectedPlayer: StateFlow<PlayerType> = _selectedPlayer.asStateFlow()

    // Remote config flag (allows disabling Video Pulse remotely if needed)
    private val _isVideoPulseRemoteEnabled = MutableStateFlow(true)
    val isVideoPulseRemoteEnabled: StateFlow<Boolean> = _isVideoPulseRemoteEnabled.asStateFlow()

    private fun loadSavedPlayer(): PlayerType {
        val savedId = prefs.getString("default_player_id", PlayerType.VIDEO_PULSE.id)
        return PlayerType.fromId(savedId)
    }

    fun setPlayerPreference(playerType: PlayerType) {
        SafeLogger.logPlayerSelection(playerType)
        _selectedPlayer.value = playerType
        prefs.edit().putString("default_player_id", playerType.id).apply()
    }

    fun setRemoteConfigEnabled(enabled: Boolean) {
        _isVideoPulseRemoteEnabled.value = enabled
        if (!enabled && _selectedPlayer.value == PlayerType.VIDEO_PULSE) {
            setPlayerPreference(PlayerType.HDOFLIX_INTERNAL)
        }
    }

    /**
     * Dispatches playback based on user preference or explicit target player.
     * If preferred player is Video Pulse:
     *   - checks installation
     *   - launches Video Pulse if installed
     *   - returns NotInstalled or LaunchFailed if issues occur so UI can prompt or fallback to HDOFLIX Player
     */
    fun play(
        media: PlaybackMedia,
        targetPlayer: PlayerType? = null,
        onInternalPlay: (PlaybackMedia) -> Unit
    ): PlayerLaunchResult {
        val chosenPlayer = targetPlayer ?: _selectedPlayer.value

        // If Video Pulse is disabled via remote config, strictly enforce HDOFLIX
        val effectivePlayer = if (chosenPlayer == PlayerType.VIDEO_PULSE && !_isVideoPulseRemoteEnabled.value) {
            SafeLogger.logFallback(PlayerType.VIDEO_PULSE, PlayerType.HDOFLIX_INTERNAL, "Video Pulse disabled by Remote Config")
            PlayerType.HDOFLIX_INTERNAL
        } else {
            chosenPlayer
        }

        return when (effectivePlayer) {
            PlayerType.HDOFLIX_INTERNAL -> {
                internalPlayer.launch(media, onInternalPlay)
            }
            PlayerType.VIDEO_PULSE -> {
                externalPlayerService.launchVideoPulse(media)
            }
            PlayerType.MX_PLAYER -> {
                externalPlayerService.launchMxPlayer(media)
            }
            PlayerType.VLC -> {
                externalPlayerService.launchVlc(media)
            }
            PlayerType.JUST_PLAYER -> {
                externalPlayerService.launchJustPlayer(media)
            }
        }
    }

    /**
     * Executes fallback from Video Pulse to HDOFLIX Internal Player
     */
    fun fallbackToInternalPlayer(
        media: PlaybackMedia,
        reason: String,
        onInternalPlay: (PlaybackMedia) -> Unit
    ): PlayerLaunchResult {
        SafeLogger.logFallback(PlayerType.VIDEO_PULSE, PlayerType.HDOFLIX_INTERNAL, reason)
        return internalPlayer.launch(media, onInternalPlay)
    }
}
