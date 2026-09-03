package com.example.player

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import com.example.model.MediaType

object VideoPulseAdapter {

    const val PACKAGE_NAME = "com.videopulse.pkvideo.pulsepk"
    const val APP_NAME = "Video Pulse"
    const val MIN_VERSION_CODE = 1L
    const val PLAY_STORE_URL = "market://details?id=$PACKAGE_NAME"
    const val WEB_STORE_URL = "https://play.google.com/store/apps/details?id=$PACKAGE_NAME"

    fun isInstalled(context: Context): Boolean {
        val installed = PlayerIntentModuleContract.isPackageInstalled(context, PACKAGE_NAME)
        val version = if (installed) PlayerIntentModuleContract.getPackageVersion(context, PACKAGE_NAME) else null
        SafeLogger.logPackageDetection(PACKAGE_NAME, installed, version)
        return installed
    }

    fun getInstalledVersion(context: Context): String? {
        return PlayerIntentModuleContract.getPackageVersion(context, PACKAGE_NAME)
    }

    fun getInstalledVersionCode(context: Context): Long {
        return PlayerIntentModuleContract.getPackageVersionCode(context, PACKAGE_NAME)
    }

    fun buildIntent(media: PlaybackMedia): Intent? {
        val parsedUri = PlayerIntentModuleContract.firstFileUri(media.streamUrl) ?: return null

        val isTv = media.type != MediaType.MOVIE
        val fullTitle = if (isTv && !media.seriesName.isNullOrBlank()) {
            "${media.seriesName} - S${media.season}E${media.episode}: ${media.title}"
        } else {
            media.title
        }

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(parsedUri, "video/*")
            setPackage(PACKAGE_NAME)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

            // Primary metadata extras
            putExtra("title", fullTitle)
            putExtra("media_title", media.title)
            putExtra("is_tv", isTv)
            if (isTv) {
                putExtra("series_name", media.seriesName ?: "")
                putExtra("season", media.season)
                putExtra("episode", media.episode)
            }
            if (!media.posterUrl.isNullOrBlank()) {
                putExtra("poster_url", media.posterUrl)
            }

            // Subtitles extra bundle
            if (media.subtitles.isNotEmpty()) {
                val subBundle = PlayerIntentModuleContract.buildSubBundle(media.subtitles)
                putExtras(subBundle)
                putExtra("subBundle", subBundle)
            }

            // Safe headers extra bundle
            if (media.headers.isNotEmpty()) {
                val safeHeaders = SafeLogger.sanitizeHeaders(media.headers)
                if (safeHeaders.isNotEmpty()) {
                    val linkBundle = PlayerIntentModuleContract.buildLinkBundle(
                        url = media.streamUrl,
                        title = fullTitle,
                        headers = safeHeaders
                    )
                    putExtra("link_bundle", linkBundle)
                }
            }
        }

        return intent
    }

    fun launch(context: Context, media: PlaybackMedia): PlayerLaunchResult {
        SafeLogger.logLaunchAttempt(PlayerType.VIDEO_PULSE, media.title, media.type != MediaType.MOVIE)

        val intent = buildIntent(media)
            ?: run {
                SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "Invalid stream URI")
                return PlayerLaunchResult.InvalidStreamUrl(media.streamUrl)
            }

        if (!isInstalled(context)) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "Package $PACKAGE_NAME is not installed")
            return PlayerLaunchResult.NotInstalled(PACKAGE_NAME, APP_NAME)
        }

        return try {
            context.startActivity(intent)
            SafeLogger.logLaunchSuccess(PlayerType.VIDEO_PULSE)
            PlayerLaunchResult.Success(PlayerType.VIDEO_PULSE)
        } catch (e: ActivityNotFoundException) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "ActivityNotFoundException on intent launch", e)
            PlayerLaunchResult.LaunchFailed("تطبيق Video Pulse غير قادر على معالجة رابط التشغيل أو لم يتم العثور على الواجهة المناسبة", e)
        } catch (e: SecurityException) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "SecurityException on intent launch", e)
            PlayerLaunchResult.LaunchFailed("خطأ في أذونات تشغيل التطبيق الخارجي", e)
        } catch (e: Exception) {
            SafeLogger.logLaunchFailure(PlayerType.VIDEO_PULSE, "Unexpected error launching intent", e)
            PlayerLaunchResult.LaunchFailed("حدث خطأ غير متوقع أثناء تشغيل Video Pulse: ${e.localizedMessage ?: "Unknown error"}", e)
        }
    }

    fun buildInstallIntent(context: Context): Intent {
        return try {
            val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse(PLAY_STORE_URL)).apply {
                setPackage("com.android.vending")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (marketIntent.resolveActivity(context.packageManager) != null) {
                marketIntent
            } else {
                Intent(Intent.ACTION_VIEW, Uri.parse(WEB_STORE_URL)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
        } catch (e: Exception) {
            Intent(Intent.ACTION_VIEW, Uri.parse(WEB_STORE_URL)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
    }
}
