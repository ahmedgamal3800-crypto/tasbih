import React from 'react';
import { Clock, BookOpen, Heart, ShieldCheck, Users, Sparkles, Search } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenGemini: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenGemini
}) => {
  const tabs = [
    {
      id: 'prayers',
      label: 'المواقيت',
      icon: Clock,
      badge: 'الصلوات'
    },
    {
      id: 'quran',
      label: 'القرآن',
      icon: BookOpen,
      badge: 'المصحف'
    },
    {
      id: 'athkar',
      label: 'الأذكار',
      icon: Heart,
      badge: 'الورد'
    },
    {
      id: 'hisn',
      label: 'حصن المسلم',
      icon: ShieldCheck,
      badge: 'الأدعية'
    },
    {
      id: 'biographies',
      label: 'السير',
      icon: Users,
      badge: 'الأنبياء'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141C18]/95 backdrop-blur-xl border-t border-[#2A352F] pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] shadow-2xl transition-all">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#A7C0A8] bg-[#1A2520] border border-[#2D4539] shadow-inner'
                  : 'text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#1A2520]/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#A7C0A8]' : 'text-[#8BA491]'}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#A7C0A8] ring-2 ring-[#0F1713] animate-pulse" />
                )}
              </div>
              <span className={`text-[11px] font-cairo ${isActive ? 'font-bold text-[#E4E9E6]' : 'font-medium text-[#8BA491]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Quick Search trigger on mobile */}
        <button
          onClick={onOpenSearch}
          className="p-2.5 rounded-2xl bg-[#1A2520] hover:bg-[#2D4539] border border-[#2A352F] text-[#8BA491] hover:text-[#E4E9E6] flex items-center justify-center transition-all active:scale-95"
          title="بحث متقدم"
        >
          <Search className="w-5 h-5 text-[#A7C0A8]" />
        </button>

      </div>
    </div>
  );
};
