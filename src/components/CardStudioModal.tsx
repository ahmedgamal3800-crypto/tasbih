import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Type, 
  Layout, 
  Check, 
  Image as ImageIcon,
  Share2,
  Copy,
  Download
} from 'lucide-react';
import { downloadCardCanvas, shareCardCanvas } from '../utils/cardExport';

export interface CardStudioData {
  text: string;
  source: string; // e.g. "سورة البقرة - آية 255" or "أذكار الصباح"
  category?: string;
}

interface CardStudioModalProps {
  initialData?: CardStudioData | null;
  onClose: () => void;
}

export interface CardBackgroundOption {
  id: string;
  nameAr: string;
  bgClass: string;
  canvasBg: string | { type: 'gradient'; colors: string[] };
  textColorDefault: string;
  borderColor: string;
}

export const BACKGROUND_OPTIONS: CardBackgroundOption[] = [
  {
    id: 'royal_emerald',
    nameAr: 'زمردي ملكي',
    bgClass: 'bg-gradient-to-br from-[#0F2419] via-[#1A3A2A] to-[#0A1A12] text-[#E8D28B] border-[#4A6354]',
    canvasBg: { type: 'gradient', colors: ['#0F2419', '#1A3A2A', '#0A1A12'] },
    textColorDefault: '#E8D28B',
    borderColor: '#4A6354'
  },
  {
    id: 'midnight_sky',
    nameAr: 'ليلة القدر',
    bgClass: 'bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-[#E4E9E6] border-[#3A506B]',
    canvasBg: { type: 'gradient', colors: ['#0B132B', '#1C2541', '#0B132B'] },
    textColorDefault: '#E4E9E6',
    borderColor: '#3A506B'
  },
  {
    id: 'golden_sand',
    nameAr: 'رخام ذهبي',
    bgClass: 'bg-gradient-to-br from-[#2C2219] via-[#3D3023] to-[#1F1710] text-[#F3C68F] border-[#6B533A]',
    canvasBg: { type: 'gradient', colors: ['#2C2219', '#3D3023', '#1F1710'] },
    textColorDefault: '#F3C68F',
    borderColor: '#6B533A'
  },
  {
    id: 'forest_calm',
    nameAr: 'غابة السكينة',
    bgClass: 'bg-[#1A2520] text-[#A7C0A8] border-[#2D4539]',
    canvasBg: '#1A2520',
    textColorDefault: '#A7C0A8',
    borderColor: '#2D4539'
  },
  {
    id: 'islamic_pattern',
    nameAr: 'زخرفة إسلامية',
    bgClass: 'bg-gradient-to-tr from-[#0F1713] via-[#14231B] to-[#1A2D22] text-[#E8D28B] border-[#2D4539]',
    canvasBg: { type: 'gradient', colors: ['#0F1713', '#14231B', '#1A2D22'] },
    textColorDefault: '#E8D28B',
    borderColor: '#2D4539'
  },
  {
    id: 'makkah_sunrise',
    nameAr: 'فجر مكة',
    bgClass: 'bg-gradient-to-br from-[#3D2612] via-[#59391B] to-[#26170A] text-[#FFDFB0] border-[#8C5D30]',
    canvasBg: { type: 'gradient', colors: ['#3D2612', '#59391B', '#26170A'] },
    textColorDefault: '#FFDFB0',
    borderColor: '#8C5D30'
  },
  {
    id: 'dark_velvet',
    nameAr: 'مخمل ناصع',
    bgClass: 'bg-[#0E1A14] text-[#E4E9E6] border-[#203D2F]',
    canvasBg: '#0E1A14',
    textColorDefault: '#E4E9E6',
    borderColor: '#203D2F'
  },
  {
    id: 'twilight_sky',
    nameAr: 'شفق الروح',
    bgClass: 'bg-gradient-to-br from-[#18132B] via-[#2A1E3D] to-[#110D20] text-[#E2D4F0] border-[#4A3866]',
    canvasBg: { type: 'gradient', colors: ['#18132B', '#2A1E3D', '#110D20'] },
    textColorDefault: '#E2D4F0',
    borderColor: '#4A3866'
  },
  {
    id: 'vintage_parchment',
    nameAr: 'ورق عتيق',
    bgClass: 'bg-[#211E19] text-[#D8C7A5] border-[#423C32]',
    canvasBg: '#211E19',
    textColorDefault: '#D8C7A5',
    borderColor: '#423C32'
  },
  {
    id: 'dark_charcoal',
    nameAr: 'بساطة فحمية',
    bgClass: 'bg-[#0F1713] text-[#A7C0A8] border-[#2A352F]',
    canvasBg: '#0F1713',
    textColorDefault: '#A7C0A8',
    borderColor: '#2A352F'
  }
];

