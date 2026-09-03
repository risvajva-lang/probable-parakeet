package com.example.player

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle

/**
 * Concrete implementation of the PlayerIntentModule contract extracted from the
 * video player integration specifications:
 * - buildLinkBundle
 * - buildSubBundle
 * - firstFileUri
 * - getArrayOrNull
 * - getMapOrNull
 * - getStringOrNull
 * - isPackageInstalled
 * - getPackageVersion
 * - launch
 */
object PlayerIntentModuleContract {

    fun isPackageInstalled(context: Context, packageName: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(packageName, 0)
            }
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        } catch (e: Exception) {
            false
        }
    }

    fun getPackageVersion(context: Context, packageName: String): String? {
        return try {
            val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(packageName, 0)
            }
            packageInfo.versionName
        } catch (e: Exception) {
            null
        }
    }

    fun getPackageVersionCode(context: Context, packageName: String): Long {
        return try {
            val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(packageName, 0)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toLong()
            }
        } catch (e: Exception) {
            -1L
        }
    }

    fun firstFileUri(url: String?): Uri? {
        if (url.isNullOrBlank()) return null
        return try {
            val parsed = Uri.parse(url.trim())
            val scheme = parsed.scheme?.lowercase()
            if (scheme == "http" || scheme == "https" || scheme == "file" || scheme == "content") {
                parsed
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    fun buildLinkBundle(
        url: String,
        title: String,
        headers: Map<String, String>? = null,
        extraProps: Map<String, Any?>? = null
    ): Bundle {
        val bundle = Bundle()
        bundle.putString("url", url)
        bundle.putString("title", title)

        if (!headers.isNullOrEmpty()) {
            val sanitized = SafeLogger.sanitizeHeaders(headers)
            val headersBundle = Bundle()
            for ((k, v) in sanitized) {
                headersBundle.putString(k, v)
            }
            bundle.putBundle("headers", headersBundle)
        }

        if (extraProps != null) {
            for ((key, value) in extraProps) {
                when (value) {
                    is String -> bundle.putString(key, value)
                    is Int -> bundle.putInt(key, value)
                    is Long -> bundle.putLong(key, value)
                    is Boolean -> bundle.putBoolean(key, value)
                    is Double -> bundle.putDouble(key, value)
                    is Bundle -> bundle.putBundle(key, value)
                }
            }
        }

        return bundle
    }

    fun buildSubBundle(subtitles: List<SubtitleTrack>?): Bundle {
        val bundle = Bundle()
        if (subtitles.isNullOrEmpty()) {
            bundle.putParcelableArrayList("subs", ArrayList<Bundle>())
            return bundle
        }

        val subsList = ArrayList<Bundle>()
        val names = ArrayList<String>()
        val urls = ArrayList<String>()
        val langs = ArrayList<String>()

        for (sub in subtitles) {
            val subItem = Bundle().apply {
                putString("name", sub.name)
                putString("filename", sub.name)
                putString("url", sub.url)
                putString("lang", sub.lang)
            }
            subsList.add(subItem)
            names.add(sub.name)
            urls.add(sub.url)
            langs.add(sub.lang)
        }
        bundle.putParcelableArrayList("subs", subsList)
        bundle.putStringArray("names", names.toTypedArray())
        bundle.putStringArray("urls", urls.toTypedArray())
        bundle.putStringArray("langs", langs.toTypedArray())
        bundle.putBoolean("subs.enable", true)
        return bundle
    }

    fun getStringOrNull(map: Map<String, Any?>?, key: String): String? {
        val value = map?.get(key) ?: return null
        return value.toString()
    }

    fun getMapOrNull(map: Map<String, Any?>?, key: String): Map<String, Any?>? {
        val value = map?.get(key) ?: return null
        @Suppress("UNCHECKED_CAST")
        return value as? Map<String, Any?>
    }

    fun getArrayOrNull(map: Map<String, Any?>?, key: String): List<Any?>? {
        val value = map?.get(key) ?: return null
        @Suppress("UNCHECKED_CAST")
        return value as? List<Any?>
    }

    fun launch(context: Context, intent: Intent): Boolean {
        return try {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }
}
