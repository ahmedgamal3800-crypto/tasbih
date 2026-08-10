package com.tasbeeh.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONObject

data class PrayerAlarmSchedule(
    val id: String,
    val nameAr: String,
    val timestampMs: Long
)

object AdhanScheduler {

    const val PREFS_NAME = "tasbeeh_adhan_prefs"
    const val KEY_VOICE_ID = "selected_voice_id"
    const val KEY_SCHEDULES_JSON = "schedules_json"

    const val TEST_ALARM_REQUEST_CODE = 777777
    const val TAG_LOG = "AdhanNativeTest"

    fun scheduleTestAlarmInOneMinute(context: Context, voiceId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val triggerAtMs = System.currentTimeMillis() + 60 * 1000L // 60 seconds (1 minute)

        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = AdhanAlarmReceiver.ACTION_TRIGGER_TEST_ADHAN
            putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME, "اختبار الأذان (بعد دقيقة)")
            putExtra(AdhanForegroundService.EXTRA_VOICE_ID, voiceId)
            putExtra("is_test", true)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            TEST_ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        alarmManager.cancel(pendingIntent)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val alarmClockInfo = AlarmManager.AlarmClockInfo(
                triggerAtMs,
                pendingIntent
            )
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMs, pendingIntent)
        }

        android.util.Log.d(TAG_LOG, "TEST_ADHAN_SCHEDULED: Test Adhan alarm scheduled natively in 60 seconds (triggerAtMs: $triggerAtMs, voiceId: $voiceId)")
    }

    fun cancelTestAlarm(context: Context) {
        android.util.Log.d(TAG_LOG, "TEST_ADHAN_CANCEL_REQUESTED: Request to cancel test adhan received")
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = AdhanAlarmReceiver.ACTION_TRIGGER_TEST_ADHAN
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            TEST_ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
        android.util.Log.d(TAG_LOG, "TEST_ADHAN_CANCELLED: Test Adhan alarm cancelled via AlarmManager.cancel()")
    }

    fun scheduleAlarmsFromJson(context: Context, payloadJson: String) {
        try {
            val jsonObject = JSONObject(payloadJson)
            val voiceId = jsonObject.optString("voiceId", "abdulbasit")
            val schedulesArray = jsonObject.optJSONArray("schedules") ?: return

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putString(KEY_VOICE_ID, voiceId)
                .putString(KEY_SCHEDULES_JSON, payloadJson)
                .apply()

            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            // First cancel all previous text notification alarms to ensure clean state
            val textNotifIds = listOf("morning_athkar", "evening_athkar", "wird")
            for (notifId in textNotifIds) {
                val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
                    action = AdhanAlarmReceiver.ACTION_TRIGGER_TEXT_NOTIF
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    notifId.hashCode(),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                alarmManager.cancel(pendingIntent)
            }

            for (i in 0 until schedulesArray.length()) {
                val item = schedulesArray.getJSONObject(i)
                val id = item.getString("id")
                val nameAr = item.getString("nameAr")
                val timestampMs = item.getLong("timestampMs")
                val type = item.optString("type", "adhan")
                val bodyAr = item.optString("bodyAr", "")

                if (type == "text_notif") {
                    scheduleTextNotifAlarm(context, alarmManager, id, nameAr, bodyAr, timestampMs)
                } else {
                    scheduleSingleAlarm(context, alarmManager, id, nameAr, timestampMs, voiceId)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun scheduleTextNotifAlarm(
        context: Context,
        alarmManager: AlarmManager,
        notifIdStr: String,
        titleAr: String,
        bodyAr: String,
        triggerAtMs: Long
    ) {
        var actualTriggerMs = triggerAtMs
        // If trigger time has already passed (e.g. earlier today), advance by 24 hours to schedule for tomorrow
        while (actualTriggerMs <= System.currentTimeMillis()) {
            actualTriggerMs += 24 * 60 * 60 * 1000L
        }

        val requestCode = notifIdStr.hashCode()

        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = AdhanAlarmReceiver.ACTION_TRIGGER_TEXT_NOTIF
            putExtra("extra_title", titleAr)
            putExtra("extra_body", bodyAr)
            putExtra("extra_notif_id_str", notifIdStr)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        alarmManager.cancel(pendingIntent)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val alarmClockInfo = AlarmManager.AlarmClockInfo(actualTriggerMs, pendingIntent)
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, actualTriggerMs, pendingIntent)
        }
    }

    private fun scheduleSingleAlarm(
        context: Context,
        alarmManager: AlarmManager,
        prayerId: String,
        prayerNameAr: String,
        triggerAtMs: Long,
        voiceId: String
    ) {
        var actualTriggerMs = triggerAtMs
        // If trigger time has already passed, advance by 24 hours
        while (actualTriggerMs <= System.currentTimeMillis()) {
            actualTriggerMs += 24 * 60 * 60 * 1000L
        }

        val requestCode = prayerId.hashCode()

        val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
            action = AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN
            putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME, prayerNameAr)
            putExtra(AdhanForegroundService.EXTRA_VOICE_ID, voiceId)
            putExtra("prayer_id", prayerId)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Cancel any existing alarm for this prayer ID to prevent duplicates
        alarmManager.cancel(pendingIntent)

        // Set exact alarm capable of waking the CPU in Doze mode
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val alarmClockInfo = AlarmManager.AlarmClockInfo(
                actualTriggerMs,
                pendingIntent
            )
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, actualTriggerMs, pendingIntent)
        }
    }

    fun cancelAllAlarms(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val allIds = listOf("fajr", "dhuhr", "asr", "maghrib", "isha", "morning_athkar", "evening_athkar", "wird")

        for (id in allIds) {
            val intentAdhan = Intent(context, AdhanAlarmReceiver::class.java).apply {
                action = AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN
            }
            val pendingIntentAdhan = PendingIntent.getBroadcast(
                context,
                id.hashCode(),
                intentAdhan,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntentAdhan)

            val intentText = Intent(context, AdhanAlarmReceiver::class.java).apply {
                action = AdhanAlarmReceiver.ACTION_TRIGGER_TEXT_NOTIF
            }
            val pendingIntentText = PendingIntent.getBroadcast(
                context,
                id.hashCode(),
                intentText,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntentText)
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_SCHEDULES_JSON).apply()
    }

    fun rescheduleSavedAlarms(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val savedJson = prefs.getString(KEY_SCHEDULES_JSON, null) ?: return
        scheduleAlarmsFromJson(context, savedJson)
    }
}
