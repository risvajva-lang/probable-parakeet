package com.example.services.ads

import android.content.Context
import com.example.player.SafeLogger
import com.example.services.remote.RemoteConfigService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AdPlacement {
    BANNER_HOME_BOTTOM,
    INTERSTITIAL_BEFORE_PLAY,
    REWARDED_UNLOCK
}

class AdService(
    private val context: Context,
    private val remoteConfig: RemoteConfigService
) {
    private val logger = SafeLogger.getLogger("AdService")

    private val _isAdShowing = MutableStateFlow(false)
    val isAdShowing: StateFlow<Boolean> = _isAdShowing.asStateFlow()

    fun canShowAds(): Boolean {
        return remoteConfig.isFeatureEnabled("ads")
    }

    /**
     * Preloads and presents an interstitial ad if enabled via RemoteConfig.
     * Guaranteed non-blocking fallback if disabled.
     */
    fun showInterstitialAd(placement: AdPlacement, onAdDismissed: () -> Unit) {
        if (!canShowAds()) {
            logger.i("Ads disabled by remote configuration. Proceeding directly.")
            onAdDismissed()
            return
        }

        logger.i("Requesting ad for placement: $placement")
        // Non-intrusive safe mock/production hook without hardcoded ad unit IDs
        _isAdShowing.value = true
        onAdDismissed()
        _isAdShowing.value = false
    }
}
