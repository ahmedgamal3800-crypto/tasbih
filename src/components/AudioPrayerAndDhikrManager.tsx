import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  X, 
  Play, 
  Pause, 
  Sparkles, 
  Clock, 
  Check, 
  HeartHandshake,
  Headphones
} from 'lucide-react';
import { UserSettings, UserProgress, PrayerTime } from '../types';
import { calculatePrayerTimes } from '../data/prayers';
import { sendLocalNotification, playGentleAudioTone } from '../utils/notifications';
import { 
  playAutomaticAdhanAudio, 
  stopAllAdhanAudio,
  speakArabicText, 
  stopArabicSpeech, 
  unlockAudioContext,
  getDefaultAthanVoiceForCountry,
  POST_PRAYER_ATHKAR, 
  DAILY_PERIODIC_ATHKAR, 
  PRE_PRAYER_ATHKAR_MESSAGES,
  PostPrayerDhikr 
} from '../utils/audioAthkar';
import { 
  syncAlarmsWithAndroidNative, 
  stopAdhanNative, 
  playAdhanNative,
  isAndroidNative 
} from '../utils/androidBridge';

interface AudioPrayerAndDhikrManagerProps {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
}

export const AudioPrayerAndDhikrManager: React.FC<AudioPrayerAndDhikrManagerProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onUpdateProgress
}) => {
  // Active Adhan Audio state
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState<string | null>(null);
  const [activeAdhanAudio, setActiveAdhanAudio] = useState<HTMLAudioElement | null>(null);

  // Active Spoken Dhikr state
  const [activeDhikrText, setActiveDhikrText] = useState<string | null>(null);
  const [activeDhikrTitle, setActiveDhikrTitle] = useState<string | null>(null);

  // Post-Prayer Athkar Modal state
  const [showPostPrayerModal, setShowPostPrayerModal] = useState<boolean>(false);
  const [currentPostDhikrIndex, setCurrentPostDhikrIndex] = useState<number>(0);
  const [isPostDhikrPlaying, setIsPostDhikrPlaying] = useState<boolean>(false);

  // Periodic Dhikr Timer tracker
  const lastPeriodicTimestampRef = useRef<number>(Date.now());
  const triggeredEventsRef = useRef<Record<string, boolean>>({});

  // Unlock audio policy on component mount
  useEffect(() => {
    unlockAudioContext();
  }, []);

  // Check clock every 5 seconds
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const dateKey = now.toISOString().split('T')[0];
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const timeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

      const prayers = calculatePrayerTimes(
        settings.city, 
        now, 
        settings.prayerManualOffsetMinutes || 0, 
        settings.perPrayerOffsets || {},
        settings.customExactPrayerTimes || {},
        settings.calculationMethod,
        settings.country
      );

      // 1. Check Automatic Adhan Trigger
      if (settings.autoAthanEnabled !== false) {
        prayers.forEach((prayer) => {
          if (prayer.id === 'sunrise') return; // Skip sunrise for adhan
          if (prayer.time === timeStr) {
            const eventKey = `adhan_${dateKey}_${prayer.id}`;
            if (!triggeredEventsRef.current[eventKey]) {
              triggeredEventsRef.current[eventKey] = true;
              triggerAutoAdhan(prayer);
            }
          }
        });
      }

      // 2. Check Pre-Prayer 15-Min Audio Reminder
      if (settings.prePrayerAudioReminder !== false) {
        prayers.forEach((prayer) => {
          if (prayer.id === 'sunrise') return;
          const [pHrs, pMins] = prayer.time.split(':').map(Number);
          let preMin = (pHrs * 60 + pMins) - 15;
          if (preMin < 0) preMin += 24 * 60;

          const nowTotalMin = currentHours * 60 + currentMinutes;
          if (nowTotalMin === preMin) {
            const eventKey = `pre_${dateKey}_${prayer.id}`;
            if (!triggeredEventsRef.current[eventKey]) {
              triggeredEventsRef.current[eventKey] = true;
              triggerPrePrayerReminder(prayer);
            }
          }
        });
      }

      // 3. Check Scheduled Athkar & Wird Notifications
      if (settings.notificationsEnabled !== false) {
        const morningTime = settings.morningAthkarTime || '06:30';
        if (settings.morningAthkarNotifEnabled !== false && morningTime === timeStr) {
          const eventKey = `notif_morning_${dateKey}`;
          if (!triggeredEventsRef.current[eventKey]) {
            triggeredEventsRef.current[eventKey] = true;
            sendLocalNotification(
              '☀️ أذكار الصباح',
              'حان الآن موعد أذكار الصباح لحفظك وبداية يومك بالبركة والسرور.'
            );
          }
        }

        const eveningTime = settings.eveningAthkarTime || '17:00';
        if (settings.eveningAthkarNotifEnabled !== false && eveningTime === timeStr) {
          const eventKey = `notif_evening_${dateKey}`;
          if (!triggeredEventsRef.current[eventKey]) {
            triggeredEventsRef.current[eventKey] = true;
            sendLocalNotification(
              '🌙 أذكار المساء',
              'حان الآن موعد أذكار المساء والتوكل على الله والتحصين.'
            );
          }
        }

        const wirdTimeVal = settings.wirdTime || '21:00';
        if (settings.wirdNotifEnabled !== false && wirdTimeVal === timeStr) {
          const eventKey = `notif_wird_${dateKey}`;
          if (!triggeredEventsRef.current[eventKey]) {
            triggeredEventsRef.current[eventKey] = true;
            sendLocalNotification(
              '📖 الورد اليومي',
              'تذكير يومي بقراءة وردك من القرآن والتسبيح ليتدبر قلبك.'
            );
          }
        }
      }
    };

    const interval = setInterval(checkClock, 5000);
    return () => clearInterval(interval);
  }, [settings]);

  // Sync Prayer Alarms with Android Native AlarmManager (Kotlin Background Service)
  useEffect(() => {
    if (isAndroidNative()) {
      const prayers = calculatePrayerTimes(
        settings.city,
        settings.prayerManualOffsetMinutes || 0,
        settings.customExactPrayerTimes || {},
        settings.calculationMethod,
        settings.country
      );
      const prayerItems = prayers.map(p => ({
        id: p.id,
        arabicName: p.arabicName,
        timeString: p.formattedTime
      }));
      syncAlarmsWithAndroidNative(
        prayerItems, 
        settings.athanVoice || 'cairo',
        settings.notificationsEnabled !== false && settings.athanSoundEnabled !== false,
        {
          morningAthkarTime: settings.morningAthkarTime || '06:30',
          morningAthkarNotifEnabled: settings.notificationsEnabled !== false && settings.morningAthkarNotifEnabled !== false,
          eveningAthkarTime: settings.eveningAthkarTime || '17:00',
          eveningAthkarNotifEnabled: settings.notificationsEnabled !== false && settings.eveningAthkarNotifEnabled !== false,
          wirdTime: settings.wirdTime || '21:00',
          wirdNotifEnabled: settings.notificationsEnabled !== false && settings.wirdNotifEnabled !== false
        }
      );
    }
  }, [settings]);

  // Trigger Auto Adhan Notification with Audio Adhan
  const triggerAutoAdhan = (prayer: PrayerTime) => {
    setActiveAdhanPrayer(prayer.arabicName);

    sendLocalNotification(
      `📢 أذان صلاة ${prayer.arabicName} - أذان القاهرة والجامع الأزهر الشريف`,
      `حان الآن موعد أذان صلاة ${prayer.arabicName} في ${settings.city} (${prayer.formattedTime})`
    );

    if (isAndroidNative()) {
      playAdhanNative('cairo');
    }

    const voiceKey = 'cairo';
    const audioObj = playAutomaticAdhanAudio(
      voiceKey,
      () => {
        setActiveAdhanPrayer(null);
        setActiveAdhanAudio(null);
        if (settings.postPrayerAudioAthkar !== false) {
          setShowPostPrayerModal(true);
        }
      },
      (errMsg) => {
        setActiveAdhanPrayer(null);
        setActiveAdhanAudio(null);
        console.error(errMsg);
      },
      () => {
        // Autoplay blocked handling
        console.warn('Autoplay blocked for Adhan audio');
      }
    );

    setActiveAdhanAudio(audioObj);
  };

  // Stop Active Adhan
  const handleStopAdhan = () => {
    stopAllAdhanAudio();
    stopAdhanNative();
    setActiveAdhanPrayer(null);
    setActiveAdhanAudio(null);
  };

  // Trigger Pre-Prayer Reminder (Visual/Notification only, no audio for Athkar)
  const triggerPrePrayerReminder = (prayer: PrayerTime) => {
    const msg = PRE_PRAYER_ATHKAR_MESSAGES[prayer.id] || `تذكير: اقتربت صلاة ${prayer.arabicName}، باقي 15 دقيقة.`;
    setActiveDhikrTitle(`تذكير قبل صلاة ${prayer.arabicName}`);
    setActiveDhikrText(msg);

    sendLocalNotification(`⏳ اقتربت صلاة ${prayer.arabicName}`, msg);
    setTimeout(() => {
      setActiveDhikrText(null);
      setActiveDhikrTitle(null);
    }, 5000);
  };

  // Trigger Periodic Daily Dhikr (Visual/Notification only)
  const triggerPeriodicDailyDhikr = () => {
    const randomDhikr = DAILY_PERIODIC_ATHKAR[Math.floor(Math.random() * DAILY_PERIODIC_ATHKAR.length)];
    setActiveDhikrTitle('تذكير الذكر الدوري');
    setActiveDhikrText(randomDhikr);

    sendLocalNotification('✨ ذكر اليوم', randomDhikr);
    setTimeout(() => {
      setActiveDhikrText(null);
      setActiveDhikrTitle(null);
    }, 5000);
  };

  // Stop Active Dhikr Banner
  const handleStopDhikr = () => {
    setActiveDhikrText(null);
    setActiveDhikrTitle(null);
  };

  // Play Post-Prayer Dhikr Step (Visual step advancement without audio)
  const handlePlayPostDhikrStep = (index: number) => {
    stopArabicSpeech();
    stopAllAdhanAudio();
    setCurrentPostDhikrIndex(index);
    setIsPostDhikrPlaying(true);
  };

  const handleStopPostDhikr = () => {
    stopArabicSpeech();
    stopAllAdhanAudio();
    setIsPostDhikrPlaying(false);
  };

  return (
    <>
      {/* 1. Active Adhan Floating Audio Banner */}
      {activeAdhanPrayer && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg mx-auto z-50 bg-[#14231B] border-2 border-[#4A6354] rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-3 text-right animate-bounce-short">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 animate-pulse">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                جاري تشغيل الأذان الآن
              </h4>
              <p className="text-sm font-bold text-[#E4E9E6] font-amiri">
                أذان صلاة {activeAdhanPrayer} (أذان القاهرة والجامع الأزهر الشريف)
              </p>
            </div>
          </div>

          <button
            onClick={handleStopAdhan}
            className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold flex items-center gap-1 shrink-0 transition-all"
          >
            <VolumeX className="w-4 h-4" />
            <span>إيقاف الأذان</span>
          </button>
        </div>
      )}

      {/* 2. Active Audio Dhikr Floating Banner */}
      {activeDhikrText && !activeAdhanPrayer && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#1A2520] border border-[#4A6354] rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 text-right animate-fadeIn">
          <div className="flex items-center gap-3 space-y-0.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D4539] flex items-center justify-center text-[#A7C0A8]">
              <Headphones className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#A7C0A8]">
                {activeDhikrTitle || 'ذكر صووتي'}
              </span>
              <p className="text-xs font-bold text-[#E4E9E6] font-amiri line-clamp-1">
                {activeDhikrText}
              </p>
            </div>
          </div>

          <button
            onClick={handleStopDhikr}
            className="p-1.5 rounded-lg text-[#8BA491] hover:text-[#E4E9E6] bg-[#141C18]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Post-Prayer Audio Athkar Trigger Button Floating Banner (or Modal) */}
      {showPostPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 text-right">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A352F] pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#A7C0A8]" />
                <h3 className="text-base font-bold font-amiri text-[#E4E9E6]">
                  أذكار دبر الصلاة (قراءة مرئية بدون صوت)
                </h3>
              </div>

              <button
                onClick={() => {
                  handleStopPostDhikr();
                  setShowPostPrayerModal(false);
                }}
                className="p-1.5 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8BA491] font-tajawal leading-relaxed">
              قال النبي ﷺ: «مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلَاةٍ ثَلَاثًا وَثَلَاثِينَ ... غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ».
            </p>

            {/* List of Post-Prayer Dhikr Steps */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {POST_PRAYER_ATHKAR.map((dhikr, idx) => {
                const isActive = currentPostDhikrIndex === idx && isPostDhikrPlaying;
                return (
                  <div
                    key={dhikr.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isActive 
                        ? 'bg-[#2D4539] border-[#4A6354] text-[#E4E9E6] shadow-md ring-1 ring-[#4A6354]' 
                        : 'bg-[#1A2520] border-[#2A352F] text-[#8BA491]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-[#E4E9E6]">
                        <span className="w-5 h-5 rounded-full bg-[#141C18] flex items-center justify-center text-[10px] text-[#A7C0A8]">
                          {idx + 1}
                        </span>
                        <span>{dhikr.title}</span>
                        {dhikr.count > 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141C18] text-[#A7C0A8] font-mono">
                            {dhikr.count} مرة
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-amiri leading-relaxed text-[#E4E9E6]/90">
                        {dhikr.text}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (isActive) {
                          handleStopPostDhikr();
                        } else {
                          handlePlayPostDhikrStep(idx);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
                        isActive
                          ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                          : 'bg-[#2D4539] hover:bg-[#3D5A4A] border-[#4A6354] text-[#E4E9E6]'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>تم القراءة</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تأكيد القراءة</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2A352F]">
              <button
                onClick={() => handlePlayPostDhikrStep(0)}
                className="px-4 py-2.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-[#A7C0A8]" />
                <span>البدء في القراءة</span>
              </button>

              <button
                onClick={() => {
                  handleStopPostDhikr();
                  setShowPostPrayerModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1A2520] hover:bg-[#2A352F] text-[#8BA491] text-xs font-bold"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
