package com.example.ui.components

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.model.EpisodeInfo
import com.example.model.MediaItem
import com.example.model.MediaType

@Composable
fun MediaDetailsSheet(
    media: MediaItem?,
    episodes: List<EpisodeInfo>,
    isFavorite: Boolean,
    onDismiss: () -> Unit,
    onPlayClick: (MediaItem, Int, Int) -> Unit,
    onFavoriteToggle: (MediaItem) -> Unit,
    onSeasonSelect: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    if (media == null) return
    val context = LocalContext.current

    val isTv = media.type == MediaType.TV || media.type == MediaType.ANIME || media.seasonsCount > 1
    var selectedSeasonNumber by remember { mutableStateOf(1) }
    var isInMyList by remember { mutableStateOf(false) }

    val totalSeasons = if (media.seasonsCount > 0) media.seasonsCount else maxOf(1, media.seasons.size)
    val totalEpisodesCount = if (episodes.isNotEmpty()) {
        maxOf(episodes.size, totalSeasons * episodes.size)
    } else {
        totalSeasons * 24
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .testTag("media_details_screen")
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 30.dp)
        ) {
            // 1. Backdrop header with circular back button and overlapping poster & title block
            item {
                Box(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Backdrop image with vertical gradient fade to background
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(270.dp)
                    ) {
                        AsyncImage(
                            model = media.fullBackdropUrl,
                            contentDescription = media.title,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )

                        // Smooth gradient darkening into the deep background
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(
                                            Color.Black.copy(alpha = 0.5f),
                                            Color.Transparent,
                                            Color(0xFF090D16).copy(alpha = 0.85f),
                                            Color(0xFF090D16)
                                        )
                                    )
                                )
                        )

                        // Circular Back button at top-left
                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .padding(start = 16.dp, top = 36.dp)
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.65f))
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "رجوع",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // Poster Card and Title + Metadata + Watch Now Button
                    // Overlaps the bottom of the backdrop image
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .padding(top = 185.dp),
                        verticalAlignment = Alignment.Bottom
                    ) {
                        // Poster Card (left side)
                        Card(
                            modifier = Modifier
                                .width(118.dp)
                                .height(172.dp),
                            shape = RoundedCornerShape(14.dp),
                            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                        ) {
                            AsyncImage(
                                model = media.fullPosterUrl,
                                contentDescription = media.title,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        // Column on the right side of the poster
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .padding(bottom = 4.dp)
                        ) {
                            // Title
                            Text(
                                text = media.title,
                                color = Color.White,
                                fontSize = 21.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            // Subtitle Metadata Line: "مسلسل • 2010 • ⭐ 8.5"
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = if (isTv) "مسلسل" else "فيلم",
                                    color = Color(0xFFCBD5E1),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Normal
                                )

                                Text(
                                    text = "•",
                                    color = Color(0xFF64748B),
                                    fontSize = 13.sp
                                )

                                Text(
                                    text = media.year ?: "2024",
                                    color = Color(0xFFCBD5E1),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Normal
                                )

                                Text(
                                    text = "•",
                                    color = Color(0xFF64748B),
                                    fontSize = 13.sp
                                )

                                Icon(
                                    imageVector = Icons.Filled.Star,
                                    contentDescription = null,
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(15.dp)
                                )

                                Text(
                                    text = String.format(java.util.Locale.US, "%.1f", if (media.voteAverage > 0) media.voteAverage else 8.5),
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Red Watch Now Pill Button: "شاهد الآن ▶"
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp)
                                    .clip(RoundedCornerShape(22.dp))
                                    .background(Color(0xFFE50914))
                                    .clickable { onPlayClick(media, selectedSeasonNumber, 1) }
                                    .testTag("details_watch_now_button"),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.PlayArrow,
                                        contentDescription = "شاهد الآن",
                                        tint = Color.White,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "شاهد الآن",
                                        color = Color.White,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 2. Action Buttons Row: [العرض الترويجي] [قائمتي] [المفضلة] [مشاركة]
            item {
                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // العرض الترويجي (Trailer)
                    ActionCardButton(
                        icon = Icons.Filled.Videocam,
                        label = "العرض\nالترويجي",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val trailerUrl = "https://www.youtube.com/results?search_query=${media.title}+official+trailer"
                            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(trailerUrl))
                            context.startActivity(intent)
                        }
                    )

                    // قائمتي (My List)
                    ActionCardButton(
                        icon = if (isInMyList) Icons.Filled.Check else Icons.Filled.Add,
                        label = "قائمتي",
                        isActive = isInMyList,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            isInMyList = !isInMyList
                            Toast.makeText(
                                context,
                                if (isInMyList) "تمت الإضافة إلى قائمتي" else "تمت الإزالة من قائمتي",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    )

                    // المفضلة (Favorite)
                    ActionCardButton(
                        icon = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        label = "المفضلة",
                        isActive = isFavorite,
                        activeColor = Color(0xFFE50914),
                        modifier = Modifier.weight(1f),
                        onClick = { onFavoriteToggle(media) }
                    )

                    // مشاركة (Share)
                    ActionCardButton(
                        icon = Icons.Filled.Share,
                        label = "مشاركة",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, media.title)
                                putExtra(Intent.EXTRA_TEXT, "شاهد ${media.title} بدقة فائقة على نافذة السينما!")
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "مشاركة عبر"))
                        }
                    )
                }
            }

            // 3. Metadata Info Line: "10 المواسم • 279 حلقة"
            item {
                Spacer(modifier = Modifier.height(14.dp))

                val metaText = if (isTv) {
                    "$totalSeasons المواسم • $totalEpisodesCount حلقة"
                } else {
                    "ساعتان و 15 دقيقة • بجودة 4K فائقة"
                }

                Text(
                    text = metaText,
                    color = Color(0xFF94A3B8),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            // 4. Genre Tags Pills: [خيال علمي وفانتازيا] [كوميديا] [رسوم متحركة]
            item {
                Spacer(modifier = Modifier.height(10.dp))

                val genresList = if (media.genres.isNotEmpty()) {
                    media.genres
                } else {
                    listOf("رسوم متحركة", "كوميديا", "خيال علمي وفانتازيا")
                }

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(genresList) { genre ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF131722))
                                .border(BorderStroke(0.8.dp, Color(0x33FFFFFF)), RoundedCornerShape(8.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = genre,
                                color = Color(0xFFE2E8F0),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Normal
                            )
                        }
                    }
                }
            }

            // 5. Story / Overview Section: "القصة"
            item {
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "القصة",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                val storyText = media.overview.ifBlank {
                    if (media.title.contains("المغامرة", ignoreCase = true) || media.title.contains("Adventure", ignoreCase = true)) {
                        "صبي يبلغ من العمر 12 عامًا وصديقه المقرب ، كلب حكيم يبلغ من العمر 28 عامًا يتمتع بقوى سحرية ، يخوضان سلسلة من المغامرات في مستقبل بعيد."
                    } else {
                        "تدور أحداث ${media.title} حول قصة مشوقة ومغامرات تأخذ المشاهدين في رحلة مثيرة وحافلة بالمفاجآت والتشويق مع نخبة من ألمع النجوم بجودة فائقة."
                    }
                }

                Text(
                    text = storyText,
                    color = Color(0xFFB0B8C8),
                    fontSize = 14.sp,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            // 6. Episodes / Seasons Section ("حلقات العمل")
            if (isTv) {
                item {
                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "حلقات العمل",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Horizontal Season Selector Pills
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items((1..maxOf(1, totalSeasons)).toList()) { seasonNum ->
                            val isSelected = seasonNum == selectedSeasonNumber
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) Color(0xFFE50914) else Color(0xFF131722))
                                    .then(
                                        if (!isSelected) {
                                            Modifier.border(
                                                BorderStroke(0.8.dp, Color(0x33FFFFFF)),
                                                RoundedCornerShape(10.dp)
                                            )
                                        } else Modifier
                                    )
                                    .clickable {
                                        selectedSeasonNumber = seasonNum
                                        onSeasonSelect(seasonNum)
                                    }
                                    .padding(horizontal = 16.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = "الموسم $seasonNum",
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Episodes list items
                items(episodes, key = { it.episodeNumber }) { ep ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp)
                            .clickable { onPlayClick(media, selectedSeasonNumber, ep.episodeNumber) },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                        border = BorderStroke(0.8.dp, Color(0x22FFFFFF))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Episode thumbnail with play button overlay
                            Box(
                                modifier = Modifier
                                    .width(115.dp)
                                    .aspectRatio(1.6f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color.Black)
                            ) {
                                val stillUrl = if (ep.stillPath != null) {
                                    "https://image.tmdb.org/t/p/w300${ep.stillPath}"
                                } else {
                                    media.fullBackdropUrl
                                }

                                AsyncImage(
                                    model = stillUrl,
                                    contentDescription = ep.title,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )

                                Box(
                                    modifier = Modifier
                                        .align(Alignment.Center)
                                        .size(32.dp)
                                        .background(Color(0xFFE50914), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.PlayArrow,
                                        contentDescription = "تشغيل",
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "الحلقة ${ep.episodeNumber}: ${ep.title}",
                                    color = Color.White,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = ep.overview?.takeIf { it.isNotBlank() } ?: "مشاهدة وتحميل الحلقة بجودة عالية وسيرفرات متعددة.",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            } else {
                // If Movie: Servers and Quick Play
                item {
                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "خيارات البث والمشاهدة",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { onPlayClick(media, 1, 1) },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                        border = BorderStroke(0.8.dp, Color(0x33FFFFFF))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .background(Color(0xFFE50914), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.PlayArrow,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "مشاهدة الفيلم بجودة 4K فائقة",
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "متوفر بـ 36 سيرفر سريع + خيار الترجمة",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 7. Cast & Crew (طاقم العمل)
            if (media.cast.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "طاقم العمل",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        items(media.cast, key = { it.id }) { actor ->
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.width(72.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF131722))
                                ) {
                                    val profileUrl = if (actor.profilePath != null) {
                                        "https://image.tmdb.org/t/p/w185${actor.profilePath}"
                                    } else {
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                                    }
                                    AsyncImage(
                                        model = profileUrl,
                                        contentDescription = actor.name,
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = actor.name,
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )

                                if (!actor.character.isNullOrBlank()) {
                                    Text(
                                        text = actor.character,
                                        color = Color(0xFF94A3B8),
                                        fontSize = 10.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ActionCardButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    modifier: Modifier = Modifier,
    isActive: Boolean = false,
    activeColor: Color = Color(0xFFE50914),
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(52.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF131722))
            .border(
                BorderStroke(0.8.dp, if (isActive) activeColor else Color(0x33FFFFFF)),
                RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label.replace("\n", " "),
                tint = if (isActive) activeColor else Color.White,
                modifier = Modifier.size(17.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = label,
                color = if (isActive) activeColor else Color.White,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                lineHeight = 13.sp,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
        }
    }
}

