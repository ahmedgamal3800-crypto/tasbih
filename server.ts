import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory store for sync codes (in production, persists to cloud storage)
const syncDatabase: Record<string, { settings: any; progress: any; updatedAt: string }> = {};

// --- API Endpoints ---

// 1. Sync Save Route
app.post('/api/sync/save', (req, res) => {
  const { syncCode, settings, progress } = req.body;
  if (!syncCode) {
    return res.status(400).json({ error: 'Sync code is required' });
  }

  syncDatabase[syncCode] = {
    settings,
    progress,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: `تم حفظ النسخة التلقائية بنجاح بالرمز ${syncCode}`,
    updatedAt: syncDatabase[syncCode].updatedAt
  });
});

// 2. Sync Load Route
app.get('/api/sync/load/:syncCode', (req, res) => {
  const { syncCode } = req.params;
  const found = syncDatabase[syncCode];

  if (!found) {
    return res.status(404).json({ error: 'رمز المزامنة غير صالح أو لم يتم العثور على بيانات' });
  }

  res.json({
    success: true,
    settings: found.settings,
    progress: found.progress,
    updatedAt: found.updatedAt
  });
});

// 3. Gemini Spiritual Reflection & Islamic Assistant Endpoint
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير مهيأ. يرجى إضافته في الإعدادات.'
      });
    }

    const { prompt, contextType } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `أنت مساعد إسلامي وموجه روحي حكيم ولطيف وناصح بالأخلاق الإسلامية العالية في تطبيق "نور الهدى".
    أجب باللغة العربية الفصحى السلسة والمريحة مع الاستشهاد بالقرآن الكريم والسنة النبوية بأسلوب مقتضب وملهم ومطمئن للقلب.
    إذا طلبت نصيحة أو دعاء أو شرح آية، قدّم إجابة مباشرة بجمال الأسلوب ونقاء القول دون إطالة مفرطة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي: ' + (error.message || 'خطأ غير معروف')
    });
  }
});

// --- Vite Middleware / Static Server ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
