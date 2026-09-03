package com.example.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Authentic HDOFLIX Dark Palette
val CinemaBackground = Color(0xFF0E1015)
val CinemaSurface = Color(0xFF16181F)
val CinemaSurfaceVariant = Color(0xFF1E212B)
val CinemaCardSurface = Color(0xFF16181F)
val CinemaCardInner = Color(0xFF1C1E26)
val CinemaBorder = Color(0xFF262A36)
val CinemaBorderSubtle = Color(0x1AFFFFFF)

// HDOFLIX Signature Red Brand Accents
val CinemaRed = Color(0xFFE50914)
val CinemaRedDark = Color(0xFFB81D24)
val CinemaRedLight = Color(0xFFFF3344)
val HdoflixRed = CinemaRed

// Rating & Highlight Accents
val CinemaGold = Color(0xFFFFC107)
val CinemaGoldLight = Color(0xFFFFD54F)
val CinemaGoldDark = Color(0xFFFFA000)

val CinemaPurple = Color(0xFF8B5CF6)
val CinemaPurpleLight = Color(0xFFA855F7)
val CinemaPink = Color(0xFFEC4899)
val CinemaPinkLight = Color(0xFFF472B6)
val CinemaOrange = Color(0xFFF97316)
val CinemaCyan = Color(0xFF38BDF8)
val CinemaGreen = Color(0xFF10B981)

// Typography & Text Tokens
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFF9CA3AF)
val TextTertiary = Color(0xFF6B7280)

// Gradients
val HdoflixRedGradient = Brush.horizontalGradient(
    listOf(Color(0xFFE50914), Color(0xFFB81D24))
)

val GoldActionGradient = Brush.horizontalGradient(
    listOf(Color(0xFFFFA000), Color(0xFFFFC107))
)

val LogoNeonGradient = Brush.linearGradient(
    listOf(Color(0xFFE50914), Color(0xFFFF2E3D))
)

val BrandTextGradient = Brush.linearGradient(
    listOf(Color(0xFFFFFFFF), Color(0xFFE50914))
)

val PurplePinkActionGradient = Brush.horizontalGradient(
    listOf(Color(0xFF8B5CF6), Color(0xFFEC4899))
)

val CardBorderGradient = Brush.linearGradient(
    listOf(Color(0x33E50914), Color(0x1AFFFFFF))
)


