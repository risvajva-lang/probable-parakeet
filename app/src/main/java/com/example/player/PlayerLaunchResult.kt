package com.example.player

sealed class PlayerLaunchResult {
    data class Success(val playerType: PlayerType) : PlayerLaunchResult()
    data class NotInstalled(val packageName: String, val appName: String = "Video Pulse") : PlayerLaunchResult()
    data class OutdatedVersion(val currentVersion: String, val minRequiredVersion: String) : PlayerLaunchResult()
    data class LaunchFailed(val reason: String, val cause: Throwable? = null) : PlayerLaunchResult()
    data class InvalidStreamUrl(val url: String) : PlayerLaunchResult()
}
