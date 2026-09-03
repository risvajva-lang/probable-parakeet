package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.MediaItem
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

data class StreamingNetwork(
    val id: String,
    val name: String,
    val networkId: Int,
    val companyId: Int
)

val POPULAR_STREAMING_NETWORKS = listOf(
    StreamingNetwork("netflix", "Netflix", networkId = 213, companyId = 178464),
    StreamingNetwork("appletv", "Apple TV+", networkId = 2552, companyId = 10104),
    StreamingNetwork("amazon", "Amazon", networkId = 1024, companyId = 20580),
    StreamingNetwork("hulu", "Hulu", networkId = 453, companyId = 1311),
    StreamingNetwork("disneyplus", "Disney+", networkId = 2739, companyId = 2),
    StreamingNetwork("hbo", "HBO", networkId = 49, companyId = 3268),
    StreamingNetwork("amc", "AMC", networkId = 174, companyId = 3287),
    StreamingNetwork("paramount", "Paramount+", networkId = 4330, companyId = 4),
    StreamingNetwork("peacock", "Peacock", networkId = 3353, companyId = 9993),
    StreamingNetwork("starz", "STARZ", networkId = 318, companyId = 1632),
    StreamingNetwork("cinemax", "Cinemax", networkId = 359, companyId = 7505)
)

@Composable
fun NetworkLogoBadge(
    network: StreamingNetwork,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        when (network.id) {
            "netflix" -> {
                Text(
                    text = "NETFLIX",
                    color = Color(0xFFE50914),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp
                )
            }
            "appletv" -> {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    // Apple logo representation
                    Text(
                        text = "",
                        color = Color.Black,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "tv+",
                        color = Color.Black,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }
            "amazon" -> {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "prime ",
                            color = Color(0xFF00A8E1),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "video",
                            color = Color(0xFF146EB4),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    // Amazon Smile Arc
                    Canvas(modifier = Modifier.width(42.dp).height(5.dp)) {
                        val path = Path().apply {
                            moveTo(2.dp.toPx(), 1.dp.toPx())
                            quadraticTo(
                                size.width / 2, size.height + 2.dp.toPx(),
                                size.width - 2.dp.toPx(), 1.dp.toPx()
                            )
                        }
                        drawPath(
                            path = path,
                            color = Color(0xFFFF9900),
                            style = Stroke(width = 2.dp.toPx())
                        )
                    }
                }
            }
            "hulu" -> {
                Text(
                    text = "hulu",
                    color = Color(0xFF1CE783),
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-0.5).sp
                )
            }
            "disneyplus" -> {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Disney",
                        color = Color(0xFF113CCF),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "+",
                        color = Color(0xFF113CCF),
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
            "hbo" -> {
                Text(
                    text = "HBO",
                    color = Color.Black,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
            "amc" -> {
                Box(
                    modifier = Modifier
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                        .background(Color.White)
                        .padding(horizontal = 6.dp, vertical = 1.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "aMC",
                        color = Color.Black,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }
            }
            "paramount" -> {
                Text(
                    text = "Paramount+",
                    color = Color(0xFF0064FF),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic
                )
            }
            "peacock" -> {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    // Peacock color dots
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(1.5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val dots = listOf(
                            Color(0xFF00C7FF),
                            Color(0xFF00D153),
                            Color(0xFFFFDD00),
                            Color(0xFFFF8000),
                            Color(0xFFFF0055),
                            Color(0xFF9900FF)
                        )
                        dots.forEach { dotColor ->
                            Box(
                                modifier = Modifier
                                    .size(4.dp)
                                    .clip(CircleShape)
                                    .background(dotColor)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "peacock",
                        color = Color.Black,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            "starz" -> {
                Text(
                    text = "STARZ",
                    color = Color(0xFF00D2C4),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.5.sp
                )
            }
            "cinemax" -> {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFFFFCC00))
                        .padding(horizontal = 8.dp, vertical = 3.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "CINEMAX",
                        color = Color.Black,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp
                    )
                }
            }
            else -> {
                Text(
                    text = network.name,
                    color = Color.Black,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun NetworksSectionRow(
    networks: List<StreamingNetwork> = POPULAR_STREAMING_NETWORKS,
    title: String = "الشبكات الشهيرة",
    onNetworkClick: (StreamingNetwork) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
    ) {
        // Section Header with red vertical bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(18.dp)
                    .background(CinemaRed, RoundedCornerShape(2.dp))
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Horizontal scrolling row of brand cards matching screenshots 1-6
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(networks, key = { it.id }) { network ->
                Card(
                    modifier = Modifier
                        .width(128.dp)
                        .height(104.dp)
                        .clickable { onNetworkClick(network) },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // White logo container
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(54.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            NetworkLogoBadge(network = network)
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Network label below
                        Text(
                            text = network.name,
                            color = TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NetworkDetailScreen(
    network: StreamingNetwork,
    items: List<MediaItem>,
    isLoading: Boolean,
    onBack: () -> Unit,
    onMediaClick: (MediaItem) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0D0F14))
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        // Top Bar: Back arrow and network name
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBack,
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
                text = network.name,
                color = TextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = CinemaRed)
            }
        } else if (items.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "لا توجد أعمال متاحة حالياً لشبكة ${network.name}",
                    color = TextSecondary,
                    fontSize = 14.sp
                )
            }
        } else {
            // 3-Column Grid matching Screenshot 7
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 80.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(items, key = { it.tmdbId }) { media ->
                    MediaCard(
                        media = media,
                        onCardClick = { onMediaClick(media) }
                    )
                }
            }
        }
    }
}
