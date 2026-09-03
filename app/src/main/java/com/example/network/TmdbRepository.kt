package com.example.network

import com.example.model.CastMember
import com.example.model.EpisodeInfo
import com.example.model.MediaItem
import com.example.model.MediaType
import com.example.model.SeasonInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

class TmdbRepository {

    private val apiKeys = listOf(
        "1cf50e6248dc270629e802686245c2c8",
        "844dba0bfd8f3a4f3799f6130ef9e335",
        "c0b0a88006bfdc37f6a7d5cf59de96dc",
        "39b1a511ec9cf5c777492c0ee9bc1777",
        "f7e2d9b6e828d1c9efbe4ff4be3ef3bf",
        "4e44d9029b1270a757cddc766a1bcb63",
        "b66e3ff5c13e4b77d6da0593b4a2f2ef"
    )

    private val keyIndex = AtomicInteger(0)

    private fun getActiveKey(): String {
        val idx = Math.abs(keyIndex.get() % apiKeys.size)
        return apiKeys[idx]
    }

    private fun rotateKey() {
        keyIndex.incrementAndGet()
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val baseUrl = "https://api.themoviedb.org/3"

    private suspend fun fetchJson(endpoint: String, extraParams: Map<String, String> = emptyMap()): JSONObject? =
        withContext(Dispatchers.IO) {
            for (attempt in apiKeys.indices) {
                val key = getActiveKey()
                val urlBuilder = StringBuilder("$baseUrl$endpoint")
                val separator = if (endpoint.contains("?")) "&" else "?"
                urlBuilder.append("${separator}api_key=$key&language=ar-SA")

                for ((k, v) in extraParams) {
                    urlBuilder.append("&$k=$v")
                }

                val request = Request.Builder()
                    .url(urlBuilder.toString())
                    .header("Accept", "application/json")
                    .build()

                try {
                    client.newCall(request).execute().use { response ->
                        if (response.code in 401..403 || response.code == 429) {
                            rotateKey()
                            return@use
                        }
                        if (response.isSuccessful) {
                            val body = response.body?.string()
                            if (!body.isNullOrBlank()) {
                                return@withContext JSONObject(body)
                            }
                        }
                    }
                } catch (e: Exception) {
                    rotateKey()
                }
            }
            null
        }

    private val genresMap = mapOf(
        28 to "أكشن",
        12 to "مغامرة",
        16 to "أنمي ورسوم متحركة",
        35 to "كوميديا",
        80 to "جريمة",
        99 to "وثائقي",
        18 to "دراما",
        10751 to "عائلي",
        14 to "فانتازيا",
        36 to "تاريخي",
        27 to "رعب",
        10402 to "موسيقى",
        9648 to "غموض",
        10749 to "رومانسي",
        878 to "خيال علمي",
        53 to "إثارة وتشويق",
        10752 to "حرب",
        37 to "غرب أمريكي",
        10759 to "حركة ومغامرة",
        10762 to "أطفال",
        10765 to "خيال علمي وفانتازيا",
        10766 to "مسلسلات درامية"
    )

    private fun parseMediaItem(obj: JSONObject, forcedType: MediaType? = null): MediaItem {
        val tmdbId = obj.optLong("id")
        val title = obj.optString("title").ifBlank {
            obj.optString("name").ifBlank {
                obj.optString("original_title").ifBlank {
                    obj.optString("original_name", "عمل سينمائي")
                }
            }
        }
        val originalTitle = obj.optString("original_title").ifBlank { obj.optString("original_name") }
        val releaseDate = obj.optString("release_date").ifBlank { obj.optString("first_air_date") }
        val year = if (releaseDate.length >= 4) releaseDate.substring(0, 4) else null

        val isAnimation = obj.optJSONArray("genre_ids")?.let { ids ->
            (0 until ids.length()).any { ids.getInt(it) == 16 }
        } ?: false

        val originalLang = obj.optString("original_language")
        val detectedType = when {
            forcedType != null -> forcedType
            isAnimation -> if (originalLang == "ja") MediaType.ANIME else MediaType.CARTOON
            obj.has("title") || obj.optString("media_type") == "movie" -> MediaType.MOVIE
            else -> MediaType.TV
        }

        val genresList = mutableListOf<String>()
        val genreIdsJson = obj.optJSONArray("genre_ids")
        if (genreIdsJson != null) {
            for (i in 0 until genreIdsJson.length()) {
                val gId = genreIdsJson.optInt(i)
                genresMap[gId]?.let { genresList.add(it) }
            }
        }
        val genresObj = obj.optJSONArray("genres")
        if (genresObj != null) {
            for (i in 0 until genresObj.length()) {
                val gName = genresObj.optJSONObject(i)?.optString("name")
                if (!gName.isNullOrBlank() && !genresList.contains(gName)) {
                    genresList.add(gName)
                }
            }
        }
        if (genresList.isEmpty()) {
            genresList.add(detectedType.titleAr)
        }

        val voteAvg = obj.optDouble("vote_average", 0.0)
        val voteCount = obj.optLong("vote_count", 0)
        val popularity = obj.optDouble("popularity", 0.0)
        val posterPath = obj.optString("poster_path").takeIf { it.isNotBlank() && it != "null" }
        val backdropPath = obj.optString("backdrop_path").takeIf { it.isNotBlank() && it != "null" }
        val overview = obj.optString("overview").ifBlank {
            "مشاهدة وتفاصيل $title بدقة عالية وسيرفرات سريعة عبر نافذة السينما VIP."
        }

        val quality = if (voteAvg >= 8.0) "4K UHD" else "1080p FHD"
        val seasonsCount = obj.optInt("number_of_seasons", 1)
        val episodesCount = obj.optInt("number_of_episodes", 1)
        val imdbId = obj.optString("imdb_id").takeIf { it.isNotBlank() && it != "null" }
            ?: obj.optJSONObject("external_ids")?.optString("imdb_id")?.takeIf { it.isNotBlank() && it != "null" }

        return MediaItem(
            tmdbId = tmdbId,
            title = title,
            originalTitle = originalTitle,
            imdbId = imdbId,
            type = detectedType,
            posterPath = posterPath,
            backdropPath = backdropPath,
            voteAverage = Math.round(voteAvg * 10.0) / 10.0,
            voteCount = voteCount,
            popularity = popularity,
            releaseDate = releaseDate,
            year = year,
            overview = overview,
            genres = genresList,
            quality = quality,
            seasonsCount = seasonsCount,
            episodesCount = episodesCount,
            isTrending = popularity > 60 || voteAvg >= 7.5
        )
    }

    suspend fun getTrending(page: Int = 1): List<MediaItem> {
        val json = fetchJson("/trending/all/week", mapOf("page" to page.toString()))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item)
            if (!media.posterPath.isNullOrBlank() || !media.backdropPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getMovies(subFilter: String = "popular", page: Int = 1): List<MediaItem> {
        val endpoint = when (subFilter) {
            "top_rated" -> "/movie/top_rated"
            "now_playing" -> "/movie/now_playing"
            "upcoming" -> "/movie/upcoming"
            else -> "/movie/popular"
        }
        val json = fetchJson(endpoint, mapOf("page" to page.toString()))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.MOVIE)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getTvShows(subFilter: String = "popular", page: Int = 1): List<MediaItem> {
        val endpoint = when (subFilter) {
            "top_rated" -> "/tv/top_rated"
            "on_the_air" -> "/tv/on_the_air"
            else -> "/tv/popular"
        }
        val json = fetchJson(endpoint, mapOf("page" to page.toString()))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.TV)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getAnime(page: Int = 1): List<MediaItem> {
        val params = mapOf(
            "with_genres" to "16",
            "with_original_language" to "ja",
            "sort_by" to "popularity.desc",
            "page" to page.toString(),
            "vote_count.gte" to "10"
        )
        val json = fetchJson("/discover/tv", params)
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.ANIME)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getCartoons(page: Int = 1): List<MediaItem> {
        val params = mapOf(
            "with_genres" to "16",
            "without_original_language" to "ja",
            "sort_by" to "popularity.desc",
            "page" to page.toString(),
            "vote_count.gte" to "10"
        )
        val json = fetchJson("/discover/movie", params)
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.CARTOON)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getAiringTodayTv(page: Int = 1): List<MediaItem> {
        val json = fetchJson("/tv/airing_today", mapOf("page" to page.toString()))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.TV)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getAllTimeGreats(page: Int = 1): List<MediaItem> {
        val json = fetchJson("/movie/top_rated", mapOf("page" to page.toString(), "vote_count.gte" to "1000"))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, MediaType.MOVIE)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getByGenre(genreId: Int, isTv: Boolean, page: Int = 1): List<MediaItem> {
        val endpoint = if (isTv) "/discover/tv" else "/discover/movie"
        val params = mapOf(
            "with_genres" to genreId.toString(),
            "sort_by" to "popularity.desc",
            "page" to page.toString()
        )
        val json = fetchJson(endpoint, params)
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val media = parseMediaItem(item, if (isTv) MediaType.TV else MediaType.MOVIE)
            if (!media.posterPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun searchMulti(query: String, page: Int = 1): List<MediaItem> {
        if (query.isBlank()) return emptyList()
        val json = fetchJson("/search/multi", mapOf("query" to query, "page" to page.toString(), "include_adult" to "false"))
        val results = json?.optJSONArray("results") ?: return emptyList()
        val list = mutableListOf<MediaItem>()
        for (i in 0 until results.length()) {
            val item = results.optJSONObject(i) ?: continue
            val mediaTypeStr = item.optString("media_type")
            if (mediaTypeStr == "person") continue
            val media = parseMediaItem(item)
            if (!media.posterPath.isNullOrBlank() || !media.backdropPath.isNullOrBlank()) {
                list.add(media)
            }
        }
        return list
    }

    suspend fun getByNetwork(networkId: Int, companyId: Int, page: Int = 1): List<MediaItem> {
        val items = mutableListOf<MediaItem>()
        val seenIds = mutableSetOf<Long>()

        // 1. Fetch TV series by network
        if (networkId > 0) {
            val tvJson = fetchJson(
                "/discover/tv",
                mapOf(
                    "with_networks" to networkId.toString(),
                    "sort_by" to "popularity.desc",
                    "page" to page.toString(),
                    "vote_count.gte" to "5"
                )
            )
            val results = tvJson?.optJSONArray("results")
            if (results != null) {
                for (i in 0 until results.length()) {
                    val obj = results.optJSONObject(i) ?: continue
                    val media = parseMediaItem(obj, MediaType.TV)
                    if (!media.posterPath.isNullOrBlank() && seenIds.add(media.tmdbId)) {
                        items.add(media)
                    }
                }
            }
        }

        // 2. Fetch movies by production company
        val companyParam = if (companyId > 0) companyId.toString() else if (networkId > 0) networkId.toString() else ""
        if (companyParam.isNotBlank()) {
            val movieJson = fetchJson(
                "/discover/movie",
                mapOf(
                    "with_companies" to companyParam,
                    "sort_by" to "popularity.desc",
                    "page" to page.toString(),
                    "vote_count.gte" to "5"
                )
            )
            val results = movieJson?.optJSONArray("results")
            if (results != null) {
                for (i in 0 until results.length()) {
                    val obj = results.optJSONObject(i) ?: continue
                    val media = parseMediaItem(obj, MediaType.MOVIE)
                    if (!media.posterPath.isNullOrBlank() && seenIds.add(media.tmdbId)) {
                        items.add(media)
                    }
                }
            }
        }

        return items.sortedByDescending { it.popularity }
    }

    suspend fun getMediaDetails(tmdbId: Long, type: MediaType): MediaItem? {
        val endpointType = if (type == MediaType.MOVIE) "movie" else "tv"
        val json = fetchJson(
            "/$endpointType/$tmdbId",
            mapOf("append_to_response" to "credits,videos,recommendations,similar,external_ids")
        ) ?: return null

        val baseMedia = parseMediaItem(json, type)

        // Parse cast
        val castList = mutableListOf<CastMember>()
        val creditsJson = json.optJSONObject("credits")
        val castArray = creditsJson?.optJSONArray("cast")
        if (castArray != null) {
            for (i in 0 until Math.min(castArray.length(), 15)) {
                val c = castArray.optJSONObject(i) ?: continue
                castList.add(
                    CastMember(
                        id = c.optLong("id"),
                        name = c.optString("name"),
                        character = c.optString("character").takeIf { it.isNotBlank() },
                        profilePath = c.optString("profile_path").takeIf { it.isNotBlank() && it != "null" }
                    )
                )
            }
        }

        // Parse seasons for TV / Anime
        val seasonsList = mutableListOf<SeasonInfo>()
        if (type != MediaType.MOVIE) {
            val seasonsArray = json.optJSONArray("seasons")
            if (seasonsArray != null) {
                for (i in 0 until seasonsArray.length()) {
                    val s = seasonsArray.optJSONObject(i) ?: continue
                    val sNum = s.optInt("season_number")
                    if (sNum <= 0) continue
                    val sName = s.optString("name", "الموسم $sNum")
                    val epCount = s.optInt("episode_count", 0)
                    val sPoster = s.optString("poster_path").takeIf { it.isNotBlank() && it != "null" }
                    seasonsList.add(
                        SeasonInfo(
                            seasonNumber = sNum,
                            title = if (sName.startsWith("Season") || sName.contains("الموسم")) "الموسم $sNum" else sName,
                            episodesCount = epCount,
                            posterPath = sPoster,
                            airDate = s.optString("air_date")
                        )
                    )
                }
            }
        }

        val extImdb = json.optJSONObject("external_ids")?.optString("imdb_id")
            ?.takeIf { it.isNotBlank() && it != "null" }
            ?: json.optString("imdb_id").takeIf { it.isNotBlank() && it != "null" }
            ?: baseMedia.imdbId

        return baseMedia.copy(
            imdbId = extImdb,
            cast = castList,
            seasons = seasonsList,
            seasonsCount = if (seasonsList.isNotEmpty()) seasonsList.size else json.optInt("number_of_seasons", 1),
            episodesCount = json.optInt("number_of_episodes", 1)
        )
    }

    suspend fun getSeasonEpisodes(tmdbId: Long, seasonNumber: Int): List<EpisodeInfo> {
        val json = fetchJson("/tv/$tmdbId/season/$seasonNumber") ?: return emptyList()
        val episodesArray = json.optJSONArray("episodes") ?: return emptyList()
        val list = mutableListOf<EpisodeInfo>()
        for (i in 0 until episodesArray.length()) {
            val ep = episodesArray.optJSONObject(i) ?: continue
            val epNum = ep.optInt("episode_number")
            val name = ep.optString("name").ifBlank { "الحلقة $epNum" }
            val overview = ep.optString("overview")
            val still = ep.optString("still_path").takeIf { it.isNotBlank() && it != "null" }
            val airDate = ep.optString("air_date")
            list.add(
                EpisodeInfo(
                    episodeNumber = epNum,
                    seasonNumber = seasonNumber,
                    title = name,
                    overview = overview,
                    stillPath = still,
                    airDate = airDate
                )
            )
        }
        return list
    }
}
