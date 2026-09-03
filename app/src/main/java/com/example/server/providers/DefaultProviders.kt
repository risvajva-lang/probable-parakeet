package com.example.server.providers

import com.example.model.MediaType
import com.example.server.MediaRequest
import com.example.server.ServerProvider
import com.example.server.ServerStream
import com.example.server.StreamQuality
import com.example.server.SubtitleTrack

/**
 * Generic adapter for self-hosted or licensed HLS/MP4 content.
 */
class LicensedDirectStreamProvider(
    private val baseUrl: String? = null,
    override val id: String = "licensed_direct",
    override val name: String = "Direct Stream VIP",
    override val priority: Int = 100,
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)
) : ServerProvider {

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val root = baseUrl ?: return emptyList()
        val path = if (request.type == MediaType.MOVIE) {
            "movies/${request.tmdbId}/master.m3u8"
        } else {
            "tv/${request.tmdbId}/s${request.season}e${request.episode}/master.m3u8"
        }
        val fullUrl = "${root.trimEnd('/')}/$path"

        val subtitles = listOf(
            SubtitleTrack(name = "العربية (Arabic)", url = "${root.trimEnd('/')}/subs/${request.tmdbId}_ar.vtt", lang = "ar", isDefault = true),
            SubtitleTrack(name = "English", url = "${root.trimEnd('/')}/subs/${request.tmdbId}_en.vtt", lang = "en")
        )

        return listOf(
            ServerStream(
                id = "${id}_hls",
                provider = id,
                server = "Recommended",
                name = "Direct Stream VIP",
                nameAr = "سيرفر مباشر VIP",
                url = fullUrl,
                type = "hls",
                quality = StreamQuality.FHD_1080P,
                subtitles = subtitles,
                priority = priority,
                responseTimeMs = 95,
                isDirectStream = true,
                isPlayable = true,
                isRecommended = true
            )
        )
    }
}

class WisteriaProvider : ServerProvider {
    override val id: String = "wisteria"
    override val name: String = "Recommended"
    override val priority: Int = 95
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://videm.xyz/embed/movie/${request.tmdbId}"
        } else {
            "https://videm.xyz/embed/tv/${request.tmdbId}/${request.season}/${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "wisteria_fast",
                provider = id,
                server = "Recommended",
                name = "Recommended VIP",
                nameAr = "Recommended (سريع VIP)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 110,
                isPlayable = true,
                isRecommended = true
            )
        )
    }
}

class LarkspurProvider : ServerProvider {
    override val id: String = "larkspur"
    override val name: String = "Fast"
    override val priority: Int = 90
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://embos.top/movie/?mid=${request.tmdbId}"
        } else {
            "https://embos.top/tv/?mid=${request.tmdbId}&s=${request.season}&e=${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "larkspur_stream",
                provider = id,
                server = "Fast",
                name = "Fast Server",
                nameAr = "Fast (عالي الدقة)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 145,
                isPlayable = true
            )
        )
    }
}

class FerrowProvider : ServerProvider {
    override val id: String = "ferrow"
    override val name: String = "Ultra 4K"
    override val priority: Int = 85
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://vidlink.pro/movie/${request.tmdbId}"
        } else {
            "https://vidlink.pro/tv/${request.tmdbId}/${request.season}/${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "ferrow_stream",
                provider = id,
                server = "Ultra 4K",
                name = "Ultra 4K",
                nameAr = "Ultra 4K (فائق السرعة)",
                url = url,
                type = "embed",
                quality = StreamQuality.UHD_4K,
                priority = priority,
                responseTimeMs = 175,
                isPlayable = true
            )
        )
    }
}

class AshgroveProvider : ServerProvider {
    override val id: String = "ashgrove"
    override val name: String = "1080p HD"
    override val priority: Int = 80
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://www.vidking.net/embed/movie/${request.tmdbId}"
        } else {
            "https://www.vidking.net/embed/tv/${request.tmdbId}/${request.season}/${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "ashgrove_stream",
                provider = id,
                server = "1080p HD",
                name = "1080p HD",
                nameAr = "1080p HD (رسمي)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 195,
                isPlayable = true
            )
        )
    }
}

