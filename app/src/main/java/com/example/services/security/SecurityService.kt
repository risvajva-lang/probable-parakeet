package com.example.services.security

import android.content.Context
import android.content.pm.ApplicationInfo
import android.os.Build
import com.example.player.SafeLogger
import java.io.File

data class SecurityReport(
    val isDebuggable: Boolean,
    val isRootSuspected: Boolean,
    val isEmulator: Boolean,
    val isIntegrityValid: Boolean
)

class SecurityService(private val context: Context) {

    private val logger = SafeLogger.getLogger("SecurityService")

    fun performEnvironmentAudit(): SecurityReport {
        val isDebug = (context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        val isRooted = checkRootPaths()
        val isEmu = checkEmulatorBuild()

        val report = SecurityReport(
            isDebuggable = isDebug,
            isRootSuspected = isRooted,
            isEmulator = isEmu,
            isIntegrityValid = true
        )

        logger.i("Security Audit completed: debug=$isDebug, rootSuspected=$isRooted, emulator=$isEmu")
        return report
    }

    private fun checkRootPaths(): Boolean {
        val paths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        )
        return try {
            paths.any { File(it).exists() }
        } catch (e: Exception) {
            false
        }
    }

    private fun checkEmulatorBuild(): Boolean {
        return (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk" == Build.PRODUCT)
    }

    /**
     * Sanitizes strings by redacting known sensitive patterns
     */
    fun sanitizeOutput(input: String): String {
        return input.replace(Regex("(?i)(api[_-]?key|token|auth|bearer|secret)=([^&\\s]+)"), "$1=[REDACTED]")
    }
}
