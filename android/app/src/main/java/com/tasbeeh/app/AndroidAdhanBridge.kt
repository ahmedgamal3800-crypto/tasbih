package com.tasbeeh.app

import android.content.Context
import android.webkit.JavascriptInterface

class AndroidAdhanBridge(private val context: Context) {

    @JavascriptInterface
    fun isNativeAvailable(): Boolean {
        return true
    }

    @JavascriptInterface
    fun schedulePrayerAlarms(jsonSchedules: String) {
        AdhanScheduler.scheduleAlarmsFromJson(context, jsonSchedules)
    }

    @JavascriptInterface
    fun cancelAllAlarms() {
        AdhanScheduler.cancelAllAlarms(context)
    }

    @JavascriptInterface
    fun scheduleTestAdhanInOneMinute(voiceId: String) {
        AdhanScheduler.scheduleTestAlarmInOneMinute(context, voiceId)
    }

    @JavascriptInterface
    fun cancelTestAdhan() {
        AdhanScheduler.cancelTestAlarm(context)
    }

    @JavascriptInterface
    fun playAdhan(voiceId: String) {
        AdhanForegroundService.startAdhan(context, "الصلاة (تجربة صوتية)", voiceId)
    }

    @JavascriptInterface
    fun stopAdhan() {
        AdhanForegroundService.stopAdhan(context)
    }

    @JavascriptInterface
    fun requestNotificationAndAlarmPermissions() {
        if (context is MainActivity) {
            context.runOnUiThread {
                context.requestNativePermissions()
            }
        }
    }

    @JavascriptInterface
    fun areNotificationsEnabled(): Boolean {
        return androidx.core.app.NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    @JavascriptInterface
    fun openNotificationSettings() {
        try {
            val intent = android.content.Intent().apply {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    action = android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, context.packageName)
                } else {
                    action = "android.settings.APP_NOTIFICATION_SETTINGS"
                    putExtra("app_package", context.packageName)
                    putExtra("app_uid", context.applicationInfo.uid)
                }
                flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
