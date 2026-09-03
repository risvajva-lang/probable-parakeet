package com.example.server

import android.util.Log
import kotlin.math.abs

class ServerSorter(
    private val weights: SortingWeights = SortingWeights()
) {

    fun sort(
        streams: List<ServerStream>,
        customWeights: SortingWeights? = null
    ): List<ServerStream> {
        val w = customWeights ?: weights

        val sorted = streams.sortedWith { a, b ->
            // 1. Playable availability first
            if (a.isPlayable != b.isPlayable) {
                return@sortedWith if (b.isPlayable) 1 else -1
            }

            // Calculate composite ranking score
            // Quality component: 0 to 400 scaled by qualityWeight
            val aQualityScore = (a.quality.rank.toDouble() / 400.0) * w.qualityWeight
            val bQualityScore = (b.quality.rank.toDouble() / 400.0) * w.qualityWeight

            // Speed component: lower responseTime is better, scaled by speedWeight
            // 100ms -> score 1.0, 3000ms -> score 0.0
            val aSpeedScore = (1.0 - (a.responseTimeMs.toDouble() / 3000.0).coerceIn(0.0, 1.0)) * w.speedWeight
            val bSpeedScore = (1.0 - (b.responseTimeMs.toDouble() / 3000.0).coerceIn(0.0, 1.0)) * w.speedWeight

            // Priority component: higher priority is better, scaled by priorityWeight
            val aPriorityScore = (a.providerPriority.coerceIn(1, 100).toDouble() / 100.0) * w.priorityWeight
            val bPriorityScore = (b.providerPriority.coerceIn(1, 100).toDouble() / 100.0) * w.priorityWeight

            val aTotalScore = aQualityScore + aSpeedScore + aPriorityScore
            val bTotalScore = bQualityScore + bSpeedScore + bPriorityScore

            // Compare by total score
            val scoreDiff = bTotalScore - aTotalScore
            if (abs(scoreDiff) > 1.0) {
                return@sortedWith if (scoreDiff > 0) 1 else -1
            }

            // Tie-breaking: Quality -> Speed -> Server Priority
            if (a.quality.rank != b.quality.rank) {
                return@sortedWith b.quality.rank.compareTo(a.quality.rank)
            }
            if (abs(a.responseTimeMs - b.responseTimeMs) > 100) {
                return@sortedWith a.responseTimeMs.compareTo(b.responseTimeMs)
            }
            a.serverPriority.compareTo(b.serverPriority)
        }

        // Tag the top valid stream as recommended
        var recommendedTagged = false
        val finalStreams = sorted.map { stream ->
            if (!recommendedTagged && stream.isPlayable) {
                recommendedTagged = true
                stream.copy(isRecommended = true)
            } else {
                stream.copy(isRecommended = false)
            }
        }

        val playableCount = finalStreams.count { it.isPlayable }
        Log.d("ServerSorter", "[Sorter] $playableCount playable servers sorted (total: ${finalStreams.size})")

        return finalStreams
    }
}
