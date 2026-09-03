package com.example.player

import com.example.model.MediaType

data class SubtitleTrack(
    val name: String,
    val url: String,
    val lang: String = "ar"
)

data class PlaybackMedia(
    val id: Long,
    val title: String,
    val streamUrl: String,
    val type: MediaType = MediaType.MOVIE,
    val season: Int = 1,
    val episode: Int = 1,
    val seriesName: String? = null,
    val posterUrl: String? = null,
    val subtitles: List<SubtitleTrack> = emptyList(),
    val headers: Map<String, String> = emptyMap()
)
