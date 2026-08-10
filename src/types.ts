export type ThemeMode = 'dark' | 'emerald' | 'sepia' | 'light';

export interface PrayerTime {
  id: string;
  name: string;
  arabicName: string;
  time: string; // HH:MM
  formattedTime: string;
  status: 'upcoming' | 'current' | 'passed';
  iconName: string;
  notificationEnabled: boolean;
  iqamaOffsetMinutes?: number;
}

export interface QuranVerse {
  id: string;
  surahNumber: number;
  surahName: string;
  surahEnglish: string;
  verseNumber: number;
  arabicText: string;
  translationText: string;
  tafsirShort: string;
  category: 'guidance' | 'patience' | 'hope' | 'mercy' | 'peace' | 'faith';
  isFavorite?: boolean;
  audioUrl?: string;
  juzNumber?: number;
}

export interface DhikrItem {
  id: string;
  title: string;
  text: string;
  transliteration?: string;
  translation?: string;
  category: 'morning' | 'evening' | 'post_prayer' | 'daily_wirid' | 'sleep' | 'quranic_duas' | 'prophetic_duas' | 'distress_duas' | 'ruqyah' | 'custom';
  targetCount: number;
  currentCount: number;
  reward?: string;
  reference?: string;
  completedToday?: boolean;
}

export type BioCategory = 'prophets' | 'companions' | 'mothers_of_believers';

export interface BiographyItem {
  id: string;
  name: string;
  title: string;
  category: BioCategory;
  periodEra?: string;
  briefSummary: string;
  fullStory: string[];
  keyLessons: string[];
  notableTraits: string[];
  referenceQuranVerses?: string[];
  imageUrl?: string;
  isBookmarked?: boolean;
}

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  time: string; // HH:MM
  category: 'prayer' | 'dhikr' | 'quran' | 'wirid' | 'custom';
  enabled: boolean;
  days: string[]; // ['Sat', 'Sun', ...]
  audioOption: 'gentle_chime' | 'athan_short' | 'soft_bell' | 'silent';
}

export interface UserSettings {
  theme: ThemeMode;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  city: string;
  country: string;
  calculationMethod: string;
  athanSoundEnabled: boolean;
  athanVoice: 'makkah' | 'madinah' | 'cairo' | 'alaqsa' | 'alafasy' | 'soft' | string;
  autoAthanEnabled?: boolean;
  prePrayerAudioReminder?: boolean;
  postPrayerAudioAthkar?: boolean;
  periodicAudioAthkar?: boolean;
  periodicAudioIntervalMinutes?: number;
  preferredAthkarReciter?: string;
  autoPlayAthkarOnWardStart?: boolean;
  prayerManualOffsetMinutes?: number;
  perPrayerOffsets?: Record<string, number>;
  customExactPrayerTimes?: Record<string, string>;
  autoSyncEnabled: boolean;
  syncCode: string;
  lastBackupDate?: string;
  notificationsEnabled: boolean;
  morningAthkarTime?: string;
  eveningAthkarTime?: string;
  wirdTime?: string;
  morningAthkarNotifEnabled?: boolean;
  eveningAthkarNotifEnabled?: boolean;
  wirdNotifEnabled?: boolean;
  dailyGoalAthkar: number;
  dailyGoalQuranPages: number;
}

export interface UserProgress {
  streakDays: number;
  lastActiveDate: string;
  completedAthkarCount: number;
  readQuranVersesCount: number;
  favoriteVerseIds: string[];
  bookmarkedBioIds: string[];
  customAthkar: DhikrItem[];
  customDuas: { id: string; title: string; text: string; dateAdded: string }[];
  prayerLogs: Record<string, boolean>; // '2026-08-06-fajr': true
}

export interface SearchResult {
  id: string;
  type: 'verse' | 'dhikr' | 'biography' | 'dua';
  title: string;
  subtitle: string;
  snippet: string;
  itemData: QuranVerse | DhikrItem | BiographyItem | any;
}
