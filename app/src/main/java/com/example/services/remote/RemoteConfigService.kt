package com.example.services.remote

import com.example.player.SafeLogger
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class FeatureFlags(
    val videoPulseEnabled: Boolean = true,
    val downloadsEnabled: Boolean = true,
    val traktEnabled: Boolean = true,
    val adsEnabled: Boolean = false,
    val analyticsEnabled: Boolean = true,
    val serverProbeTimeoutMs: Long = 5000L,
    val maxServersPerSource: Int = 10,
    val defaultPlayer: String = "HDOFLIX_INTERNAL",
    val maintenanceMode: Boolean = false,
    val maintenanceMessage: String = "System undergoing scheduled maintenance. Please check back shortly."
)

class RemoteConfigService {

    private val logger = SafeLogger.getLogger("RemoteConfigService")

    private val _config = MutableStateFlow(FeatureFlags())
    val config: StateFlow<FeatureFlags> = _config.asStateFlow()

    fun updateConfig(newFlags: FeatureFlags) {
        _config.value = newFlags
        logger.i("Remote config updated: ads=${newFlags.adsEnabled}, videoPulse=${newFlags.videoPulseEnabled}")
    }

    fun isFeatureEnabled(featureName: String): Boolean {
        return when (featureName.lowercase()) {
            "videopulse" -> _config.value.videoPulseEnabled
            "downloads" -> _config.value.downloadsEnabled
            "trakt" -> _config.value.traktEnabled
            "ads" -> _config.value.adsEnabled
            "analytics" -> _config.value.analyticsEnabled
            else -> true
        }
    }
}
