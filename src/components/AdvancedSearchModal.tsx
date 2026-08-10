import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Heart, 
  Users, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { QURAN_VERSES } from '../data/quran';
import { INITIAL_ATHKAR } from '../data/athkar';
import { HISN_ATHKAR } from '../data/hisnAlMuslim';
import { BIOGRAPHIES_DATA } from '../data/biographies';
import { QuranVerse, DhikrItem, BiographyItem, SearchResult } from '../types';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (verse: QuranVerse) => void;
  onSelectBiography: (bio: BiographyItem) => void;
  onSelectTab: (tab: string) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVerse,
  onSelectBiography,
  onSelectTab
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verse' | 'dhikr' | 'biography'>('all');

  const results: SearchResult[] = [];

  if (query.trim().length > 0) {
    const q = query.trim();

    // 1. Search Quran Verses
    if (filterType === 'all' || filterType === 'verse') {
      QURAN_VERSES.forEach(verse => {
        if (
          verse.arabicText.includes(q) ||
          verse.surahName.includes(q) ||
          verse.tafsirShort.includes(q)
        ) {
          results.push({
            id: verse.id,
            type: 'verse',
            title: `سورة ${verse.surahName} - آية ${verse.verseNumber}`,
            subtitle: `الجزء ${verse.juzNumber}`,
            snippet: verse.arabicText,
            itemData: verse
          });
        }
      });
    }

    // 2. Search Athkar & Hisn Al-Muslim
    if (filterType === 'all' || filterType === 'dhikr') {
      INITIAL_ATHKAR.forEach(dhikr => {
        if (
          dhikr.title.includes(q) ||
          dhikr.text.includes(q) ||
          (dhikr.reward && dhikr.reward.includes(q))
        ) {
          results.push({
            id: dhikr.id,
            type: 'dhikr',
            title: dhikr.title,
            subtitle: 'الأذكار والورد اليومي',
            snippet: dhikr.text,
            itemData: dhikr
          });
        }
      });

      HISN_ATHKAR.forEach(hisn => {
        if (
          hisn.title.includes(q) ||
          hisn.text.includes(q) ||
          (hisn.benefit && hisn.benefit.includes(q))
        ) {
          results.push({
            id: hisn.id,
            type: 'dhikr',
            title: hisn.title,
            subtitle: `حصن المسلم - ${hisn.categoryAr}`,
            snippet: hisn.text,
            itemData: hisn
          });
        }
      });
    }

    // 3. Search Biographies
    if (filterType === 'all' || filterType === 'biography') {
      BIOGRAPHIES_DATA.forEach(bio => {
        if (
          bio.name.includes(q) ||
          bio.title.includes(q) ||
          bio.briefSummary.includes(q)
        ) {
          results.push({
            id: bio.id,
            type: 'biography',
            title: bio.name,
            subtitle: bio.title,
            snippet: bio.briefSummary,
            itemData: bio
          });
        }
      });
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'verse') {
      onSelectVerse(result.itemData);
      onSelectTab('quran');
    } else if (result.type === 'biography') {
      onSelectBiography(result.itemData);
      onSelectTab('biographies');
    } else {
      onSelectTab('athkar');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl overflow-hidden space-y-4 p-5">
        
        {/* Search Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-[#2A352F]">
          <Search className="w-5 h-5 text-[#A7C0A8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في القرآن الكريم، الأذكار، والسير النبوية (مثال: الفرج، الصبر، خديجة، الاستغفار)..."
            className="w-full bg-transparent text-[#E4E9E6] placeholder-[#8BA491] text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#8BA491]">التصفية:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl transition-all ${filterType === 'all' ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354]' : 'bg-[#1A2520] text-[#8BA491] border border-[#2A352F]'}`}
          >
            الجميع
          </button>
          <button
            onClick={() => setFilterType('verse')}
            className={`px-3 py-1 rounded-xl transition-all ${filterType === 'verse' ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354]' : 'bg-[#1A2520] text-[#8BA491] border border-[#2A352F]'}`}
          >
            الآيات
          </button>
          <button
            onClick={() => setFilterType('dhikr')}
            className={`px-3 py-1 rounded-xl transition-all ${filterType === 'dhikr' ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354]' : 'bg-[#1A2520] text-[#8BA491] border border-[#2A352F]'}`}
          >
            الأذكار
          </button>
          <button
            onClick={() => setFilterType('biography')}
            className={`px-3 py-1 rounded-xl transition-all ${filterType === 'biography' ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354]' : 'bg-[#1A2520] text-[#8BA491] border border-[#2A352F]'}`}
          >
            التراجم والسير
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center text-[#8BA491] space-y-2">
              <Sparkles className="w-8 h-8 text-[#A7C0A8]/40 mx-auto" />
              <p className="text-xs">اكتب أي كلمة للبحث الفوري الشامل في أركان التطبيق</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#8BA491]">
              <p className="text-xs">لم يتم العثور على نتائج تطابق "{query}"</p>
            </div>
          ) : (
            results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="p-3.5 rounded-2xl bg-[#1A2520] hover:bg-[#2D4539] border border-[#2A352F] hover:border-[#4A6354] transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 text-right overflow-hidden">
                  <div className="flex items-center gap-2">
                    {result.type === 'verse' && <BookOpen className="w-4 h-4 text-[#A7C0A8] shrink-0" />}
                    {result.type === 'dhikr' && <Heart className="w-4 h-4 text-[#A7C0A8] shrink-0" />}
                    {result.type === 'biography' && <Users className="w-4 h-4 text-[#A7C0A8] shrink-0" />}
                    
                    <h4 className="text-sm font-bold font-amiri text-[#E4E9E6] group-hover:text-[#A7C0A8]">
                      {result.title}
                    </h4>
                  </div>

                  <p className="text-xs font-amiri text-[#8BA491] truncate">
                    "{result.snippet}"
                  </p>
                </div>

                <ChevronLeft className="w-4 h-4 text-[#8BA491] group-hover:text-[#A7C0A8] group-hover:-translate-x-1 transition-transform shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
