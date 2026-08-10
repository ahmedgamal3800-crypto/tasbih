import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bell, 
  MapPin, 
  Sliders, 
  Compass, 
  Play, 
  Pause,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';
import { PrayerTime, UserSettings } from '../types';
import { playAutomaticAdhanAudio, stopAllAdhanAudio, unlockAudioContext } from '../utils/audioAthkar';

interface PrayerCountdownTimerProps {
  prayers: PrayerTime[];
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
    nextPrayer: PrayerTime | null;
  };
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onToggleManualAdjustment?: () => void;
  onToggleQibla?: () => void;
  qiblaDegree?: number;
}

export const PrayerCountdownTimer: React.FC<PrayerCountdownTimerProps> = ({
  prayers,
  countdown,
  settings,
  onUpdateSettings,
  onToggleManualAdjustment,
  onToggleQibla,
  qiblaDegree = 135
}) => {
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [timerMode, setTimerMode] = useState<'adhan' | 'iqama'>('adhan');
  const [copied, setCopied] = useState(false);

  // Compute Current Active Prayer
  const getCurrentPrayer = (): PrayerTime | null => {
    if (!prayers || prayers.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let current: PrayerTime | null = null;
    for (let i = 0; i < prayers.length; i++) {
      const [h, m] = prayers[i].time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (currentMinutes >= prayerMinutes) {
        current = prayers[i];
      }
    }
    // If before Fajr, current is Isha from previous night
    if (!current && prayers.length > 0) {
      current = prayers[prayers.length - 1];
    }
    return current;
  };

  const currentPrayer = getCurrentPrayer();
  const nextPrayer = countdown.nextPrayer;

  // Calculate elapsed progress percentage between current and next prayer
  const calculateProgressPercent = (): number => {
    if (!currentPrayer || !nextPrayer) return 50;
    const now = new Date();
    const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const [ch, cm] = currentPrayer.time.split(':').map(Number);
    let startSecs = ch * 3600 + cm * 60;

    const [nh, nm] = nextPrayer.time.split(':').map(Number);
    let endSecs = nh * 3600 + nm * 60;

    if (endSecs <= startSecs) {
      endSecs += 24 * 3600; // Wraps next day
    }
    let currentNowSecs = nowSecs;
    if (currentNowSecs < startSecs) {
      currentNowSecs += 24 * 3600;
    }

    const totalDuration = endSecs - startSecs;
    const elapsed = currentNowSecs - startSecs;

    if (totalDuration <= 0) return 100;
    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    return Math.round(percent);
  };

  const progressPercent = calculateProgressPercent();

  // Iqama countdown calculation
  const getIqamaMinutesRemaining = (): number => {
    if (!currentPrayer) return 0;
    const offset = currentPrayer.iqamaOffsetMinutes || 15;
    const now = new Date();
    const [h, m] = currentPrayer.time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);
    const iqamaTime = new Date(prayerTime.getTime() + offset * 60 * 1000);

    const diffMs = iqamaTime.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (60 * 1000));
  };

  const iqamaRemainingMins = getIqamaMinutesRemaining();

  // Play / Stop Adhan Audio
  const handleToggleAdhanAudio = () => {
    unlockAudioContext();
    if (isPlayingAdhan) {
      stopAllAdhanAudio();
      setIsPlayingAdhan(false);
    } else {
      setIsPlayingAdhan(true);
      playAutomaticAdhanAudio(
        'cairo',
        () => setIsPlayingAdhan(false),
        () => setIsPlayingAdhan(false),
        () => setIsPlayingAdhan(false)
      );
    }
  };

  // Copy Prayer Schedule Card
  const handleShareCountdown = () => {
    if (!nextPrayer) return;
    const text = `🕌 موعد صلاة ${nextPrayer.arabicName} القادمة في ${settings.city}: ${nextPrayer.formattedTime}\nمتبقي: ${countdown.hours}س و ${countdown.minutes}د و ${countdown.seconds}ث\nعبر تطبيق نور الهداية الرفيق الإسلامي 🌿`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#121C16] p-5 sm:p-7 border border-[#22342A] shadow-xl text-[#E5EDE8] transition-all">
      {/* Background Soft Eye-Comfort Ambient Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#253C30]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3E5A4A]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#22342A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#18251E] border border-[#22342A] flex items-center justify-center text-[#A5D2B3] shadow-inner">
              <Clock className="w-6 h-6 text-[#A5D2B3] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8AA393]">
                <Sparkles className="w-3.5 h-3.5 text-[#A5D2B3]" />
                <span>مؤقت الصلاة المباشر والمريح للعين</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[#A5D2B3]">
                {settings.city} - {settings.country}
              </h2>
            </div>
          </div>

          {/* Mode Switcher: Adhan Timer vs Iqama Timer */}
          <div className="flex items-center gap-1 bg-[#18251E] p-1 rounded-xl border border-[#22342A] text-xs font-medium self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setTimerMode('adhan')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timerMode === 'adhan'
                  ? 'bg-[#253C30] text-[#E5EDE8] font-bold border border-[#3E5A4A] shadow-sm'
                  : 'text-[#8AA393] hover:text-[#E5EDE8]'
              }`}
            >
              مؤقت الأذان
            </button>
            <button
              onClick={() => setTimerMode('iqama')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timerMode === 'iqama'
                  ? 'bg-[#253C30] text-[#E5EDE8] font-bold border border-[#3E5A4A] shadow-sm'
                  : 'text-[#8AA393] hover:text-[#E5EDE8]'
              }`}
            >
              مؤقت الإقامة (+{currentPrayer?.iqamaOffsetMinutes || 15}د)
            </button>
          </div>
        </div>

        {/* Main Countdown Display Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Next Prayer & Countdown Numbers */}
          <div className="md:col-span-7 space-y-4 text-center md:text-right">
            
            {timerMode === 'adhan' ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18251E] border border-[#22342A] text-[#A5D2B3] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>الصلاة القادمة: {nextPrayer ? nextPrayer.arabicName : 'الفجر'}</span>
                  <span className="text-[#8AA393]">({nextPrayer ? nextPrayer.formattedTime : '--:--'})</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#8AA393] font-medium">الوقت المتبقي حتى رفع الأذان:</p>
                  
                  {/* Large Eye-Friendly Countdown Clock */}
                  <div className="flex items-center justify-center md:justify-start gap-2 dir-ltr font-mono">
                    <div className="flex flex-col items-center bg-[#18251E] px-3 sm:px-4 py-2.5 rounded-2xl border border-[#22342A] min-w-[70px]">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#A5D2B3]">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#8AA393] font-cairo">ساعة</span>
                    </div>

                    <span className="text-2xl text-[#3E5A4A] font-bold animate-pulse">:</span>

                    <div className="flex flex-col items-center bg-[#18251E] px-3 sm:px-4 py-2.5 rounded-2xl border border-[#22342A] min-w-[70px]">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#A5D2B3]">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#8AA393] font-cairo">دقيقة</span>
                    </div>

                    <span className="text-2xl text-[#3E5A4A] font-bold animate-pulse">:</span>

                    <div className="flex flex-col items-center bg-[#18251E] px-3 sm:px-4 py-2.5 rounded-2xl border border-[#22342A] min-w-[70px]">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#82C89A]">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-[#8AA393] font-cairo">ثانية</span>
                    </div>
                  </div>
                </div>

                {/* Current Active Prayer Info */}
                {currentPrayer && (
                  <p className="text-xs text-[#8AA393] pt-1">
                    🕌 أنت الآن في وقت صلاة <strong className="text-[#E5EDE8]">{currentPrayer.arabicName}</strong> ({currentPrayer.formattedTime})
                  </p>
                )}
              </>
            ) : (
              /* Iqama Timer Mode */
              <div className="space-y-3 py-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-bold">
                  <span>⏱ مؤقت إقامة صلاة {currentPrayer ? currentPrayer.arabicName : 'الجهرية'}</span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold font-cairo text-[#E5EDE8]">
                  {iqamaRemainingMins > 0 ? (
                    <span>متبقي <strong className="text-amber-300 font-mono text-3xl">{iqamaRemainingMins}</strong> دقيقة على الإقامة</span>
                  ) : (
                    <span className="text-emerald-300">حان وقت الإقامة أو انقضت بحمد الله</span>
                  )}
                </div>

                <p className="text-xs text-[#8AA393]">
                  إقامة صلاة {currentPrayer?.arabicName} تتم بعد {currentPrayer?.iqamaOffsetMinutes || 15} دقيقة من رفع الأذان بالمسجد.
                </p>
              </div>
            )}

            {/* Quick Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <button
                onClick={handleToggleAdhanAudio}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  isPlayingAdhan
                    ? 'bg-rose-900/80 hover:bg-rose-800 text-white animate-pulse ring-1 ring-rose-500'
                    : 'bg-[#253C30] hover:bg-[#324f40] border border-[#3E5A4A] text-[#A5D2B3]'
                }`}
              >
                {isPlayingAdhan ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-200" />
                    <span>إيقاف الأذان ⏹</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#A5D2B3]" />
                    <span>استماع للأذان 🔊</span>
                  </>
                )}
              </button>

              {onToggleQibla && (
                <button
                  onClick={onToggleQibla}
                  className="px-3.5 py-2 rounded-xl bg-[#18251E] hover:bg-[#253C30] border border-[#22342A] text-[#8AA393] hover:text-[#E5EDE8] text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Compass className="w-4 h-4 text-[#A5D2B3]" />
                  <span>القبلة ({qiblaDegree}°)</span>
                </button>
              )}

              {onToggleManualAdjustment && (
                <button
                  onClick={onToggleManualAdjustment}
                  className="px-3.5 py-2 rounded-xl bg-[#18251E] hover:bg-[#253C30] border border-[#22342A] text-[#8AA393] hover:text-[#E5EDE8] text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Sliders className="w-4 h-4 text-[#A5D2B3]" />
                  <span>تعديل التوقيت</span>
                </button>
              )}

              <button
                onClick={handleShareCountdown}
                className="p-2 rounded-xl bg-[#18251E] hover:bg-[#253C30] border border-[#22342A] text-[#8AA393] hover:text-[#E5EDE8] transition-all"
                title="مشاركة موعد الصلاة"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#A5D2B3]" />}
              </button>
            </div>

          </div>

          {/* Right Column: Visual Progress Ring & Indicator */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#18251E] rounded-2xl border border-[#22342A] relative">
            
            {/* Visual Ring */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#22342A]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#A5D2B3] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inside Ring Content */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#A5D2B3] font-mono">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-[#8AA393] font-medium max-w-[80px] leading-tight mt-0.5">
                  انقضى من الانتظار
                </span>
              </div>
            </div>

            {/* Progress Bar Label */}
            <div className="mt-3 w-full space-y-1 text-center">
              <div className="flex justify-between text-[11px] text-[#8AA393]">
                <span>{currentPrayer?.arabicName || 'الآن'}</span>
                <span>{nextPrayer?.arabicName || 'القادمة'}</span>
              </div>
              <div className="w-full h-2 bg-[#121C16] rounded-full overflow-hidden border border-[#22342A]">
                <div
                  className="h-full bg-gradient-to-r from-[#253C30] via-[#3E5A4A] to-[#A5D2B3] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
