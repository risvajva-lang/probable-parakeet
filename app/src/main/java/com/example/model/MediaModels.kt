package com.example.model

enum class MediaType(val rawValue: String, val titleAr: String) {
    MOVIE("movie", "فيلم"),
    TV("tv", "مسلسل"),
    ANIME("anime", "أنمي"),
    CARTOON("cartoon", "كرتون");

    companion object {
        fun fromString(value: String?): MediaType {
            return when (value?.lowercase()) {
                "tv", "series" -> TV
                "anime" -> ANIME
                "cartoon" -> CARTOON
                else -> MOVIE
            }
        }
    }
}

data class CastMember(
    val id: Long,
    val name: String,
    val character: String? = null,
    val profilePath: String? = null
)

data class EpisodeInfo(
    val episodeNumber: Int,
    val seasonNumber: Int,
    val title: String,
    val overview: String? = null,
    val stillPath: String? = null,
    val airDate: String? = null
)

data class SeasonInfo(
    val seasonNumber: Int,
    val title: String,
    val episodesCount: Int,
    val posterPath: String? = null,
    val airDate: String? = null,
    val episodes: List<EpisodeInfo> = emptyList()
)

data class MediaItem(
    val tmdbId: Long,
    val title: String,
    val originalTitle: String? = null,
    val imdbId: String? = null,
    val type: MediaType = MediaType.MOVIE,
    val posterPath: String? = null,
    val backdropPath: String? = null,
    val voteAverage: Double = 0.0,
    val voteCount: Long = 0,
    val popularity: Double = 0.0,
    val releaseDate: String? = null,
    val year: String? = null,
    val overview: String = "",
    val genres: List<String> = emptyList(),
    val quality: String = "1080p FHD",
    val duration: String? = null,
    val seasonsCount: Int = 1,
    val episodesCount: Int = 1,
    val seasons: List<SeasonInfo> = emptyList(),
    val cast: List<CastMember> = emptyList(),
    val director: String? = null,
    val isTrending: Boolean = false
) {
    val fullPosterUrl: String
        get() = if (posterPath.isNullOrBlank()) {
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60"
        } else if (posterPath.startsWith("http")) {
            posterPath
        } else {
            "https://image.tmdb.org/t/p/w500$posterPath"
        }

    val fullBackdropUrl: String
        get() = if (backdropPath.isNullOrBlank()) {
            fullPosterUrl
        } else if (backdropPath.startsWith("http")) {
            backdropPath
        } else {
            "https://image.tmdb.org/t/p/original$backdropPath"
        }
}

data class ServerProvider(
    val id: String,
    val name: String,
    val nameAr: String,
    val movieTemplate: String,
    val tvTemplate: String,
    val priority: Int,
    val quality: String,
    val isVip: Boolean,
    val group: String = "vip"
)

enum class AppCategory(val id: String, val titleAr: String, val titleEn: String = "Home") {
    HOME("home", "الرئيسية", "Home"),
    MOVIES("movies", "الأفلام", "Movies"),
    TV("tv", "المسلسلات", "TV Shows"),
    GENRES("genres", "التصنيفات", "Genres"),
    SETTINGS("settings", "الإعدادات", "Settings"),
    FAVORITES("favorites", "المفضلة", "Favorites"),
    HISTORY("history", "السجل", "History"),
    ALL("all", "الرئيسية", "Home"),
    MOVIE("movie", "الأفلام", "Movies"),
    ANIME("anime", "أنمي", "Anime"),
    CARTOON("cartoon", "كرتون", "Cartoon"),
    TRENDING("trending", "الرائج", "Trending")
}