class VidSrcProvider : ServerProvider {
    override val id: String = "vidsrc"
    override val name: String = "Pro Stream"
    override val priority: Int = 75
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://vidsrc.xyz/embed/movie?tmdb=${request.tmdbId}"
        } else {
            "https://vidsrc.xyz/embed/tv?tmdb=${request.tmdbId}&season=${request.season}&episode=${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "vidsrc_pro",
                provider = id,
                server = "Pro Stream",
                name = "Pro Stream",
                nameAr = "Pro Stream (رئيسي)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 230,
                isPlayable = true
            )
        )
    }
}

class SuperEmbedProvider : ServerProvider {
    override val id: String = "superembed"
    override val name: String = "Multi-Quality"
    override val priority: Int = 70
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://multiembed.mov/?video_id=${request.tmdbId}&tmdb=1"
        } else {
            "https://multiembed.mov/?video_id=${request.tmdbId}&tmdb=1&s=${request.season}&e=${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "superembed_multi",
                provider = id,
                server = "Multi-Quality",
                name = "Multi-Quality",
                nameAr = "Multi-Quality (متعدد الجودات)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 260,
                isPlayable = true
            )
        )
    }
}

class AutoEmbedProvider : ServerProvider {
    override val id: String = "autoembed"
    override val name: String = "Auto Source"
    override val priority: Int = 65
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://autoembed.co/movie/tmdb/${request.tmdbId}"
        } else {
            "https://autoembed.co/tv/tmdb/${request.tmdbId}-${request.season}-${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "autoembed_co",
                provider = id,
                server = "Auto Source",
                name = "Auto Source",
                nameAr = "Auto Source (تلقائي)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 285,
                isPlayable = true
            )
        )
    }
}

class SmashyStreamProvider : ServerProvider {
    override val id: String = "smashystream"
    override val name: String = "Backup Server"
    override val priority: Int = 60
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://embed.smashystream.com/playere.php?tmdb=${request.tmdbId}"
        } else {
            "https://embed.smashystream.com/playere.php?tmdb=${request.tmdbId}&season=${request.season}&episode=${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "smashy_stream",
                provider = id,
                server = "Backup Server",
                name = "Backup Server",
                nameAr = "Backup (احتياطي)",
                url = url,
                type = "embed",
                quality = StreamQuality.HD_720P,
                priority = priority,
                responseTimeMs = 310,
                isPlayable = true
            )
        )
    }
}

class EmbedWiseProvider : ServerProvider {
    override val id: String = "embedwise"
    override val name: String = "Direct Player"
    override val priority: Int = 55
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = if (request.type == MediaType.MOVIE) {
            "https://player.videasy.net/movie/${request.tmdbId}"
        } else {
            "https://player.videasy.net/tv/${request.tmdbId}/${request.season}/${request.episode}"
        }
        return listOf(
            ServerStream(
                id = "embedwise_player",
                provider = id,
                server = "Direct Player",
                name = "Direct Player",
                nameAr = "Direct Player (سريع)",
                url = url,
                type = "embed",
                quality = StreamQuality.FHD_1080P,
                priority = priority,
                responseTimeMs = 330,
                isPlayable = true
            )
        )
    }
}

/**
 * Adapter bridging all configured servers from ServersRepository into the dynamic ServerProvider system.
 */
class ConfiguredServerProvider(
    private val providerData: com.example.model.ServerProvider
) : ServerProvider {
    override val id: String = providerData.id
    override val name: String = providerData.name
    override val priority: Int = (100 - providerData.priority).coerceAtLeast(1)
    override val supportedTypes: List<MediaType> = listOf(MediaType.MOVIE, MediaType.TV, MediaType.ANIME, MediaType.CARTOON)

    override fun supports(request: MediaRequest): Boolean = supportedTypes.contains(request.type)

    override suspend fun resolve(request: MediaRequest): List<ServerStream> {
        val url = com.example.data.ServersRepository.buildServerUrl(
            server = providerData,
            tmdbId = request.tmdbId,
            type = request.type,
            season = request.season,
            episode = request.episode
        )
        val quality = StreamQuality.fromString(providerData.quality)
        return listOf(
            ServerStream(
                id = "${providerData.id}_stream",
                provider = providerData.id,
                server = providerData.name,
                name = providerData.name,
                nameAr = providerData.nameAr,
                url = url,
                type = "embed",
                quality = quality,
                priority = priority,
                responseTimeMs = (95L + (providerData.priority * 12L)),
                isPlayable = true,
                isAvailable = true,
                isRecommended = providerData.isVip && providerData.priority <= 3
            )
        )
    }
}

