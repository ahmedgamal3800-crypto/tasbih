import React from 'react';
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Search, 
  Bell, 
  Cloud, 
  BookOpen, 
  Flame,
  Palette,
  CheckCircle2
} from 'lucide-react';
import { ThemeMode, UserSettings, UserProgress } from '../types';
import { getFormattedHijriDate } from '../data/prayers';

interface NavbarProps {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSync: () => void;
  onOpenGemini: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onOpenSearch,
  onOpenNotifications,
  onOpenSync,
  onOpenGemini,
  activeTab,
  setActiveTab
}) => {
  const { hijriDateStr, gregorianDateStr } = getFormattedHijriDate();

  const handleCycleTheme = () => {
    const themes: ThemeMode[] = ['emerald', 'dark', 'sepia', 'light'];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    onUpdateSettings({ theme: themes[nextIdx] });
  };

  const getThemeLabel = (t: ThemeMode) => {
    switch (t) {
      case 'emerald': return 'الزمردي';
      case 'dark': return 'الداكن';
      case 'sepia': return 'الدافئ';
      case 'light': return 'النهار';
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#141C18]/90 border-b border-[#2A352F] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Dates */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('prayers')}
              className="flex items-center gap-2 text-right group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2D4539] border border-[#4A6354] flex items-center justify-center text-[#A7C0A8] shadow-md group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#A7C0A8]" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold font-amiri text-[#A7C0A8] group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                  تسبيح
                </h1>
                <p className="text-[10px] text-[#8BA491] hidden sm:block">
                  {hijriDateStr} | {gregorianDateStr}
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1A2520] p-1 rounded-2xl border border-[#2A352F]">
            <button
              onClick={() => setActiveTab('prayers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'prayers'
                  ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#141C18]'
              }`}
            >
              مواقيت الصلاة
            </button>
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'quran'
                  ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#141C18]'
              }`}
            >
              القرآن الكريم
            </button>
            <button
              onClick={() => setActiveTab('athkar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'athkar'
                  ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#141C18]'
              }`}
            >
              الأذكار والورد
            </button>
            <button
              onClick={() => setActiveTab('hisn')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'hisn'
                  ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#141C18]'
              }`}
            >
              حصن المسلم
            </button>
            <button
              onClick={() => setActiveTab('biographies')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'biographies'
                  ? 'bg-[#2D4539] text-[#E4E9E6] font-bold border border-[#4A6354] shadow-sm'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#141C18]'
              }`}
            >
              الأنبياء والصحابة
            </button>
          </nav>

          {/* Action Tools & Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Streak Counter Badge */}
            <div 
              title="أيام الالتزام المتتالية بالعبادة"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#1A2520] border border-[#2A352F] text-[#A7C0A8] text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5 fill-[#A7C0A8] text-[#A7C0A8] animate-pulse" />
              <span>{progress.streakDays} يوم</span>
            </div>

            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-[#8BA491] hover:text-[#E4E9E6] bg-[#1A2520] hover:bg-[#2D4539] border border-[#2A352F] transition-all flex items-center gap-1.5"
              title="بحث متقدم (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-[#A7C0A8]" />
              <span className="hidden lg:inline text-xs font-normal text-[#8BA491]">بحث...</span>
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl text-[#8BA491] hover:text-[#E4E9E6] bg-[#1A2520] hover:bg-[#2D4539] border border-[#2A352F] transition-all relative"
              title="التنبيهات والإشعارات الذكية"
            >
              <Bell className="w-4 h-4 text-[#8BA491]" />
              {settings.notificationsEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A7C0A8] ring-2 ring-[#0F1713] animate-ping" />
              )}
            </button>

            {/* Device Sync & Auto Backup */}
            <button
              onClick={onOpenSync}
              className="p-2 rounded-xl text-[#8BA491] hover:text-[#E4E9E6] bg-[#1A2520] hover:bg-[#2D4539] border border-[#2A352F] transition-all flex items-center gap-1"
              title="المزامنة والنسخ الاحتياطي التلقائي"
            >
              <Cloud className="w-4 h-4 text-[#A7C0A8]" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
