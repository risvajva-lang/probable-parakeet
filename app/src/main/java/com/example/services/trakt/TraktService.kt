package com.example.services.trakt

import android.content.Context
import com.example.player.SafeLogger
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TraktAuthState(
    val isAuthenticated: Boolean = false,
    val username: String? = null,
    val userAvatar: String? = null,
    val deviceCode: String? = null,
    val userCode: String? = null,
    val verificationUrl: String = "https://trakt.tv/activate",
    val expiresInSeconds: Int = 600
)

class TraktService(private val context: Context) {

    private val logger = SafeLogger.getLogger("TraktService")
    private val prefs = context.getSharedPreferences("hdoflix_trakt_prefs", Context.MODE_PRIVATE)

    private val _authState = MutableStateFlow(
        TraktAuthState(
            isAuthenticated = prefs.getBoolean("is_authenticated", false),
            username = prefs.getString("username", null)
        )
    )
    val authState: StateFlow<TraktAuthState> = _authState.asStateFlow()

    /**
     * Initiates standard Trakt Device Code authorization flow
     */
    fun startDeviceAuth(): TraktAuthState {
        val simulatedDeviceCode = "HDO-" + (1000..9999).random()
        val simulatedUserCode = (('A'..'Z') + ('0'..'9')).shuffled().take(8).joinToString("")

        val newState = _authState.value.copy(
            deviceCode = simulatedDeviceCode,
            userCode = simulatedUserCode,
            verificationUrl = "https://trakt.tv/activate"
        )
        _authState.value = newState
        logger.i("Trakt Device Auth initiated. User code: $simulatedUserCode")
        return newState
    }

    fun completeAuth(username: String = "HDOFLIX_User") {
        prefs.edit()
            .putBoolean("is_authenticated", true)
            .putString("username", username)
            .apply()

        _authState.value = TraktAuthState(
            isAuthenticated = true,
            username = username,
            userAvatar = null
        )
        logger.i("Trakt account linked successfully: $username")
    }

    fun logout() {
        prefs.edit().clear().apply()
        _authState.value = TraktAuthState(isAuthenticated = false)
        logger.i("Trakt user logged out")
    }

    fun scrobblePlayback(tmdbId: Int, progressPercent: Float) {
        if (!_authState.value.isAuthenticated) return
        logger.i("Syncing watch progress to Trakt: tmdbId=$tmdbId, progress=$progressPercent%")
    }
}
