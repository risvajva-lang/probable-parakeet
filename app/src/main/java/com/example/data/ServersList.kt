package com.example.data

import com.example.model.MediaType
import com.example.model.ServerProvider

object ServersRepository {
    val SERVERS: List<ServerProvider> = listOf(
        ServerProvider(
            id = "videm_xyz",
            name = "Videm",
            nameAr = "Videm (سريع VIP)",
            movieTemplate = "https://videm.xyz/embed/movie/{tmdb_id}",
            tvTemplate = "https://videm.xyz/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 1,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "embos_top",
            name = "Embos",
            nameAr = "Embos (سريع VIP)",
            movieTemplate = "https://embos.top/movie/?mid={tmdb_id}",
            tvTemplate = "https://embos.top/tv/?mid={tmdb_id}&s={season}&e={episode}",
            priority = 2,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidlink_pro_direct",
            name = "VidLink Pro Direct",
            nameAr = "VidLink Pro Direct (4K VIP)",
            movieTemplate = "https://vidlink.pro/movie/{tmdb_id}",
            tvTemplate = "https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}",
            priority = 3,
            quality = "4K UHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidking_1",
            name = "VidKing",
            nameAr = "VidKing (1080p)",
            movieTemplate = "https://www.vidking.net/embed/movie/{tmdb_id}",
            tvTemplate = "https://www.vidking.net/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 4,
            quality = "1080p FHD",
            isVip = true,
            group = "fast"
        ),
        ServerProvider(
            id = "peachify",
            name = "Peachify",
            nameAr = "Peachify (سريع)",
            movieTemplate = "https://peachify.top/embed/movie/{tmdb_id}",
            tvTemplate = "https://peachify.top/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 5,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "videasy_1",
            name = "Videasy",
            nameAr = "Videasy (FHD)",
            movieTemplate = "https://player.videasy.net/movie/{tmdb_id}",
            tvTemplate = "https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}",
            priority = 6,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidnest_1",
            name = "VidNest",
            nameAr = "VidNest (1080p)",
            movieTemplate = "https://vidnest.fun/movie/{tmdb_id}",
            tvTemplate = "https://vidnest.fun/tv/{tmdb_id}/{season}/{episode}",
            priority = 7,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "vidfast_1",
            name = "VidFast",
            nameAr = "VidFast (سريع)",
            movieTemplate = "https://vidfast.pro/movie/{tmdb_id}",
            tvTemplate = "https://vidfast.pro/tv/{tmdb_id}/{season}/{episode}",
            priority = 8,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidlink_1",
            name = "VidLink",
            nameAr = "VidLink (4K VIP)",
            movieTemplate = "https://vidlink.pro/movie/{tmdb_id}",
            tvTemplate = "https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}",
            priority = 9,
            quality = "4K UHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidsrc_pm_node",
            name = "VidSrc PM Node",
            nameAr = "VidSrc PM Node (سريع)",
            movieTemplate = "https://vidsrc.pm/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.pm/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 10,
            quality = "1080p FHD",
            isVip = false,
            group = "vidsrc"
        ),
        ServerProvider(
            id = "movies111",
            name = "Movies111",
            nameAr = "Movies111 (1080p)",
            movieTemplate = "https://111movies.com/movie/{tmdb_id}",
            tvTemplate = "https://111movies.com/tv/{tmdb_id}/{season}/{episode}",
            priority = 11,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "vidsrc_in_main",
            name = "VidSrc.in",
            nameAr = "VidSrc.in (FHD)",
            movieTemplate = "https://vidsrc.in/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.in/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 12,
            quality = "1080p FHD",
            isVip = true,
            group = "vidsrc"
        ),
        ServerProvider(
            id = "vidfyi",
            name = "VidFyi",
            nameAr = "VidFyi (FHD)",
            movieTemplate = "https://vidsrc.fyi/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.fyi/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 13,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "hyperlink_1",
            name = "HyperLink",
            nameAr = "HyperLink (1080p)",
            movieTemplate = "https://autoembed.co/movie/tmdb/{tmdb_id}",
            tvTemplate = "https://autoembed.co/tv/tmdb/{tmdb_id}/{season}/{episode}",
            priority = 14,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidcore_vidsrc_sbs_1",
            name = "VidCore SBS",
            nameAr = "VidCore SBS (VIP)",
            movieTemplate = "https://vidsrc.sbs/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.sbs/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 15,
            quality = "1080p FHD",
            isVip = true,
            group = "vidsrc"
        ),
        ServerProvider(
            id = "vidcore_1",
            name = "VidCore",
            nameAr = "VidCore (FHD)",
            movieTemplate = "https://vidcore.org/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidcore.org/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 16,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidsrc_sbs_1",
            name = "VidSrc SBS",
            nameAr = "VidSrc SBS (سريع)",
            movieTemplate = "https://vidsrc.sbs/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.sbs/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 17,
            quality = "1080p FHD",
            isVip = false,
            group = "vidsrc"
        ),
        ServerProvider(
            id = "vidlink_vip_autosub_1",
            name = "VidLink VIP AutoSub",
            nameAr = "VidLink VIP (ترجمة عربية)",
            movieTemplate = "https://vidlink.pro/movie/{tmdb_id}?sub_lang=ar",
            tvTemplate = "https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}?sub_lang=ar",
            priority = 18,
            quality = "4K UHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidking_2",
            name = "VidKing 2",
            nameAr = "VidKing (سيرفر 2)",
            movieTemplate = "https://www.vidking.net/embed/movie/{tmdb_id}",
            tvTemplate = "https://www.vidking.net/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 19,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "videasy_2",
            name = "Videasy 2",
            nameAr = "Videasy (سيرفر 2)",
            movieTemplate = "https://player.videasy.net/movie/{tmdb_id}",
            tvTemplate = "https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}",
            priority = 20,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidrock",
            name = "VidRock",
            nameAr = "VidRock (سريع)",
            movieTemplate = "https://vidrock.net/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidrock.net/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 21,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "nontongo",
            name = "NonTongo",
            nameAr = "NonTongo (FHD)",
            movieTemplate = "https://nontongo.win/embed/movie/{tmdb_id}",
            tvTemplate = "https://nontongo.win/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 22,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "two_embed_cloud",
            name = "2Embed Cloud",
            nameAr = "2Embed Cloud (سريع)",
            movieTemplate = "https://www.2embed.cc/embed/{tmdb_id}",
            tvTemplate = "https://www.2embed.cc/embedtv/{tmdb_id}&s={season}&e={episode}",
            priority = 23,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "videasy_ultra",
            name = "Videasy Ultra",
            nameAr = "Videasy Ultra (VIP)",
            movieTemplate = "https://player.videasy.net/movie/{tmdb_id}",
            tvTemplate = "https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}",
            priority = 24,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "smashystream_fast",
            name = "SmashyStream Fast",
            nameAr = "SmashyStream Fast (سريع)",
            movieTemplate = "https://embed.smashystream.com/playere.php?tmdb={tmdb_id}",
            tvTemplate = "https://embed.smashystream.com/playere.php?tmdb={tmdb_id}&season={season}&episode={episode}",
            priority = 25,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "vidfast_2",
            name = "VidFast 2",
            nameAr = "VidFast (سيرفر 2)",
            movieTemplate = "https://vidfast.pro/movie/{tmdb_id}",
            tvTemplate = "https://vidfast.pro/tv/{tmdb_id}/{season}/{episode}",
            priority = 26,
            quality = "1080p FHD",
            isVip = true,
            group = "vip"
        ),
        ServerProvider(
            id = "vidmov",
            name = "VidMov",
            nameAr = "VidMov (سريع)",
            movieTemplate = "https://vidmov.com/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidmov.com/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 27,
            quality = "1080p FHD",
            isVip = false,
            group = "fast"
        ),
        ServerProvider(
            id = "vidsrc_direct",
            name = "VidSrc Direct",
            nameAr = "VidSrc (FHD)",
            movieTemplate = "https://vidsrc.to/embed/movie/{tmdb_id}",
            tvTemplate = "https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}",
            priority = 28,
            quality = "1080p FHD",
            isVip = false,
            group = "vidsrc"
        )
    )

    fun buildServerUrl(
        server: ServerProvider,
        tmdbId: Long,
        type: MediaType,
        season: Int = 1,
        episode: Int = 1
    ): String {
        val isMovie = type == MediaType.MOVIE
        val template = if (isMovie) server.movieTemplate else server.tvTemplate
        return template
            .replace("{tmdb_id}", tmdbId.toString())
            .replace("{season}", season.toString())
            .replace("{episode}", episode.toString())
            .replace("{s}", season.toString())
            .replace("{e}", episode.toString())
    }
}
