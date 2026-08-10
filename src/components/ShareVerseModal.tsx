import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Palette, 
  Type,
  Send
} from 'lucide-react';
import { QuranVerse } from '../types';
import { downloadCardCanvas } from '../utils/cardExport';

interface ShareVerseModalProps {
  verse: QuranVerse | null;
  onClose: () => void;
}

export const ShareVerseModal: React.FC<ShareVerseModalProps> = ({
  verse,
  onClose
}) => {
  if (!verse) return null;

  const [copied, setCopied] = useState(false);
  const [bgStyle, setBgStyle] = useState<'emerald' | 'night' | 'gold' | 'sepia'>('emerald');
  const [fontFamily, setFontFamily] = useState<'amiri' | 'cairo'>('amiri');

  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `﴿ ${verse.arabicText} ﴾
[سورة ${verse.surahName} - الآية ${verse.verseNumber}]

"${verse.tafsirShort}"

تمت المشاركة عبر تطبيق نور الهدى - الرفيق الإسلامي`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      if (bgStyle === 'emerald') {
        grad.addColorStop(0, '#022c22');
        grad.addColorStop(0.5, '#115e59');
        grad.addColorStop(1, '#020617');
      } else if (bgStyle === 'night') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
      } else if (bgStyle === 'gold') {
        grad.addColorStop(0, '#451a03');
        grad.addColorStop(0.5, '#292524');
        grad.addColorStop(1, '#020617');
      } else {
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#292524');
        grad.addColorStop(1, '#0c0a09');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 8;
      ctx.strokeRect(60, 60, 960, 960);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 28px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText(`تطبيق تسبيح - سورة ${verse.surahName} [آية ${verse.verseNumber}]`, 540, 150);

      const verseText = `﴿ ${verse.arabicText} ﴾`;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 42px ${fontFamily === 'amiri' ? 'Amiri, serif' : 'Cairo, sans-serif'}`;

      const maxW = 860;
      const words = verseText.split(' ');
      const lines: string[] = [];
      let line = words[0];
      for (let i = 1; i < words.length; i++) {
        const test = line + ' ' + words[i];
        if (ctx.measureText(test).width > maxW) {
          lines.push(line);
          line = words[i];
        } else {
          line = test;
        }
      }
      lines.push(line);

      const lh = 70;
      const startY = 540 - (lines.length * lh) / 2;
      lines.forEach((l, idx) => {
        ctx.fillText(l, 540, startY + idx * lh);
      });

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '26px Tajawal, sans-serif';
      ctx.fillText(`"${verse.tafsirShort}"`, 540, 880);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px Cairo, sans-serif';
      ctx.fillText('صدق الله العظيم', 540, 960);

      await downloadCardCanvas(canvas, `verse-${verse.surahName}-${verse.verseNumber}.png`);
    } catch (e) {
      console.error('Verse card download error:', e);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleShareTwitter = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  };

  // Background styling mapping
  const getBgClasses = () => {
    switch (bgStyle) {
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 border-emerald-500/50 text-emerald-100';
      case 'night':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/50 text-indigo-100';
      case 'gold':
        return 'bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950 border-amber-500/50 text-amber-100';
      case 'sepia':
        return 'bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 border-amber-600/40 text-amber-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-amiri text-emerald-400 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            مشاركة الآية كبطاقة إسلامية مميزة
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Color Themes */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">النمط:</span>
            <button
              onClick={() => setBgStyle('emerald')}
              className={`w-6 h-6 rounded-full bg-emerald-800 border-2 ${bgStyle === 'emerald' ? 'border-amber-300 scale-110' : 'border-transparent'}`}
              title="زمردي"
            />
            <button
              onClick={() => setBgStyle('night')}
              className={`w-6 h-6 rounded-full bg-indigo-900 border-2 ${bgStyle === 'night' ? 'border-amber-300 scale-110' : 'border-transparent'}`}
              title="ليلي"
            />
            <button
              onClick={() => setBgStyle('gold')}
              className={`w-6 h-6 rounded-full bg-amber-800 border-2 ${bgStyle === 'gold' ? 'border-amber-300 scale-110' : 'border-transparent'}`}
              title="ذهبي"
            />
            <button
              onClick={() => setBgStyle('sepia')}
              className={`w-6 h-6 rounded-full bg-stone-700 border-2 ${bgStyle === 'sepia' ? 'border-amber-300 scale-110' : 'border-transparent'}`}
              title="دافئ"
            />
          </div>

          {/* Font selection */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setFontFamily('amiri')}
              className={`px-2 py-1 rounded text-[11px] font-amiri ${fontFamily === 'amiri' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
            >
              الخط الأندلسي
            </button>
            <button
              onClick={() => setFontFamily('cairo')}
              className={`px-2 py-1 rounded text-[11px] font-cairo ${fontFamily === 'cairo' ? 'bg-emerald-600 text-white' : 'text-slate-300'}`}
            >
              الخط الحديث
            </button>
          </div>
        </div>

        {/* Generated Share Card Preview */}
        <div
          ref={cardRef}
          className={`relative p-6 sm:p-8 rounded-2xl border shadow-xl space-y-4 text-center ${getBgClasses()} transition-all`}
        >
          <div className="flex items-center justify-between text-[11px] opacity-80">
            <span className="font-semibold">تطبيق نور الهدى</span>
            <span>سورة {verse.surahName} : {verse.verseNumber}</span>
          </div>

          <div className="py-2">
            <p className={`text-xl sm:text-2xl leading-relaxed font-semibold ${fontFamily === 'amiri' ? 'font-amiri' : 'font-cairo'}`}>
              ﴿ {verse.arabicText} ﴾
            </p>
          </div>

          <p className="text-xs opacity-90 font-tajawal max-w-sm mx-auto">
            "{verse.tafsirShort}"
          </p>

          <div className="pt-2 text-[10px] opacity-60 flex items-center justify-center gap-1 font-cairo">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>صدق الله العظيم</span>
          </div>
        </div>

        {/* Share Action Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          
          <button
            onClick={handleDownloadCard}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-950/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل البطاقة</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium shadow-md shadow-emerald-950/30 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>واتساب</span>
          </button>

          <button
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>تويتر / X</span>
          </button>

        </div>

      </div>
    </div>
  );
};
