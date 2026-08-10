import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  BookMarked, 
  Check, 
  Copy, 
  Sparkles, 
  RotateCcw,
  Sun,
  Moon,
  Clock,
  Heart,
  Home,
  Compass,
  Coffee,
  Shield,
  Share2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { HISN_CATEGORIES, HISN_ATHKAR, HisnItem } from '../data/hisnAlMuslim';
import { UserProgress } from '../types';
import { playTasbeehClickAudio } from '../utils/audioAthkar';

interface HisnAlMuslimSectionProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onOpenShareModal?: (item: { title: string; text: string; benefit?: string }) => void;
}

export const HisnAlMuslimSection: React.FC<HisnAlMuslimSectionProps> = ({
  progress,
  onUpdateProgress,
  onOpenShareModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Counter state per Dua ID
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  
  // Bookmarked items stored in progress
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Category Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return Sun;
      case 'Moon': return Moon;
      case 'Clock': return Clock;
      case 'Heart': return Heart;
      case 'Home': return Home;
      case 'Compass': return Compass;
      case 'Coffee': return Coffee;
      case 'Shield': return Shield;
      case 'Sparkles': return Sparkles;
      default: return BookMarked;
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return HISN_ATHKAR.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.benefit && item.benefit.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle Counting
  const handleCountIncrement = (item: HisnItem) => {
    const current = itemCounts[item.id] || 0;
    const nextCount = current + 1;
    
    setItemCounts(prev => ({
      ...prev,
      [item.id]: nextCount
    }));

    // Sound feedback
    playTasbeehClickAudio(nextCount >= item.count ? 'completion' : 'click');

    // Trigger vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Update global progress count
    onUpdateProgress({
      totalAthkarRead: (progress.totalAthkarRead || 0) + 1
    });
  };

  // Reset count for single item
  const handleResetCount = (itemId: string) => {
    setItemCounts(prev => ({
      ...prev,
      [itemId]: 0
    }));
  };

  // Copy Text
  const handleCopy = (item: HisnItem) => {
    const content = `${item.title}\n\n${item.text}\n\n المصدر: ${item.source || 'حصن المسلم'}`;
    navigator.clipboard.writeText(content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1C2C24] via-[#141C18] to-[#0F1713] border border-[#2D4539] p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4539]/80 border border-[#4A6354] text-[#A7C0A8] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#A7C0A8]" />
              <span>حصن المسلم الكامل من أذكار الكتاب والسنة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-amiri text-[#E4E9E6]">
              أدعية وأذكار حصن المسلم
            </h2>
            <p className="text-xs sm:text-sm text-[#8BA491] max-w-2xl leading-relaxed font-tajawal">
              موسوعة جامعة ومحققة لكافة أدعية وأذكار المسلم اليومية لحفظ النفس والبركة وتفريج الهموم والأرق.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-[#8BA491] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في أذكار وأدعية حصن المسلم..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#0F1713] border border-[#2A352F] text-[#E4E9E6] placeholder-[#8BA491] text-xs focus:outline-none focus:border-[#4A6354] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-[#2D4539] text-[#E4E9E6] border border-[#4A6354] shadow-md'
              : 'bg-[#141C18] text-[#8BA491] hover:text-[#E4E9E6] border border-[#2A352F]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
          <span>الكل ({HISN_ATHKAR.length})</span>
        </button>

        {HISN_CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.iconName);
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2D4539] text-[#E4E9E6] border border-[#4A6354] shadow-md'
                  : 'bg-[#141C18] text-[#8BA491] hover:text-[#E4E9E6] border border-[#2A352F]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A7C0A8]' : 'text-[#8BA491]'}`} />
              <span>{cat.titleAr}</span>
            </button>
          );
        })}
      </div>

      {/* Duas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const currentCount = itemCounts[item.id] || 0;
          const isCompleted = currentCount >= item.count;
          const isBookmarked = bookmarkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between gap-4 ${
                isCompleted 
                  ? 'bg-[#16221C] border-[#3D5A4A] shadow-md' 
                  : 'bg-[#141C18] border-[#2A352F] hover:border-[#3D5A4A]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1F2C25] text-[#8BA491] border border-[#2A352F] text-[10px] font-semibold mb-2">
                    {item.categoryAr}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-amiri text-[#A7C0A8]">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      isBookmarked
                        ? 'bg-[#2D4539] text-[#A7C0A8] border border-[#4A6354]'
                        : 'bg-[#0F1713] text-[#8BA491] border border-[#2A352F] hover:text-[#E4E9E6]'
                    }`}
                    title="حفظ في الأذكار المفضلة"
                  >
                    <BookMarked className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Arabic Text */}
              <div className="py-2 bg-[#0F1713]/60 p-4 rounded-2xl border border-[#2A352F]/80">
                <p className="text-base sm:text-lg leading-loose font-amiri text-[#E4E9E6] text-right">
                  {item.text}
                </p>
              </div>

              {/* Expandable Benefit & Source Section */}
              {expandedIds[item.id] ? (
                <div className="space-y-2.5 animate-fadeIn">
                  {item.benefit && (
                    <div className="text-xs text-[#C2D1C4] bg-[#1A2520] p-3.5 rounded-xl border border-[#2D4539] leading-relaxed font-tajawal space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#A7C0A8]">
                        <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
                        <span>الفضل والبركة:</span>
                      </div>
                      <p>{item.benefit}</p>
                    </div>
                  )}

                  {item.source && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8BA491] italic bg-[#0F1713] px-3 py-1.5 rounded-lg border border-[#2A352F] w-fit font-tajawal">
                      <Info className="w-3 h-3 text-[#A7C0A8]" />
                      <span>المصدر: {item.source}</span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs text-[#8BA491] hover:text-[#E4E9E6] font-tajawal flex items-center gap-1 transition-colors pt-1"
                  >
                    <span>إخفاء الشرح والتفاصيل</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                (item.benefit || item.source) && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs text-[#8BA491] hover:text-[#A7C0A8] font-tajawal flex items-center gap-1.5 transition-colors py-1 w-fit"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
                    <span>عرض شرح وفضل الدعاء</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )
              )}

              {/* Action Buttons & Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2A352F]">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-2 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
                    title="نسخ النص"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {onOpenShareModal && (
                    <button
                      onClick={() => onOpenShareModal({ title: item.title, text: item.text, benefit: item.benefit })}
                      className="p-2 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
                      title="مشاركة كبطاقة داعية"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {currentCount > 0 && (
                    <button
                      onClick={() => handleResetCount(item.id)}
                      className="p-2 rounded-xl bg-[#0F1713] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
                      title="تصفير العداد"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter Button */}
                <button
                  onClick={() => handleCountIncrement(item)}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                      : 'bg-[#2D4539] hover:bg-[#3D5A4A] text-[#E4E9E6] border border-[#4A6354]'
                  }`}
                >
                  <span>{isCompleted ? 'تم القراءة' : 'تكرار'}</span>
                  <span className="w-6 h-6 rounded-full bg-[#141C18] border border-[#4A6354] flex items-center justify-center text-[11px] font-bold text-[#A7C0A8]">
                    {currentCount} / {item.count}
                  </span>
                </button>

              </div>

            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-[#141C18] rounded-3xl border border-[#2A352F] space-y-3">
          <ShieldCheck className="w-10 h-10 text-[#8BA491] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#E4E9E6]">لا توجد أذكار تطابق بحثك</h3>
          <p className="text-xs text-[#8BA491]">جرب البحث بكلمة أخرى أو اختر تصنيفاً آخر من الأعلى.</p>
        </div>
      )}

    </div>
  );
};