export const FONT_OPTIONS = [
  { id: 'font-amiri', nameAr: 'خط الأميري', fontFamily: 'Amiri, Traditional Arabic, serif' },
  { id: 'font-cairo', nameAr: 'خط القاهرة', fontFamily: 'Cairo, sans-serif' },
  { id: 'font-tajawal', nameAr: 'خط تجول', fontFamily: 'Tajawal, sans-serif' },
  { id: 'font-serif', nameAr: 'خط الرقعة والكوفي', fontFamily: 'serif' }
];

export const FONT_SIZES = [
  { id: 'sm', label: 'صغير', class: 'text-lg', canvasPx: 26 },
  { id: 'md', label: 'متوسط', class: 'text-2xl', canvasPx: 34 },
  { id: 'lg', label: 'كبير', class: 'text-3xl', canvasPx: 42 },
  { id: 'xl', label: 'كبير جداً', class: 'text-4xl', canvasPx: 52 }
];

export const TEXT_COLORS = [
  { id: 'gold', hex: '#E8D28B', label: 'ذهب إبريز' },
  { id: 'white', hex: '#FFFFFF', label: 'أبيض ناصع' },
  { id: 'cream', hex: '#F5EBE0', label: 'عاجي دافئ' },
  { id: 'emerald', hex: '#A7C0A8', label: 'زمردي هادئ' },
  { id: 'amber', hex: '#F3C68F', label: 'عنبري' },
  { id: 'silver', hex: '#E4E9E6', label: 'فضي مشرق' }
];

