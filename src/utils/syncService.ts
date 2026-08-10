import { UserSettings, UserProgress } from '../types';

const SETTINGS_KEY = 'noor_huda_user_settings_v1';
const PROGRESS_KEY = 'noor_huda_user_progress_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'emerald',
  fontSize: 'md',
  city: 'القاهرة',
  country: 'مصر',
  calculationMethod: 'egyptian',
  athanSoundEnabled: true,
  athanVoice: 'cairo',
  autoAthanEnabled: true,
  prePrayerAudioReminder: true,
  postPrayerAudioAthkar: false,
  periodicAudioAthkar: true,
  periodicAudioIntervalMinutes: 60,
  prayerManualOffsetMinutes: 0,
  perPrayerOffsets: {},
  autoSyncEnabled: true,
  syncCode: generateRandomSyncCode(),
  notificationsEnabled: true,
  morningAthkarTime: '06:30',
  eveningAthkarTime: '17:00',
  wirdTime: '21:00',
  morningAthkarNotifEnabled: true,
  eveningAthkarNotifEnabled: true,
  wirdNotifEnabled: true,
  dailyGoalAthkar: 100,
  dailyGoalQuranPages: 5,
  lastBackupDate: new Date().toISOString()
};

export const DEFAULT_PROGRESS: UserProgress = {
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedAthkarCount: 0,
  readQuranVersesCount: 0,
  favoriteVerseIds: ['v1', 'v2', 'v3', 'v5', 'v7', 'v8', 'v10'],
  bookmarkedBioIds: ['prophet-muhammad', 'mother-khadijah', 'sahabi-abu-bakr'],
  customAthkar: [],
  customDuas: [
    {
      id: 'd1',
      title: 'دعاء صلاح القلب والذرية',
      text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي.',
      dateAdded: new Date().toISOString()
    }
  ],
  prayerLogs: {}
};

export function generateRandomSyncCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function loadLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadLocalProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const loaded = JSON.parse(raw);
    
    // Check and update daily streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (loaded.lastActiveDate !== todayStr) {
      const lastActive = new Date(loaded.lastActiveDate);
      const todayDate = new Date(todayStr);
      const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        loaded.streakDays = (loaded.streakDays || 1) + 1;
      } else if (diffDays > 1) {
        loaded.streakDays = 1;
      }
      loaded.lastActiveDate = todayStr;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(loaded));
    }

    return { ...DEFAULT_PROGRESS, ...loaded };
  } catch (e) {
    return DEFAULT_PROGRESS;
  }
}

export function saveLocalProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

// Automatic JSON Backup File Generator
export function exportBackupJSON(settings: UserSettings, progress: UserProgress): void {
  const backupData = {
    appName: 'NoorAlHudaApp',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    progress
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `noor_al_huda_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Server Cloud Sync API Calls
export async function syncToServer(syncCode: string, settings: UserSettings, progress: UserProgress): Promise<{ success: boolean, message: string }> {
  try {
    const res = await fetch('/api/sync/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncCode, settings, progress })
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return { success: true, message: data.message || 'تمت المزامنة بنجاح' };
  } catch (e) {
    return { success: false, message: 'فشلت المزامنة عبر السيرفر. تم الحفظ محلياً.' };
  }
}

export async function fetchFromServerSync(syncCode: string): Promise<{ success: boolean, settings?: UserSettings, progress?: UserProgress, message: string }> {
  try {
    const res = await fetch(`/api/sync/load/${syncCode}`);
    if (!res.ok) {
      return { success: false, message: 'رمز المزامنة غير موجود أو انتهت صلاحيته' };
    }
    const data = await res.json();
    return { success: true, settings: data.settings, progress: data.progress, message: 'تم استرجاع البيانات بنجاح' };
  } catch (e) {
    return { success: false, message: 'حدث خطأ أثناء الاتصال بالخادم' };
  }
}
