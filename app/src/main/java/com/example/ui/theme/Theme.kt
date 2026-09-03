package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CinemaColorScheme = darkColorScheme(
    primary = CinemaGold,
    onPrimary = Color.Black,
    primaryContainer = CinemaGoldDark,
    onPrimaryContainer = Color.White,
    secondary = CinemaPurple,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF241442),
    onSecondaryContainer = Color(0xFFE9D5FF),
    tertiary = CinemaPink,
    onTertiary = Color.White,
    background = CinemaBackground,
    onBackground = TextPrimary,
    surface = CinemaSurface,
    onSurface = TextPrimary,
    surfaceVariant = CinemaSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = CinemaBorder
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = CinemaColorScheme,
        typography = Typography,
        content = content
    )
}
