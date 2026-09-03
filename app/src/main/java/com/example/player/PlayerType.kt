package com.example.player

enum class PlayerType(val id: String, val titleAr: String, val isDefault: Boolean = false) {
    HDOFLIX_INTERNAL(
        id = "hdoflix_internal",
        titleAr = "HDOFLIX Player (افتراضي)",
        isDefault = true
    ),
    VIDEO_PULSE(
        id = "video_pulse",
        titleAr = "Video Pulse",
        isDefault = false
    ),
    MX_PLAYER(
        id = "mx_player",
        titleAr = "MX Player",
        isDefault = false
    ),
    VLC(
        id = "vlc",
        titleAr = "VLC Player",
        isDefault = false
    ),
    JUST_PLAYER(
        id = "just_player",
        titleAr = "Just Player",
        isDefault = false
    );

    companion object {
        fun fromId(id: String?): PlayerType {
            return values().firstOrNull { it.id == id } ?: HDOFLIX_INTERNAL
        }
    }
}
