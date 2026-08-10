package com.tasbeeh.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat

class AdhanForegroundService : Service() {

    private var mediaPlayer: MediaPlayer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var isCurrentSessionTest: Boolean = false

    companion object {
        const val CHANNEL_ID = "adhan_foreground_service_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_ADHAN = "com.tasbeeh.app.START_ADHAN"
        const val ACTION_STOP_ADHAN = "com.tasbeeh.app.STOP_ADHAN"
        const val EXTRA_PRAYER_NAME = "extra_prayer_name"
        const val EXTRA_VOICE_ID = "extra_voice_id"
        const val EXTRA_IS_TEST = "extra_is_test"
        private const val TAG_LOG = "AdhanNativeTest"

        fun startAdhan(context: Context, prayerName: String, voiceId: String, isTest: Boolean = false) {
            val intent = Intent(context, AdhanForegroundService::class.java).apply {
                action = ACTION_START_ADHAN
                putExtra(EXTRA_PRAYER_NAME, prayerName)
                putExtra(EXTRA_VOICE_ID, voiceId)
                putExtra(EXTRA_IS_TEST, isTest)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopAdhan(context: Context) {
            val intent = Intent(context, AdhanForegroundService::class.java).apply {
                action = ACTION_STOP_ADHAN
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_ADHAN -> {
                val prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "الصلاة"
                val voiceId = intent.getStringExtra(EXTRA_VOICE_ID) ?: "abdulbasit"
                isCurrentSessionTest = intent.getBooleanExtra(EXTRA_IS_TEST, false)

                if (isCurrentSessionTest) {
                    Log.d(TAG_LOG, "TEST_ADHAN_SERVICE_STARTED: AdhanForegroundService started for Test Adhan")
                }

                acquireWakeLock()
                val notification = buildNotification(prayerName)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
                } else {
                    startForeground(NOTIFICATION_ID, notification)
                }

                playAdhanAudio(voiceId)
            }
            ACTION_STOP_ADHAN -> {
                stopPlaybackAndSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "TasbeehApp::AdhanWakeLock"
            ).apply {
                acquire(5 * 60 * 1000L) // Holds CPU wake lock for max 5 minutes during Adhan
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun playAdhanAudio(voiceId: String) {
        stopMediaPlayer()

        try {
            val rawResId = getRawAudioResource(voiceId)
            if (rawResId == 0) {
                Log.e(TAG_LOG, "ملف أذان عبد الباسط غير موجود.")
                stopPlaybackAndSelf()
                return
            }

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )

                val assetFileDescriptor = try {
                    resources.openRawResourceFd(rawResId)
                } catch (e: Exception) {
                    null
                }

                if (assetFileDescriptor == null) {
                    Log.e(TAG_LOG, "ملف أذان عبد الباسط غير موجود.")
                    stopPlaybackAndSelf()
                    return
                }

                setDataSource(
                    assetFileDescriptor.fileDescriptor,
                    assetFileDescriptor.startOffset,
                    assetFileDescriptor.length
                )
                assetFileDescriptor.close()

                setOnCompletionListener {
                    if (isCurrentSessionTest) {
                        Log.d(TAG_LOG, "TEST_ADHAN_AUDIO_COMPLETED: MediaPlayer finished playing Test Adhan audio")
                    }
                    stopPlaybackAndSelf()
                }

                setOnErrorListener { _, _, _ ->
                    Log.e(TAG_LOG, "ملف أذان عبد الباسط غير موجود.")
                    stopPlaybackAndSelf()
                    true
                }

                prepare()
                start()

                if (isCurrentSessionTest) {
                    Log.d(TAG_LOG, "TEST_ADHAN_AUDIO_STARTED: MediaPlayer started Adhan audio playback natively")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG_LOG, "ملف أذان عبد الباسط غير موجود.", e)
            stopPlaybackAndSelf()
        }
    }

    private fun getRawAudioResource(voiceId: String): Int {
        val resName = when (voiceId) {
            "abdulbasit" -> "adhan_abdulbasit"
            "default" -> "adhan_cairo"
            "cairo" -> "adhan_cairo"
            "makkah" -> "adhan_makkah"
            "madinah" -> "adhan_madinah"
            "alaqsa" -> "adhan_alaqsa"
            "alafasy" -> "adhan_alafasy"
            else -> "adhan_abdulbasit"
        }

        val resId = resources.getIdentifier(resName, "raw", packageName)
        return if (resId != 0) resId else R.raw.adhan_abdulbasit
    }

    private fun stopMediaPlayer() {
        try {
            mediaPlayer?.run {
                if (isPlaying) stop()
                release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopPlaybackAndSelf() {
        stopMediaPlayer()
        wakeLock?.run {
            if (isHeld) release()
        }
        wakeLock = null

        if (isCurrentSessionTest) {
            Log.d(TAG_LOG, "TEST_ADHAN_SERVICE_STOPPED: AdhanForegroundService stopped and WakeLock released")
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "تنبيهات الأذان والصلوات",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "قناة التشغيل الصوتي للأذان في خلفية النظام"
                setSound(null, null) // Audio is played via MediaPlayer USAGE_ALARM stream
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(prayerName: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, AdhanForegroundService::class.java).apply {
            action = ACTION_STOP_ADHAN
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("📢 حان الآن موعد أذان صلاة $prayerName")
            .setContentText("أذان مبني على Android Native بصوت الشيخ عبد الباسط عبد الصمد")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .addAction(android.R.drawable.ic_media_pause, "إيقاف الأذان", stopPendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        stopPlaybackAndSelf()
        super.onDestroy()
    }
}
