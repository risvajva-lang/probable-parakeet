package com.example.player

import android.util.Log

object SafeLogger {
    private const val TAG = "HDOFLIX_Player"

    class Logger(private val tag: String) {
        fun d(msg: String) = Log.d(tag, msg)
        fun i(msg: String) = Log.i(tag, msg)
        fun w(msg: String, t: Throwable? = null) = if (t != null) Log.w(tag, msg, t) else Log.w(tag, msg)
        fun e(msg: String, t: Throwable? = null) = if (t != null) Log.e(tag, msg, t) else Log.e(tag, msg)
    }

    fun getLogger(tag: String) = Logger(tag)

    private val SENSITIVE_KEYS = setOf(
        "token", "bearer", "authorization", "auth", "key", "password", "pass", "pwd",
        "secret", "api_key", "apikey", "session", "credential"
    )

    fun logPlayerSelection(playerType: PlayerType) {
        Log.i(TAG, "[Player Selection] Selected player: ${playerType.id}")
    }

    fun logPackageDetection(packageName: String, isInstalled: Boolean, version: String? = null) {
        val versionInfo = if (version != null) " (version: $version)" else ""
        Log.i(TAG, "[Package Detection] Package '$packageName' installed=$isInstalled$versionInfo")
    }

    fun logLaunchAttempt(playerType: PlayerType, mediaTitle: String, isTv: Boolean) {
        val sanitizedTitle = sanitizeString(mediaTitle)
        Log.i(TAG, "[Launch Attempt] Launching $playerType for '$sanitizedTitle' (isTv=$isTv)")
    }

    fun logLaunchSuccess(playerType: PlayerType) {
        Log.i(TAG, "[Launch Result] Successfully launched ${playerType.id}")
    }

    fun logLaunchFailure(playerType: PlayerType, reason: String, throwable: Throwable? = null) {
        val sanitizedReason = sanitizeString(reason)
        if (throwable != null) {
            Log.e(TAG, "[Launch Result] Failed to launch ${playerType.id}: $sanitizedReason (${throwable.javaClass.simpleName})")
        } else {
            Log.e(TAG, "[Launch Result] Failed to launch ${playerType.id}: $sanitizedReason")
        }
    }

    fun logFallback(fromPlayer: PlayerType, toPlayer: PlayerType, reason: String) {
        Log.w(TAG, "[Fallback] Falling back from ${fromPlayer.id} to ${toPlayer.id}. Reason: ${sanitizeString(reason)}")
    }

    fun sanitizeHeaders(headers: Map<String, String>): Map<String, String> {
        return headers.filterKeys { key ->
            val lower = key.lowercase()
            SENSITIVE_KEYS.none { sensitive -> lower.contains(sensitive) }
        }
    }

    fun sanitizeUrl(url: String): String {
        return sanitizeString(url)
    }

    private fun sanitizeString(input: String): String {
        var result = input
        for (sensitive in SENSITIVE_KEYS) {
            val regex = Regex("$sensitive[=:][^&\\s,]+", RegexOption.IGNORE_CASE)
            result = result.replace(regex, "$sensitive=[REDACTED]")
        }
        return result
    }
}
