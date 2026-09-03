package com.example.server

import com.example.model.MediaType
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ServerManagerTest {

    @Test
    fun testServerDeduplication() {
        val deduplicator = ServerDeduplicator()
        val stream1 = ServerStream(
            id = "1",
            provider = "p1",
            server = "Server 1",
            url = "https://example.com/video?id=123&token=abc",
            quality = StreamQuality.FHD_1080P
        )
        val stream2 = ServerStream(
            id = "2",
            provider = "p2",
            server = "Server 2",
            url = "https://example.com/video?token=abc&id=123", // Normalized to same URL
            quality = StreamQuality.FHD_1080P
        )
        val stream3 = ServerStream(
            id = "3",
            provider = "p3",
            server = "Server 3",
            url = "https://example.com/other-video",
            quality = StreamQuality.UHD_4K
        )

        val unique = deduplicator.deduplicate(listOf(stream1, stream2, stream3))
        assertEquals(2, unique.size)
    }

    @Test
    fun testServerSorting() {
        val sorter = ServerSorter()
        val s1 = ServerStream(
            id = "s1",
            server = "Slow 720p",
            url = "https://example.com/1",
            quality = StreamQuality.HD_720P,
            responseTimeMs = 1500,
            priority = 20,
            isPlayable = true
        )
        val s2 = ServerStream(
            id = "s2",
            server = "Fast 1080p",
            url = "https://example.com/2",
            quality = StreamQuality.FHD_1080P,
            responseTimeMs = 120,
            priority = 90,
            isPlayable = true
        )
        val s3 = ServerStream(
            id = "s3",
            server = "Unplayable 4K",
            url = "https://example.com/3",
            quality = StreamQuality.UHD_4K,
            responseTimeMs = 80,
            priority = 100,
            isPlayable = false
        )

        val sorted = sorter.sort(listOf(s1, s2, s3))

        // First should be playable and top ranked (s2)
        assertTrue(sorted[0].isPlayable)
        assertEquals("Fast 1080p", sorted[0].name)
        assertTrue(sorted[0].isRecommended)

        // Last should be unplayable s3
        assertFalse(sorted.last().isPlayable)
    }

    @Test
    fun testServerCache() {
        val cache = ServerCache(ttlMs = 5000L)
        val request = MediaRequest(
            tmdbId = 999L,
            type = MediaType.MOVIE,
            title = "Test Movie"
        )
        val streams = listOf(
            ServerStream(id = "s1", server = "Server 1", url = "https://example.com/stream")
        )

        cache.set(request, streams)
        val cached = cache.get(request)
        assertNotNull(cached)
        assertEquals(1, cached?.size)

        // Evict
        cache.evict(request)
        val afterEvict = cache.get(request)
        assertEquals(null, afterEvict)
    }

    @Test
    fun testServerManagerResolve() = runBlocking {
        val manager = ServerManager()
        val request = MediaRequest(
            tmdbId = 550L,
            imdbId = "tt0137523",
            type = MediaType.MOVIE,
            title = "Fight Club",
            year = "1999"
        )

        val servers = manager.resolve(request)
        assertTrue(servers.isNotEmpty())
        assertTrue(servers.any { it.isRecommended })

        // Check retry
        val retried = manager.retry(request)
        assertTrue(retried.isNotEmpty())
    }
}
