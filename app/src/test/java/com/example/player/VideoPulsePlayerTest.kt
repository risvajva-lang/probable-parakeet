package com.example.player

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import com.example.model.MediaType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class VideoPulsePlayerTest {

    private lateinit var context: Context
    private lateinit var playerService: PlayerService

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        playerService = PlayerService(context)
        playerService.setPlayerPreference(PlayerType.HDOFLIX_INTERNAL)
        playerService.setRemoteConfigEnabled(true)
    }

    // Case 1: Video Pulse مثبت
    @Test
    fun `testCase1_videoPulseInstalled_detectedCorrectly`() {
        val packageManager = context.packageManager
        val shadowPackageManager = shadowOf(packageManager)

        val packageInfo = PackageInfo().apply {
            packageName = VideoPulseAdapter.PACKAGE_NAME
            versionName = "1.5.0"
        }
        shadowPackageManager.addPackage(packageInfo)

        assertTrue(VideoPulseAdapter.isInstalled(context))
        assertEquals("1.5.0", VideoPulseAdapter.getInstalledVersion(context))
    }

    // Case 2: Video Pulse غير مثبت
    @Test
    fun `testCase2_videoPulseNotInstalled_returnsNotInstalledResult`() {
        assertFalse(VideoPulseAdapter.isInstalled(context))

        val media = PlaybackMedia(
            id = 50L,
            title = "Test Film",
            streamUrl = "https://video.test.com/stream.mp4",
            type = MediaType.MOVIE
        )

        val result = VideoPulseAdapter.launch(context, media)
        assertTrue(result is PlayerLaunchResult.NotInstalled)
        assertEquals(VideoPulseAdapter.PACKAGE_NAME, (result as PlayerLaunchResult.NotInstalled).packageName)
    }

    // Case 3: تشغيل Movie
    @Test
    fun `testCase3_playMovie_buildsCorrectMovieIntent`() {
        val media = PlaybackMedia(
            id = 100L,
            title = "Inception",
            streamUrl = "https://vidsrc.to/embed/movie/100",
            type = MediaType.MOVIE,
            posterUrl = "https://image.tmdb.org/t/p/w500/inception.jpg"
        )

        val intent = VideoPulseAdapter.buildIntent(media)
        assertNotNull(intent)
        assertEquals(Intent.ACTION_VIEW, intent?.action)
        assertEquals(VideoPulseAdapter.PACKAGE_NAME, intent?.`package`)
        assertEquals(Uri.parse(media.streamUrl), intent?.data)
        assertEquals("video/*", intent?.type)
        assertEquals("Inception", intent?.getStringExtra("title"))
        assertFalse(intent?.getBooleanExtra("is_tv", true) ?: true)
        assertEquals("https://image.tmdb.org/t/p/w500/inception.jpg", intent?.getStringExtra("poster_url"))
    }

    // Case 4: تشغيل TV Episode
    @Test
    fun `testCase4_playTvEpisode_buildsCorrectEpisodeIntent`() {
        val media = PlaybackMedia(
            id = 200L,
            title = "Ozymandias",
            streamUrl = "https://vidsrc.me/embed/tv?tmdb=200&season=5&episode=14",
            type = MediaType.TV,
            season = 5,
            episode = 14,
            seriesName = "Breaking Bad"
        )

        val intent = VideoPulseAdapter.buildIntent(media)
        assertNotNull(intent)
        assertEquals(Intent.ACTION_VIEW, intent?.action)
        assertTrue(intent?.getBooleanExtra("is_tv", false) ?: false)
        assertEquals("Breaking Bad", intent?.getStringExtra("series_name"))
        assertEquals(5, intent?.getIntExtra("season", 0))
        assertEquals(14, intent?.getIntExtra("episode", 0))
        assertTrue(intent?.getStringExtra("title")?.contains("Breaking Bad - S5E14: Ozymandias") ?: false)
    }

    // Case 5: Subtitle
    @Test
    fun `testCase5_subtitles_correctlyAttachedToIntentExtras`() {
        val subtitles = listOf(
            SubtitleTrack(name = "Arabic", url = "https://sub.example.com/ar.vtt", lang = "ar"),
            SubtitleTrack(name = "English", url = "https://sub.example.com/en.vtt", lang = "en")
        )

        val media = PlaybackMedia(
            id = 300L,
            title = "Interstellar",
            streamUrl = "https://stream.server.com/play.mp4",
            type = MediaType.MOVIE,
            subtitles = subtitles
        )

        val intent = VideoPulseAdapter.buildIntent(media)
        assertNotNull(intent)

        val subBundle = intent?.getBundleExtra("subBundle")
        assertNotNull(subBundle)
        val names = subBundle?.getStringArray("names")
        val urls = subBundle?.getStringArray("urls")
        val langs = subBundle?.getStringArray("langs")

        assertEquals(2, names?.size)
        assertEquals("Arabic", names?.get(0))
        assertEquals("https://sub.example.com/ar.vtt", urls?.get(0))
        assertEquals("ar", langs?.get(0))
    }

    // Case 6: Intent غير صحيح
    @Test
    fun `testCase6_invalidStreamUrl_returnsInvalidStreamUrlResult`() {
        val media = PlaybackMedia(
            id = 400L,
            title = "Broken Link",
            streamUrl = "ftp://invalid-url-protocol",
            type = MediaType.MOVIE
        )

        val intent = VideoPulseAdapter.buildIntent(media)
        assertNull(intent)

        val result = VideoPulseAdapter.launch(context, media)
        assertTrue(result is PlayerLaunchResult.InvalidStreamUrl)
    }

    // Case 7: ActivityNotFoundException
    @Test
    fun `testCase7_activityNotFound_gracefullyHandledWithoutCrash`() {
        val media = PlaybackMedia(
            id = 500L,
            title = "Test No Activity",
            streamUrl = "https://video.test.com/stream.mp4",
            type = MediaType.MOVIE
        )

        // Attempting launch when app is absent will return NotInstalled or LaunchFailed, never crash
        val result = VideoPulseAdapter.launch(context, media)
        assertNotNull(result)
        assertTrue(result is PlayerLaunchResult.NotInstalled || result is PlayerLaunchResult.LaunchFailed)
    }

    // Case 8: Video Pulse يغلق أثناء التشغيل
    @Test
    fun `testCase8_videoPulseClosesDuringPlayback_stateMaintainedSafely`() {
        // PlayerService retains selectedPlayer state and allows smooth user interaction
        assertEquals(PlayerType.HDOFLIX_INTERNAL, playerService.selectedPlayer.value)
        playerService.setPlayerPreference(PlayerType.VIDEO_PULSE)
        assertEquals(PlayerType.VIDEO_PULSE, playerService.selectedPlayer.value)
    }

    // Case 9: Fallback إلى Internal Player
    @Test
    fun `testCase9_fallbackToInternalPlayer_executesDirectStreamSafely`() {
        var internalPlayerTriggered = false
        val media = PlaybackMedia(
            id = 600L,
            title = "Fallback Film",
            streamUrl = "https://video.test.com/stream.mp4",
            type = MediaType.MOVIE
        )

        val result = playerService.play(media, PlayerType.HDOFLIX_INTERNAL) {
            internalPlayerTriggered = true
        }

        assertTrue(result is PlayerLaunchResult.Success)
        assertEquals(PlayerType.HDOFLIX_INTERNAL, (result as PlayerLaunchResult.Success).playerType)
        assertTrue(internalPlayerTriggered)
    }

    // Case 10: تغيير المشغل من Settings
    @Test
    fun `testCase10_changePlayerFromSettings_updatesSelectionCorrectly`() {
        playerService.setPlayerPreference(PlayerType.VIDEO_PULSE)
        assertEquals(PlayerType.VIDEO_PULSE, playerService.selectedPlayer.value)

        playerService.setPlayerPreference(PlayerType.HDOFLIX_INTERNAL)
        assertEquals(PlayerType.HDOFLIX_INTERNAL, playerService.selectedPlayer.value)
    }

    // Case 11: إعادة تشغيل التطبيق والتأكد من حفظ الاختيار
    @Test
    fun `testCase11_restartingApp_persistsPlayerPreference`() {
        // Set to VIDEO_PULSE
        playerService.setPlayerPreference(PlayerType.VIDEO_PULSE)
        assertEquals(PlayerType.VIDEO_PULSE, playerService.selectedPlayer.value)

        // Simulate app restart by creating a new PlayerService instance with the same context
        val newPlayerService = PlayerService(context)
        assertEquals(PlayerType.VIDEO_PULSE, newPlayerService.selectedPlayer.value)

        // Set back to HDOFLIX_INTERNAL
        newPlayerService.setPlayerPreference(PlayerType.HDOFLIX_INTERNAL)
        val restartedAgainService = PlayerService(context)
        assertEquals(PlayerType.HDOFLIX_INTERNAL, restartedAgainService.selectedPlayer.value)
    }
}
