package com.tasbeeh.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

class AdhanAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_TRIGGER_ADHAN = "com.tasbeeh.app.ACTION_TRIGGER_ADHAN"
        const val ACTION_TRIGGER_TEST_ADHAN = "com.tasbeeh.app.ACTION_TRIGGER_TEST_ADHAN"
        const val ACTION_TRIGGER_TEXT_NOTIF = "com.tasbeeh.app.ACTION_TRIGGER_TEXT_NOTIF"
        private const val TAG_LOG = "AdhanNativeTest"
    }

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return

        when (action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                // Device rebooted: automatically restore and reschedule all prayer alarms & notifications
                AdhanScheduler.rescheduleSavedAlarms(context)
            }
            ACTION_TRIGGER_TEST_ADHAN -> {
                Log.d(TAG_LOG, "TEST_ADHAN_ALARM_RECEIVED: Test Alarm received by AdhanAlarmReceiver from AlarmManager")
                val prayerName = intent.getStringExtra(AdhanForegroundService.EXTRA_PRAYER_NAME) ?: "اختبار الأذان (بعد دقيقة)"
                val voiceId = intent.getStringExtra(AdhanForegroundService.EXTRA_VOICE_ID) ?: "cairo"
                AdhanForegroundService.startAdhan(context, prayerName, voiceId, isTest = true)
            }
            ACTION_TRIGGER_ADHAN -> {
                val prayerName = intent.getStringExtra(AdhanForegroundService.EXTRA_PRAYER_NAME) ?: "الصلاة"
                val voiceId = intent.getStringExtra(AdhanForegroundService.EXTRA_VOICE_ID) ?: "cairo"

                // Start Foreground Service to play local Adhan audio even in background / sleep mode
                AdhanForegroundService.startAdhan(context, prayerName, voiceId, isTest = false)
            }
            ACTION_TRIGGER_TEXT_NOTIF -> {
                val title = intent.getStringExtra("extra_title") ?: "تذكير الأذكار"
                val body = intent.getStringExtra("extra_body") ?: "تذكير بذكر الله"
                val notifIdStr = intent.getStringExtra("extra_notif_id_str") ?: "athkar"

                showTextNotification(context, title, body, notifIdStr.hashCode())

                // Automatically reschedule next day's alarm
                AdhanScheduler.rescheduleSavedAlarms(context)
            }
        }
    }

    private fun showTextNotification(context: Context, title: String, body: String, notifId: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "athkar_text_notifications_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "تنبيهات الأذكار والورد",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "إشعارات يومية لأذكار الصباح والمساء والورد القرآني"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                context,
                notifId,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else null

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        if (pendingIntent != null) {
            builder.setContentIntent(pendingIntent)
        }

        notificationManager.notify(notifId, builder.build())
    }
}
