package com.example.server

import com.example.model.MediaType

data class MediaRequest(
    val tmdbId: Long,
    val imdbId: String? = null,
    val type: MediaType,
    val title: String,
    val year: String? = null,
    val season: Int = 1,
    val episode: Int = 1,
    val originalTitle: String? = null,
    val releaseDate: String? = null,
    val mediaId: String? = null
)

enum class StreamQuality(val label: String, val rank: Int) {
    UHD_4K("4K UHD", 400),
    FHD_1080P("1080p FHD", 300),
    HD_720P("720p HD", 200),
    SD_480P("480p SD", 100),
    AUTO("Auto", 250);

    companion object {
        fun fromString(value: String?): StreamQuality {
            return when {
                value?.contains("4K", ignoreCase = true) == true -> UHD_4K
                value?.contains("1080", ignoreCase = true) == true -> FHD_1080P
                value?.contains("720", ignoreCase = true) == true -> HD_720P
                value?.contains("480", ignoreCase = true) == true -> SD_480P
                else -> FHD_1080P
            }
        }
    }
}

data class SubtitleTrack(
    val name: String,
    val url: String,
    val lang: String = "en",
    val isDefault: Boolean = false
)

data class ServerStream(
    val id: String,
    val provider: String = "direct",
    val server: String = "Server",
    val name: String = server,
    val nameAr: String? = null,
    val providerId: String = provider,
    val host: String? = null,
    val url: String,
    val type: String = "embed", // "hls", "mp4", "mpd", "unknown", "embed"
    val quality: StreamQuality = StreamQuality.FHD_1080P,
    val qualityLabel: String = quality.label,
    val bitrate: Long? = null,
    val headers: Map<String, String> = emptyMap(),
    val subtitles: List<SubtitleTrack> = emptyList(),
    val priority: Int = 10,
    val providerPriority: Int = priority,
    val serverPriority: Int = 10,
    val responseTimeMs: Long = 0,
    val isPlayable: Boolean = true,
    val isAvailable: Boolean = true,
    val isRecommended: Boolean = false,
    val isDirectStream: Boolean = false,
    val format: String = type
) {
    // Aliases to match unified ServerResult model
    val available: Boolean get() = isAvailable && isPlayable
    val responseTime: Long get() = responseTimeMs
}

typealias ServerResult = ServerStream

interface ServerProvider {
    val id: String
    val name: String
    val priority: Int
    val supportedTypes: List<MediaType>

    fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    suspend fun resolve(request: MediaRequest): List<ServerStream>
    suspend fun resolveStreams(request: MediaRequest): List<ServerStream> = resolve(request)
    suspend fun isAvailable(): Boolean = true
}

data class ProviderConfig(
    val id: String,
    val enabled: Boolean = true,
    val priority: Int = 100,
    val supportsMovie: Boolean = true,
    val supportsTv: Boolean = true,
    val timeoutMs: Long = 8000L,
    val label: String? = null
)

data class SortingWeights(
    val qualityWeight: Int = 40,
    val speedWeight: Int = 30,
    val priorityWeight: Int = 30
)

data class RemoteServerConfig(
    val enabled: Boolean = true,
    val maxServersToResolve: Int = 10,
    val providers: List<ProviderConfig> = emptyList(),
    val sorting: SortingWeights = SortingWeights()
)

data class ValidationResult(
    val isValid: Boolean,
    val responseTimeMs: Long,
    val statusCode: Int? = null,
    val streamType: String? = null,
    val errorMessage: String? = null
)

data class ServerManagerConfig(
    val timeoutPerProviderMs: Long = 8000L,
    val maxServersToReturn: Int = 35,
    val enableCache: Boolean = true,
    val cacheTtlMs: Long = 10 * 60 * 1000L,
    val backendUrl: String? = null,
    val sortingWeights: SortingWeights = SortingWeights()
)
