package com.example.ui.components

import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.MediaItem
import com.example.player.PlayerType
import com.example.player.VideoPulseAdapter
import com.example.ui.theme.CinemaBackground
import com.example.ui.theme.CinemaBorder
import com.example.ui.theme.CinemaGreen
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.CinemaSurface
import com.example.ui.theme.CinemaSurfaceVariant
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

/**
 * Dedicated Video Pulse Card as specified in requirements:
 * - Video Pulse Icon (reference from provided icon)
 * - Name: Video Pulse
 * - App Status: Installed / Not Installed
 * - If installed: [ Use Video Pulse ]
 * - If not installed: [ Install ]
 */
@Composable
fun VideoPulseCard(
    isInstalled: Boolean,
    version: String? = null,
    isSelected: Boolean = false,
    onUse: () -> Unit,
    onInstall: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("video_pulse_card"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
        border = BorderStroke(
            width = if (isSelected) 1.5.dp else 1.dp,
            color = if (isSelected) CinemaRed else Color(0xFF262A36)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    // Video Pulse Reference Icon
                    Image(
                        painter = painterResource(id = R.drawable.ic_videopulse),
                        contentDescription = "Video Pulse",
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Video Pulse",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            if (isSelected) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .background(CinemaRed.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "المحدد",
                                        color = CinemaRed,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(3.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(if (isInstalled) CinemaGreen else Color(0xFFF59E0B))
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = if (isInstalled) {
                                    if (!version.isNullOrBlank()) "Installed ($version)" else "Installed"
                                } else {
                                    "Not Installed"
                                },
                                color = if (isInstalled) CinemaGreen else Color(0xFFF59E0B),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                // Action Button: [ Use Video Pulse ] or [ Install ]
                if (isInstalled) {
                    Button(
                        onClick = onUse,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) CinemaRed else Color(0xFF262A36),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("use_videopulse_button")
                    ) {
                        Text(
                            text = "Use Video Pulse",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Button(
                        onClick = onInstall,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = CinemaRed,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("install_videopulse_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Download,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Install",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

/**
 * Player Choice Sheet (Shown when user selects a media to play or switches players)
 * Contains:
 * Video Player
 * [ HDOFLIX Player ] (Default)
 * [ Video Pulse ]
 * + Dedicated Video Pulse Card
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerChoiceSheet(
    media: MediaItem,
    seasonNumber: Int = 1,
    episodeNumber: Int = 1,
    isVideoPulseInstalled: Boolean,
    videoPulseVersion: String? = null,
    onChoosePlayer: (PlayerType) -> Unit,
    onInstallVideoPulse: () -> Unit = {},
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = CinemaSurface,
        modifier = Modifier.testTag("player_choice_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Video Player",
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = media.title,
                        color = CinemaRed,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Close",
                        tint = TextSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Primary Option 1: [ HDOFLIX Player ] (Default)
            Button(
                onClick = { onChoosePlayer(PlayerType.HDOFLIX_INTERNAL) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = CinemaRed,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("choose_player_hdoflix")
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "HDOFLIX Player (افتراضي)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Primary Option 2: [ Video Pulse ]
            OutlinedButton(
                onClick = { onChoosePlayer(PlayerType.VIDEO_PULSE) },
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = TextPrimary
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF262A36))
                ),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("choose_player_videopulse")
            ) {
                Icon(
                    imageVector = Icons.Filled.Tv,
                    contentDescription = null,
                    tint = Color(0xFF00B0FF),
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Video Pulse",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .background(
                            if (isVideoPulseInstalled) CinemaGreen.copy(alpha = 0.2f) else Color(0xFFF59E0B).copy(alpha = 0.2f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (isVideoPulseInstalled) "Installed" else "Not Installed",
                        color = if (isVideoPulseInstalled) CinemaGreen else Color(0xFFF59E0B),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Video Pulse Detail Card
            VideoPulseCard(
                isInstalled = isVideoPulseInstalled,
                version = videoPulseVersion,
                isSelected = false,
                onUse = { onChoosePlayer(PlayerType.VIDEO_PULSE) },
                onInstall = onInstallVideoPulse
            )
        }
    }
}

/**
 * Dialog shown when Video Pulse is chosen but not installed on the user's device:
 * "Video Pulse غير مثبت"
 * [ تثبيت Video Pulse ]
 * [ استخدام مشغل HDOFLIX ]
 */
@Composable
fun VideoPulseNotInstalledDialog(
    onInstall: () -> Unit,
    onFallbackToInternal: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CinemaSurface,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.ErrorOutline,
                    contentDescription = null,
                    tint = Color(0xFFF59E0B),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Video Pulse غير مثبت",
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "تطبيق Video Pulse غير مثبت على هاتفك.\nيمكنك تثبيته من متجر التطبيقات الرسمي لاستخدامه كمشغل خارجي، أو المتابعة الفورية باستخدام مشغل HDOFLIX الداخلي المدمج.",
                    color = TextSecondary,
                    fontSize = 13.sp,
                    lineHeight = 19.sp
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onInstall,
                colors = ButtonDefaults.buttonColors(
                    containerColor = CinemaRed,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("dialog_install_videopulse_button")
            ) {
                Icon(
                    imageVector = Icons.Filled.Download,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "تثبيت Video Pulse",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        },
        dismissButton = {
            OutlinedButton(
                onClick = onFallbackToInternal,
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color.White
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF262A36))
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("dialog_fallback_hdoflix_button")
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = null,
                    tint = CinemaRed,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "استخدام مشغل HDOFLIX",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp
                )
            }
        },
        modifier = Modifier.testTag("videopulse_not_installed_dialog")
    )
}

/**
 * Dialog shown when Video Pulse launch failed (e.g. ActivityNotFoundException or invalid state):
 * "تعذر تشغيل الفيديو بواسطة Video Pulse"
 * [ المحاولة مرة أخرى ]
 * [ تشغيل بواسطة HDOFLIX ]
 */
@Composable
fun VideoPulseLaunchFailedDialog(
    reason: String,
    onRetry: () -> Unit = {},
    onFallbackToInternal: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CinemaSurface,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.ErrorOutline,
                    contentDescription = null,
                    tint = CinemaRed,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "تعذر تشغيل الفيديو بواسطة Video Pulse",
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "حدث خطأ أثناء محاولة تشغيل الفيديو عبر تطبيق Video Pulse الخارجي.",
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
                if (reason.isNotBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = reason,
                        color = TextSecondary,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "يمكنك إعادة المحاولة أو المتابعة الفورية عبر مشغل HDOFLIX الداخلي المدمج.",
                    color = CinemaRed,
                    fontSize = 12.sp
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF262A36),
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("dialog_retry_videopulse_button")
            ) {
                Icon(
                    imageVector = Icons.Filled.Refresh,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "المحاولة مرة أخرى",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        },
        dismissButton = {
            Button(
                onClick = onFallbackToInternal,
                colors = ButtonDefaults.buttonColors(
                    containerColor = CinemaRed,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.testTag("dialog_fallback_hdoflix_button")
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "تشغيل بواسطة HDOFLIX",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        },
        modifier = Modifier.testTag("videopulse_launch_failed_dialog")
    )
}

/**
 * Settings Sheet modal containing Video Player selection and Video Pulse card
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsSheet(
    selectedPlayer: PlayerType,
    isVideoPulseInstalled: Boolean,
    videoPulseVersion: String?,
    onSelectPlayer: (PlayerType) -> Unit,
    onInstallVideoPulse: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = CinemaSurface,
        modifier = modifier.testTag("settings_bottom_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Settings,
                        contentDescription = null,
                        tint = CinemaRed,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "إعدادات التطبيق",
                        color = TextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Close",
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Player Section Title
            Text(
                text = "Video Player",
                color = TextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "اختر المشغل المفضل لتشغيل الوسائط في التطبيق",
                color = TextSecondary,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            // Option 1: HDOFLIX Player (Default)
            PlayerOptionCard(
                title = "HDOFLIX Player",
                description = "المشغل الداخلي السريع والمدمج (الافتراضي).",
                isSelected = selectedPlayer == PlayerType.HDOFLIX_INTERNAL,
                badgeText = "Default",
                badgeColor = CinemaRed,
                onClick = { onSelectPlayer(PlayerType.HDOFLIX_INTERNAL) },
                testTag = "setting_player_hdoflix"
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Option 2: Video Pulse
            PlayerOptionCard(
                title = "Video Pulse",
                description = "External player with hardware acceleration.",
                isSelected = selectedPlayer == PlayerType.VIDEO_PULSE,
                badgeText = if (isVideoPulseInstalled) "Installed" else "External",
                badgeColor = if (isVideoPulseInstalled) CinemaGreen else Color(0xFFF59E0B),
                onClick = { onSelectPlayer(PlayerType.VIDEO_PULSE) },
                testTag = "setting_player_videopulse"
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Option 3: MX Player
            PlayerOptionCard(
                title = "MX Player",
                description = "Hardware acceleration & multi-core decoding.",
                isSelected = selectedPlayer == PlayerType.MX_PLAYER,
                badgeText = "External",
                badgeColor = Color(0xFF3B82F6),
                onClick = { onSelectPlayer(PlayerType.MX_PLAYER) },
                testTag = "setting_player_mx"
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Option 4: VLC Player
            PlayerOptionCard(
                title = "VLC Player",
                description = "Popular open-source multimedia player.",
                isSelected = selectedPlayer == PlayerType.VLC,
                badgeText = "External",
                badgeColor = Color(0xFFF97316),
                onClick = { onSelectPlayer(PlayerType.VLC) },
                testTag = "setting_player_vlc"
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Option 5: Just Player
            PlayerOptionCard(
                title = "Just Player",
                description = "Minimalist media player based on ExoPlayer.",
                isSelected = selectedPlayer == PlayerType.JUST_PLAYER,
                badgeText = "External",
                badgeColor = Color(0xFF10B981),
                onClick = { onSelectPlayer(PlayerType.JUST_PLAYER) },
                testTag = "setting_player_just"
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Video Pulse Card
            VideoPulseCard(
                isInstalled = isVideoPulseInstalled,
                version = videoPulseVersion,
                isSelected = selectedPlayer == PlayerType.VIDEO_PULSE,
                onUse = { onSelectPlayer(PlayerType.VIDEO_PULSE) },
                onInstall = onInstallVideoPulse
            )
        }
    }
}

@Composable
fun PlayerOptionCard(
    title: String,
    description: String,
    isSelected: Boolean,
    badgeText: String,
    badgeColor: Color,
    onClick: () -> Unit,
    testTag: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) CinemaRed.copy(alpha = 0.12f) else Color(0xFF16181F))
            .border(
                width = if (isSelected) 1.5.dp else 1.dp,
                color = if (isSelected) CinemaRed else Color(0xFF262A36),
                shape = RoundedCornerShape(12.dp)
            )
            .clickable { onClick() }
            .padding(14.dp)
            .testTag(testTag)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    RadioButton(
                        selected = isSelected,
                        onClick = onClick,
                        colors = RadioButtonDefaults.colors(
                            selectedColor = CinemaRed,
                            unselectedColor = TextSecondary
                        )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = title,
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Box(
                    modifier = Modifier
                        .background(badgeColor.copy(alpha = 0.18f), RoundedCornerShape(6.dp))
                        .border(1.dp, badgeColor.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = badgeText,
                        color = badgeColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Text(
                text = description,
                color = TextSecondary,
                fontSize = 12.sp,
                lineHeight = 17.sp,
                modifier = Modifier.padding(start = 36.dp, top = 2.dp)
            )
        }
    }
}
