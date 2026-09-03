package com.example.server

import android.util.Log
import java.util.concurrent.ConcurrentHashMap

class ServerCache(
    var ttlMs: Long = 10 * 60 * 1000L
) {
    private data class CacheEntry(
        val streams: List<ServerStream>,
        val timestamp: Long
    )

    private val storage = ConcurrentHashMap<String, CacheEntry>()

    fun buildKey(request: MediaRequest): String {
        val idPart = request.mediaId ?: request.tmdbId.toString()
        val imdbPart = request.imdbId ?: ""
        return "${request.type.rawValue}:$idPart:$imdbPart:${request.season}:${request.episode}"
    }

    fun get(request: MediaRequest): List<ServerStream>? {
        val key = buildKey(request)
        val entry = storage[key] ?: return null
        val now = System.currentTimeMillis()

        if (now - entry.timestamp > ttlMs) {
            Log.d("ServerCache", "[Cache] Expired entry for $key, removing")
            storage.remove(key)
            return null
        }

        Log.d("ServerCache", "[Cache] Cache hit for $key (${entry.streams.size} streams)")
        return entry.streams
    }

    fun set(request: MediaRequest, streams: List<ServerStream>) {
        if (streams.isEmpty()) return
        val key = buildKey(request)
        Log.d("ServerCache", "[Cache] Caching ${streams.size} streams for $key")
        storage[key] = CacheEntry(
            streams = streams,
            timestamp = System.currentTimeMillis()
        )
    }

    fun evict(request: MediaRequest) {
        val key = buildKey(request)
        Log.d("ServerCache", "[Cache] Evicting cache for $key")
        storage.remove(key)
    }

    fun clear() {
        Log.d("ServerCache", "[Cache] Cleared entire server cache")
        storage.clear()
    }
}