export const CardStudioModal: React.FC<CardStudioModalProps> = ({
  initialData,
  onClose
}) => {
  const [cardText, setCardText] = useState(
    initialData?.text || 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ'
  );
  const [cardSource, setCardSource] = useState(
    initialData?.source || 'سورة البقرة - آية 255'
  );

  const [selectedBgId, setSelectedBgId] = useState<string>('royal_emerald');
  const [selectedFont, setSelectedFont] = useState<string>('font-amiri');
  const [selectedFontSize, setSelectedFontSize] = useState<string>('md');
  const [selectedTextColorHex, setSelectedTextColorHex] = useState<string>('#E8D28B');
  const [showFrame, setShowFrame] = useState<boolean>(true);
  const [useBrackets, setUseBrackets] = useState<boolean>(true);

  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [liveCardDataUrl, setLiveCardDataUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const currentBg = BACKGROUND_OPTIONS.find(b => b.id === selectedBgId) || BACKGROUND_OPTIONS[0];
  const currentFontObj = FONT_OPTIONS.find(f => f.id === selectedFont) || FONT_OPTIONS[0];
  const currentSizeObj = FONT_SIZES.find(s => s.id === selectedFontSize) || FONT_SIZES[1];

  // Sync live image data URL whenever card design parameters change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const canvas = generateCardCanvas();
        if (canvas) {
          setLiveCardDataUrl(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        console.warn('Error generating live card image:', e);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [
    cardText,
    cardSource,
    selectedBgId,
    selectedFont,
    selectedFontSize,
    selectedTextColorHex,
    showFrame,
    useBrackets
  ]);

  const handleCopyText = () => {
    const fullContent = `${useBrackets ? `﴿ ${cardText} ﴾` : cardText}\n\n— ${cardSource}\nتمت المشاركة عبر تطبيق تسبيح الرفيق الإسلامي`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to build 1080x1080 high-res card canvas
  const generateCardCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw background
    if (typeof currentBg.canvasBg === 'string') {
      ctx.fillStyle = currentBg.canvasBg;
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      currentBg.canvasBg.colors.forEach((col, idx) => {
        grad.addColorStop(idx / (currentBg.canvasBg as any).colors.length, col);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw Decorative Frame
    if (showFrame) {
      ctx.strokeStyle = currentBg.borderColor;
      ctx.lineWidth = 12;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      ctx.lineWidth = 2;
      ctx.strokeRect(75, 75, width - 150, height - 150);

      // Ornate Corners
      const cornerSize = 40;
      ctx.fillStyle = selectedTextColorHex;
      // Top Left
      ctx.fillRect(80, 80, cornerSize, 6);
      ctx.fillRect(80, 80, 6, cornerSize);
      // Top Right
      ctx.fillRect(width - 80 - cornerSize, 80, cornerSize, 6);
      ctx.fillRect(width - 86, 80, 6, cornerSize);
      // Bottom Left
      ctx.fillRect(80, height - 86, cornerSize, 6);
      ctx.fillRect(80, height - 80 - cornerSize, 6, cornerSize);
      // Bottom Right
      ctx.fillRect(width - 80 - cornerSize, height - 86, cornerSize, 6);
      ctx.fillRect(width - 86, height - 80 - cornerSize, 6, cornerSize);
    }

    // Header App Stamp
    ctx.fillStyle = '#A7C0A8';
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('تطبيق تسبيح - الرفيق الإسلامي', width / 2, 140);

    // Main Text Wrap
    const textToRender = useBrackets ? `﴿ ${cardText} ﴾` : cardText;
    const fontSizePx = currentSizeObj.canvasPx * 1.35;
    ctx.font = `bold ${fontSizePx}px ${currentFontObj.fontFamily}`;
    ctx.fillStyle = selectedTextColorHex;
    ctx.textAlign = 'center';

    const maxTextWidth = width - 240;
    const words = textToRender.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw Lines centered vertically
    const lineHeight = fontSizePx * 1.6;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + (fontSizePx / 2);

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Draw Source Badge
    ctx.fillStyle = '#8BA491';
    ctx.font = '28px Cairo, Tajawal, sans-serif';
    ctx.fillText(`— ${cardSource}`, width / 2, height - 160);

    // Watermark footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '20px sans-serif';
    ctx.fillText('تصميم بطاقة دعوية • tasbeeh.app', width / 2, height - 90);

    return canvas;
  };

  // Download Card as PNG Image (Works in Web Browser and Android Capacitor APK)
  const handleDownloadCard = async () => {
    setIsExporting(true);
    try {
      const canvas = generateCardCanvas();
      if (canvas) {
        await downloadCardCanvas(canvas, `tasbeeh-card-${Date.now()}.png`);
      }
    } catch (err) {
      console.error('Download card error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Native Share Sheet (Works seamlessly in Android APK / Capacitor / WebViews / Mobile)
  const handleShareNative = async () => {
    setIsExporting(true);
    try {
      const canvas = generateCardCanvas();
      if (canvas) {
        const textToShare = useBrackets ? `﴿ ${cardText} ﴾` : cardText;
        await shareCardCanvas(canvas, textToShare, cardSource);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Open direct full-resolution image view modal for mobile/APK long-press saving
  const handleOpenApkPreview = () => {
    const canvas = generateCardCanvas();
    if (canvas) {
      setPreviewImageModal(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#141C18] border border-[#2D4539] rounded-3xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A352F] flex items-center justify-between bg-[#1A2520] sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D4539] border border-[#4A6354] flex items-center justify-center text-[#A7C0A8]">
              <Sparkles className="w-5 h-5 text-[#A7C0A8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-amiri text-[#E4E9E6]">
                أستوديو تصميم وبناء البطاقات الدعوية والقرآنية
              </h3>
              <p className="text-xs text-[#8BA491] hidden sm:block">
                صمّم بطاقتك بـ 10 خلفيات عريقة، اختر الخط ولون النقاء، وحمّلها بصيغة صورة عالية الدقة.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141C18] text-[#8BA491] hover:text-[#E4E9E6] hover:bg-[#2D4539] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Editor & Live Canvas Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Column (Left on desktop, 5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-right">
            
            {/* Input Card Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A7C0A8] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#A7C0A8]" />
                <span>نص الآية الكريمة أو الذكر:</span>
              </label>
              <textarea
                value={cardText}
                onChange={(e) => setCardText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-2xl bg-[#0F1713] text-[#E4E9E6] border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354] font-amiri leading-relaxed"
                placeholder="اكتب النص القرآني أو الدعاء هنا..."
              />
            </div>

            {/* Input Card Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#A7C0A8] flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-[#A7C0A8]" />
                <span>المصدر / السورة والآية:</span>
              </label>
              <input
                type="text"
                value={cardSource}
                onChange={(e) => setCardSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F1713] text-[#E4E9E6] border border-[#2A352F] text-xs focus:outline-none focus:border-[#4A6354]"
                placeholder="مثال: سورة البقرة - آية 255"
              />
            </div>

            {/* Background Image/Style Chooser (10 Options) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#A7C0A8] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#A7C0A8]" />
                  <span>اختر الخلفية (10 تصاميم عريقة):</span>
                </label>
                <span className="text-[10px] text-[#8BA491]">{currentBg.nameAr}</span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-[#0F1713] rounded-2xl border border-[#2A352F]">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBgId(bg.id);
                      setSelectedTextColorHex(bg.textColorDefault);
                    }}
                    title={bg.nameAr}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all ${bg.bgClass} ${
                      selectedBgId === bg.id ? 'ring-2 ring-[#A7C0A8] scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[9px] font-bold truncate px-1">{bg.nameAr}</span>
                    {selectedBgId === bg.id && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#A7C0A8] text-[#0F1713] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A7C0A8] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#A7C0A8]" />
                <span>اختر نوع الخط العربي:</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-2 rounded-xl text-xs border transition-all ${
                      selectedFont === font.id
                        ? 'bg-[#2D4539] text-[#E4E9E6] border-[#4A6354] font-bold'
                        : 'bg-[#0F1713] text-[#8BA491] border-[#2A352F] hover:bg-[#1A2520]'
                    }`}
                  >
                    <span className={font.id}>{font.nameAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Color */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A7C0A8]">حجم الخط:</label>
                <div className="flex items-center gap-1 bg-[#0F1713] p-1 rounded-xl border border-[#2A352F]">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedFontSize(size.id)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        selectedFontSize === size.id
                          ? 'bg-[#2D4539] text-[#E4E9E6]'
                          : 'text-[#8BA491] hover:text-[#E4E9E6]'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color Swatches */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#A7C0A8]">لون الكلمات:</label>
                <div className="flex items-center justify-between gap-1 bg-[#0F1713] p-1.5 rounded-xl border border-[#2A352F]">
                  {TEXT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelectedTextColorHex(col.hex)}
                      title={col.label}
                      style={{ backgroundColor: col.hex }}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        selectedTextColorHex === col.hex ? 'ring-2 ring-[#A7C0A8] scale-110' : 'border-[#2A352F]'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Frames & Brackets Toggles */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2A352F] text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#8BA491]">
                <input
                  type="checkbox"
                  checked={showFrame}
                  onChange={(e) => setShowFrame(e.target.checked)}
                  className="rounded bg-[#0F1713] border-[#2A352F] text-[#2D4539] focus:ring-0"
                />
                <span>إضافة إطار وزخرفة زوايا</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#8BA491]">
                <input
                  type="checkbox"
                  checked={useBrackets}
                  onChange={(e) => setUseBrackets(e.target.checked)}
                  className="rounded bg-[#0F1713] border-[#2A352F] text-[#2D4539] focus:ring-0"
                />
                <span>أقواس قرآنية ﴿ ﴾</span>
              </label>
            </div>

          </div>

          {/* Card Live Preview & Download Column (Right on desktop, 7 cols) */}
          <div className="lg:col-span-7 space-y-3 flex flex-col items-center justify-center">
            
            <div className="flex items-center justify-between w-full max-w-md px-1 text-xs">
              <span className="text-[#8BA491] font-semibold">المعاينة المباشرة للبطاقة:</span>
              <span className="text-[11px] text-[#E8D28B] font-bold flex items-center gap-1 bg-[#1A2520] px-2.5 py-1 rounded-lg border border-[#2D4539]">
                <span>💡 وضع الضغط المطول مفعل</span>
              </span>
            </div>

            {/* Live Visual Card Container */}
            <div 
              ref={cardRef}
              className={`w-full max-w-md aspect-square rounded-3xl p-8 border shadow-2xl relative flex flex-col justify-between items-center text-center transition-all ${currentBg.bgClass} overflow-hidden group touch-auto`}
            >
              
              {/* Frame Lines overlay if enabled */}
              {showFrame && (
                <>
                  <div className="absolute inset-4 border-2 border-current opacity-30 rounded-2xl pointer-events-none" />
                  <div className="absolute inset-6 border border-current opacity-20 rounded-xl pointer-events-none" />
                </>
              )}

              {/* Top Branding Stamp */}
              <div className="relative z-10 pt-2 flex items-center gap-2 text-xs font-bold font-cairo opacity-80">
                <Sparkles className="w-4 h-4 text-current" />
                <span>تطبيق تسبيح - الرفيق الإسلامي</span>
              </div>

              {/* Center Verse/Dhikr Text */}
              <div className="relative z-10 my-auto px-4">
                <p 
                  style={{ color: selectedTextColorHex }}
                  className={`leading-relaxed font-bold ${selectedFont} ${currentSizeObj.class}`}
                >
                  {useBrackets ? `﴿ ${cardText} ﴾` : cardText}
                </p>
              </div>

              {/* Bottom Source & Footer */}
              <div className="relative z-10 pb-2 space-y-1">
                <p className="text-sm font-semibold font-cairo opacity-90">
                  — {cardSource}
                </p>
                <p className="text-[10px] opacity-60">
                  تصميم بطاقة دعوية • tasbeeh.app
                </p>
              </div>

              {/* Fully Visible Native Canvas Image Overlay for Direct APK Long-Press Saving */}
              {liveCardDataUrl && (
                <img
                  src={liveCardDataUrl}
                  alt="البطاقة الدعوية - اضغط مطولاً للحفظ"
                  className="absolute inset-0 w-full h-full object-contain rounded-3xl z-30 cursor-pointer touch-auto opacity-100 transition-opacity"
                  title="اضغط مطولاً على الصورة لحفظها مباشرة في المعرض"
                />
              )}

            </div>

            {/* Instructions Banner for APK / Mobile Users */}
            <div className="w-full max-w-md p-3 bg-[#1A2520] border border-[#2D4539] rounded-2xl text-center space-y-0.5">
              <p className="text-xs font-bold text-[#E8D28B] flex items-center justify-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#A7C0A8]" />
                <span>طريقة التنزيل: اضغط مطولاً (Long Press) على الصورة أعلاه</span>
              </p>
              <p className="text-[11px] text-[#8BA491]">
                عند الضغط المطول تظهر لك قائمة الهاتف لاختيار <strong className="text-[#A7C0A8]">"حفظ الصورة"</strong> أو <strong className="text-[#A7C0A8]">"تنزيل الصورة"</strong> مباشرة إلى معرض الصور.
              </p>
            </div>

            {/* Action Bar: Download Card, Share, Full Preview, Copy Text */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 w-full max-w-lg pt-1">
              
              <button
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50"
                title="تنزيل البطاقة كصورة عالية الدقة"
              >
                <Download className="w-4 h-4 shrink-0 text-white" />
                <span>{isExporting ? 'جاري المعالجة...' : 'تحميل البطاقة'}</span>
              </button>

              <button
                onClick={handleShareNative}
                disabled={isExporting}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                title="مشاركة الصورة عبر الواتساب وتطبيقات الهاتف"
              >
                <Share2 className="w-4 h-4 text-[#A7C0A8]" />
                <span>مشاركة البطاقة</span>
              </button>

              <button
                onClick={handleOpenApkPreview}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[#1A2520] hover:bg-[#2A352F] border border-[#2D4539] text-[#A7C0A8] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                title="عرض الصورة بملء الشاشة"
              >
                <ImageIcon className="w-4 h-4 text-[#A7C0A8]" />
                <span>شاشة كاملة</span>
              </button>

              <button
                onClick={handleCopyText}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[#141C18] hover:bg-[#1A2520] border border-[#2A352F] text-[#8BA491] hover:text-[#A7C0A8] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                title="نسخ النص مع المصدر"
              >
                {copied ? <Check className="w-4 h-4 text-[#A7C0A8]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* APK / Mobile WebView Full Screen Image View Modal for Long-Press Saving */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#141C18] border border-[#2D4539] rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 text-center max-h-[90vh] overflow-y-auto">
            
            {/* Top Title & Close */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#2A352F]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#A7C0A8]" />
                <h4 className="text-base font-bold font-amiri text-[#E4E9E6]">
                  وضع الحفظ بالضغط المطول
                </h4>
              </div>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1.5 rounded-xl bg-[#1A2520] text-[#8BA491] hover:text-[#E4E9E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Instructions */}
            <div className="w-full p-3 bg-[#1A2520] border border-[#2D4539] rounded-2xl text-xs text-[#A7C0A8] font-tajawal text-right leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1 text-[#E8D28B]">
                <span>💡 اضغط مطولاً على الصورة أدناه:</span>
              </p>
              <p className="text-[#8BA491]">
                اضغط <strong className="text-[#E4E9E6]">مطولاً (Long Press)</strong> على صورة البطاقة واختر <strong className="text-[#A7C0A8]">"حفظ الصورة"</strong> ليتم تنزيلها مباشرة إلى معرض الصور في هاتفك.
              </p>
            </div>

            {/* Rendered Image */}
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden border border-[#4A6354] shadow-xl bg-black/50 relative">
              <img
                src={previewImageModal}
                alt="بطاقة إسلامية - اضغط مطولاً للحفظ"
                className="w-full h-full object-contain touch-auto cursor-pointer"
                title="اضغط مطولاً على الصورة لحفظها مباشرة"
              />
            </div>

            {/* Modal Action Buttons */}
            <div className="w-full flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={handleShareNative}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D4539] hover:bg-[#3D5A4A] border border-[#4A6354] text-[#E4E9E6] font-bold text-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-[#A7C0A8]" />
                <span>مشاركة البطاقة</span>
              </button>

              <button
                onClick={() => setPreviewImageModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1A2520] border border-[#2D4539] text-[#8BA491] hover:text-[#E4E9E6] font-semibold text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
