package com.example.services.subtitles

import android.content.Context
import com.example.player.SafeLogger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

data class SubtitleTrack(
    val id: String,
    val languageCode: String, // e.g. "ar", "en", "es", "fr"
    val label: String,        // e.g. "Arabic", "English", "French"
    val format: SubtitleFormat,
    val url: String,
    val isDefault: Boolean = false,
    val isDownloaded: Boolean = false,
    val localFilePath: String? = null
)

enum class SubtitleFormat {
    VTT,
    SRT,
    TTML,
    UNKNOWN
}

class SubtitleService(private val context: Context) {

    private val logger = SafeLogger.getLogger("SubtitleService")
    private val cacheDir: File = File(context.cacheDir, "subtitles").apply { mkdirs() }

    private val _availableTracks = MutableStateFlow<List<SubtitleTrack>>(emptyList())
    val availableTracks: StateFlow<List<SubtitleTrack>> = _availableTracks.asStateFlow()

    private val _selectedTrack = MutableStateFlow<SubtitleTrack?>(null)
    val selectedTrack: StateFlow<SubtitleTrack?> = _selectedTrack.asStateFlow()

    /**
     * Registers and indexes subtitle tracks for a media item.
     * Automatically prioritizes user device language (Arabic or English).
     */
    fun setTracks(tracks: List<SubtitleTrack>, preferredLanguage: String? = null) {
        val targetLang = preferredLanguage ?: Locale.getDefault().language
        val normalized = tracks.map { track ->
            val isAutoMatch = track.languageCode.equals(targetLang, ignoreCase = true) ||
                    (targetLang == "ar" && track.label.contains("Arab", ignoreCase = true)) ||
                    (targetLang == "en" && track.label.contains("Eng", ignoreCase = true))
            track.copy(isDefault = isAutoMatch)
        }
        _availableTracks.value = normalized

        // Auto-select preferred or fallback to default
        val matched = normalized.firstOrNull { it.isDefault }
            ?: normalized.firstOrNull { it.languageCode.equals("ar", ignoreCase = true) }
            ?: normalized.firstOrNull { it.languageCode.equals("en", ignoreCase = true) }
            ?: normalized.firstOrNull()

        _selectedTrack.value = matched
        logger.i("Subtitles initialized: ${normalized.size} tracks, auto-selected: ${matched?.label ?: "None"}")
    }

    fun selectTrack(trackId: String?) {
        if (trackId == null) {
            _selectedTrack.value = null
            logger.i("Subtitles disabled")
            return
        }
        val match = _availableTracks.value.firstOrNull { it.id == trackId }
        _selectedTrack.value = match
        logger.i("Selected subtitle track: ${match?.label}")
    }

    /**
     * Downloads and caches a remote VTT/SRT subtitle track to local disk.
     */
    suspend fun downloadSubtitle(track: SubtitleTrack): Result<File> = withContext(Dispatchers.IO) {
        try {
            val extension = if (track.format == SubtitleFormat.VTT) "vtt" else "srt"
            val targetFile = File(cacheDir, "${track.id.hashCode()}_${track.languageCode}.$extension")
            if (targetFile.exists() && targetFile.length() > 0) {
                return@withContext Result.success(targetFile)
            }

            val conn = URL(track.url).openConnection() as HttpURLConnection
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.requestMethod = "GET"
            conn.setRequestProperty("User-Agent", "HDOFLIX-Player/2.0")

            if (conn.responseCode in 200..299) {
                conn.inputStream.use { input ->
                    targetFile.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
                logger.i("Subtitle downloaded successfully: ${targetFile.absolutePath}")
                Result.success(targetFile)
            } else {
                Result.failure(Exception("HTTP error ${conn.responseCode} while downloading subtitles"))
            }
        } catch (e: Exception) {
            logger.e("Failed to download subtitle: ${e.message}")
            Result.failure(e)
        }
    }

    fun clearCache() {
        try {
            cacheDir.listFiles()?.forEach { it.delete() }
            logger.i("Subtitle cache cleared")
        } catch (e: Exception) {
            logger.e("Failed to clear subtitle cache: ${e.message}")
        }
    }
}
