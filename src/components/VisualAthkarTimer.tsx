import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Wind,
  Clock,
  Heart
} from 'lucide-react';
import { playTasbeehClickAudio } from '../utils/audioAthkar';

interface VisualAthkarTimerProps {
  onSessionComplete?: (durationMinutes: number) => void;
  activeDhikrTitle?: string;
}

const PRESET_DURATIONS = [
  { label: 'دقيقة واحدة', seconds: 60, icon: '1m' },
  { label: '3 دقائق', seconds: 180, icon: '3m' },
  { label: '5 دقائق', seconds: 300, icon: '5m' },
  { label: '10 دقائق', seconds: 600, icon: '10m' },
  { label: '15 دقيقة', seconds: 900, icon: '15m' }
];

export const VisualAthkarTimer: React.FC<VisualAthkarTimerProps> = ({
  onSessionComplete,
  activeDhikrTitle
}) => {
  const [targetSeconds, setTargetSeconds] = useState<number>(300); // Default 5 minutes
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [enableBreathingGuide, setEnableBreathingGuide] = useState<boolean>(true);

  // Breathing guide state (Inhale 4s, Hold 2s, Exhale 4s)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingText, setBreathingText] = useState<string>('شهيق واستحضار النية...');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsCompleted(true);
            
            if (soundEnabled) {
              playTasbeehClickAudio('completion');
            }

            if (onSessionComplete) {
              onSessionComplete(Math.round(targetSeconds / 60));
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, targetSeconds, soundEnabled, onSessionComplete]);

  // Handle Breathing guide rhythm (10s total loop: 4s inhale, 2s hold, 4s exhale)
  useEffect(() => {
    if (!isRunning || !enableBreathingGuide) return;

    let breathInterval: NodeJS.Timeout;
    let step = 0;

    const runBreathingCycle = () => {
      step = (step + 1) % 10;
      if (step < 4) {
        setBreathingPhase('inhale');
        setBreathingText('شهيق واستحضار خشوع الذكر 🌿');
      } else if (step < 6) {
        setBreathingPhase('hold');
        setBreathingText('تأمل وطمأنينة القلب ✨');
      } else {
        setBreathingPhase('exhale');
        setBreathingText('زفير مع التسبيح والحمد 🤲');
      }
    };

    breathInterval = setInterval(runBreathingCycle, 1000);
    return () => clearInterval(breathInterval);
  }, [isRunning, enableBreathingGuide]);

  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Progress calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = targetSeconds > 0 ? ((targetSeconds - timeLeft) / targetSeconds) : 0;
  const strokeDashoffset = circumference - (progressPercentage * circumference);

  // Controls
  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(targetSeconds);
      setIsCompleted(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(targetSeconds);
    setIsCompleted(false);
  };

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    setTargetSeconds(seconds);
    setTimeLeft(seconds);
    setIsCompleted(false);
  };

  const handleAddMinute = () => {
    setTargetSeconds((prev) => prev + 60);
    setTimeLeft((prev) => prev + 60);
  };

  return (
    <div className="rounded-3xl bg-[#141C18] border border-[#2D4539] p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A352F] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F2C25] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold">
            <Timer className="w-3.5 h-3.5 text-[#A7C0A8]" />
            <span>مؤقت الذكر البصري والسكينة</span>
          </div>
          <h3 className="text-xl font-bold font-amiri text-[#E4E9E6]">
            تنظيم وقت التسبيح والخلوة الإيمانية
          </h3>
        </div>

        {/* Audio & Breathing Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnableBreathingGuide(!enableBreathingGuide)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              enableBreathingGuide
                ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354]'
                : 'bg-[#0F1713] text-[#8BA491] border-[#2A352F]'
            }`}
            title="تفعيل دليل التنفس والسكينة"
          >
            <Wind className="w-3.5 h-3.5 text-[#A7C0A8]" />
            <span>دليل التنفس</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#0F1713] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
            title="تفعيل/إيقاف تنبيه النهاية"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#A7C0A8]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Duration Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRESET_DURATIONS.map((preset) => {
          const isSelected = targetSeconds === preset.seconds;
          return (
            <button
              key={preset.seconds}
              onClick={() => handleSelectPreset(preset.seconds)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] shadow-md'
                  : 'bg-[#0F1713] text-[#8BA491] hover:text-[#E4E9E6] border-[#2A352F]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#A7C0A8]" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Visual Display & Ring */}
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        
        <div className="relative flex items-center justify-center">
          
          {/* Animated Glow Rings when running */}
          {isRunning && (
            <>
              <div 
                className={`absolute rounded-full border border-emerald-500/20 transition-all duration-1000 ${
                  breathingPhase === 'inhale' ? 'w-64 h-64 scale-110 opacity-60' : 'w-56 h-56 scale-95 opacity-20'
                }`} 
              />
              <div 
                className={`absolute rounded-full border border-emerald-400/10 transition-all duration-1000 ${
                  breathingPhase === 'inhale' ? 'w-72 h-72 scale-125 opacity-40' : 'w-52 h-52 scale-90 opacity-10'
                }`} 
              />
            </>
          )}

          {/* SVG Circular Progress Bar */}
          <svg className="w-56 h-56 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-[#1F2C25]"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Animated Progress Circle */}
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-[#A7C0A8] transition-all duration-1000 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Timer Information */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#E4E9E6] tracking-wider drop-shadow-md">
              {formatTime(timeLeft)}
            </span>

            {isCompleted ? (
              <span className="text-xs font-bold text-emerald-400 font-amiri mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                اكتمل الورد المبارك!
              </span>
            ) : isRunning ? (
              <span className="text-[11px] text-[#A7C0A8] font-tajawal mt-1 animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#A7C0A8]" />
                جاري الذكر والتسبيح...
              </span>
            ) : (
              <span className="text-[11px] text-[#8BA491] font-tajawal mt-1">
                جاهز لبدء الجلسة
              </span>
            )}

            {activeDhikrTitle && (
              <span className="text-[10px] text-[#8BA491] max-w-[120px] truncate mt-1">
                {activeDhikrTitle}
              </span>
            )}

          </div>

        </div>

        {/* Breathing Guide Prompt Box */}
        {enableBreathingGuide && isRunning && (
          <div className="px-5 py-2.5 rounded-2xl bg-[#0F1713] border border-[#2A352F] text-center max-w-sm transition-all animate-fadeIn">
            <p className="text-xs font-bold text-[#A7C0A8] font-amiri flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>{breathingText}</span>
            </p>
          </div>
        )}

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-all active:scale-95"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-2xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Play className="w-4 h-4 text-[#A7C0A8] fill-current" />
              <span>بدء المؤقت</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>إيقاف مؤقت</span>
            </button>
          )}

          <button
            onClick={handleAddMinute}
            className="p-3 rounded-2xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-all active:scale-95 flex items-center gap-1"
            title="إضافة دقيقة إضافية"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-bold">1 د</span>
          </button>

        </div>

      </div>

    </div>
  );
};
