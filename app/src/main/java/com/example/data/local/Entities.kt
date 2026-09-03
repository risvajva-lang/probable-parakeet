package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey
    val tmdbId: Long,
    val title: String,
    val posterPath: String? = null,
    val backdropPath: String? = null,
    val type: String = "movie",
    val voteAverage: Double = 0.0,
    val year: String? = null,
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "history")
data class HistoryEntity(
    @PrimaryKey
    val tmdbId: Long,
    val title: String,
    val posterPath: String? = null,
    val backdropPath: String? = null,
    val type: String = "movie",
    val season: Int = 1,
    val episode: Int = 1,
    val voteAverage: Double = 0.0,
    val year: String? = null,
    val watchedAt: Long = System.currentTimeMillis()
)
