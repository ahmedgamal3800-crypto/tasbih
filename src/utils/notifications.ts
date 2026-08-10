import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { playAutomaticAdhanAudio } from './audioAthkar';
import { isAndroidNative } from './androidBridge';

export async function getNotificationPermissionStatusAsync(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (typeof window === 'undefined') return 'unsupported';

  // 1. Check Capacitor Native Platform first
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      console.log('[notifications] LocalNotifications.checkPermissions status:', status);
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch (err) {
      console.warn('Capacitor LocalNotifications.checkPermissions failed:', err);
    }
  }

  // 2. Check Android Native Adhan Bridge if available
  if (isAndroidNative() && window.AndroidAdhanBridge?.areNotificationsEnabled) {
    try {
      return window.AndroidAdhanBridge.areNotificationsEnabled() ? 'granted' : 'denied';
    } catch (err) {
      console.warn('AndroidAdhanBridge.areNotificationsEnabled error:', err);
    }
  }

  // 3. Fallback to Web Notification API (Browser / Web Preview)
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return 'prompt';
}

export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';

  if (isAndroidNative()) {
    if (window.AndroidAdhanBridge?.areNotificationsEnabled) {
      try {
        return window.AndroidAdhanBridge.areNotificationsEnabled() ? 'granted' : 'denied';
      } catch (err) {
        console.warn('AndroidAdhanBridge error:', err);
      }
    }
  }

  if (!('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission as 'granted' | 'denied' | 'default';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  console.log('[notifications] requestNotificationPermission called.');

  // 1. Capacitor Native Platform request (APK / Device)
  if (Capacitor.isNativePlatform()) {
    try {
      console.log('[notifications] Invoking LocalNotifications.requestPermissions()');
      const res = await LocalNotifications.requestPermissions();
      console.log('[notifications] LocalNotifications.requestPermissions result:', res);
      
      // Also request via Android bridge if present
      if (window.AndroidAdhanBridge?.requestNotificationAndAlarmPermissions) {
        try {
          window.AndroidAdhanBridge.requestNotificationAndAlarmPermissions();
        } catch (e) {
          console.warn('AndroidAdhanBridge request error:', e);
        }
      }

      return res.display === 'granted';
    } catch (err) {
      console.error('Capacitor LocalNotifications.requestPermissions error:', err);
    }
  }

  // 2. Android Native Bridge request
  if (isAndroidNative()) {
    if (window.AndroidAdhanBridge?.requestNotificationAndAlarmPermissions) {
      try {
        window.AndroidAdhanBridge.requestNotificationAndAlarmPermissions();
      } catch (err) {
        console.warn('Error invoking native notification permission request:', err);
      }
    }
    if (window.AndroidAdhanBridge?.areNotificationsEnabled) {
      try {
        return window.AndroidAdhanBridge.areNotificationsEnabled();
      } catch (err) {
        console.warn('Error checking notification permission:', err);
      }
    }
    return true;
  }

  // 3. Browser / Web Preview fallback
  if (!('Notification' in window)) {
    console.warn('System Notification API not supported in this browser/WebView environment.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      let granted = false;
      const requestResult = Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          granted = true;
        }
      });

      if (requestResult && typeof requestResult.then === 'function') {
        const permission = await requestResult;
        return permission === 'granted';
      }

      return granted;
    } catch (e) {
      console.warn('Error requesting Web notification permission:', e);
      return false;
    }
  }

  return false;
}

export function sendLocalNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;

  // 1. Try Standard Web Notification if granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        dir: 'rtl',
        lang: 'ar'
      });
      return;
    } catch (e) {
      console.log('Notification trigger standard error:', e);
    }
  }

  // 2. Try ServiceWorker Notification if available
  if ('navigator' in window && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          dir: 'rtl',
          lang: 'ar'
        });
      });
    } catch (e) {
      console.log('ServiceWorker notification error:', e);
    }
  }
}

// Audio player for authentic Cairo Adhan recording
export function playCairoAdhan(): HTMLAudioElement {
  return playAutomaticAdhanAudio();
}

// Audio helper for prayer alerts - Authentic Cairo Adhan for Adhan alerts (No sound for silent Athkar alerts)
export function playGentleAudioTone(type: 'chime' | 'soft_athan' | 'bell' | string = 'soft_athan') {
  try {
    if (type === 'soft_athan' || type === 'athan_short') {
      playCairoAdhan();
    }
  } catch (e) {
    console.warn('Error in audio alert:', e);
  }
}
