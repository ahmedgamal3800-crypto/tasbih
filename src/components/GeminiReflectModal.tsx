import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  BookOpen, 
  HeartHandshake, 
  Loader2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { QuranVerse } from '../types';

interface GeminiReflectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVerse?: QuranVerse | null;
}

export const GeminiReflectModal: React.FC<GeminiReflectModalProps> = ({
  isOpen,
  onClose,
  initialVerse
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState(
    initialVerse 
      ? `ارغب في تدبر الآية الكريمة: "﴿ ${initialVerse.arabicText} ﴾" [سورة ${initialVerse.surahName}]. أعطني إلهاماً روحياً وعملياً أطبقه في حياتي اليومية.`
      : ''
  );

  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const quickPrompts = [
    'كيف أحافظ على الخشوع وحضور القلب في صلاتي؟',
    'دعاء مبارك للتيسير وراحة البال وانشراح الصدر',
    'كيف استثمر وقتي في الاستغفار والذكر اليومي؟',
    'نصيحة لإعانة النفس على التوبة والصبر عند الابتلاء'
  ];

  const handleSendQuery = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setResponse(data.text);
      } else {
        setResponse(data.error || 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.');
      }
    } catch (e) {
      setResponse('تعذر الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-amiri text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            الموجه الروحي وتدبر القرآن
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input Box */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-300 font-semibold">
            اكتب سؤالك أو الآية التي ترغب في تدبرها والاسترشاد بها:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب هنا ما يشغل بالك، أو اطلب دعاء مخصصاً لحالتك الروحية..."
              className="w-full p-3 bg-slate-800 text-slate-100 placeholder-slate-400 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={loading || !prompt.trim()}
              className="absolute left-2 bottom-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>إرسال</span>
            </button>
          </div>
        </div>

        {/* Quick Prompts Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleSendQuery(p);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 transition-colors shrink-0"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Response Box */}
        <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[300px] p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-8">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <p className="text-xs">جاري إعداد التوجيه الروحي والموعظة الحسنة...</p>
            </div>
          ) : response ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span>التوجيه والتدبر:</span>
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-tajawal whitespace-pre-line">
                {response}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8 text-center space-y-1">
              <HeartHandshake className="w-8 h-8 text-emerald-500/30" />
              <p className="text-xs">الموجه الروحي جاهز للإجابة وتأمل الآيات بأسلوب مطمئن للقلب</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
