import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { UserSettings, UserProgress } from '../types';
import { exportBackupJSON, syncToServer, fetchFromServerSync } from '../utils/syncService';

interface SyncAndBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
}

export const SyncAndBackupModal: React.FC<SyncAndBackupModalProps> = ({
  isOpen,
  onClose,
  settings,
  progress,
  onUpdateSettings,
  onUpdateProgress
}) => {
  if (!isOpen) return null;

  const [inputSyncCode, setInputSyncCode] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(settings.syncCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleManualBackupExport = () => {
    exportBackupJSON(settings, progress);
    const updatedSettings = { ...settings, lastBackupDate: new Date().toISOString() };
    onUpdateSettings(updatedSettings);
  };

  const handleFileUploadRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && parsed.progress) {
          onUpdateSettings(parsed.settings);
          onUpdateProgress(parsed.progress);
          setSyncStatusMsg('تم استرجاع النسخة الاحتياطية بنجاح!');
        } else {
          setSyncStatusMsg('ملف غير صالح، يرجى اختيار ملف نسخة احتسابية صحيح');
        }
      } catch (err) {
        setSyncStatusMsg('حدث خطأ أثناء قراءة الملف');
      }
    };
    reader.readAsText(file);
  };

  const handlePushCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('جاري الرفع إلى السيرفر للمزامنة...');
    const result = await syncToServer(settings.syncCode, settings, progress);
    setIsSyncing(false);
    setSyncStatusMsg(result.message);
  };

  const handlePullCloudSync = async () => {
    if (!inputSyncCode.trim()) {
      setSyncStatusMsg('يرجى كتابة رمز المزامنة المكون من 6 أرقام');
      return;
    }
    setIsSyncing(true);
    setSyncStatusMsg('جاري جلب البيانات من الجهاز الآخر...');
    const result = await fetchFromServerSync(inputSyncCode.trim());
    setIsSyncing(false);
    if (result.success && result.settings && result.progress) {
      onUpdateSettings(result.settings);
      onUpdateProgress(result.progress);
      setSyncStatusMsg('تمت مزامنة البيانات واسترجاع تقدمك الشخصي بنجاح!');
    } else {
      setSyncStatusMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden space-y-5 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-amiri text-teal-400 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-teal-400" />
            مزامنة البيانات بين الأجهزة والنسخ الاحتياطي
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Code Box */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-teal-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-400" />
              رمز المزامنة الخاص بك (Sync Code):
            </span>
            <button
              onClick={handleCopySyncCode}
              className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 font-bold flex items-center gap-1 transition-colors"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{codeCopied ? 'تم النسخ' : 'نسخ الرمز'}</span>
            </button>
          </div>

          <div className="text-2xl font-extrabold font-mono text-center tracking-widest text-teal-300 py-1 bg-slate-900 rounded-lg border border-slate-700">
            {settings.syncCode}
          </div>

          <p className="text-[11px] text-slate-400">
            استخدم هذا الرمز لنقل أو مزامنة إنجازك وأذكارك وآياتك المفضلة على أي هاتف أو حاسوب آخر.
          </p>

          <button
            onClick={handlePushCloudSync}
            disabled={isSyncing}
            className="w-full py-2 mt-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>حفظ نسخة فورية على السيرفر سحابياً</span>
          </button>
        </div>

        {/* Pull Sync from Another Device */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-semibold">
            ربط ومزامنة من جهاز آخر بواسطة الرمز:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputSyncCode}
              onChange={(e) => setInputSyncCode(e.target.value)}
              placeholder="أدخل رمز المزامنة المكون من 6 أرقام..."
              className="w-full p-2.5 bg-slate-800 text-slate-100 rounded-xl border border-slate-700 font-mono text-center focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handlePullCloudSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-semibold shrink-0"
            >
              جلب وتطبيق
            </button>
          </div>
        </div>

        {/* File Backup & Restore */}
        <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-slate-200">النسخ الاحتياطي التلقائي (ملف JSON):</h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleManualBackupExport}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تحميل نسخة احتياطية</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>استرجاع من ملف</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUploadRestore}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>آخر نسخة احتسابية:</span>
            <span className="font-mono text-slate-300">
              {settings.lastBackupDate 
                ? new Date(settings.lastBackupDate).toLocaleDateString('ar-EG')
                : 'اليوم تلقائياً'}
            </span>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium animate-fadeIn">
            {syncStatusMsg}
          </div>
        )}

      </div>
    </div>
  );
};
