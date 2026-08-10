import React, { useState, useEffect } from 'react';
import { 
  loadLocalSettings, 
  saveLocalSettings, 
  loadLocalProgress, 
  saveLocalProgress 
} from './utils/syncService';
import { UserSettings, UserProgress, QuranVerse, BiographyItem } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { QuranSection } from './components/QuranSection';
import { AthkarSection } from './components/AthkarSection';
import { HisnAlMuslimSection } from './components/HisnAlMuslimSection';
import { BiographiesSection } from './components/BiographiesSection';
import { ShareVerseModal } from './components/ShareVerseModal';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { NotificationManagerModal } from './components/NotificationManagerModal';
import { SyncAndBackupModal } from './components/SyncAndBackupModal';
import { GeminiReflectModal } from './components/GeminiReflectModal';
import { AudioPrayerAndDhikrManager } from './components/AudioPrayerAndDhikrManager';
import { Heart, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(loadLocalSettings);
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress);

  const [activeTab, setActiveTab] = useState<string>('prayers');

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [shareVerse, setShareVerse] = useState<QuranVerse | null>(null);
  const [geminiVerse, setGeminiVerse] = useState<QuranVerse | null>(null);

  // Apply Theme class to document body
  useEffect(() => {
    document.body.className = `theme-${settings.theme} font-cairo antialiased selection:bg-emerald-500/30 selection:text-emerald-200`;
  }, [settings.theme]);

  // Persist Settings
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveLocalSettings(updated);
  };

  // Persist Progress
  const handleUpdateProgress = (newProgress: Partial<UserProgress>) => {
    const updated = { ...progress, ...newProgress };
    setProgress(updated);
    saveLocalProgress(updated);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Top Sticky Navbar */}
      <Navbar
        settings={settings}
        progress={progress}
        onUpdateSettings={handleUpdateSettings}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenGemini={() => {
          setGeminiVerse(null);
          setGeminiModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport with Mobile Dock Bottom Clearance */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 flex-1">
        
        {activeTab === 'prayers' && (
          <PrayerTimesSection
            settings={settings}
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {activeTab === 'quran' && (
          <QuranSection
            settings={settings}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onOpenShareModal={(verse) => setShareVerse(verse)}
            onOpenGeminiReflection={(verse) => {
              setGeminiVerse(verse);
              setGeminiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'athkar' && (
          <AthkarSection
            settings={settings}
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {activeTab === 'hisn' && (
          <HisnAlMuslimSection
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onOpenShareModal={(item) => setShareVerse({
              id: 'hisn-' + Date.now(),
              surahNumber: 0,
              surahNameAr: 'حصن المسلم',
              verseNumber: 0,
              textAr: item.text,
              translationEn: item.benefit || item.title
            })}
          />
        )}

        {activeTab === 'biographies' && (
          <BiographiesSection
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A352F] bg-[#141C18] py-6 mt-12 text-xs text-[#8BA491]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          
          <div className="space-y-1">
            <h4 className="font-bold font-amiri text-[#A5D2B3] text-sm flex items-center justify-center md:justify-start gap-1.5">
              <BookOpen className="w-4 h-4 text-[#A5D2B3]" />
              تطبيق نور الهداية - الرفيق الإسلامي الشامل
            </h4>
            <p className="text-[11px] text-[#8BA491] font-tajawal">
              ﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾ • جميع الأذكار والآيات مدققة ومحفوظة تلقائياً.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setSyncModalOpen(true)}
              className="hover:text-[#E4E9E6] transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#A7C0A8]" />
              <span>المزامنة والنسخ الاحتياطي</span>
            </button>
            <span>•</span>
            <button 
              onClick={() => setNotificationsModalOpen(true)}
              className="hover:text-[#E4E9E6] transition-colors"
            >
              إعدادات التنبيهات
            </button>
          </div>

        </div>
      </footer>

      {/* Global Interactive Modals */}
      <ShareVerseModal
        verse={shareVerse}
        onClose={() => setShareVerse(null)}
      />

      <AdvancedSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectVerse={(v) => setActiveTab('quran')}
        onSelectBiography={(b) => setActiveTab('biographies')}
        onSelectTab={setActiveTab}
      />

      <NotificationManagerModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <SyncAndBackupModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        settings={settings}
        progress={progress}
        onUpdateSettings={handleUpdateSettings}
        onUpdateProgress={handleUpdateProgress}
      />

      <GeminiReflectModal
        isOpen={geminiModalOpen}
        onClose={() => setGeminiModalOpen(false)}
        initialVerse={geminiVerse}
      />

      {/* Global Background Audio Adhan & Audio Athkar Manager */}
      <AudioPrayerAndDhikrManager
        settings={settings}
        progress={progress}
        onUpdateSettings={handleUpdateSettings}
        onUpdateProgress={handleUpdateProgress}
      />

      {/* Mobile Sticky Native Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenGemini={() => {
          setGeminiVerse(null);
          setGeminiModalOpen(true);
        }}
      />

    </div>
  );
}
