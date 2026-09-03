package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.ChildCare
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LiveTv
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.TheaterComedy
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.MediaItem
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

data class GenreDefinition(
    val id: Int,
    val nameEn: String,
    val nameAr: String,
    val icon: ImageVector
)

val TV_GENRES = listOf(
    GenreDefinition(10759, "Action & Adventure", "حركة ومغامرة", Icons.Filled.FlashOn),
    GenreDefinition(16, "Animation", "رسوم متحركة", Icons.Filled.Palette),
    GenreDefinition(35, "Comedy", "كوميديا", Icons.Filled.EmojiEmotions),
    GenreDefinition(80, "Crime", "جريمة", Icons.Filled.Shield),
    GenreDefinition(99, "Documentary", "وثائقي", Icons.Filled.Videocam),
    GenreDefinition(18, "Drama", "دراما", Icons.Filled.TheaterComedy),
    GenreDefinition(10751, "Family", "عائلي", Icons.Filled.ChildCare),
    GenreDefinition(10762, "Kids", "أطفال", Icons.Filled.ChildCare),
    GenreDefinition(9648, "Mystery", "غموض", Icons.Filled.Psychology),
    GenreDefinition(10763, "News", "أخبار", Icons.Filled.Public),
    GenreDefinition(10764, "Reality", "واقعي", Icons.Filled.LiveTv),
    GenreDefinition(10765, "Sci-Fi & Fantasy", "خيال علمي وفانتازيا", Icons.Filled.RocketLaunch),
    GenreDefinition(10766, "Soap", "مسلسلات درامية", Icons.Filled.Favorite),
    GenreDefinition(10767, "Talk", "حوار", Icons.Filled.Movie),
    GenreDefinition(10768, "War & Politics", "حرب وسياسة", Icons.Filled.Shield),
    GenreDefinition(37, "Western", "غرب أمريكي", Icons.Filled.Explore)
)

val MOVIE_GENRES = listOf(
    GenreDefinition(28, "Action", "أكشن", Icons.Filled.FlashOn),
    GenreDefinition(12, "Adventure", "مغامرة", Icons.Filled.Explore),
    GenreDefinition(16, "Animation", "رسوم متحركة", Icons.Filled.Palette),
    GenreDefinition(35, "Comedy", "كوميديا", Icons.Filled.EmojiEmotions),
    GenreDefinition(80, "Crime", "جريمة", Icons.Filled.Shield),
    GenreDefinition(99, "Documentary", "وثائقي", Icons.Filled.Videocam),
    GenreDefinition(18, "Drama", "دراما", Icons.Filled.TheaterComedy),
    GenreDefinition(10751, "Family", "عائلي", Icons.Filled.ChildCare),
    GenreDefinition(14, "Fantasy", "فانتازيا", Icons.Filled.AutoAwesome),
    GenreDefinition(36, "History", "تاريخي", Icons.Filled.History),
    GenreDefinition(27, "Horror", "رعب", Icons.Filled.Shield),
    GenreDefinition(10402, "Music", "موسيقى", Icons.Filled.MusicNote),
    GenreDefinition(9648, "Mystery", "غموض", Icons.Filled.Psychology),
    GenreDefinition(10749, "Romance", "رومانسي", Icons.Filled.Favorite),
    GenreDefinition(878, "Science Fiction", "خيال علمي", Icons.Filled.RocketLaunch),
    GenreDefinition(53, "Thriller", "إثارة وتشويق", Icons.Filled.FlashOn),
    GenreDefinition(10752, "War", "حرب", Icons.Filled.Shield),
    GenreDefinition(37, "Western", "غرب أمريكي", Icons.Filled.Explore)
)

@Composable
fun GenresView(
    isTv: Boolean,
    onToggleType: (Boolean) -> Unit,
    selectedGenreId: Int?,
    selectedGenreName: String?,
    genreMediaItems: List<MediaItem>,
    isLoadingGenre: Boolean,
    onSelectGenre: (Int, String) -> Unit,
    onClearGenre: () -> Unit,
    onMediaClick: (MediaItem) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        // If viewing a specific genre's media results
        if (selectedGenreId != null) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onClearGenre,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = selectedGenreName ?: "Genre",
                    color = TextPrimary,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (isLoadingGenre) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = CinemaRed)
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    contentPadding = PaddingValues(vertical = 12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(genreMediaItems, key = { it.tmdbId }) { media ->
                        MediaCard(
                            media = media,
                            onCardClick = { onMediaClick(media) }
                        )
                    }
                }
            }
            return
        }

        // Segmented Switcher Pill matching screenshots 9 & 10
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
            border = BorderStroke(1.dp, Color(0xFF262A36))
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // TV Shows button
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .padding(4.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isTv) CinemaRed else Color.Transparent)
                        .clickable { onToggleType(true) }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "📺 TV Shows",
                        color = if (isTv) Color.White else TextSecondary,
                        fontSize = 14.sp,
                        fontWeight = if (isTv) FontWeight.Bold else FontWeight.Medium
                    )
                }

                // Movies button
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .padding(4.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (!isTv) CinemaRed else Color.Transparent)
                        .clickable { onToggleType(false) }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🎬 Movies",
                        color = if (!isTv) Color.White else TextSecondary,
                        fontSize = 14.sp,
                        fontWeight = if (!isTv) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // "ALL GENRES" header
        Text(
            text = "ALL GENRES",
            color = TextSecondary,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        // 2-column Grid of genre cards
        val currentList = if (isTv) TV_GENRES else MOVIE_GENRES

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(currentList, key = { it.id }) { genre ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp)
                        .clickable { onSelectGenre(genre.id, genre.nameEn) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            // Red circle with icon
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(CinemaRed),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = genre.icon,
                                    contentDescription = genre.nameEn,
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            Text(
                                text = genre.nameEn,
                                color = TextPrimary,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "Open",
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
