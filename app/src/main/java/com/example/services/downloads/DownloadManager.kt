package com.example.services.downloads

import android.content.Context
import android.os.Environment
import android.os.StatFs
import com.example.player.SafeLogger
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

enum class DownloadStatus {
    QUEUED,
    DOWNLOADING,
    PAUSED,
    COMPLETED,
    FAILED,
    CANCELLED
}

data class DownloadTask(
    val id: String,
    val tmdbId: Long,
    val title: String,
    val posterPath: String?,
    val mediaType: String,
    val season: Int = 1,
    val episode: Int = 1,
    val streamUrl: String,
    val quality: String = "1080p",
    val progress: Float = 0f, // 0.0 to 1.0
    val bytesDownloaded: Long = 0L,
    val totalBytes: Long = 0L,
    val status: DownloadStatus = DownloadStatus.QUEUED,
    val localFilePath: String? = null,
    val errorMessage: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

data class StorageInfo(
    val freeBytes: Long,
    val totalBytes: Long,
    val appUsedBytes: Long
)

class DownloadManager(private val context: Context) {

    private val logger = SafeLogger.getLogger("DownloadManager")
    private val scope = CoroutineScope(Dispatchers.IO)
    private val downloadJobs = mutableMapOf<String, Job>()

    private val downloadDir: File = File(context.getExternalFilesDir(Environment.DIRECTORY_MOVIES), "HDOFLIX_Downloads").apply { mkdirs() }

    private val _tasks = MutableStateFlow<List<DownloadTask>>(emptyList())
    val tasks: StateFlow<List<DownloadTask>> = _tasks.asStateFlow()

    private val _storageInfo = MutableStateFlow(calculateStorage())
    val storageInfo: StateFlow<StorageInfo> = _storageInfo.asStateFlow()

    fun enqueueDownload(
        tmdbId: Long,
        title: String,
        posterPath: String?,
        mediaType: String,
        season: Int = 1,
        episode: Int = 1,
        streamUrl: String,
        quality: String = "1080p"
    ): String {
        val taskId = "${tmdbId}_S${season}_E${episode}_${quality}"
        val existing = _tasks.value.firstOrNull { it.id == taskId }
        if (existing != null && existing.status == DownloadStatus.COMPLETED) {
            logger.i("Download already completed for: $title")
            return taskId
        }

        val task = DownloadTask(
            id = taskId,
            tmdbId = tmdbId,
            title = title,
            posterPath = posterPath,
            mediaType = mediaType,
            season = season,
            episode = episode,
            streamUrl = streamUrl,
            quality = quality,
            status = DownloadStatus.QUEUED
        )

        _tasks.value = _tasks.value.filterNot { it.id == taskId } + task
        logger.i("Enqueued download task: $taskId for $title")
        startDownload(taskId)
        return taskId
    }

    fun startDownload(taskId: String) {
        val task = _tasks.value.firstOrNull { it.id == taskId } ?: return
        if (task.status == DownloadStatus.DOWNLOADING) return

        updateTask(taskId) { it.copy(status = DownloadStatus.DOWNLOADING, errorMessage = null) }

        val job = scope.launch {
            try {
                val fileName = "${task.title.replace(Regex("[^a-zA-Z0-9.-]"), "_")}_${task.id}.mp4"
                val destination = File(downloadDir, fileName)

                val url = URL(task.streamUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 15000
                conn.readTimeout = 15000
                conn.requestMethod = "GET"
                conn.setRequestProperty("User-Agent", "HDOFLIX-Downloader/2.0")

                val totalLength = conn.contentLengthLong
                var bytesReadTotal = 0L

                conn.inputStream.use { input ->
                    destination.outputStream().use { output ->
                        val buffer = ByteArray(32 * 1024)
                        var read: Int
                        var lastReportTime = System.currentTimeMillis()

                        while (input.read(buffer).also { read = it } != -1) {
                            output.write(buffer, 0, read)
                            bytesReadTotal += read

                            val now = System.currentTimeMillis()
                            if (now - lastReportTime > 500) {
                                lastReportTime = now
                                val progress = if (totalLength > 0) bytesReadTotal.toFloat() / totalLength else 0.5f
                                updateTask(taskId) {
                                    it.copy(
                                        bytesDownloaded = bytesReadTotal,
                                        totalBytes = totalLength,
                                        progress = progress
                                    )
                                }
                            }
                        }
                    }
                }

                updateTask(taskId) {
                    it.copy(
                        status = DownloadStatus.COMPLETED,
                        progress = 1.0f,
                        bytesDownloaded = bytesReadTotal,
                        totalBytes = bytesReadTotal,
                        localFilePath = destination.absolutePath
                    )
                }
                _storageInfo.value = calculateStorage()
                logger.i("Download task completed successfully: $taskId")
            } catch (e: Exception) {
                logger.e("Download failed for $taskId: ${e.message}")
                updateTask(taskId) {
                    it.copy(
                        status = DownloadStatus.FAILED,
                        errorMessage = e.message ?: "Download interrupted"
                    )
                }
            } finally {
                downloadJobs.remove(taskId)
            }
        }
        downloadJobs[taskId] = job
    }

    fun pauseDownload(taskId: String) {
        downloadJobs[taskId]?.cancel()
        downloadJobs.remove(taskId)
        updateTask(taskId) { it.copy(status = DownloadStatus.PAUSED) }
        logger.i("Paused download: $taskId")
    }

    fun resumeDownload(taskId: String) {
        startDownload(taskId)
    }

    fun cancelDownload(taskId: String) {
        downloadJobs[taskId]?.cancel()
        downloadJobs.remove(taskId)
        val task = _tasks.value.firstOrNull { it.id == taskId }
        task?.localFilePath?.let { File(it).delete() }
        _tasks.value = _tasks.value.filterNot { it.id == taskId }
        _storageInfo.value = calculateStorage()
        logger.i("Cancelled and removed download: $taskId")
    }

    fun deleteDownloadedFile(taskId: String) {
        cancelDownload(taskId)
    }

    private fun updateTask(taskId: String, transform: (DownloadTask) -> DownloadTask) {
        _tasks.value = _tasks.value.map {
            if (it.id == taskId) transform(it) else it
        }
    }

    fun calculateStorage(): StorageInfo {
        return try {
            val stat = StatFs(context.filesDir.path)
            val free = stat.availableBlocksLong * stat.blockSizeLong
            val total = stat.blockCountLong * stat.blockSizeLong
            val appUsed = downloadDir.walkTopDown().filter { it.isFile }.map { it.length() }.sum()
            StorageInfo(freeBytes = free, totalBytes = total, appUsedBytes = appUsed)
        } catch (e: Exception) {
            StorageInfo(freeBytes = 10L * 1024 * 1024 * 1024, totalBytes = 64L * 1024 * 1024 * 1024, appUsedBytes = 0L)
        }
    }

    companion object {
        @Volatile
        private var instance: DownloadManager? = null

        fun getInstance(context: Context): DownloadManager {
            return instance ?: synchronized(this) {
                instance ?: DownloadManager(context.applicationContext).also { instance = it }
            }
        }
    }
}
