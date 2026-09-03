package com.example.ui.components

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.data.ServersRepository
import com.example.model.EpisodeInfo
import com.example.model.MediaItem
import com.example.model.MediaType
import com.example.model.ServerProvider
import com.example.ui.theme.CinemaBackground
import com.example.ui.theme.CinemaGold
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.CinemaSurface
import com.example.ui.theme.CinemaSurfaceVariant
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun VideoPlayerSheet(
    media: MediaItem,
    selectedServer: ServerProvider,
    seasonNumber: Int,
    episodeNumber: Int,
    episodes: List<EpisodeInfo>,
    onClose: () -> Unit,
    onSelectServer: (ServerProvider) -> Unit,
    onSelectEpisode: (Int) -> Unit,
    onOpenInVideoPulse: (() -> Unit)? = null,
    streamUrl: String? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isPlayerLoading by remember { mutableStateOf(true) }
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }

    val videoUrl = remember(streamUrl, selectedServer, media.tmdbId, media.type, seasonNumber, episodeNumber) {
        if (!streamUrl.isNullOrBlank()) {
            streamUrl
        } else {
            ServersRepository.buildServerUrl(
                server = selectedServer,
                tmdbId = media.tmdbId,
                type = media.type,
                season = seasonNumber,
                episode = episodeNumber
            )
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            webViewInstance?.destroy()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(CinemaBackground)
            .testTag("video_player_screen")
    ) {
        // Player Top Navigation Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(CinemaSurface)
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                IconButton(
                    onClick = onClose,
                    modifier = Modifier.testTag("player_close_button")
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Close Player",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                Column {
                    Text(
                        text = media.title,
                        color = TextPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = if (media.type == MediaType.MOVIE) {
                            "فيلم • ${selectedServer.name}"
                        } else {
                            "الموسم $seasonNumber • الحلقة $episodeNumber • ${selectedServer.name}"
                        },
                        color = TextSecondary,
                        fontSize = 11.sp
                    )
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Open in Video Pulse Player
                if (onOpenInVideoPulse != null) {
                    IconButton(
                        onClick = onOpenInVideoPulse,
                        modifier = Modifier.testTag("player_videopulse_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Tv,
                            contentDescription = "تشغيل عبر Video Pulse",
                            tint = CinemaGold,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                // Reload Button
                IconButton(
                    onClick = {
                        isPlayerLoading = true
                        webViewInstance?.reload()
                    },
                    modifier = Modifier.testTag("player_refresh_button")
                ) {
                    Icon(
                        imageVector = Icons.Filled.Refresh,
                        contentDescription = "Reload Server",
                        tint = TextSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Open in External Browser
                IconButton(
                    onClick = {
                        try {
                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(videoUrl))
                            context.startActivity(browserIntent)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    },
                    modifier = Modifier.testTag("player_external_button")
                ) {
                    Icon(
                        imageVector = Icons.Filled.OpenInBrowser,
                        contentDescription = "Open in External Browser",
                        tint = CinemaGold,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        // Embedded WebView Player Viewport (16:9 Cinema Ratio)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .background(Color.Black)
        ) {
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.mediaPlaybackRequiresUserGesture = false
                        settings.loadsImagesAutomatically = true
                        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        settings.userAgentString = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"

                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                isPlayerLoading = false
                            }
                        }

                        webChromeClient = WebChromeClient()

                        loadUrl(videoUrl)
                        webViewInstance = this
                    }
                },
                update = { webView ->
                    if (webView.url != videoUrl) {
                        isPlayerLoading = true
                        webView.loadUrl(videoUrl)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (isPlayerLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.7f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(
                            color = CinemaRed,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "جاري الاتصال بسيرفر ${selectedServer.name}...",
                            color = Color.White,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Episode switcher if TV / Anime
        if (media.type != MediaType.MOVIE) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CinemaSurface)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Previous Episode
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (episodeNumber > 1) CinemaSurfaceVariant else Color.Transparent)
                        .clickable(enabled = episodeNumber > 1) {
                            onSelectEpisode(episodeNumber - 1)
                        }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.ArrowBack,
                        contentDescription = "السابق",
                        tint = if (episodeNumber > 1) Color.White else Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "الحلقة السابقة",
                        color = if (episodeNumber > 1) Color.White else Color.Gray,
                        fontSize = 12.sp
                    )
                }

                Text(
                    text = "الحلقة $episodeNumber",
                    color = CinemaGold,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )

                // Next Episode
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(CinemaSurfaceVariant)
                        .clickable {
                            onSelectEpisode(episodeNumber + 1)
                        }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "الحلقة التالية",
                        color = Color.White,
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Filled.ArrowForward,
                        contentDescription = "التالي",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Servers Selection Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Tv,
                        contentDescription = null,
                        tint = CinemaRed,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "سيرفرات البث والمشاهدة",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = "36 سيرفر VIP متاح",
                    color = CinemaGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Horizontal Servers List
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.testTag("servers_list")
            ) {
                items(ServersRepository.SERVERS) { server ->
                    val isSelected = server.id == selectedServer.id
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) CinemaRed else CinemaSurfaceVariant)
                            .clickable { onSelectServer(server) }
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                            .testTag("server_button_${server.id}")
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = server.name,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                                if (server.isVip) {
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "VIP",
                                        color = CinemaGold,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                            Text(
                                text = server.quality,
                                color = if (isSelected) Color.White.copy(alpha = 0.8f) else TextSecondary,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }

        // Episodes Horizontal Carousel if TV/Anime and episodes available
        if (media.type != MediaType.MOVIE && episodes.isNotEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp)
            ) {
                Text(
                    text = "اختر الحلقة (الموسم $seasonNumber)",
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(episodes) { ep ->
                        val isCurrent = ep.episodeNumber == episodeNumber
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isCurrent) CinemaRed else CinemaSurfaceVariant)
                                .clickable { onSelectEpisode(ep.episodeNumber) }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = "الحلقة ${ep.episodeNumber}",
                                color = if (isCurrent) Color.White else TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }
        }
    }
}
