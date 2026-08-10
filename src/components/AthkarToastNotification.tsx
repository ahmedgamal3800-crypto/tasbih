import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  X, 
  Volume2, 
  CheckCircle2, 
  Plus, 
  Copy, 
  Check, 
  BellRing,
  Heart
} from 'lucide-react';
import { speakArabicText, stopArabicSpeech } from '../utils/audioAthkar';
import { playGentleAudioTone } from '../utils/notifications';

interface AthkarToastNotificationProps {
  id: string;
  title: string;
  text: string;
  categoryLabel?: string;
  onClose: () => void;
  onQuickCount?: () => void;
  soundEnabled?: boolean;
}

export const AthkarToastNotification: React.FC<AthkarToastNotificationProps> = ({
  title,
  text,
  categoryLabel = 'تذكير الورد اليومي',
  onClose,
  onQuickCount,
  soundEnabled = true
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [countedTimes, setCountedTimes] = useState(0);

  // Play gentle chime on mount if sound enabled
  useEffect(() => {
    if (soundEnabled) {
      playGentleAudioTone();
    }
  }, [soundEnabled]);

  // Auto dismiss after 12 seconds if not interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 12000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingVoice) {
      stopArabicSpeech();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      speakArabicText(
        text,
        () => setIsPlayingVoice(false),
        () => setIsPlayingVoice(false)
      );
    }
  };

  const handleQuickTasbeeh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCountedTimes((prev) => prev + 1);
    if (onQuickCount) {
      onQuickCount();
    }
    // Subtle vibration on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slideDown">
      <div className="bg-[#141C18]/95 backdrop-blur-xl border-2 border-[#4A6354] rounded-2xl shadow-2xl p-4 text-right space-y-3 relative overflow-hidden ring-1 ring-emerald-500/30">
        
        {/* Subtle Top Accent Bar */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-[#A7C0A8] to-emerald-600 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#2A352F] pb-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#2D4539] text-[#A7C0A8] border border-[#4A6354]">
              <BellRing className="w-4 h-4 text-[#A7C0A8] animate-bounce-short" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#8BA491] block">
                {categoryLabel}
              </span>
              <h4 className="text-xs font-bold text-[#E4E9E6] font-amiri">
                {title}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#0F1713] hover:bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6] border border-[#2A352F] transition-colors"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dhikr Content Body */}
        <div className="bg-[#0F1713] p-3 rounded-xl border border-[#2A352F]">
          <p className="text-sm font-amiri text-[#E4E9E6] leading-relaxed">
            "{text}"
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleQuickTasbeeh}
            className="flex-1 py-1.5 px-3 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#A7C0A8]" />
            <span>تسبيح سريع ({countedTimes})</span>
          </button>

          <button
            onClick={handleSpeak}
            className={`p-2 rounded-xl border transition-colors ${
              isPlayingVoice
                ? 'bg-emerald-900/80 border-emerald-600 text-emerald-200'
                : 'bg-[#0F1713] hover:bg-[#1A2520] border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6]'
            }`}
            title="استماع للذكر بصوت فصيح"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
            title="نسخ الذكر"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Timer Auto-Dismiss Indicator Bar */}
        <div className="w-full bg-[#1F2C25] h-1 rounded-full overflow-hidden mt-1">
          <div className="bg-[#A7C0A8] h-full w-full animate-timer-shrink" />
        </div>

      </div>
    </div>
  );
};
