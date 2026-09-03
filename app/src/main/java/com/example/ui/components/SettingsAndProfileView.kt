package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PlayCircleOutline
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.player.PlayerType
import com.example.server.ServerCache
import com.example.ui.theme.CinemaBackground
import com.example.ui.theme.CinemaGreen
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun SettingsAndProfileView(
    selectedPlayer: PlayerType,
    isVideoPulseInstalled: Boolean,
    videoPulseVersion: String?,
    onSelectPlayer: (PlayerType) -> Unit,
    onInstallVideoPulse: () -> Unit = {},
    onOpenFavorites: () -> Unit,
    onOpenHistory: () -> Unit,
    onClearHistory: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var cacheClearedMessage by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(CinemaBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .testTag("settings_screen")
    ) {
        Text(
            text = "الإعدادات",
            color = TextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 80.dp)
        ) {
            // Profile & App Brand Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    androidx.compose.ui.graphics.Brush.linearGradient(
                                        listOf(Color(0xFF9333EA), Color(0xFFDB2777), Color(0xFFF59E0B))
                                    )
                                )
                                .padding(2.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF0B1020)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Movie,
                                    contentDescription = "نافذة السينما",
                                    tint = com.example.ui.theme.CinemaGold,
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "نافذة السينما",
                                    color = TextPrimary,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(com.example.ui.theme.CinemaGold.copy(alpha = 0.2f))
                                        .border(0.8.dp, com.example.ui.theme.CinemaGold.copy(alpha = 0.5f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "VIP",
                                        color = com.example.ui.theme.CinemaGold,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            Text(
                                text = "منصة الترفيه السينمائي الرقمي الفائقة",
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            // Quick Access: Favorites & History
            item {
                Text(
                    text = "المكتبة الشخصية",
                    color = TextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36))
                ) {
                    Column {
                        SettingsNavRow(
                            icon = Icons.Filled.Favorite,
                            iconColor = CinemaRed,
                            title = "قائمة المفضلة",
                            subtitle = "الأفلام والمسلسلات المحفوظة لديك",
                            onClick = onOpenFavorites
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(Color(0xFF262A36))
                        )

                        SettingsNavRow(
                            icon = Icons.Filled.History,
                            iconColor = Color(0xFF00B0FF),
                            title = "سجل المشاهدة",
                            subtitle = "متابعة ما تم مشاهدته مؤخراً",
                            onClick = onOpenHistory
                        )
                    }
                }
            }

            // Video Player Settings
            item {
                Text(
                    text = "Video Player",
                    color = TextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        // Option 1: HDOFLIX Player (Default)
                        PlayerOptionItem(
                            title = "HDOFLIX Player (Default)",
                            subtitle = "Internal high-performance ExoPlayer with Subtitles & 4K",
                            isSelected = selectedPlayer == PlayerType.HDOFLIX_INTERNAL,
                            onClick = { onSelectPlayer(PlayerType.HDOFLIX_INTERNAL) }
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Option 2: Video Pulse (External)
                        PlayerOptionItem(
                            title = "Video Pulse",
                            subtitle = if (isVideoPulseInstalled) {
                                "External player (${videoPulseVersion ?: "v1.0"})"
                            } else {
                                "External player (Optional, requires install)"
                            },
                            isSelected = selectedPlayer == PlayerType.VIDEO_PULSE,
                            onClick = { onSelectPlayer(PlayerType.VIDEO_PULSE) }
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Option 3: MX Player
                        PlayerOptionItem(
                            title = "MX Player",
                            subtitle = "Hardware acceleration & multi-core decoding",
                            isSelected = selectedPlayer == PlayerType.MX_PLAYER,
                            onClick = { onSelectPlayer(PlayerType.MX_PLAYER) }
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Option 4: VLC Player
                        PlayerOptionItem(
                            title = "VLC Player",
                            subtitle = "Open source media player for all formats",
                            isSelected = selectedPlayer == PlayerType.VLC,
                            onClick = { onSelectPlayer(PlayerType.VLC) }
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Option 5: Just Player
                        PlayerOptionItem(
                            title = "Just Player",
                            subtitle = "Clean, lightweight Android media player",
                            isSelected = selectedPlayer == PlayerType.JUST_PLAYER,
                            onClick = { onSelectPlayer(PlayerType.JUST_PLAYER) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Dedicated Video Pulse Card
                VideoPulseCard(
                    isInstalled = isVideoPulseInstalled,
                    version = videoPulseVersion,
                    isSelected = selectedPlayer == PlayerType.VIDEO_PULSE,
                    onUse = { onSelectPlayer(PlayerType.VIDEO_PULSE) },
                    onInstall = onInstallVideoPulse
                )
            }

            // Server Engine & Performance
            item {
                Text(
                    text = "محرك السيرفرات والذاكرة المؤقتة",
                    color = TextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(CinemaGreen.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Dns,
                                    contentDescription = null,
                                    tint = CinemaGreen,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = "نظام السيرفرات الديناميكي: مفعل",
                                    color = TextPrimary,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "9 مزودي خدمة نشطين مع اختبار تلقائي للسرعة والجودة",
                                    color = TextSecondary,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF1F222A))
                                .clickable {
                                    com.example.server.ServerManager.instance.clearCache()
                                    cacheClearedMessage = true
                                }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Filled.CleaningServices,
                                    contentDescription = null,
                                    tint = CinemaRed,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (cacheClearedMessage) "تم مسح الذاكرة المؤقتة بنجاح ✓" else "مسح الذاكرة المؤقتة للسيرفرات",
                                    color = if (cacheClearedMessage) CinemaGreen else TextPrimary,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }

            // About Application
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Info,
                                contentDescription = null,
                                tint = CinemaRed,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "حول HDO FLIX",
                                color = TextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "الإصدار: 3.2.0 • تصميم عالي الدقة مبني خصيصاً لتجربة سينمائية فريدة وبث فائق الجودة عبر خوادم متعددة وموثوقة.",
                            color = TextSecondary,
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsNavRow(
    icon: ImageVector,
    iconColor: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column {
                Text(
                    text = title,
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = subtitle,
                    color = TextSecondary,
                    fontSize = 11.sp
                )
            }
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = Color(0xFF6B7280),
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
private fun PlayerOptionItem(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) Color(0xFF1E222B) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = isSelected,
            onClick = onClick,
            colors = RadioButtonDefaults.colors(
                selectedColor = com.example.ui.theme.CinemaGold,
                unselectedColor = Color(0xFF6B7280)
            )
        )

        Spacer(modifier = Modifier.width(8.dp))

        Column {
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            )
            Text(
                text = subtitle,
                color = TextSecondary,
                fontSize = 11.sp
            )
        }
    }
}
