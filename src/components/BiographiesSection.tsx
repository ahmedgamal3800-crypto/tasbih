import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Bookmark, 
  Search, 
  X,
  Award,
  CheckCircle2,
  Palette,
  Share2,
  Sparkles
} from 'lucide-react';
import { BiographyItem, BioCategory, UserProgress } from '../types';
import { BIOGRAPHIES_DATA } from '../data/biographies';
import { CardStudioModal, CardStudioData } from './CardStudioModal';

interface BiographiesSectionProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
}

export const BiographiesSection: React.FC<BiographiesSectionProps> = ({
  progress,
  onUpdateProgress
}) => {
  const [activeCategory, setActiveCategory] = useState<BioCategory>('prophets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBio, setSelectedBio] = useState<BiographyItem | null>(null);

  // Card Studio Modal State
  const [studioData, setStudioData] = useState<CardStudioData | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  const handleOpenStudio = (text: string, source: string) => {
    setStudioData({ text, source });
    setIsStudioOpen(true);
  };

  const handleToggleBookmark = (bioId: string) => {
    const bookmarked = progress.bookmarkedBioIds || [];
    const updated = bookmarked.includes(bioId)
      ? bookmarked.filter(id => id !== bioId)
      : [...bookmarked, bioId];
    onUpdateProgress({ bookmarkedBioIds: updated });
  };

  const categories = [
    { id: 'prophets', label: 'سير الأنبياء والرسل (25 نبي)', icon: '✨' },
    { id: 'companions', label: 'سير الصحابة الكرام', icon: '⚔️' },
    { id: 'mothers_of_believers', label: 'أمهات المؤمنين', icon: '🌸' }
  ];

  const filteredBiographies = BIOGRAPHIES_DATA.filter(item => {
    const matchesCat = item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.includes(searchQuery) || 
      item.title.includes(searchQuery) ||
      item.briefSummary.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-[#1A2520] border border-[#2D4539] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-right">
          <h2 className="text-2xl font-bold font-amiri text-[#A7C0A8] flex items-center justify-center md:justify-start gap-2">
            <Users className="w-6 h-6 text-[#A7C0A8]" />
            سير أنبياء الله ورسله الـ 25 والقدوات الحسنة
          </h2>
          <p className="text-xs text-[#8BA491] font-tajawal">
            تأمل في قصص وحياة أنبياء الله الـ 25 المذكورين في القرآن، واستخلص العِبر والدروس الخالدة، وصمّم بطاقات السيرة لمشاركتها وتحميلها.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] w-full md:w-auto">
          <Search className="w-4 h-4 text-[#8BA491] absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن نبي، صحابي، أو كلمة..."
            className="w-full pr-9 pl-3 py-2 bg-[#141C18] text-[#E4E9E6] placeholder-[#8BA491] rounded-xl border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
          />
        </div>
      </div>

      {/* Category Nav Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-[#2A352F] pb-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as BioCategory)}
            className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center border ${
              activeCategory === cat.id
                ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] shadow-md ring-1 ring-[#4A6354]'
                : 'bg-[#141C18] hover:bg-[#1A2520] text-[#8BA491] border-[#2A352F]'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Biography Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBiographies.map((bio) => {
          const isBookmarked = progress.bookmarkedBioIds?.includes(bio.id);

          return (
            <div
              key={bio.id}
              className="p-5 rounded-2xl bg-[#141C18] hover:bg-[#1A2520] border border-[#2A352F] hover:border-[#4A6354] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2D4539] border border-[#4A6354] text-[#A7C0A8] text-[10px] font-semibold">
                    {bio.periodEra || 'العصر الخالد'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenStudio(`${bio.name}\n${bio.title}\n\n"${bio.briefSummary}"`, bio.name)}
                      className="p-1.5 rounded-lg bg-[#0F1713] hover:bg-[#1A2520] text-[#8BA491] hover:text-[#A7C0A8] transition-colors"
                      title="تصميم وتنزيل بطاقة النبوة"
                    >
                      <Palette className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(bio.id)}
                      className="p-1.5 rounded-xl text-[#8BA491] hover:text-[#A7C0A8] hover:bg-[#1A2520] transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#A7C0A8] text-[#A7C0A8]' : ''}`} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-amiri text-[#E4E9E6]">
                  {bio.name}
                </h3>

                <p className="text-xs text-[#A7C0A8] font-semibold font-cairo">
                  {bio.title}
                </p>

                <p className="text-xs text-[#8BA491] font-tajawal leading-relaxed line-clamp-3">
                  {bio.briefSummary}
                </p>
              </div>

              {/* Notable traits badges */}
              <div className="pt-3 border-t border-[#2A352F] space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {bio.notableTraits.slice(0, 3).map((trait, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#0F1713] text-[#8BA491] text-[10px] border border-[#2A352F]">
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBio(bio)}
                    className="flex-1 py-2 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#A7C0A8]" />
                    <span>السيرة والدروس</span>
                  </button>

                  <button
                    onClick={() => handleOpenStudio(`${bio.name} - ${bio.title}\n\n${bio.briefSummary}\n\nأهم الدروس:\n• ${bio.keyLessons.join('\n• ')}`, bio.name)}
                    className="px-3 py-2 rounded-xl bg-[#141C18] hover:bg-[#1A2520] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    title="تصميم ومشاركة بطاقة السيرة"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A7C0A8]" />
                    <span>بطاقة</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Full Biography Reading Modal */}
      {selectedBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#2A352F] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2D4539] text-[#A7C0A8] text-xs font-bold">
                  {selectedBio.periodEra}
                </span>
                <h3 className="text-2xl font-bold font-amiri text-[#E4E9E6] mt-1">
                  {selectedBio.name}
                </h3>
                <p className="text-xs text-[#A7C0A8] font-semibold mt-0.5">
                  {selectedBio.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenStudio(`${selectedBio.name} - ${selectedBio.title}\n\n${selectedBio.briefSummary}`, selectedBio.name)}
                  className="px-3 py-1.5 rounded-xl bg-[#2D4539] text-[#E4E9E6] text-xs font-semibold flex items-center gap-1.5 border border-[#4A6354]"
                >
                  <Palette className="w-3.5 h-3.5 text-[#A7C0A8]" />
                  <span>بطاقة الدعوة والتحميل</span>
                </button>

                <button
                  onClick={() => setSelectedBio(null)}
                  className="p-2 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold font-amiri text-[#A7C0A8] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#A7C0A8]" />
                المحطات الرئيسية في السيرة المباركة:
              </h4>

              <div className="space-y-3">
                {selectedBio.fullStory.map((paragraph, idx) => (
                  <p key={idx} className="text-sm text-[#E4E9E6] leading-relaxed font-tajawal bg-[#1A2520] p-3.5 rounded-xl border border-[#2A352F]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Key Lessons Takeaways */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold font-amiri text-[#A7C0A8] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A7C0A8]" />
                الدروس والعِبر المستفادة:
              </h4>

              <div className="space-y-2">
                {selectedBio.keyLessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#E4E9E6] font-tajawal">
                    <CheckCircle2 className="w-4 h-4 text-[#A7C0A8] shrink-0 mt-0.5" />
                    <span>{lesson}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quranic & Historical References */}
            {selectedBio.referenceQuranVerses && (
              <div className="p-4 rounded-xl bg-[#0F1713] border border-[#2D4539] space-y-2">
                <h5 className="text-xs font-bold text-[#A7C0A8] font-amiri">
                  الآيات والأدلة الواردة في الذكر الحكيم:
                </h5>
                {selectedBio.referenceQuranVerses.map((ref, idx) => (
                  <p key={idx} className="text-sm font-amiri text-[#E4E9E6]">
                    ﴿ {ref} ﴾
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleOpenStudio(`${selectedBio.name}\n${selectedBio.referenceQuranVerses ? selectedBio.referenceQuranVerses[0] : selectedBio.briefSummary}`, selectedBio.name)}
                className="px-4 py-2 rounded-xl bg-[#1A2520] hover:bg-[#2A352F] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold flex items-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>تصميم وتنزيل صورة السيرة</span>
              </button>

              <button
                onClick={() => setSelectedBio(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-semibold text-xs transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>

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

