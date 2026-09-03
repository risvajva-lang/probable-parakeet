package com.example.services.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.example.MainActivity
import com.example.player.SafeLogger

enum class NotificationType {
    NEW_EPISODE,
    NEW_MOVIE,
    SYSTEM_UPDATE,
    WATCH_REMINDER
}

class NotificationService(private val context: Context) {

    private val logger = SafeLogger.getLogger("NotificationService")
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    companion object {
        const val CHANNEL_NEW_EPISODES = "channel_new_episodes"
        const val CHANNEL_NEW_MOVIES = "channel_new_movies"
        const val CHANNEL_UPDATES = "channel_updates"
        const val CHANNEL_REMINDERS = "channel_reminders"
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_NEW_EPISODES,
                    "New Episodes",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Alerts for new releases and episode updates for your tracked series"
                },
                NotificationChannel(
                    CHANNEL_NEW_MOVIES,
                    "Featured Movies",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Recommendations and newly added high-definition movies"
                },
                NotificationChannel(
                    CHANNEL_UPDATES,
                    "System Updates",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "App enhancements, new features, and server announcements"
                },
                NotificationChannel(
                    CHANNEL_REMINDERS,
                    "Watch Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Reminders to resume your saved shows and movies"
                }
            )
            channels.forEach { notificationManager?.createNotificationChannel(it) }
            logger.i("Notification channels initialized")
        }
    }

    fun showNotification(
        type: NotificationType,
        title: String,
        message: String,
        mediaId: Int? = null,
        notificationId: Int = System.currentTimeMillis().toInt()
    ) {
        val channelId = when (type) {
            NotificationType.NEW_EPISODE -> CHANNEL_NEW_EPISODES
            NotificationType.NEW_MOVIE -> CHANNEL_NEW_MOVIES
            NotificationType.SYSTEM_UPDATE -> CHANNEL_UPDATES
            NotificationType.WATCH_REMINDER -> CHANNEL_REMINDERS
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            mediaId?.let { putExtra("tmdb_id", it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        try {
            NotificationManagerCompat.from(context).notify(notificationId, builder.build())
            logger.i("Dispatched notification [$type]: $title")
        } catch (e: SecurityException) {
            logger.w("Notification permission not granted: ${e.message}")
        }
    }
}
