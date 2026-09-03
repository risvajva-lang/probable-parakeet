package com.example.player.bridge

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import com.example.model.MediaType
import com.example.player.PlaybackMedia
import com.example.player.PlayerIntentModuleContract
import com.example.player.PlayerLaunchResult
import com.example.player.PlayerType
import com.example.player.SafeLogger
import com.example.player.SubtitleTrack
import com.example.player.VideoPulseAdapter

/**
 * VideoPulseModule provides the bridge interface for querying and launching Video Pulse.
 * Responsibilities:
 * 1. Check if Video Pulse is installed.
 * 2. Get Video Pulse installed version.
 * 3. Launch Video Pulse with complete contract (movie/tv, subtitles, headers).
 * 4. Handle ActivityNotFoundException and SecurityException gracefully without crashing.
 * 5. Return standardized result maps to callers and bridge consumers.
 */
class VideoPulseModule(private val context: Context) {

    companion object {
        const val MODULE_NAME = "VideoPulseModule"
        const val PACKAGE_NAME = VideoPulseAdapter.PACKAGE_NAME
    }

    /**
     * 1. Checks if Video Pulse package is installed on the device.
     */
    fun isPackageInstalled(targetPackage: String = PACKAGE_NAME): Boolean {
        return PlayerIntentModuleContract.isPackageInstalled(context, targetPackage)
    }

    fun isInstalled(): Boolean {
        return isPackageInstalled(PACKAGE_NAME)
    }

    /**
     * 2. Returns the version name of the installed Video Pulse package, or null if not installed.
     */
    fun getPackageVersion(targetPackage: String = PACKAGE_NAME): String? {
        return PlayerIntentModuleContract.getPackageVersion(context, targetPackage)
    }

    fun getVersion(): String? {
        return getPackageVersion(PACKAGE_NAME)
    }

    /**
     * Opens official Google Play Store or web link for Video Pulse installation.
     */
    fun openStore(storeUrl: String? = null): Boolean {
        return try {
            val urlToOpen = storeUrl ?: VideoPulseAdapter.WEB_STORE_URL
            val intent = if (urlToOpen.startsWith("market://")) {
                VideoPulseAdapter.buildInstallIntent(context)
            } else {
                Intent(Intent.ACTION_VIEW, Uri.parse(urlToOpen)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "Failed to open store", e)
            false
        }
    }

    /**
     * 3, 4 & 5. Launches Video Pulse with structured intent and returns a result map.
     */
    fun launch(options: Map<String, Any?>): Map<String, Any?> {
        val streamUrl = options["url"]?.toString()
            ?: options["data"]?.toString()
            ?: options["streamUrl"]?.toString()
            ?: ""

        if (streamUrl.isBlank()) {
            return mapOf(
                "success" to false,
                "status" to "INVALID_STREAM_URL",
                "error" to "Stream URL is empty or invalid"
            )
        }

        if (!isInstalled()) {
            return mapOf(
                "success" to false,
                "status" to "NOT_INSTALLED",
                "error" to "Video Pulse غير مثبت على هذا الجهاز",
                "packageName" to PACKAGE_NAME
            )
        }

        val title = options["title"]?.toString() ?: "Video"
        val isTv = options["is_tv"] as? Boolean ?: (options["isTv"] as? Boolean) ?: false
        val seriesName = options["series_name"]?.toString() ?: options["seriesName"]?.toString()
        val season = (options["season"] as? Number)?.toInt() ?: 1
        val episode = (options["episode"] as? Number)?.toInt() ?: 1
        val posterUrl = options["poster_url"]?.toString() ?: options["posterUrl"]?.toString()

        // Extract subtitles if present in options
        val subtitlesList = mutableListOf<SubtitleTrack>()
        val subsRaw = options["subtitles"] as? List<*> ?: (options["subs"] as? List<*>)
        subsRaw?.forEach { item ->
            if (item is Map<*, *>) {
                val subName = item["name"]?.toString() ?: "Arabic"
                val subUrl = item["url"]?.toString() ?: ""
                val subLang = item["lang"]?.toString() ?: "ar"
                if (subUrl.isNotBlank()) {
                    subtitlesList.add(SubtitleTrack(name = subName, url = subUrl, lang = subLang))
                }
            }
        }

        // Extract headers if present
        val headersMap = mutableMapOf<String, String>()
        val headersRaw = options["headers"] as? Map<*, *>
        headersRaw?.forEach { (k, v) ->
            if (k != null && v != null) {
                headersMap[k.toString()] = v.toString()
            }
        }

        val media = PlaybackMedia(
            id = (options["id"] as? Number)?.toLong() ?: 0L,
            title = title,
            streamUrl = streamUrl,
            type = if (isTv) MediaType.TV else MediaType.MOVIE,
            season = season,
            episode = episode,
            seriesName = seriesName,
            posterUrl = posterUrl,
            subtitles = subtitlesList,
            headers = headersMap
        )

        return try {
            val result = VideoPulseAdapter.launch(context, media)
            when (result) {
                is PlayerLaunchResult.Success -> {
                    mapOf("success" to true, "status" to "SUCCESS")
                }
                is PlayerLaunchResult.NotInstalled -> {
                    mapOf(
                        "success" to false,
                        "status" to "NOT_INSTALLED",
                        "error" to "Video Pulse غير مثبت",
                        "packageName" to PACKAGE_NAME
                    )
                }
                is PlayerLaunchResult.LaunchFailed -> {
                    mapOf(
                        "success" to false,
                        "status" to "LAUNCH_FAILED",
                        "error" to result.reason
                    )
                }
                is PlayerLaunchResult.InvalidStreamUrl -> {
                    mapOf(
                        "success" to false,
                        "status" to "INVALID_STREAM_URL",
                        "error" to "رابط البث غير صالح"
                    )
                }
                is PlayerLaunchResult.OutdatedVersion -> {
                    mapOf(
                        "success" to false,
                        "status" to "OUTDATED_VERSION",
                        "error" to "نسخة Video Pulse الحالية (${result.currentVersion}) قديمة، تتطلب الإصدار ${result.minRequiredVersion}"
                    )
                }
            }
        } catch (e: ActivityNotFoundException) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "ActivityNotFoundException captured", e)
            mapOf(
                "success" to false,
                "status" to "ACTIVITY_NOT_FOUND",
                "error" to "تعذر العثور على نشاط Video Pulse الملائم لتشغيل الرابط"
            )
        } catch (e: Exception) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "Launch exception captured", e)
            mapOf(
                "success" to false,
                "status" to "LAUNCH_FAILED",
                "error" to (e.localizedMessage ?: "فشل تشغيل Video Pulse")
            )
        }
    }

    /**
     * Direct typed launcher for Kotlin callers
     */
    fun launchPlayer(media: PlaybackMedia): PlayerLaunchResult {
        return VideoPulseAdapter.launch(context, media)
    }
}
