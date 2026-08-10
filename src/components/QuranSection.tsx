import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Heart, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Search, 
  BookmarkCheck,
  Info,
  ChevronLeft,
  Tag,
  Palette,
  Compass,
  Layers,
  Loader2,
  Copy,
  Check,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Award,
  Flame,
  ChevronRight
} from 'lucide-react';
import { QuranVerse, UserSettings, UserProgress } from '../types';
import { QURAN_VERSES, SURAH_LIST, SurahMeta } from '../data/quran';
import { CardStudioModal, CardStudioData } from './CardStudioModal';
import { fetchSurahVerses, SurahVerse } from '../lib/quranApi';

interface QuranSectionProps {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onOpenShareModal: (verse: QuranVerse) => void;
  onOpenGeminiReflection?: (verse: QuranVerse) => void;
}

export const QuranSection: React.FC<QuranSectionProps> = ({
  settings,
  progress,
  onUpdateProgress,
  onOpenShareModal,
  onOpenGeminiReflection
}) => {
  const [activeTab, setActiveTab] = useState<'surah_reader' | 'selected_verses'>('surah_reader');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<QuranVerse | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Card Studio Modal state
  const [studioData, setStudioData] = useState<CardStudioData | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  // Selected Surah View for full Quran reading
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta>(SURAH_LIST[0]); // Default Al-Fatihah
  const [surahVerses, setSurahVerses] = useState<SurahVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);
  const [surahFilterQuery, setSurahFilterQuery] = useState<string>('');
  const [copiedVerseIndex, setCopiedVerseIndex] = useState<number | null>(null);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  // Khatm Quran Estimator State (عداد وحاسبة ختم القرآن الكريم)
  const [khatmCurrentPage, setKhatmCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('quran_khatm_current_page');
    return saved ? Math.min(604, Math.max(1, parseInt(saved, 10))) : 1;
  });

  const [khatmDailyPace, setKhatmDailyPace] = useState<number>(() => {
    const saved = localStorage.getItem('quran_khatm_daily_pace');
    return saved ? Math.max(1, parseInt(saved, 10)) : (settings.dailyGoalQuranPages || 20);
  });

  const [isKhatmWidgetExpanded, setIsKhatmWidgetExpanded] = useState<boolean>(true);

  // Sync Khatm state to LocalStorage
  useEffect(() => {
    localStorage.setItem('quran_khatm_current_page', khatmCurrentPage.toString());
  }, [khatmCurrentPage]);

  useEffect(() => {
    localStorage.setItem('quran_khatm_daily_pace', khatmDailyPace.toString());
  }, [khatmDailyPace]);

  // Khatm calculations
  const totalQuranPages = 604;
  const khatmPagesRemaining = Math.max(0, totalQuranPages - khatmCurrentPage);
  const khatmProgressPercent = Math.min(100, Math.round((khatmCurrentPage / totalQuranPages) * 100));
  const khatmCurrentJuz = Math.min(30, Math.ceil(khatmCurrentPage / 20.13) || 1);
  const khatmDaysRemaining = khatmPagesRemaining > 0 ? Math.ceil(khatmPagesRemaining / Math.max(1, khatmDailyPace)) : 0;

  const getKhatmCompletionDateStr = (days: number) => {
    if (days <= 0) return 'تمت الختمة المباركة بفضل الله!';
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const pagesPerPrayer = (khatmDailyPace / 5).toFixed(1);

  // Verse of the Day
  const verseOfTheDay = QURAN_VERSES[0];

  // Fetch surah verses whenever selectedSurah changes
  useEffect(() => {
    let isMounted = true;
    const loadVerses = async () => {
      setIsLoadingVerses(true);
      const verses = await fetchSurahVerses(selectedSurah.id);
      if (isMounted) {
        setSurahVerses(verses);
        setIsLoadingVerses(false);
      }
    };
    loadVerses();
    return () => { isMounted = false; };
  }, [selectedSurah]);

  const handleToggleFavorite = (verseId: string) => {
    const favorites = progress.favoriteVerseIds || [];
    const newFavorites = favorites.includes(verseId)
      ? favorites.filter(id => id !== verseId)
      : [...favorites, verseId];
    onUpdateProgress({ favoriteVerseIds: newFavorites });
  };

  const handlePlayAudio = (audioUrl?: string, idKey?: string) => {
    if (!audioUrl) return;

    if (playingAudioId === idKey) {
      audioElement?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setAudioElement(audio);
    setPlayingAudioId(idKey || audioUrl);
    audio.onended = () => setPlayingAudioId(null);
  };

  const handleOpenStudio = (text: string, source: string) => {
    setStudioData({ text, source });
    setIsStudioOpen(true);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedVerseIndex(index);
    setTimeout(() => setCopiedVerseIndex(null), 2000);
  };

  // Filter verses in selected_verses tab
  const filteredVerses = QURAN_VERSES.filter(verse => {
    const matchesCategory = selectedCategory === 'all' || verse.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      verse.arabicText.includes(searchQuery) || 
      verse.surahName.includes(searchQuery) ||
      verse.tafsirShort.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Filter 114 Surahs directory
  const filteredSurahs = SURAH_LIST.filter(surah => 
    surah.nameAr.includes(surahSearchQuery) || 
    surah.nameEn.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
    surah.id.toString() === surahSearchQuery.trim()
  );

  // Filter active surah verses by search term
  const activeDisplayVerses = surahVerses.filter(v => 
    surahFilterQuery === '' || v.text.includes(surahFilterQuery) || v.numberInSurah.toString() === surahFilterQuery.trim()
  );

  const categories = [
    { id: 'all', label: 'الجميع' },
    { id: 'hope', label: 'الأمل والفرج' },
    { id: 'mercy', label: 'الرحمة والمغفرة' },
    { id: 'peace', label: 'السكينة والطمأنينة' },
    { id: 'faith', label: 'التوحيد والإيمان' },
    { id: 'patience', label: 'الصبر والاحتساب' },
    { id: 'guidance', label: 'الهدى والتقوى' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Featured Verse Card (آية اليوم للتفكر والتدبر) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1A2520] p-6 sm:p-8 border border-[#2D4539] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2D4539]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 text-center">
          
          <div className="flex items-center justify-between text-xs text-[#A7C0A8]">
            <span className="px-3 py-1 rounded-full bg-[#141C18] border border-[#2A352F] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
              آية اليوم لراحة القلب
            </span>

            <span className="text-[#8BA491] font-cairo">
              سورة {verseOfTheDay.surahName} - الآية {verseOfTheDay.verseNumber}
            </span>
          </div>

          {/* Arabic Calligraphy Verse Text */}
          <div className="py-4 px-2">
            <p className="text-2xl sm:text-3xl lg:text-4xl leading-relaxed sm:leading-loose font-amiri text-[#E4E9E6] drop-shadow-sm font-semibold">
              ﴿ {verseOfTheDay.arabicText} ﴾
            </p>
          </div>

          <p className="text-sm text-[#8BA491] max-w-2xl mx-auto leading-relaxed font-tajawal">
            "{verseOfTheDay.tafsirShort}"
          </p>

          {/* Interactive Card Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            
            <button
              onClick={() => handlePlayAudio(verseOfTheDay.audioUrl, verseOfTheDay.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] text-[#E4E9E6] border border-[#4A6354] font-medium text-xs shadow-md transition-all"
            >
              {playingAudioId === verseOfTheDay.id ? (
                <>
                  <VolumeX className="w-4 h-4 text-[#A7C0A8]" />
                  <span>إيقاف التلاوة</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#A7C0A8]" />
                  <span>استماع للتلاوة العذبة</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenStudio(verseOfTheDay.arabicText, `سورة ${verseOfTheDay.surahName} - آية ${verseOfTheDay.verseNumber}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] text-[#E4E9E6] border border-[#4A6354] font-medium text-xs transition-all shadow-sm"
            >
              <Palette className="w-4 h-4 text-[#A7C0A8]" />
              <span>تصميم بطاقة دعوية</span>
            </button>

            <button
              onClick={() => onOpenShareModal(verseOfTheDay)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141C18] hover:bg-[#1A2520] text-[#A7C0A8] border border-[#2A352F] font-medium text-xs transition-all"
            >
              <Share2 className="w-4 h-4 text-[#A7C0A8]" />
              <span>مشاركة سريعة</span>
            </button>

            <button
              onClick={() => handleToggleFavorite(verseOfTheDay.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-xs transition-all ${
                progress.favoriteVerseIds?.includes(verseOfTheDay.id)
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#141C18] text-[#8BA491] border-[#2A352F] hover:text-[#E4E9E6]'
              }`}
            >
              <Heart className={`w-4 h-4 ${progress.favoriteVerseIds?.includes(verseOfTheDay.id) ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>مفضلة الآيات</span>
            </button>

            {onOpenGeminiReflection && (
              <button
                onClick={() => onOpenGeminiReflection(verseOfTheDay)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] text-[#E4E9E6] border border-[#4A6354] font-medium text-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#A7C0A8]" />
                <span>تدبر بالذكاء الاصطناعي</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Khatm Quran Estimator & Counter Card (عداد وحاسبة ختم القرآن الكريم) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141C18] p-5 sm:p-7 border border-[#2D4539] shadow-xl space-y-6">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A352F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D4539] border border-[#4A6354] flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-amiri text-[#E4E9E6]">
                  عداد وحاسبة ختم القرآن الكريم
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  تحديث تلقائي
                </span>
              </div>
              <p className="text-xs text-[#8BA491] font-tajawal mt-0.5">
                حساب وتحديد المدة الزمنية وتاريخ الختم المتوقع بناءً على معدل قراءتك اليومي
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsKhatmWidgetExpanded(!isKhatmWidgetExpanded)}
            className="px-3 py-1.5 rounded-xl bg-[#1A2520] hover:bg-[#202E28] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold transition-all shrink-0"
          >
            {isKhatmWidgetExpanded ? 'طي العداد' : 'توسيع العداد'}
          </button>
        </div>

        {/* Expanded Content */}
        {isKhatmWidgetExpanded && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top 4 Key Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Card 1: Days Remaining */}
              <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] relative overflow-hidden space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#A7C0A8]">
                  <span className="font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    المدة المتبقية
                  </span>
                  <span className="text-[10px] text-[#8BA491]">تقديري</span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl sm:text-3xl font-black font-cairo text-amber-300">
                    {khatmDaysRemaining}
                  </span>
                  <span className="text-xs text-[#E4E9E6] font-medium">يوماً</span>
                </div>
                <p className="text-[11px] text-[#8BA491] truncate">
                  متبقي {khatmPagesRemaining} صفحة ({ (khatmPagesRemaining / 20.13).toFixed(1) } جزء)
                </p>
              </div>

              {/* Card 2: Estimated Completion Date */}
              <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] relative overflow-hidden space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#A7C0A8]">
                  <span className="font-semibold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    تاريخ الختم المتوقع
                  </span>
                </div>
                <div className="pt-1">
                  <p className="text-xs sm:text-sm font-bold text-[#E4E9E6] leading-snug">
                    {getKhatmCompletionDateStr(khatmDaysRemaining)}
                  </p>
                </div>
                <p className="text-[11px] text-[#8BA491]">
                  معدل {khatmDailyPace} صفحة/يومياً
                </p>
              </div>

              {/* Card 3: Completion Percentage */}
              <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] relative overflow-hidden space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#A7C0A8]">
                  <span className="font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    نسبة الإنجاز
                  </span>
                  <span className="text-xs font-bold text-cyan-300 font-cairo">{khatmProgressPercent}%</span>
                </div>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-xl sm:text-2xl font-bold font-cairo text-[#E4E9E6]">
                    الصفحة {khatmCurrentPage}
                  </span>
                  <span className="text-xs text-[#8BA491]">/ 604</span>
                </div>
                <p className="text-[11px] text-[#8BA491]">
                  الجزء الحالي: {khatmCurrentJuz} من 30
                </p>
              </div>

              {/* Card 4: Required Pace per Prayer */}
              <div className="p-4 rounded-2xl bg-[#1A2520] border border-[#2D4539] relative overflow-hidden space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#A7C0A8]">
                  <span className="font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    بعد كل صلاة مفروضة
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl sm:text-3xl font-black font-cairo text-rose-300">
                    {pagesPerPrayer}
                  </span>
                  <span className="text-xs text-[#E4E9E6] font-medium">صفحات</span>
                </div>
                <p className="text-[11px] text-[#8BA491]">
                  ≈ {Math.round(khatmDailyPace * 1.5)} دقيقة قراءة يومياً
                </p>
              </div>

            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2 bg-[#1A2520] p-4 rounded-2xl border border-[#2D4539]">
              <div className="flex items-center justify-between text-xs text-[#E4E9E6] font-medium">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  تقدم الختمة الحالية: <strong className="text-amber-300">{khatmCurrentPage} صفحة</strong> من 604
                </span>
                <span className="text-[#A7C0A8] font-bold font-cairo">{khatmProgressPercent}% مُكتمل</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0F1713] overflow-hidden p-0.5 border border-[#2A352F]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${khatmProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Interactive Section 1: Update Reading Position */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1A2520] border border-[#2D4539] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#2A352F] pb-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#E4E9E6] font-amiri flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    تحديث موضع القراءة الحالي (الصفحة الحالية من المصحف):
                  </h4>
                  <p className="text-[11px] text-[#8BA491]">
                    انقر على الأزرار السريعة أو استخدم الشريط لتحديث الصفحة التي وصلت إليها
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#141C18] px-3 py-1.5 rounded-xl border border-[#2A352F]">
                  <span className="text-xs text-[#8BA491]">الصفحة:</span>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={khatmCurrentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setKhatmCurrentPage(Math.min(604, Math.max(1, val)));
                    }}
                    className="w-16 bg-[#0F1713] text-amber-300 font-bold text-center py-0.5 text-xs rounded-lg border border-[#2A352F] focus:outline-none focus:border-[#4A6354]"
                  />
                  <span className="text-xs text-[#8BA491]">من 604</span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={1}
                  max={604}
                  value={khatmCurrentPage}
                  onChange={(e) => setKhatmCurrentPage(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#0F1713] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#8BA491]">
                  <span>الفاتحة (صفحة 1)</span>
                  <span>الجزء 15 (صفحة 300)</span>
                  <span>الناس (صفحة 604)</span>
                </div>
              </div>

              {/* Quick Jump Adjustment Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setKhatmCurrentPage(p => Math.max(1, p - 20))}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#202E28] border border-[#2A352F] text-[#A7C0A8] text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Minus className="w-3 h-3" />
                  <span>-20 صفحة (جزء)</span>
                </button>

                <button
                  onClick={() => setKhatmCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#202E28] border border-[#2A352F] text-[#A7C0A8] text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Minus className="w-3 h-3" />
                  <span>-1 صفحة</span>
                </button>

                <button
                  onClick={() => setKhatmCurrentPage(p => Math.min(604, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>+1 صفحة (تم القراءة)</span>
                </button>

                <button
                  onClick={() => setKhatmCurrentPage(p => Math.min(604, p + 5))}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#202E28] border border-[#2A352F] text-[#A7C0A8] text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+5 صفحات</span>
                </button>

                <button
                  onClick={() => setKhatmCurrentPage(p => Math.min(604, p + 20))}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C18] hover:bg-[#202E28] border border-[#2A352F] text-[#A7C0A8] text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+20 صفحة (جزء كامل)</span>
                </button>

                <button
                  onClick={() => setKhatmCurrentPage(1)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#141C18] hover:bg-rose-950/40 border border-[#2A352F] hover:border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1 mr-auto transition-all"
                  title="بدء ختمة جديدة من البداية"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>بدء ختمة جديدة</span>
                </button>
              </div>
            </div>

            {/* Interactive Section 2: Set Daily Reading Pace */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1A2520] border border-[#2D4539] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#2A352F] pb-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#E4E9E6] font-amiri flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    تحديد معدل القراءة اليومي المستهدف (وردك اليومي):
                  </h4>
                  <p className="text-[11px] text-[#8BA491]">
                    اختر أحد الخيارات الجاهزة أو ادخل عدد الصفحات التي ترغب بقراءتها يومياً
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#141C18] px-3 py-1.5 rounded-xl border border-[#2A352F]">
                  <span className="text-xs text-[#8BA491]">معدلك:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={khatmDailyPace}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) setKhatmDailyPace(val);
                    }}
                    className="w-14 bg-[#0F1713] text-emerald-300 font-bold text-center py-0.5 text-xs rounded-lg border border-[#2A352F] focus:outline-none focus:border-[#4A6354]"
                  />
                  <span className="text-xs text-[#8BA491]">صفحة/يوم</span>
                </div>
              </div>

              {/* Goal Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setKhatmDailyPace(20)}
                  className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                    khatmDailyPace === 20
                      ? 'bg-[#2D4539] border-[#4A6354] shadow-md text-[#E4E9E6]'
                      : 'bg-[#141C18] hover:bg-[#202E28] border-[#2A352F] text-[#8BA491]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>🌙 ختمة شهرية</span>
                    <span>30 يوماً</span>
                  </div>
                  <p className="text-[11px] text-[#A7C0A8]">20 صفحة = جزء كامل/يوم</p>
                  <p className="text-[10px] text-[#8BA491]">4 صفحات بعد كل صلاة</p>
                </button>

                <button
                  onClick={() => setKhatmDailyPace(10)}
                  className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                    khatmDailyPace === 10
                      ? 'bg-[#2D4539] border-[#4A6354] shadow-md text-[#E4E9E6]'
                      : 'bg-[#141C18] hover:bg-[#202E28] border-[#2A352F] text-[#8BA491]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>📖 ختمة شهرين</span>
                    <span>60 يوماً</span>
                  </div>
                  <p className="text-[11px] text-[#A7C0A8]">10 صفحات = 1/2 جزء/يوم</p>
                  <p className="text-[10px] text-[#8BA491]">صفحتان بعد كل صلاة</p>
                </button>

                <button
                  onClick={() => setKhatmDailyPace(40)}
                  className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                    khatmDailyPace === 40
                      ? 'bg-[#2D4539] border-[#4A6354] shadow-md text-[#E4E9E6]'
                      : 'bg-[#141C18] hover:bg-[#202E28] border-[#2A352F] text-[#8BA491]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>⚡ ختمة 15 يوماً</span>
                    <span>15 يوماً</span>
                  </div>
                  <p className="text-[11px] text-[#A7C0A8]">40 صفحة = جزءان/يوم</p>
                  <p className="text-[10px] text-[#8BA491]">8 صفحات بعد كل صلاة</p>
                </button>

                <button
                  onClick={() => setKhatmDailyPace(5)}
                  className={`p-3 rounded-xl border text-right transition-all space-y-1 ${
                    khatmDailyPace === 5
                      ? 'bg-[#2D4539] border-[#4A6354] shadow-md text-[#E4E9E6]'
                      : 'bg-[#141C18] hover:bg-[#202E28] border-[#2A352F] text-[#8BA491]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span>🕊️ ختمة خفيفة</span>
                    <span>120 يوماً</span>
                  </div>
                  <p className="text-[11px] text-[#A7C0A8]">5 صفحات/يوم</p>
                  <p className="text-[10px] text-[#8BA491]">صفحة واحدة بعد كل صلاة</p>
                </button>
              </div>
            </div>

            {/* Practical Tip Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs flex items-center gap-2 font-tajawal">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>طريقة عملية للختم:</strong> قراءة <strong>{pagesPerPrayer} صفحات</strong> عقب كل صلاة مكتوبة تُيسر عليك إتمام الختمة خلال <strong>{khatmDaysRemaining} يوماً</strong> دون أي مشقة بفضل الله وتوفيقه.
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#2A352F] pb-3 gap-3">
        <div className="grid grid-cols-1 sm:flex items-center gap-2 bg-[#1A2520] p-1.5 rounded-2xl border border-[#2A352F] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('surah_reader')}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              activeTab === 'surah_reader'
                ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] shadow-md ring-1 ring-[#4A6354]'
                : 'text-[#8BA491] hover:text-[#E4E9E6] border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#A7C0A8]" />
            <span>قراءة سور المصحف كاملاً (114 سورة)</span>
          </button>

          <button
            onClick={() => setActiveTab('selected_verses')}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              activeTab === 'selected_verses'
                ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] shadow-md ring-1 ring-[#4A6354]'
                : 'text-[#8BA491] hover:text-[#E4E9E6] border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-[#A7C0A8]" />
            <span>آيات التفكر والمختارات</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenStudio('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'آية الكرسي')}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-semibold transition-all"
        >
          <Palette className="w-4 h-4 text-[#A7C0A8]" />
          <span>فتح أستوديو البطاقات</span>
        </button>
      </div>

      {/* VIEW 1: FULL QURAN SURAH READER (114 Surahs Text Selection) */}
      {activeTab === 'surah_reader' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Surah List Column (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            
            {/* Search Surah Box */}
            <div className="p-3.5 rounded-2xl bg-[#141C18] border border-[#2A352F] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#A7C0A8]">
                <span>فهرس السور (114 سورة)</span>
                <span className="text-[11px] text-[#8BA491]">اختر سورة لقراءتها</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8BA491] absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="ابحث باسم السورة أو رقمها (مثل: الكهف، 36)..."
                  className="w-full pr-9 pl-3 py-2 bg-[#0F1713] text-[#E4E9E6] placeholder-[#8BA491] rounded-xl border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                />
              </div>
            </div>

            {/* Scrollable List of Surahs */}
            <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.id}
                  onClick={() => setSelectedSurah(surah)}
                  className={`w-full p-3 rounded-2xl border transition-all text-right flex items-center justify-between ${
                    selectedSurah.id === surah.id
                      ? 'bg-[#2D4539] border-[#4A6354] shadow-md text-[#E4E9E6]'
                      : 'bg-[#141C18] hover:bg-[#1A2520] border-[#2A352F] text-[#8BA491]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#0F1713] border border-[#2A352F] text-[#A7C0A8] font-bold text-xs flex items-center justify-center font-cairo shrink-0">
                      {surah.id}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold font-amiri text-[#E4E9E6]">
                        سورة {surah.nameAr}
                      </h4>
                      <p className="text-[11px] text-[#8BA491]">
                        {surah.type} • {surah.versesCount} آية
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#A7C0A8] bg-[#141C18] px-2 py-1 rounded-lg border border-[#2A352F]">
                    جزء {surah.juzStart || 1}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* Surah Text Display Reader (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-[#141C18] border border-[#2D4539] space-y-6 text-right min-h-[600px]">
            
            {/* Surah Header Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#2A352F] pb-4 gap-4">
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#A7C0A8] mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2D4539] border border-[#4A6354]">
                    سورة رقم {selectedSurah.id}
                  </span>
                  <span>•</span>
                  <span>{selectedSurah.type}</span>
                  <span>•</span>
                  <span>{selectedSurah.versesCount} آية</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-amiri text-[#E4E9E6]">
                  سورة {selectedSurah.nameAr}
                </h2>
              </div>

              {/* Search Within Current Surah */}
              <div className="relative min-w-[200px] w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-[#8BA491] absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={surahFilterQuery}
                  onChange={(e) => setSurahFilterQuery(e.target.value)}
                  placeholder="بحث داخل أيات السورة..."
                  className="w-full pr-8 pl-3 py-1.5 bg-[#0F1713] text-[#E4E9E6] placeholder-[#8BA491] rounded-xl border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                />
              </div>
            </div>

            {/* Bismillah Header (Except Surah At-Tawbah #9) */}
            {selectedSurah.id !== 9 && (
              <div className="text-center py-2 border-b border-[#2A352F]">
                <p className="text-2xl font-amiri text-[#A7C0A8] font-bold">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoadingVerses ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#A7C0A8] animate-spin mx-auto" />
                <p className="text-xs text-[#8BA491]">جاري تحميل آيات سورة {selectedSurah.nameAr} كاملة...</p>
              </div>
            ) : activeDisplayVerses.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-sm text-[#8BA491]">لم يتم العثور على آيات تطابق البحث في سورة {selectedSurah.nameAr}</p>
                <button
                  onClick={() => setSurahFilterQuery('')}
                  className="text-xs text-[#A7C0A8] underline"
                >
                  إعادة عرض السورة كاملة
                </button>
              </div>
            ) : (
              /* Full Quran Verse List Display */
              <div className="space-y-4">
                {activeDisplayVerses.map((verse) => (
                  <div
                    key={verse.numberInSurah}
                    className="p-4 rounded-2xl bg-[#1A2520] hover:bg-[#202E28] border border-[#2D4539] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-[#141C18] border border-[#4A6354] text-[#A7C0A8] font-bold text-xs flex items-center justify-center font-cairo">
                        {verse.numberInSurah}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Audio recitation for this verse */}
                        {verse.audioUrl && (
                          <button
                            onClick={() => handlePlayAudio(verse.audioUrl, `s${selectedSurah.id}_v${verse.numberInSurah}`)}
                            className="p-1.5 rounded-lg bg-[#141C18] text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#2D4539] transition-all"
                            title="استماع للآية"
                          >
                            {playingAudioId === `s${selectedSurah.id}_v${verse.numberInSurah}` ? (
                              <VolumeX className="w-4 h-4 text-[#A7C0A8]" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Copy verse */}
                        <button
                          onClick={() => handleCopyText(verse.text, verse.numberInSurah)}
                          className="p-1.5 rounded-lg bg-[#141C18] text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#2D4539] transition-all"
                          title="نسخ نص الآية"
                        >
                          {copiedVerseIndex === verse.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Card Studio button for THIS verse */}
                        <button
                          onClick={() => handleOpenStudio(
                            verse.text,
                            `سورة ${selectedSurah.nameAr} - الآية ${verse.numberInSurah}`
                          )}
                          className="px-3 py-1 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Palette className="w-3.5 h-3.5 text-[#A7C0A8]" />
                          <span>تصميم بطاقة</span>
                        </button>
                      </div>
                    </div>

                    {/* Verse Quranic Text */}
                    <div className="py-2 text-right">
                      <p className="text-xl sm:text-2xl font-amiri text-[#E4E9E6] leading-relaxed font-semibold">
                        {verse.text} ﴿{verse.numberInSurah}﴾
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: SELECTED VERSES FOR MEDITATION */}
      {activeTab === 'selected_verses' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                      : 'bg-[#141C18] hover:bg-[#1A2520] text-[#8BA491] border border-[#2A352F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-[#8BA491] absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن آية، كلمة، أو تفسير..."
                className="w-full pr-9 pl-3 py-2 bg-[#141C18] text-[#E4E9E6] placeholder-[#8BA491] rounded-xl border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
              />
            </div>

          </div>

          {/* Verses List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredVerses.map((verse) => {
              const isFav = progress.favoriteVerseIds?.includes(verse.id);
              const isPlaying = playingAudioId === verse.id;

              return (
                <div
                  key={verse.id}
                  className="p-5 rounded-2xl bg-[#141C18] hover:bg-[#1A2520] border border-[#2A352F] hover:border-[#4A6354] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#2D4539] border border-[#4A6354] text-[#A7C0A8] font-bold text-xs flex items-center justify-center font-cairo">
                        {verse.surahNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold font-amiri text-[#E4E9E6]">
                          سورة {verse.surahName}
                        </h4>
                        <span className="text-[11px] text-[#8BA491]">
                          الآية رقم {verse.verseNumber} • الجزء {verse.juzNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenStudio(verse.arabicText, `سورة ${verse.surahName} - آية ${verse.verseNumber}`)}
                        className="p-2 rounded-xl text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#1A2520] transition-colors flex items-center gap-1 text-[11px]"
                        title="تصميم بطاقة دعوية"
                      >
                        <Palette className="w-4 h-4 text-[#A7C0A8]" />
                        <span className="hidden sm:inline">تصميم بطاقة</span>
                      </button>

                      <button
                        onClick={() => handlePlayAudio(verse.audioUrl, verse.id)}
                        className="p-2 rounded-xl text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#1A2520] transition-colors"
                        title="استماع"
                      >
                        {isPlaying ? <VolumeX className="w-4 h-4 text-[#A7C0A8]" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onOpenShareModal(verse)}
                        className="p-2 rounded-xl text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#1A2520] transition-colors"
                        title="مشاركة الآية"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleFavorite(verse.id)}
                        className="p-2 rounded-xl text-[#8BA491] hover:text-rose-400 hover:bg-[#1A2520] transition-colors"
                        title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400 text-rose-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Verse Arabic Text */}
                  <div className="py-2">
                    <p className="text-xl sm:text-2xl font-amiri text-[#E4E9E6] leading-relaxed font-semibold">
                      ﴿ {verse.arabicText} ﴾
                    </p>
                  </div>

                  {/* Tafsir Accordion */}
                  <div className="pt-2 border-t border-[#2A352F] flex items-center justify-between">
                    <p className="text-xs text-[#8BA491] font-tajawal line-clamp-2">
                      {verse.tafsirShort}
                    </p>
                    
                    <button
                      onClick={() => setActiveTafsirVerse(activeTafsirVerse?.id === verse.id ? null : verse)}
                      className="text-[11px] text-[#A7C0A8] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>التفسير والمزيد</span>
                    </button>
                  </div>

                  {/* Detailed Tafsir Expanded View */}
                  {activeTafsirVerse?.id === verse.id && (
                    <div className="mt-3 p-4 rounded-xl bg-[#1A2520] border border-[#2D4539] space-y-2 animate-fadeIn">
                      <h5 className="text-xs font-bold text-[#A7C0A8] font-amiri">
                        التفسير الميسر وتأملات الآية:
                      </h5>
                      <p className="text-xs text-[#E4E9E6] leading-relaxed font-tajawal">
                        {verse.tafsirShort}
                      </p>
                      <div className="text-[11px] text-[#8BA491] pt-1">
                        الترجمة الإنجليزية: <span className="italic text-[#E4E9E6]">{verse.translationText}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
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
