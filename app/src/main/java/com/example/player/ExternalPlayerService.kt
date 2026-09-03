package com.example.player

import android.content.Context
import android.content.Intent

class ExternalPlayerService(private val context: Context) {

    fun isVideoPulseInstalled(): Boolean {
        return VideoPulseAdapter.isInstalled(context)
    }

    fun getVideoPulseVersion(): String? {
        return VideoPulseAdapter.getInstalledVersion(context)
    }

    fun buildVideoPulseIntent(media: PlaybackMedia): Intent? {
        return VideoPulseAdapter.buildIntent(media)
    }

    fun launchVideoPulse(media: PlaybackMedia): PlayerLaunchResult {
        return VideoPulseAdapter.launch(context, media)
    }

    fun launchMxPlayer(media: PlaybackMedia): PlayerLaunchResult {
        return launchPackagePlayer(
            media = media,
            packageNames = listOf("com.mxtech.videoplayer.ad", "com.mxtech.videoplayer.pro"),
            playerName = "MX Player",
            playerType = PlayerType.MX_PLAYER
        )
    }

    fun launchVlc(media: PlaybackMedia): PlayerLaunchResult {
        return launchPackagePlayer(
            media = media,
            packageNames = listOf("org.videolan.vlc"),
            playerName = "VLC",
            playerType = PlayerType.VLC
        )
    }

    fun launchJustPlayer(media: PlaybackMedia): PlayerLaunchResult {
        return launchPackagePlayer(
            media = media,
            packageNames = listOf("com.brouken.player"),
            playerName = "Just Player",
            playerType = PlayerType.JUST_PLAYER
        )
    }

    private fun launchPackagePlayer(
        media: PlaybackMedia,
        packageNames: List<String>,
        playerName: String,
        playerType: PlayerType
    ): PlayerLaunchResult {
        val targetPackage = packageNames.firstOrNull { pkg ->
            try {
                context.packageManager.getPackageInfo(pkg, 0)
                true
            } catch (e: Exception) {
                false
            }
        } ?: packageNames.first()

        return try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(android.net.Uri.parse(media.streamUrl), "video/*")
                setPackage(targetPackage)
                putExtra("title", media.title)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            PlayerLaunchResult.Success(playerType)
        } catch (e: Exception) {
            PlayerLaunchResult.LaunchFailed("$playerName failed: ${e.message}", e)
        }
    }

    fun getInstallIntent(): Intent {
        return VideoPulseAdapter.buildInstallIntent(context)
    }
}
