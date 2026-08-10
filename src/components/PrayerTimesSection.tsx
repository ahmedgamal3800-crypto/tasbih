import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  SunMedium, 
  SunMoon, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Compass, 
  Clock, 
  CheckCircle,
  Bell,
  Sliders,
  Sparkles,
  Globe,
  Headphones,
  AlertTriangle
} from 'lucide-react';
import { PrayerTime, UserSettings, UserProgress } from '../types';
import { 
  calculatePrayerTimes, 
  getNextPrayerCountdown, 
  CITIES_LIST, 
  CALCULATION_METHODS,
  getCountriesList,
  getCitiesForCountry,
  fetchAladhanPrayerTimes
} from '../data/prayers';
import { playGentleAudioTone, requestNotificationPermission, sendLocalNotification } from '../utils/notifications';
import { 
  speakArabicText, 
  stopArabicSpeech, 
  playAutomaticAdhanAudio, 
  stopAllAdhanAudio, 
  isAdhanCurrentlyPlaying, 
  unlockAudioContext
} from '../utils/audioAthkar';
import { PrayerCountdownTimer } from './PrayerCountdownTimer';

interface PrayerTimesSectionProps {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
}

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onUpdateProgress
}) => {
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, nextPrayer: null as PrayerTime | null });
  const [showQibla, setShowQibla] = useState(false);
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  const [qiblaDegree, setQiblaDegree] = useState(135);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activePlayingPrayerKey, setActivePlayingPrayerKey] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Direct Adhan Playback (Cairo Adhan MP3)
  const handlePlayAdhan = () => {
    unlockAudioContext();
    stopAllAdhanAudio();
    if (audioInstance) {
      try {
        audioInstance.pause();
        audioInstance.currentTime = 0;
      } catch (e) {
        console.warn('Pause error', e);
      }
    }

    setIsPlayingAudio(true);
    setActivePlayingPrayerKey('general');

    try {
      const audio = playAutomaticAdhanAudio(
        'cairo',
        () => {
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        },
        (errMsg) => {
          console.warn('Adhan play error:', errMsg);
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        },
        () => {
          console.warn('Adhan play blocked');
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        }
      );
      setAudioInstance(audio);
    } catch (err) {
      console.error('Play adhan error:', err);
      setIsPlayingAudio(false);
      setActivePlayingPrayerKey(null);
      setAudioInstance(null);
    }
  };

  // Direct Stop Adhan
  const handleStopAdhan = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }
    stopAllAdhanAudio();
    setIsPlayingAudio(false);
    setAudioInstance(null);
  };

  const currentCityLoc = CITIES_LIST.find(c => c.nameAr === settings.city) || CITIES_LIST[0];
  const currentCountry = settings.country || currentCityLoc.countryAr || 'مصر';
  const countriesList = getCountriesList();
  const availableCities = getCitiesForCountry(currentCountry);

  // Recalculate prayer times whenever country, city, calculation method, manual offsets or custom exact times change
  useEffect(() => {
    let isMounted = true;

    // 1. Instant local calculation using NOAA astronomical formulas
    const localPrayers = calculatePrayerTimes(
      settings.city,
      new Date(),
      settings.prayerManualOffsetMinutes || 0,
      settings.perPrayerOffsets || {},
      settings.customExactPrayerTimes || {},
      settings.calculationMethod,
      settings.country
    );
    setPrayers(localPrayers);

    // 2. Fetch official timings from Aladhan API for maximum precision
    const cityLoc = CITIES_LIST.find(
      c => c.nameAr === settings.city && (!settings.country || c.countryAr === settings.country)
    ) || CITIES_LIST.find(c => c.nameAr === settings.city);

    if (cityLoc) {
      fetchAladhanPrayerTimes(cityLoc.nameEn, cityLoc.countryAr, settings.calculationMethod).then(apiTimes => {
        if (isMounted && apiTimes) {
          const apiPrayers = calculatePrayerTimes(
            settings.city,
            new Date(),
            settings.prayerManualOffsetMinutes || 0,
            settings.perPrayerOffsets || {},
            { ...apiTimes, ...(settings.customExactPrayerTimes || {}) },
            settings.calculationMethod,
            settings.country
          );
          setPrayers(apiPrayers);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [
    settings.city, 
    settings.country,
    settings.calculationMethod, 
    settings.prayerManualOffsetMinutes, 
    settings.perPrayerOffsets,
    settings.customExactPrayerTimes
  ]);

  // Live timer tick every second for prayer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (prayers.length > 0) {
        const cd = getNextPrayerCountdown(prayers);
        setCountdown(cd);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayers]);

  // Handle Prayer Completion log
  const togglePrayerLogged = (prayerId: string) => {
    const todayKey = `${new Date().toISOString().split('T')[0]}-${prayerId}`;
    const newLogs = { ...progress.prayerLogs, [todayKey]: !progress.prayerLogs[todayKey] };
    onUpdateProgress({ prayerLogs: newLogs });
  };

  const getPrayerIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMoon': return <SunMoon className="w-5 h-5 text-amber-300" />;
      case 'Sunrise': return <Sunrise className="w-5 h-5 text-amber-400" />;
      case 'Sun': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5 text-orange-400" />;
      case 'Sunset': return <Sunset className="w-5 h-5 text-rose-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-300" />;
      default: return <Clock className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Unlock audio policy on component load
  useEffect(() => {
    unlockAudioContext();
  }, []);

  const playAthanPreview = (specificPrayerKey: string = 'general') => {
    // If audio is currently playing...
    if (isPlayingAudio || isAdhanCurrentlyPlaying()) {
      stopAllAdhanAudio();
      setIsPlayingAudio(false);
      setAudioInstance(null);
      
      // If clicking the same button that was playing, toggle OFF and return
      if (activePlayingPrayerKey === specificPrayerKey) {
        setActivePlayingPrayerKey(null);
        return;
      }
    }

    // Start playing requested prayer Adhan with selected voice
    stopAllAdhanAudio();
    setIsPlayingAudio(true);
    setActivePlayingPrayerKey(specificPrayerKey);

    try {
      const audio = playAutomaticAdhanAudio(
        'cairo',
        () => {
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        },
        () => {
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        },
        () => {
          setIsPlayingAudio(false);
          setActivePlayingPrayerKey(null);
          setAudioInstance(null);
        }
      );
      setAudioInstance(audio);
    } catch (e) {
      console.warn('Adhan player exception:', e);
      setIsPlayingAudio(false);
      setActivePlayingPrayerKey(null);
      setAudioInstance(null);
    }
  };

  // Helper to calculate Qibla angle from current city lat/lng
  const handleCalculateQibla = () => {
    setShowQibla(!showQibla);
    const city = CITIES_LIST.find(c => c.nameAr === settings.city) || CITIES_LIST[0];
    
    // Makkah coordinates
    const makkahLat = 21.3891 * (Math.PI / 180);
    const makkahLng = 39.8579 * (Math.PI / 180);
    const cityLat = city.lat * (Math.PI / 180);
    const cityLng = city.lng * (Math.PI / 180);

    const dLng = makkahLng - cityLng;
    const y = Math.sin(dLng);
    const x = Math.cos(cityLat) * Math.tan(makkahLat) - Math.sin(cityLat) * Math.cos(dLng);
    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = (qiblaRad * (180 / Math.PI) + 360) % 360;
    setQiblaDegree(Math.round(qiblaDeg));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Interactive Prayer Countdown Timer */}
      <PrayerCountdownTimer
        prayers={prayers}
        countdown={countdown}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onToggleManualAdjustment={() => setShowManualAdjustment(!showManualAdjustment)}
        onToggleQibla={handleCalculateQibla}
        qiblaDegree={qiblaDegree}
      />

      {/* Location & Notification Quick Control Bar */}
      <div className="bg-[#121C16] p-4 rounded-2xl border border-[#22342A] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8AA393]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Country Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18251E] border border-[#22342A] text-[#E5EDE8]">
            <Globe className="w-3.5 h-3.5 text-[#A5D2B3] shrink-0" />
            <span className="text-[#8AA393]">الدولة:</span>
            <select
              value={currentCountry}
              onChange={(e) => {
                const newCountry = e.target.value;
                const citiesInCountry = getCitiesForCountry(newCountry);
                const firstCity = citiesInCountry[0];
                if (firstCity) {
                  onUpdateSettings({
                    country: newCountry,
                    city: firstCity.nameAr,
                    calculationMethod: firstCity.defaultMethod || settings.calculationMethod
                  });
                } else {
                  onUpdateSettings({ country: newCountry });
                }
              }}
              className="bg-transparent text-[#A5D2B3] font-bold focus:outline-none cursor-pointer"
            >
              {countriesList.map((c) => (
                <option key={c} value={c} className="bg-[#121C16] text-[#E5EDE8]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18251E] border border-[#22342A] text-[#E5EDE8]">
            <MapPin className="w-3.5 h-3.5 text-[#A5D2B3] shrink-0" />
            <span className="text-[#8AA393]">المدينة:</span>
            <select
              value={settings.city}
              onChange={(e) => {
                const newCity = e.target.value;
                const cityLoc = CITIES_LIST.find(c => c.nameAr === newCity && c.countryAr === currentCountry) || CITIES_LIST.find(c => c.nameAr === newCity);
                if (cityLoc) {
                  onUpdateSettings({
                    city: newCity,
                    country: cityLoc.countryAr,
                    calculationMethod: cityLoc.defaultMethod || settings.calculationMethod
                  });
                } else {
                  onUpdateSettings({ city: newCity });
                }
              }}
              className="bg-transparent text-[#A5D2B3] font-bold focus:outline-none cursor-pointer"
            >
              {availableCities.map((c) => (
                <option key={c.nameAr} value={c.nameAr} className="bg-[#121C16] text-[#E5EDE8]">
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#E5EDE8]">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled !== false}
              onChange={async (e) => {
                const checked = e.target.checked;
                if (checked) {
                  try {
                    await requestNotificationPermission();
                  } catch (err) {
                    console.warn('Notification permission error', err);
                  }
                  onUpdateSettings({ notificationsEnabled: true });
                  sendLocalNotification('تطبيق نور الهداية للموبايل', 'تم تفعيل إشعارات الأذان والصلوات بنجاح! 🔔');
                } else {
                  onUpdateSettings({ notificationsEnabled: false });
                }
              }}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <span className="font-bold text-[#A5D2B3] flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>إشعارات الأذان</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-[#E5EDE8]">
            <input
              type="checkbox"
              checked={settings.autoAthanEnabled !== false}
              onChange={(e) => onUpdateSettings({ autoAthanEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <span>الأذان التلقائي</span>
          </label>
        </div>
      </div>

        {/* Simplified Adhan Settings Section */}
        <div className="mt-6 bg-[#1A2520] border border-[#2D4539] p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A352F] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D4539] border border-[#4A6354] flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#E4E9E6] font-amiri">
                  إعدادات الأذان
                </h3>
                <p className="text-xs text-[#8BA491]">
                  أذان القاهرة والجامع الأزهر الشريف
                </p>
              </div>
            </div>
          </div>

          {/* Adhan Control Buttons Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Button 1: Play Adhan */}
            <button
              onClick={handlePlayAdhan}
              disabled={isPlayingAudio}
              className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isPlayingAudio
                  ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed animate-pulse ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/40 active:scale-95'
              }`}
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>🔊 تشغيل الأذان</span>
            </button>

            {/* Button 2: Stop Adhan */}
            <button
              onClick={handleStopAdhan}
              className="px-4 py-3 rounded-2xl bg-rose-950/70 hover:bg-rose-900/90 border border-rose-800/60 text-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:shadow-rose-950/40 active:scale-95"
            >
              <VolumeX className="w-4 h-4 text-rose-300 shrink-0" />
              <span>⏹ إيقاف الأذان</span>
            </button>
          </div>

          {/* Active Audio Playback Banner */}
          {isPlayingAudio && (
            <div className="bg-emerald-950/70 border border-emerald-800/70 p-3.5 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-emerald-200 animate-fadeIn">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>جاري تشغيل أذان القاهرة والجامع الأزهر الشريف... 🕌</span>
            </div>
          )}
        </div>

        {/* Qibla Direction Drawer */}
        {showQibla && (
          <div className="mt-6 pt-6 border-t border-[#2A352F] grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#141C18] p-5 rounded-2xl border border-[#2A352F]">
            <div className="space-y-2 text-right">
              <h4 className="text-base font-bold font-amiri text-[#A7C0A8] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#A7C0A8]" />
                اتجاه القبلة الشريفة بالنسبة لـ {settings.city}
              </h4>
              <p className="text-xs text-[#8BA491] leading-relaxed">
                الزاوية الدقيقة لمكة المكرمة هي <span className="font-bold text-[#E4E9E6]">{qiblaDegree} درجة</span> شمال الشرق. ووجّه هاتفك نحو الاتجاه المبين في البوصلة التفاعلية.
              </p>
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#2D4539] flex items-center justify-center bg-[#0F1713] shadow-inner">
                {/* Compass Needle */}
                <div 
                  className="absolute w-1 h-14 bg-gradient-to-t from-emerald-600 to-[#A7C0A8] rounded-full transition-transform duration-700 ease-out"
                  style={{ transform: `rotate(${qiblaDegree}deg)` }}
                />
                <div className="w-4 h-4 rounded-full bg-[#A7C0A8] ring-4 ring-[#141C18] z-10" />
                <span className="absolute top-1 text-[10px] text-[#8BA491]">شمال</span>
                <span className="absolute bottom-1 text-[10px] text-[#8BA491]">جنوب</span>
                <span className="absolute right-1 text-[10px] text-[#8BA491]">شرق</span>
                <span className="absolute left-1 text-[10px] text-[#8BA491]">غرب</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Time Adjustment & DST Drawer */}
        {showManualAdjustment && (
          <div className="mt-6 pt-6 border-t border-[#2A352F] bg-[#141C18] p-5 rounded-2xl border border-[#2D4539] space-y-5 text-right animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A352F] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#A7C0A8]" />
                <h4 className="text-base font-bold font-amiri text-[#E4E9E6]">
                  ضبط مواقيت الأذان والتوقيت الصيفي / الشتوي
                </h4>
              </div>

              <button
                onClick={() => {
                  onUpdateSettings({
                    prayerManualOffsetMinutes: 0,
                    perPrayerOffsets: {},
                    customExactPrayerTimes: {}
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1A2520] hover:bg-[#2A352F] border border-[#2A352F] text-amber-300 text-xs font-semibold transition-all"
              >
                إعادة ضبط تلقائي
              </button>
            </div>

            {/* Quick Preset Buttons (DST - Summer/Winter) */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#A7C0A8]">1. اختصارات التوقيت الشتوي والصيفي:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: 0 })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    (settings.prayerManualOffsetMinutes || 0) === 0
                      ? 'bg-[#2D4539] border-[#4A6354] text-[#E4E9E6] shadow-md ring-1 ring-[#4A6354]'
                      : 'bg-[#1A2520] border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6]'
                  }`}
                >
                  ❄️ التوقيت الشتوي (0)
                </button>

                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: 60 })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    (settings.prayerManualOffsetMinutes || 0) === 60
                      ? 'bg-[#2D4539] border-[#4A6354] text-[#E4E9E6] shadow-md ring-1 ring-[#4A6354]'
                      : 'bg-[#1A2520] border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6]'
                  }`}
                >
                  ☀️ التوقيت الصيفي (+60د)
                </button>

                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: -60 })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    (settings.prayerManualOffsetMinutes || 0) === -60
                      ? 'bg-[#2D4539] border-[#4A6354] text-[#E4E9E6] shadow-md ring-1 ring-[#4A6354]'
                      : 'bg-[#1A2520] border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6]'
                  }`}
                >
                  ⏪ تأخير ساعة (-60د)
                </button>

                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: 30 })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    (settings.prayerManualOffsetMinutes || 0) === 30
                      ? 'bg-[#2D4539] border-[#4A6354] text-[#E4E9E6] shadow-md ring-1 ring-[#4A6354]'
                      : 'bg-[#1A2520] border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6]'
                  }`}
                >
                  ⏩ تقديم (+30د)
                </button>
              </div>
            </div>

            {/* Direct Exact Time Typing Section (User Request) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#A7C0A8]">2. كتابة وتحديد توقيت الصلاة المباشر بالكامل (ساعة : دقيقة):</p>
                <span className="text-[10px] text-[#8BA491]">اكتب الوقت مباشرة مثل 04:15 أو اختره من القائمة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'fajr', label: 'الفجر' },
                  { id: 'sunrise', label: 'الشروق' },
                  { id: 'dhuhr', label: 'الظهر' },
                  { id: 'asr', label: 'العصر' },
                  { id: 'maghrib', label: 'المغرب' },
                  { id: 'isha', label: 'العشاء' }
                ].map((p) => {
                  const prayerMatch = prayers.find(pr => pr.id === p.id);
                  const customTime = (settings.customExactPrayerTimes || {})[p.id] || '';
                  const currentTimeDisplay = prayerMatch ? prayerMatch.time : '';

                  return (
                    <div 
                      key={p.id}
                      className={`p-3.5 rounded-2xl border space-y-2 text-xs transition-all ${
                        customTime 
                          ? 'bg-[#2D4539]/60 border-amber-400/50 shadow-md ring-1 ring-amber-400/30' 
                          : 'bg-[#1A2520] border-[#2A352F]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#E4E9E6]">{p.label}</span>
                        {prayerMatch && (
                          <span className="font-mono font-bold text-amber-300 text-xs bg-[#141C18] px-2 py-0.5 rounded-md border border-[#2A352F]">
                            {prayerMatch.formattedTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#2A352F]/60">
                        {/* Time Picker / Manual Input */}
                        <div className="flex-1 flex items-center gap-1 bg-[#141C18] border border-[#2A352F] rounded-xl px-2 py-1">
                          <input
                            type="time"
                            value={customTime || currentTimeDisplay}
                            onChange={(e) => {
                              const newCustom = { ...(settings.customExactPrayerTimes || {}), [p.id]: e.target.value };
                              onUpdateSettings({ customExactPrayerTimes: newCustom });
                            }}
                            className="w-full bg-transparent font-mono text-xs font-bold text-[#E4E9E6] focus:outline-none cursor-pointer dir-ltr"
                          />
                        </div>

                        {/* Direct Text Box Override for Manual Typing */}
                        <input
                          type="text"
                          placeholder="04:15"
                          value={customTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newCustom = { ...(settings.customExactPrayerTimes || {}), [p.id]: val };
                            onUpdateSettings({ customExactPrayerTimes: newCustom });
                          }}
                          className="w-16 px-1.5 py-1 bg-[#141C18] border border-[#2A352F] rounded-xl font-mono text-xs font-bold text-[#A7C0A8] text-center focus:outline-none focus:border-[#4A6354]"
                          title="اكتب الوقت يدوياً بأرقام مثل 04:15"
                        />

                        {customTime && (
                          <button
                            onClick={() => {
                              const newCustom = { ...(settings.customExactPrayerTimes || {}) };
                              delete newCustom[p.id];
                              onUpdateSettings({ customExactPrayerTimes: newCustom });
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[10px] font-bold hover:bg-rose-900"
                            title="إلغاء التوقيت اليدوي المباشر"
                          >
                            مسح
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global Minutes Offset Stepper & Manual Numeric Typing */}
            <div className="p-3.5 bg-[#1A2520] border border-[#2A352F] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#E4E9E6] block">3. التقديم أو التأخير العام بالدقائق (إدخال يدوي):</span>
                <span className="text-[11px] text-[#8BA491]">اكتب الرقم مباشرة بالدقائق (مثال: 60 للتوقيت الصيفي، -60 لتأخير ساعة)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: (settings.prayerManualOffsetMinutes || 0) - 1 })}
                  className="w-9 h-9 rounded-xl bg-[#2D4539] border border-[#4A6354] text-[#E4E9E6] font-bold text-base flex items-center justify-center hover:bg-[#3D5A4A]"
                  title="تأخير دقيقة"
                >
                  -
                </button>

                <div className="flex items-center gap-1 bg-[#141C18] border border-[#2A352F] rounded-xl px-2 py-1">
                  <input
                    type="number"
                    value={settings.prayerManualOffsetMinutes ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateSettings({ prayerManualOffsetMinutes: isNaN(val) ? 0 : val });
                    }}
                    className="w-16 bg-transparent font-mono font-bold text-sm text-[#A7C0A8] text-center focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-[#8BA491] text-[11px]">دقيقة</span>
                </div>

                <button
                  onClick={() => onUpdateSettings({ prayerManualOffsetMinutes: (settings.prayerManualOffsetMinutes || 0) + 1 })}
                  className="w-9 h-9 rounded-xl bg-[#2D4539] border border-[#4A6354] text-[#E4E9E6] font-bold text-base flex items-center justify-center hover:bg-[#3D5A4A]"
                  title="تقديم دقيقة"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fine Tuning Per Prayer Offsets with Direct Numeric Input */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-[#A7C0A8]">4. ضبط الفارق بالدقائق لكل صلاة منفردة (مطابقة المسجد المحلي):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'fajr', label: 'الفجر' },
                  { id: 'sunrise', label: 'الشروق' },
                  { id: 'dhuhr', label: 'الظهر' },
                  { id: 'asr', label: 'العصر' },
                  { id: 'maghrib', label: 'المغرب' },
                  { id: 'isha', label: 'العشاء' }
                ].map((p) => {
                  const currentSpecific = (settings.perPrayerOffsets || {})[p.id] || 0;
                  const prayerMatch = prayers.find(pr => pr.id === p.id);
                  return (
                    <div 
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[#1A2520] border border-[#2A352F] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#E4E9E6]">{p.label}</span>
                        {prayerMatch && (
                          <span className="font-mono font-bold text-emerald-400 text-xs bg-[#141C18] px-2 py-0.5 rounded-md border border-[#2A352F]">
                            {prayerMatch.formattedTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#2A352F]/60">
                        <button
                          onClick={() => {
                            const newPer = { ...(settings.perPrayerOffsets || {}), [p.id]: currentSpecific - 1 };
                            onUpdateSettings({ perPrayerOffsets: newPer });
                          }}
                          className="w-7 h-7 rounded-lg bg-[#2D4539] text-[#E4E9E6] font-bold flex items-center justify-center hover:bg-[#3D5A4A] shrink-0"
                        >
                          -
                        </button>

                        <div className="flex items-center gap-1 bg-[#141C18] border border-[#2A352F] rounded-lg px-2 py-0.5">
                          <input
                            type="number"
                            value={currentSpecific}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const newPer = { ...(settings.perPrayerOffsets || {}), [p.id]: isNaN(val) ? 0 : val };
                              onUpdateSettings({ perPrayerOffsets: newPer });
                            }}
                            className="w-12 bg-transparent font-mono text-xs font-bold text-[#A7C0A8] text-center focus:outline-none"
                            placeholder="0"
                          />
                          <span className="text-[#8BA491] text-[10px]">د</span>
                        </div>

                        <button
                          onClick={() => {
                            const newPer = { ...(settings.perPrayerOffsets || {}), [p.id]: currentSpecific + 1 };
                            onUpdateSettings({ perPrayerOffsets: newPer });
                          }}
                          className="w-7 h-7 rounded-lg bg-[#2D4539] text-[#E4E9E6] font-bold flex items-center justify-center hover:bg-[#3D5A4A] shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      {/* Grid of 6 Prayer Times */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-amiri text-[#E4E9E6] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#A7C0A8]" />
            مواقيت الصلاة اليومية - {settings.city}
          </h3>
          
          {/* Method selector */}
          <div className="text-xs text-[#8BA491] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#8BA491]" />
            <select
              value={settings.calculationMethod}
              onChange={(e) => onUpdateSettings({ calculationMethod: e.target.value })}
              className="bg-[#141C18] text-[#E4E9E6] rounded-xl px-2.5 py-1 border border-[#2A352F] focus:outline-none"
            >
              {CALCULATION_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.nameAr}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {prayers.map((prayer) => {
            const isCompleted = progress.prayerLogs[`${todayStr}-${prayer.id}`];
            const isNext = countdown.nextPrayer?.id === prayer.id;

            return (
              <div
                key={prayer.id}
                className={`relative p-4 rounded-2xl border transition-all ${
                  isNext
                    ? 'bg-[#2D4539] border-[#4A6354] shadow-lg text-[#E4E9E6]'
                    : 'bg-[#141C18] hover:bg-[#1A2520] border-[#2A352F]'
                }`}
              >
                {/* Status indicator badge */}
                {isNext && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#A7C0A8] text-[#0F1713] font-bold text-[10px]">
                    الصلاة القادمة
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[#1A2520] border border-[#2A352F]">
                    {getPrayerIcon(prayer.iconName)}
                  </div>

                  {/* Prayer completion logger checkbox */}
                  <button
                    onClick={() => togglePrayerLogged(prayer.id)}
                    title={isCompleted ? 'تم أداء الصلاة بحمد الله' : 'علم كأنك صليتها'}
                    className={`p-1.5 rounded-xl transition-colors ${
                      isCompleted 
                        ? 'bg-[#2D4539] text-[#A7C0A8] border border-[#4A6354]' 
                        : 'text-[#8BA491] hover:text-[#E4E9E6]'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${isCompleted ? 'fill-[#A7C0A8] text-[#0F1713]' : ''}`} />
                  </button>
                </div>

                <h4 className="text-sm font-bold font-amiri text-[#E4E9E6]">
                  {prayer.arabicName}
                </h4>

                <div className="text-base font-bold font-cairo text-[#A7C0A8] mt-1">
                  {prayer.formattedTime}
                </div>

                <div className="mt-3 pt-2 border-t border-[#2A352F] flex items-center justify-between text-[11px] text-[#8BA491]">
                  <span>الإقامة: +{prayer.iqamaOffsetMinutes}د</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const updatedPrayers = prayers.map(p => 
                          p.id === prayer.id ? { ...p, notificationEnabled: !p.notificationEnabled } : p
                        );
                        setPrayers(updatedPrayers);
                      }}
                      title={prayer.notificationEnabled ? 'التنبيهات مفعلة' : 'التنبيهات معطلة'}
                    >
                      <Bell className={`w-3.5 h-3.5 ${prayer.notificationEnabled ? 'text-[#A7C0A8]' : 'text-[#8BA491]'}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
