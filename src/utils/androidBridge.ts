/**
 * Android Native Adhan Bridge
 * Enables seamless communication between Web Frontend (React) and Android Native App (Kotlin).
 */

export interface AndroidPrayerScheduleItem {
  id: string; // 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'morning_athkar' | 'evening_athkar' | 'wird'
  nameAr: string;
  timestampMs: number;
  type?: 'adhan' | 'text_notif';
  bodyAr?: string;
}

export interface AndroidNativeInterface {
  schedulePrayerAlarms?: (jsonSchedules: string) => void;
  cancelAllAlarms?: () => void;
  scheduleTestAdhanInOneMinute?: (voiceId: string) => void;
  cancelTestAdhan?: () => void;
  playAdhan?: (voiceId: string) => void;
  stopAdhan?: () => void;
  isNativeAvailable?: () => boolean;
  requestNotificationAndAlarmPermissions?: () => void;
  areNotificationsEnabled?: () => boolean;
  openNotificationSettings?: () => void;
}

declare global {
  interface Window {
    AndroidAdhanBridge?: AndroidNativeInterface;
  }
}

/**
 * Checks if running inside the Android Native Kotlin Wrapper / Capacitor Container
 */
export function isAndroidNative(): boolean {
  return typeof window !== 'undefined' && Boolean(window.AndroidAdhanBridge?.isNativeAvailable?.());
}

/**
 * Syncs prayer time alarms and Athkar/Wird reminders with Android Native AlarmManager
 */
export function syncAlarmsWithAndroidNative(
  prayers: { id: string; arabicName: string; timeString: string }[],
  voiceId: string,
  enabled: boolean = true,
  athkarReminders?: {
    morningAthkarTime?: string;
    morningAthkarNotifEnabled?: boolean;
    eveningAthkarTime?: string;
    eveningAthkarNotifEnabled?: boolean;
    wirdTime?: string;
    wirdNotifEnabled?: boolean;
  }
): boolean {
  if (!isAndroidNative()) {
    return false;
  }

  if (!enabled) {
    window.AndroidAdhanBridge?.cancelAllAlarms?.();
    console.log('kbd Native Adhan alarms canceled (disabled in settings)');
    return true;
  }

  if (!window.AndroidAdhanBridge?.schedulePrayerAlarms) {
    return false;
  }

  try {
    const now = new Date();
    const schedules: AndroidPrayerScheduleItem[] = [];

    // 1. Schedule 5 Daily Prayers (Adhan audio)
    prayers.forEach((prayer) => {
      if (prayer.id === 'sunrise') return; // Skip sunrise as it is not a prayer with Adhan

      const [time, modifier] = prayer.timeString.split(' ');
      if (!time) return;

      let [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (prayerDate.getTime() <= now.getTime()) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      schedules.push({
        id: prayer.id,
        nameAr: prayer.arabicName,
        timestampMs: prayerDate.getTime(),
        type: 'adhan'
      });
    });

    // Helper to calculate next timestamp for HH:MM time
    const getNextTimestamp = (timeStr: string) => {
      if (!timeStr) return null;
      const parts = timeStr.split(':');
      if (parts.length < 2) return null;
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (isNaN(h) || isNaN(m)) return null;
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      if (d.getTime() <= now.getTime()) {
        d.setDate(d.getDate() + 1);
      }
      return d.getTime();
    };

    // 2. Schedule Morning Athkar Text Notification
    if (athkarReminders?.morningAthkarNotifEnabled !== false && athkarReminders?.morningAthkarTime) {
      const ts = getNextTimestamp(athkarReminders.morningAthkarTime);
      if (ts) {
        schedules.push({
          id: 'morning_athkar',
          nameAr: 'تنبيه أذكار الصباح',
          bodyAr: 'حان الآن موعد أذكار الصباح لحفظك وبداية يومك بالبركة.',
          timestampMs: ts,
          type: 'text_notif'
        });
      }
    }

    // 3. Schedule Evening Athkar Text Notification
    if (athkarReminders?.eveningAthkarNotifEnabled !== false && athkarReminders?.eveningAthkarTime) {
      const ts = getNextTimestamp(athkarReminders.eveningAthkarTime);
      if (ts) {
        schedules.push({
          id: 'evening_athkar',
          nameAr: 'تنبيه أذكار المساء',
          bodyAr: 'حان الآن موعد أذكار المساء والتوكل على الله.',
          timestampMs: ts,
          type: 'text_notif'
        });
      }
    }

    // 4. Schedule Daily Wird Text Notification
    if (athkarReminders?.wirdNotifEnabled !== false && athkarReminders?.wirdTime) {
      const ts = getNextTimestamp(athkarReminders.wirdTime);
      if (ts) {
        schedules.push({
          id: 'wird',
          nameAr: 'تنبيه الورد والقرآن',
          bodyAr: 'تذكير يومي بقراءة وردك من القرآن الكريم والتسبيح.',
          timestampMs: ts,
          type: 'text_notif'
        });
      }
    }

    const payload = JSON.stringify({
      voiceId,
      schedules,
    });

    window.AndroidAdhanBridge.schedulePrayerAlarms(payload);
    console.log('✅ Prayer alarms & Athkar reminders successfully scheduled with Android Native AlarmManager:', schedules);
    return true;
  } catch (err) {
    console.error('Failed to sync alarms with Android Native:', err);
    return false;
  }
}

/**
 * Trigger Adhan playback natively in Android (using Kotlin MediaPlayer & Foreground Service)
 */
export function playAdhanNative(voiceId: string): boolean {
  if (isAndroidNative() && window.AndroidAdhanBridge?.playAdhan) {
    window.AndroidAdhanBridge.playAdhan(voiceId);
    return true;
  }
  return false;
}

/**
 * Stop Adhan playback natively
 */
export function stopAdhanNative(): boolean {
  if (isAndroidNative() && window.AndroidAdhanBridge?.stopAdhan) {
    window.AndroidAdhanBridge.stopAdhan();
    return true;
  }
  return false;
}

/**
 * Schedules a test Adhan natively in 1 minute (60s) via AlarmManager
 */
export function scheduleTestAdhanInOneMinuteNative(voiceId: string): boolean {
  if (isAndroidNative() && window.AndroidAdhanBridge?.scheduleTestAdhanInOneMinute) {
    window.AndroidAdhanBridge.scheduleTestAdhanInOneMinute(voiceId);
    console.log('⏱️ Scheduled Native Test Adhan in 60s via AlarmManager');
    return true;
  }
  return false;
}

/**
 * Cancels scheduled test Adhan natively without affecting real prayer time alarms
 */
export function cancelTestAdhanNative(): boolean {
  console.log('TEST_ADHAN_CANCEL_REQUESTED');
  if (isAndroidNative() && window.AndroidAdhanBridge?.cancelTestAdhan) {
    window.AndroidAdhanBridge.cancelTestAdhan();
    console.log('TEST_ADHAN_CANCELLED');
    return true;
  }
  console.log('TEST_ADHAN_CANCELLED');
  return false;
}
