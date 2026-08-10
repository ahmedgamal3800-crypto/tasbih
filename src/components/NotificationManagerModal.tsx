import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Clock, 
  Check, 
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { UserSettings } from '../types';
import { 
  requestNotificationPermission, 
  sendLocalNotification, 
  getNotificationPermissionStatus,
  getNotificationPermissionStatusAsync
} from '../utils/notifications';
import { isAndroidNative } from '../utils/androidBridge';

interface NotificationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const NotificationManagerModal: React.FC<NotificationManagerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const [masterEnabled, setMasterEnabled] = useState<boolean>(settings.notificationsEnabled !== false);
  const [morningTime, setMorningTime] = useState<string>(settings.morningAthkarTime || '06:30');
  const [morningEnabled, setMorningEnabled] = useState<boolean>(settings.morningAthkarNotifEnabled !== false);

  const [eveningTime, setEveningTime] = useState<string>(settings.eveningAthkarTime || '17:00');
  const [eveningEnabled, setEveningEnabled] = useState<boolean>(settings.eveningAthkarNotifEnabled !== false);

  const [wirdTime, setWirdTime] = useState<string>(settings.wirdTime || '21:00');
  const [wirdEnabled, setWirdEnabled] = useState<boolean>(settings.wirdNotifEnabled !== false);

  const [permissionStatus, setPermissionStatus] = useState<string>(
    getNotificationPermissionStatus()
  );

  // Initialize local state whenever modal opens or settings update
  useEffect(() => {
    if (isOpen) {
      setMasterEnabled(settings.notificationsEnabled !== false);
      setMorningTime(settings.morningAthkarTime || '06:30');
      setMorningEnabled(settings.morningAthkarNotifEnabled !== false);
      setEveningTime(settings.eveningAthkarTime || '17:00');
      setEveningEnabled(settings.eveningAthkarNotifEnabled !== false);
      setWirdTime(settings.wirdTime || '21:00');
      setWirdEnabled(settings.wirdNotifEnabled !== false);
      
      // Async permission status check
      getNotificationPermissionStatusAsync().then((status) => {
        setPermissionStatus(status === 'prompt' ? 'default' : status);
      }).catch((err) => {
        console.warn('Error checking async permission status:', err);
        setPermissionStatus(getNotificationPermissionStatus());
      });
    }
  }, [isOpen, settings]);

  const handleEnableBrowserNotifications = async () => {
    try {
      await requestNotificationPermission();
    } catch (e) {
      console.warn('Notification permission error', e);
    }
    const currentStatus = getNotificationPermissionStatus();
    setPermissionStatus(currentStatus);
    setMasterEnabled(true);
    onUpdateSettings({ notificationsEnabled: true });
    sendLocalNotification('تسبيح - تطبيق الموبايل', 'تم تفعيل التنبيهات وإشعارات الأذان بنجاح! 🔔');
  };

  const handleTestNotification = () => {
    sendLocalNotification('تجربة إشعار الأذان والصلاة', 'الله أكبر الله أكبر - الإشعارات تعمل بنجاح على هاتفك!');
  };

  const handleSaveAndClose = () => {
    const updated = {
      notificationsEnabled: masterEnabled,
      morningAthkarTime: morningTime,
      morningAthkarNotifEnabled: morningEnabled,
      eveningAthkarTime: eveningTime,
      eveningAthkarNotifEnabled: eveningEnabled,
      wirdTime: wirdTime,
      wirdNotifEnabled: wirdEnabled,
    };
    onUpdateSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl overflow-hidden space-y-4 p-6 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A352F] pb-3">
          <h3 className="text-base font-bold font-amiri text-[#E4E9E6] flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#A7C0A8]" />
            إشعارات تطبيق الموبايل والتنبيهات
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Master Switch */}
        <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-bold text-[#E4E9E6] text-xs flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-300" />
              <span>مفتاح تفعيل الإشعارات الرئيسي</span>
            </h4>
            <p className="text-[#8BA491] text-[11px] leading-relaxed">
              تشغيل أو إيقاف جميع التنبيهات وإشعارات الأذان في التطبيق.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={masterEnabled}
              onChange={async (e) => {
                const val = e.target.checked;
                setMasterEnabled(val);
                if (val) {
                  try {
                    await requestNotificationPermission();
                    const asyncStatus = await getNotificationPermissionStatusAsync();
                    setPermissionStatus(asyncStatus === 'prompt' ? 'default' : asyncStatus);
                  } catch (err) {
                    console.warn(err);
                  }
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#0F1713] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* System Notification Permission Switch */}
        <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-bold text-[#E4E9E6] text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#A7C0A8]" />
                <span>السماح بإشعارات النظام</span>
              </h4>
              <p className="text-[#8BA491] text-[11px] leading-relaxed">
                {permissionStatus === 'granted'
                  ? 'إذن الإشعارات مفعل ومسموح به من نظام Android.'
                  : 'إذن نظام Android لإرسال إشعارات الأذان والتنبيهات المجدولة.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={permissionStatus === 'granted'}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  console.log('[SystemNotificationToggle] Clicked toggle, requested checked =', checked);
                  if (checked) {
                    try {
                      const granted = await requestNotificationPermission();
                      console.log('[SystemNotificationToggle] requestNotificationPermission returned:', granted);
                      const asyncStatus = await getNotificationPermissionStatusAsync();
                      console.log('[SystemNotificationToggle] asyncStatus:', asyncStatus);
                      const finalStatus = asyncStatus === 'prompt' ? (granted ? 'granted' : 'denied') : asyncStatus;
                      setPermissionStatus(finalStatus);

                      if (finalStatus === 'granted') {
                        setMasterEnabled(true);
                        onUpdateSettings({ notificationsEnabled: true });
                      } else if (finalStatus === 'denied' && isAndroidNative()) {
                        window.AndroidAdhanBridge?.openNotificationSettings?.();
                      }
                    } catch (err) {
                      console.error('[SystemNotificationToggle] Error requesting notification permission:', err);
                    }
                  } else {
                    if (isAndroidNative()) {
                      window.AndroidAdhanBridge?.openNotificationSettings?.();
                    } else {
                      setPermissionStatus('denied');
                    }
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#0F1713] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {(!isAndroidNative() && !Capacitor.isNativePlatform()) && (
            <p className="text-[10px] text-amber-300/80 bg-amber-950/30 p-2 rounded-xl border border-amber-900/40 mt-1">
              تنويه: أذونات Android تعمل حقيقيًا عند تثبيت تطبيق الهواتف (APK). في المعاينة (Preview) يتم اختيار إشعارات المتصفح فقط.
            </p>
          )}
        </div>

        {permissionStatus === 'granted' && (
          <button
            onClick={handleTestNotification}
            className="w-full py-2 rounded-xl bg-[#141C18] hover:bg-[#2D4539] border border-[#2A352F] text-[#A7C0A8] text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
            <span>إرسال إشعار تجريبي للهاتف</span>
          </button>
        )}

        {/* Reminders List */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#A7C0A8]">تخصيص مواعيد وتنبيهات الأذكار والورد:</h4>
            <span className="text-[10px] text-[#8BA491]">يمكنك تغيير الوقت يدوياً</span>
          </div>

          {/* Morning Athkar */}
          <div className="p-3.5 rounded-2xl bg-[#1A2520] border border-[#2A352F] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A7C0A8]" />
                <span className="font-bold text-[#E4E9E6]">تنبيه أذكار الصباح</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="bg-[#0F1713] text-[#A7C0A8] font-mono font-bold px-2 py-1 rounded-lg border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                />
                <input
                  type="checkbox"
                  checked={morningEnabled}
                  onChange={(e) => setMorningEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  title="تفعيل/تعطيل إشعار أذكار الصباح"
                />
              </div>
            </div>
            <p className="text-[#8BA491] text-[11px]">تنبيه يومي لحفظ النفس والبركة في الصباح.</p>
          </div>

          {/* Evening Athkar */}
          <div className="p-3.5 rounded-2xl bg-[#1A2520] border border-[#2A352F] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A7C0A8]" />
                <span className="font-bold text-[#E4E9E6]">تنبيه أذكار المساء</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="bg-[#0F1713] text-[#A7C0A8] font-mono font-bold px-2 py-1 rounded-lg border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                />
                <input
                  type="checkbox"
                  checked={eveningEnabled}
                  onChange={(e) => setEveningEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  title="تفعيل/تعطيل إشعار أذكار المساء"
                />
              </div>
            </div>
            <p className="text-[#8BA491] text-[11px]">تنبيه يومي قبل الغروب والتوكل على الله.</p>
          </div>

          {/* Daily Wird */}
          <div className="p-3.5 rounded-2xl bg-[#1A2520] border border-[#2A352F] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A7C0A8]" />
                <span className="font-bold text-[#E4E9E6]">تنبيه الورد والقرآن</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={wirdTime}
                  onChange={(e) => setWirdTime(e.target.value)}
                  className="bg-[#0F1713] text-[#A7C0A8] font-mono font-bold px-2 py-1 rounded-lg border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                />
                <input
                  type="checkbox"
                  checked={wirdEnabled}
                  onChange={(e) => setWirdEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  title="تفعيل/تعطيل إشعار الورد اليومي"
                />
              </div>
            </div>
            <p className="text-[#8BA491] text-[11px]">تذكير يومي بقراءة وردك من القران أو التسبيح.</p>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#2A352F]">
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-bold text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>حفظ وإغلاق</span>
          </button>
        </div>

      </div>
    </div>
  );
};
