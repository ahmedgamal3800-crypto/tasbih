import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  BookMarked,
  Award,
  Palette,
  Volume2,
  VolumeX,
  Timer,
  Hash,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  BellRing,
  Bell,
  Clock,
  Headphones,
  Play
} from 'lucide-react';
import { DhikrItem, UserSettings, UserProgress } from '../types';
import { INITIAL_ATHKAR } from '../data/athkar';
import { CardStudioModal, CardStudioData } from './CardStudioModal';
import { playTasbeehClickAudio, DAILY_PERIODIC_ATHKAR } from '../utils/audioAthkar';
import { VisualAthkarTimer } from './VisualAthkarTimer';
import { AthkarToastNotification } from './AthkarToastNotification';

interface AthkarSectionProps {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
}

export const AthkarSection: React.FC<AthkarSectionProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onUpdateProgress
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [athkarList, setAthkarList] = useState<DhikrItem[]>(INITIAL_ATHKAR);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Counter state per Dhikr card
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  const handleCardCountIncrement = (item: DhikrItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = itemCounts[item.id] || 0;
    const nextCount = current + 1;
    setItemCounts(prev => ({
      ...prev,
      [item.id]: nextCount
    }));

    if (soundEnabled) {
      playTasbeehClickAudio(nextCount >= item.targetCount ? 'completion' : 'click');
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    onUpdateProgress({
      completedAthkarCount: (progress.completedAthkarCount || 0) + 1
    });
  };

  const handleCardResetCount = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemCounts(prev => ({
      ...prev,
      [itemId]: 0
    }));
  };

  // Tool Modes: Tasbeeh, Timer
  const [activeToolMode, setActiveToolMode] = useState<'tasbeeh' | 'timer'>('tasbeeh');
  const [activeDhikr, setActiveDhikr] = useState<DhikrItem>(INITIAL_ATHKAR[0]);
  const [tasbeehCount, setTasbeehCount] = useState(0);

  // Periodic Reminder & Toast Notification State
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    text: string;
  } | null>(null);

  const [lastReminderTimestamp, setLastReminderTimestamp] = useState<number>(Date.now());
  const [nextReminderSecondsLeft, setNextReminderSecondsLeft] = useState<number>(
    (settings.periodicAudioIntervalMinutes || 60) * 60
  );

  // Timer countdown for periodic reminders
  useEffect(() => {
    if (settings.periodicAudioAthkar === false) return;

    const intervalMinutes = settings.periodicAudioIntervalMinutes || 60;
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastReminderTimestamp;
      const remainingSecs = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));
      setNextReminderSecondsLeft(remainingSecs);

      if (remainingSecs <= 0) {
        setLastReminderTimestamp(Date.now());
        triggerPeriodicDhikrToast();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.periodicAudioAthkar, settings.periodicAudioIntervalMinutes, lastReminderTimestamp]);

  const triggerPeriodicDhikrToast = (customTitle?: string, customText?: string) => {
    const text = customText || DAILY_PERIODIC_ATHKAR[Math.floor(Math.random() * DAILY_PERIODIC_ATHKAR.length)];
    const title = customTitle || 'تذكير الورد الدوري 🌿';
    setActiveToast({
      id: `toast-${Date.now()}`,
      title,
      text
    });
  };

  // Card Studio Modal State
  const [studioData, setStudioData] = useState<CardStudioData | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  // Expandable Card & Copy State
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [copiedDhikrId, setCopiedDhikrId] = useState<string | null>(null);

  const toggleExpandCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyText = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedDhikrId(id);
    setTimeout(() => setCopiedDhikrId(null), 2000);
  };

  const categories = [
    { id: 'morning', label: 'أذكار الصباح' },
    { id: 'evening', label: 'أذكار المساء' },
    { id: 'sleep', label: 'أذكار النوم' },
    { id: 'post_prayer', label: 'أذكار بعد الصلاة' },
    { id: 'daily_wirid', label: 'الورد والتسبيح' },
    { id: 'quranic_duas', label: 'أدعية قرآنية' },
    { id: 'prophetic_duas', label: 'أدعية نبوية' },
    { id: 'distress_duas', label: 'أدعية تفريج الكرب' },
    { id: 'ruqyah', label: 'الرقية الشرعية' },
    { id: 'custom_duas', label: 'أدعيتي الخاصة' }
  ];

  // Handle Tasbeeh Click
  const handleTasbeehClick = () => {
    const nextCount = tasbeehCount + 1;
    setTasbeehCount(nextCount);

    // Play click sound or completion chime
    if (soundEnabled) {
      playTasbeehClickAudio(nextCount === activeDhikr.targetCount ? 'completion' : 'click');
    }

    // Trigger vibration on devices supporting it
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Check if target reached
    if (nextCount === activeDhikr.targetCount) {
      // Update global completed counter
      const currentCompleted = progress.completedAthkarCount || 0;
      onUpdateProgress({
        completedAthkarCount: currentCompleted + activeDhikr.targetCount
      });
    }
  };

  const resetTasbeeh = () => {
    setTasbeehCount(0);
  };

  const handleOpenStudio = (text: string, source: string) => {
    setStudioData({ text, source });
    setIsStudioOpen(true);
  };

  // Add Custom Du'a Modal
  const [showAddDuaModal, setShowAddDuaModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');

  const handleAddCustomDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customText) return;

    const newDua = {
      id: `dua-${Date.now()}`,
      title: customTitle,
      text: customText,
      dateAdded: new Date().toISOString()
    };

    const updatedDuas = [...(progress.customDuas || []), newDua];
    onUpdateProgress({ customDuas: updatedDuas });
    setCustomTitle('');
    setCustomText('');
    setShowAddDuaModal(false);
  };

  const filteredAthkar = athkarList.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6 animate-fadeIn relative">
      
      {/* Floating Active Toast Notification */}
      {activeToast && (
        <AthkarToastNotification
          id={activeToast.id}
          title={activeToast.title}
          text={activeToast.text}
          onClose={() => setActiveToast(null)}
          onQuickCount={() => {
            const current = progress.completedAthkarCount || 0;
            onUpdateProgress({ completedAthkarCount: current + 1 });
          }}
        />
      )}

      {/* Mode Switcher & Interactive Tool Banner */}
      <div className="flex items-center justify-between bg-[#141C18] p-1.5 rounded-2xl border border-[#2D4539] gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveToolMode('tasbeeh')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeToolMode === 'tasbeeh'
              ? 'bg-[#2D4539] text-[#E4E9E6] shadow-md border border-[#4A6354]'
              : 'text-[#8BA491] hover:text-[#E4E9E6]'
          }`}
        >
          <Hash className="w-4 h-4 text-[#A7C0A8]" />
          <span>المسبحة الرقمية</span>
        </button>

        <button
          onClick={() => setActiveToolMode('timer')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeToolMode === 'timer'
              ? 'bg-[#2D4539] text-[#E4E9E6] shadow-md border border-[#4A6354]'
              : 'text-[#8BA491] hover:text-[#E4E9E6]'
          }`}
        >
          <Timer className="w-4 h-4 text-[#A7C0A8]" />
          <span>المؤقت البصري</span>
        </button>
      </div>

      {activeToolMode === 'timer' ? (
        <VisualAthkarTimer
          activeDhikrTitle={activeDhikr.title}
          onSessionComplete={(mins) => {
            onUpdateProgress({
              totalAthkarRead: (progress.totalAthkarRead || 0) + (mins * 10)
            });
          }}
        />
      ) : (
        /* Interactive Electronic Tasbeeh Banner (المسبحة الرقمية التفاعلية) */
        <div className="relative overflow-hidden rounded-3xl bg-[#1A2520] p-6 sm:p-8 border border-[#2D4539] shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2D4539]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Active Dhikr Details */}
            <div className="space-y-3 text-center md:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141C18] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
                <span>المسبحة الرقمية والورد المستمر</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-amiri text-[#E4E9E6]">
                {activeDhikr.title}
              </h3>

              <p className="text-lg font-amiri text-[#E4E9E6] leading-relaxed bg-[#141C18] p-4 rounded-2xl border border-[#2A352F]">
                "{activeDhikr.text}"
              </p>

              {activeDhikr.reward && (
                <p className="text-xs text-[#8BA491] font-tajawal flex items-center justify-center md:justify-start gap-1.5">
                  <Award className="w-4 h-4 text-[#A7C0A8] shrink-0" />
                  <span>{activeDhikr.reward}</span>
                </p>
              )}

              <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                <button
                  onClick={() => handleOpenStudio(activeDhikr.text, activeDhikr.title)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-semibold transition-all"
                >
                  <Palette className="w-4 h-4 text-[#A7C0A8]" />
                  <span>تصميم بطاقة</span>
                </button>

                <button
                  onClick={() => setActiveToolMode('timer')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141C18] hover:bg-[#1A2520] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold transition-all"
                >
                  <Timer className="w-4 h-4 text-[#A7C0A8]" />
                  <span>بدء جلسة مؤقت</span>
                </button>
              </div>
            </div>

            {/* Interactive Counter Ring Button */}
            <div className="flex flex-col items-center justify-center space-y-4">
              
              <button
                onClick={handleTasbeehClick}
                className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#2D4539] p-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer border-4 border-[#4A6354] group"
              >
                <div className="w-full h-full rounded-full bg-[#0F1713] flex flex-col items-center justify-center p-4 border border-[#2D4539]">
                  <span className="text-xs text-[#8BA491] group-hover:text-[#A7C0A8] font-cairo">
                    اضغط للتسبيح
                  </span>
                  
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#A7C0A8] my-1 drop-shadow">
                    {tasbeehCount}
                  </span>

                  <span className="text-[11px] text-[#8BA491]">
                    الهدف: {activeDhikr.targetCount}
                  </span>
                </div>
              </button>

              {/* Counter Controls */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={resetTasbeeh}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#1A2520] text-[#8BA491] border border-[#2A352F] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الصفحة</span>
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#1A2520] text-[#8BA491] border border-[#2A352F] transition-colors"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#A7C0A8]" />
                      <span>صوت النقرات مفعل</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#8BA491]" />
                      <span>صامت</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Category Tabs */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A352F] pb-3">
          
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 py-1 w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                  selectedCategory === cat.id
                    ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] shadow-md ring-1 ring-[#4A6354]'
                    : 'bg-[#141C18] text-[#8BA491] hover:bg-[#1A2520] border-[#2A352F]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {selectedCategory === 'custom_duas' && (
            <button
              onClick={() => setShowAddDuaModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-semibold shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دعاء خاص</span>
            </button>
          )}

        </div>

        {/* Manual Notification Timing Adjustment Bar */}
        <div className="p-3.5 rounded-2xl bg-[#141C18] border border-[#2D4539] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#A7C0A8] font-bold">
            <Clock className="w-4 h-4 text-[#A7C0A8]" />
            <span>تحديد وقت تنبيهات الأذكار والورد المفضل لك:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Morning */}
            <div className="flex items-center gap-1.5 bg-[#0F1713] px-2.5 py-1 rounded-xl border border-[#2A352F]">
              <span className="text-[#8BA491] text-[11px]">الصباح:</span>
              <input
                type="time"
                value={settings.morningAthkarTime || '06:30'}
                onChange={(e) => onUpdateSettings({ morningAthkarTime: e.target.value })}
                className="bg-transparent text-[#A7C0A8] font-mono font-bold text-xs focus:outline-none"
              />
            </div>

            {/* Evening */}
            <div className="flex items-center gap-1.5 bg-[#0F1713] px-2.5 py-1 rounded-xl border border-[#2A352F]">
              <span className="text-[#8BA491] text-[11px]">المساء:</span>
              <input
                type="time"
                value={settings.eveningAthkarTime || '17:00'}
                onChange={(e) => onUpdateSettings({ eveningAthkarTime: e.target.value })}
                className="bg-transparent text-[#A7C0A8] font-mono font-bold text-xs focus:outline-none"
              />
            </div>

            {/* Wird */}
            <div className="flex items-center gap-1.5 bg-[#0F1713] px-2.5 py-1 rounded-xl border border-[#2A352F]">
              <span className="text-[#8BA491] text-[11px]">الورد:</span>
              <input
                type="time"
                value={settings.wirdTime || '21:00'}
                onChange={(e) => onUpdateSettings({ wirdTime: e.target.value })}
                className="bg-transparent text-[#A7C0A8] font-mono font-bold text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Athkar Cards Grid */}
        {selectedCategory !== 'custom_duas' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAthkar.map((item) => {
              const isSelected = activeDhikr.id === item.id;
              const isExpanded = !!expandedCardIds[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#1D2A24] border-[#4A6354] shadow-lg ring-1 ring-[#4A6354]/40'
                      : 'bg-[#141C18] hover:bg-[#18231E] border-[#2A352F]'
                  }`}
                >
                  {/* Active Indicator Top Bar */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-[#A7C0A8] to-emerald-600" />
                  )}

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 
                        onClick={() => {
                          setActiveDhikr(item);
                          setTasbeehCount(0);
                        }}
                        className="text-base font-bold font-amiri text-[#E4E9E6] flex items-center gap-2 cursor-pointer hover:text-[#A7C0A8] transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-[#A7C0A8] shrink-0" />
                        <span>{item.title}</span>
                      </h4>

                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
                          نشط بالمسبحة
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-[#0F1713] border border-[#2A352F] text-[#A7C0A8] font-bold text-xs font-mono">
                        العدد: {item.targetCount}
                      </span>

                      <button
                        onClick={(e) => toggleExpandCard(item.id, e)}
                        className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1 text-xs font-semibold ${
                          isExpanded
                            ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354]'
                            : 'bg-[#0F1713] text-[#8BA491] hover:text-[#E4E9E6] border-[#2A352F]'
                        }`}
                        title={isExpanded ? 'طي الشرح والفضل' : 'توسيع عرض الشرح والفضل'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Dhikr Arabic Text */}
                  <div 
                    onClick={() => {
                      setActiveDhikr(item);
                      setTasbeehCount(0);
                    }}
                    className="cursor-pointer group"
                  >
                    <p className="text-sm sm:text-base font-amiri text-[#E4E9E6] leading-relaxed bg-[#0F1713]/60 p-3.5 rounded-xl border border-[#2A352F]/70 group-hover:border-[#3D5A4A] transition-colors">
                      "{item.text}"
                    </p>
                  </div>

                  {/* Interactive Counter Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2A352F]/70">
                    <button
                      onClick={(e) => handleCardCountIncrement(item, e)}
                      className={`flex-1 py-2.5 px-4 rounded-xl border font-bold text-sm flex items-center justify-between transition-all active:scale-95 shadow-md ${
                        (itemCounts[item.id] || 0) >= item.targetCount
                          ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                          : 'bg-[#2D4539] hover:bg-[#3D5A4A] border-[#4A6354] text-[#E4E9E6]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#A7C0A8]" />
                        <span>{(itemCounts[item.id] || 0) >= item.targetCount ? 'تم القراءة ✓' : 'اضغط للعد'}</span>
                      </div>
                      <span className="font-mono bg-[#0F1713]/80 px-2.5 py-0.5 rounded-lg border border-[#2A352F] text-xs">
                        {itemCounts[item.id] || 0} / {item.targetCount}
                      </span>
                    </button>

                    {(itemCounts[item.id] || 0) > 0 && (
                      <button
                        onClick={(e) => handleCardResetCount(item.id, e)}
                        className="p-2.5 rounded-xl bg-[#0F1713] hover:bg-rose-950/40 border border-[#2A352F] hover:border-rose-800 text-[#8BA491] hover:text-rose-300 transition-colors"
                        title="إعادة ضبط عداد هذا الذكر"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Expandable Explanation & Benefit Details */}
                  {isExpanded ? (
                    <div className="space-y-3 pt-2 border-t border-[#2A352F] animate-fadeIn">
                      
                      {/* Reward & Explanation Box */}
                      {item.reward && (
                        <div className="p-3.5 rounded-xl bg-[#1A2620] border border-[#2D4539] space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#A7C0A8] font-tajawal">
                            <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
                            <span>فضل وشرح هذا الذكر:</span>
                          </div>
                          <p className="text-xs text-[#C2D1C4] font-tajawal leading-relaxed">
                            {item.reward}
                          </p>
                        </div>
                      )}

                      {/* Source Reference */}
                      {item.reference && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8BA491] italic bg-[#0F1713] px-3 py-1.5 rounded-lg border border-[#2A352F] w-fit">
                          <Info className="w-3 h-3 text-[#A7C0A8]" />
                          <span>المصدر: {item.reference}</span>
                        </div>
                      )}

                      {/* Card Actions Bar inside Expanded View */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDhikr(item);
                            setTasbeehCount(0);
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-900/60 border-emerald-700 text-emerald-200'
                              : 'bg-[#2D4539] hover:bg-[#3D5A4A] border-[#4A6354] text-[#E4E9E6]'
                          }`}
                        >
                          <Hash className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'الذكر النشط بالمسبحة' : 'تحديد للمسبحة'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudio(item.text, item.title);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="تصميم بطاقة داعية"
                        >
                          <Palette className="w-3.5 h-3.5 text-[#A7C0A8]" />
                          <span>بطاقة</span>
                        </button>

                        <button
                          onClick={(e) => handleCopyText(item.text, item.id, e)}
                          className="py-1.5 px-3 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="نسخ النص"
                        >
                          {copiedDhikrId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* Collapsed Toggle Button Prompt */
                    <div className="pt-1 flex items-center justify-between border-t border-[#2A352F]/50">
                      <button
                        onClick={(e) => toggleExpandCard(item.id, e)}
                        className="text-xs text-[#8BA491] hover:text-[#A7C0A8] font-tajawal flex items-center gap-1.5 transition-colors py-0.5"
                      >
                        <Sparkles className="w-3 h-3 text-[#A7C0A8]" />
                        <span>عرض فضل الذكر والشرح</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudio(item.text, item.title);
                        }}
                        className="p-1 rounded-lg hover:bg-[#1F2C25] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
                        title="تصميم بطاقة"
                      >
                        <Palette className="w-3.5 h-3.5 text-[#A7C0A8]" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* Custom Du'as list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(progress.customDuas || []).map((dua) => (
              <div key={dua.id} className="p-5 rounded-2xl bg-[#141C18] border border-[#2A352F] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold font-amiri text-[#A7C0A8]">
                    {dua.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenStudio(dua.text, dua.title)}
                      className="p-1.5 rounded-lg bg-[#0F1713] hover:bg-[#1A2520] text-[#8BA491] hover:text-[#A7C0A8] transition-colors"
                      title="تصميم بطاقة"
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-amiri text-[#E4E9E6] leading-relaxed">
                  "{dua.text}"
                </p>
                <div className="text-[10px] text-[#8BA491] pt-2 border-t border-[#2A352F]">
                  تاريخ الإضافة: {new Date(dua.dateAdded).toLocaleDateString('ar-EG')}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Custom Du'a Modal */}
      {showAddDuaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-amiri text-[#A7C0A8]">
              إضافة دعاء خاص لوردك اليومي
            </h3>

            <form onSubmit={handleAddCustomDua} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8BA491] mb-1 font-semibold">عنوان الدعاء:</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="مثال: دعاء التيسير وتيسير الرزق"
                  className="w-full p-2.5 bg-[#0F1713] text-[#E4E9E6] rounded-xl border border-[#2A352F] focus:outline-none focus:border-[#4A6354]"
                />
              </div>

              <div>
                <label className="block text-[#8BA491] mb-1 font-semibold">نص الدعاء:</label>
                <textarea
                  required
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="اكتب نص الدعاء الذي تحب تكراره دائماً..."
                  className="w-full p-2.5 bg-[#0F1713] text-[#E4E9E6] rounded-xl border border-[#2A352F] focus:outline-none focus:border-[#4A6354]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDuaModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6] font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-semibold shadow-md"
                >
                  حفظ الدعاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Studio Modal */}
      {isStudioOpen && (
        <CardStudioModal
          initialData={studioData}
          onClose={() => setIsStudioOpen(false)}
        />
      )}

    </div>
  );
};
