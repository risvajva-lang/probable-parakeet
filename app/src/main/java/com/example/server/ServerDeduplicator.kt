package com.example.server

import android.net.Uri
import android.util.Log

class ServerDeduplicator {

    fun normalizeUrl(rawUrl: String): String {
        return try {
            val uri = Uri.parse(rawUrl.trim())
            val scheme = (uri.scheme ?: "https").lowercase()
            val host = (uri.host ?: "").lowercase()
            val path = (uri.path ?: "").trimEnd('/')

            // Safely parse query parameters
            val queryNames = try {
                uri.queryParameterNames.sorted()
            } catch (_: Exception) {
                emptyList<String>()
            }

            val queryString = if (queryNames.isNotEmpty()) {
                queryNames.joinToString("&") { name ->
                    "$name=${uri.getQueryParameter(name) ?: ""}"
                }
            } else {
                uri.query ?: ""
            }

            val queryPart = if (queryString.isNotEmpty()) "?$queryString" else ""
            "$scheme://$host$path$queryPart"
        } catch (_: Exception) {
            rawUrl.trim().lowercase().trimEnd('/')
        }
    }

    fun deduplicate(streams: List<ServerStream>): List<ServerStream> {
        val seenNormalizedUrls = HashSet<String>()
        val seenServerKeys = HashSet<String>()
        val uniqueStreams = mutableListOf<ServerStream>()

        for (stream in streams) {
            val normUrl = normalizeUrl(stream.url)
            val serverKey = "${stream.name.lowercase().trim()}:${stream.quality.name}:${stream.type}"

            // If the normalized URL is already seen, skip duplicate
            if (seenNormalizedUrls.contains(normUrl)) {
                Log.d("ServerDeduplicator", "[Deduplicator] Dropping duplicate URL: ${stream.name} ($normUrl)")
                continue
            }

            // If a provider yields the identical name and quality with the same base path, skip
            if (seenServerKeys.contains(serverKey)) {
                // Check if the URL is truly different
                val existingWithSameKey = uniqueStreams.any { normalizeUrl(it.url) == normUrl }
                if (existingWithSameKey) {
                    continue
                }
            }

            seenNormalizedUrls.add(normUrl)
            seenServerKeys.add(serverKey)
            uniqueStreams.add(stream)
        }

        Log.d("ServerDeduplicator", "[Deduplicator] Filtered ${streams.size} streams down to ${uniqueStreams.size} unique streams")
        return uniqueStreams
    }
}
