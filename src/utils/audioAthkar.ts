// Audio Athkar & Automatic Adhan Audio Engine

import { playGentleAudioTone } from './notifications';

export interface PostPrayerDhikr {
  id: string;
  title: string;
  text: string;
  count: number;
}

export const POST_PRAYER_ATHKAR: PostPrayerDhikr[] = [
  {
    id: 'post_1',
    title: 'الاستغفار ثلاثاً',
    text: 'أَسْتَغْفِرُ اللَّهَ ، أَسْتَغْفِرُ اللَّهَ ، أَسْتَغْفِرُ اللَّهَ',
    count: 3
  },
  {
    id: 'post_2',
    title: 'دعاء السلام',
    text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ ، تَبَارَكْتَ ذَا الْجَلَالِ وَالْإِكْرَامِ',
    count: 1
  },
  {
    id: 'post_3',
    title: 'التوحيد والثناء',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ . اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    count: 1
  },
  {
    id: 'post_4',
    title: 'التسبيح والتحميد والتكبير',
    text: 'سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَاللَّهُ أَكْبَرُ',
    count: 33
  },
  {
    id: 'post_5',
    title: 'تمام المائة',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 1
  },
  {
    id: 'post_6',
    title: 'آية الكرسي',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    count: 1
  }
];

export const DAILY_PERIODIC_ATHKAR = [
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
  'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
  'سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ',
  'رَضِيتُ بِاللَّهِ رَبًّا ، وَبِالْإِسْلَامِ دِينًا ، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
  'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ'
];

export const PRE_PRAYER_ATHKAR_MESSAGES: Record<string, string> = {
  fajr: 'تذكير بصلاة الفجر: اقترب موعد الأذان، قال ﷺ: ركعتا الفجر خير من الدنيا وما فيها.',
  dhuhr: 'تذكير بصلاة الظهر: اقتربت الصلاة، استعد بالوضوء وتفريغ قلبك للوقوف بين يدي الله.',
  asr: 'تذكير بصلاة العصر: اقتربت الصلاة الوسطى، قال ﷺ: من صلى البردين دخل الجنة.',
  maghrib: 'تذكير بصلاة المغرب: اقترب موعد المغرب، أقبل على ربك بالدعاء المستجاب.',
  isha: 'تذكير بصلاة العشاء: اقتربت الصلاة، اختم يومك بالطاعة والطمأنينة.'
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

let currentSpeechSessionId = 0;

export function stopArabicSpeech(): void {
  currentSpeechSessionId++;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech cancel error:', e);
    }
  }
  currentUtterance = null;
}

export function speakArabicText(
  text: string, 
  onEnd?: () => void, 
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in browser');
    if (typeof onEnd === 'function') onEnd();
    return false;
  }

  // Split into manageable chunks if text is long to prevent Chrome SpeechSynthesis timeout bug
  const maxChunkLength = 140;
  let chunks: string[] = [];

  if (text.length > maxChunkLength) {
    const rawSentences = text.split(/([\.!\؟\n]| - )/);
    let currentChunk = '';
    for (let part of rawSentences) {
      if ((currentChunk + part).length <= maxChunkLength) {
        currentChunk += part;
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = part;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
  } else {
    chunks = [text];
  }

  return speakArabicChunks(chunks, undefined, onEnd, onError);
}

export function speakArabicChunks(
  chunks: string[],
  onChunkChange?: (index: number) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || chunks.length === 0) {
    if (typeof onEnd === 'function') onEnd();
    return false;
  }

  stopArabicSpeech();
  const sessionId = ++currentSpeechSessionId;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    let currentIndex = 0;

    const speakNextChunk = () => {
      if (currentSpeechSessionId !== sessionId) return;

      if (currentIndex >= chunks.length) {
        currentUtterance = null;
        if (typeof onEnd === 'function') onEnd();
        return;
      }

      if (typeof onChunkChange === 'function') onChunkChange(currentIndex);

      const chunkText = chunks[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      currentUtterance = utterance;

      utterance.lang = 'ar-SA';
      utterance.rate = 0.90; // Clear, reverent recitation rate
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = () => {
        if (currentSpeechSessionId !== sessionId) return;
        currentIndex++;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        console.warn('Speech chunk error:', e);
        if (currentSpeechSessionId !== sessionId) return;
        currentIndex++;
        speakNextChunk();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis speak exception:', err);
        if (typeof onError === 'function') onError(err);
        else if (typeof onEnd === 'function') onEnd();
      }
    };

    speakNextChunk();
    return true;
  } catch (e) {
    console.warn('speakArabicChunks exception:', e);
    if (typeof onEnd === 'function') onEnd();
    return false;
  }
}

export interface AdhanVoiceOption {
  id: string;
  nameAr: string;
  countryAr: string;
  reciterAr: string;
  sources: string[];
}

export const ADHAN_VOICE_OPTIONS: AdhanVoiceOption[] = [
  {
    id: 'cairo',
    nameAr: 'أذان القاهرة والجامع الأزهر الشريف',
    countryAr: 'مصر والعالم الإسلامي',
    reciterAr: 'أذان القاهرة والجامع الأزهر الشريف',
    sources: [
      '/audio/adhan_cairo.mp3'
    ]
  }
];

export function getDefaultAthanVoiceForCountry(_countryAr?: string): string {
  return 'cairo';
}

let currentAdhanAudio: HTMLAudioElement | null = null;
let primedAdhanAudio: HTMLAudioElement | null = null;
let isAudioActive = false;
let isAudioUnlocked = false;
let currentPlaybackSessionId = 0;

export function getCairoAdhanUrl(): string {
  const src = '/audio/adhan_cairo.mp3';
  if (typeof window !== 'undefined' && window.location) {
    return new URL(src.startsWith('/') ? src : `/${src}`, window.location.origin).href;
  }
  return src;
}

export function isAdhanCurrentlyPlaying(): boolean {
  if (currentAdhanAudio && !currentAdhanAudio.paused && !currentAdhanAudio.ended) {
    return true;
  }
  return isAudioActive;
}

export function stopAllAdhanAudio(): void {
  // Invalidate any active session immediately so ongoing async chains cancel
  currentPlaybackSessionId++;
  isAudioActive = false;

  // 1. Cancel speech synthesis immediately if active
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech cancel error:', e);
    }
  }
  currentUtterance = null;

  // 2. Stop and reset global Adhan HTMLAudioElement immediately without destroying primed element
  if (currentAdhanAudio) {
    try {
      currentAdhanAudio.pause();
      currentAdhanAudio.currentTime = 0;
    } catch (e) {
      console.warn('Adhan audio stop error:', e);
    }
    if (currentAdhanAudio !== primedAdhanAudio) {
      try {
        currentAdhanAudio.src = '';
        currentAdhanAudio.removeAttribute('src');
      } catch (e) {}
    }
    currentAdhanAudio = null;
  }
}

// Global helper to unlock browser audio policy on user touch/click
export function unlockAudioContext(): void {
  if (typeof window === 'undefined') return;

  const unlockEvents = ['click', 'touchstart', 'pointerdown', 'keydown'];
  
  const unlockHandler = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }

      // Prime Adhan Audio Element on user interaction
      if (!primedAdhanAudio) {
        const url = getCairoAdhanUrl();
        const primed = new Audio(url);
        primed.preload = 'auto';
        primed.load();
        primedAdhanAudio = primed;
      }

      // Play a silent audio buffer to unlock HTML5 Audio
      if (!isAudioUnlocked) {
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        silentAudio.play().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    } finally {
      if (isAudioUnlocked && primedAdhanAudio) {
        unlockEvents.forEach(evt => document.removeEventListener(evt, unlockHandler));
      }
    }
  };

  unlockEvents.forEach(evt => document.addEventListener(evt, unlockHandler, { once: false }));
}

export function playAutomaticAdhanAudio(
  voiceKey: string = 'cairo',
  onEnded?: () => void,
  onError?: (errorMessage: string) => void,
  onAutoplayBlocked?: () => void
): HTMLAudioElement {
  stopAllAdhanAudio();
  const sessionId = currentPlaybackSessionId;
  isAudioActive = true;

  const audioUrl = getCairoAdhanUrl();

  let audio: HTMLAudioElement;

  if (primedAdhanAudio) {
    audio = primedAdhanAudio;
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
    }
    audio.currentTime = 0;
  } else {
    audio = new Audio(audioUrl);
    audio.preload = 'auto';
  }

  currentAdhanAudio = audio;

  const handleAudioFailure = (customMessage?: string) => {
    isAudioActive = false;
    currentAdhanAudio = null;
    const errMsg = customMessage || 'عذراً، تعذر تشغيل صوت الأذان.';
    console.warn('[ADHAN] Audio playback failed:', errMsg);
    if (typeof onError === 'function') {
      onError(errMsg);
    }
  };

  audio.onended = () => {
    if (sessionId !== currentPlaybackSessionId) return;
    isAudioActive = false;
    currentAdhanAudio = null;
    if (typeof onEnded === 'function') {
      onEnded();
    }
  };

  audio.onerror = () => {
    if (sessionId !== currentPlaybackSessionId) return;
    console.warn('[ADHAN] Media error encountered:', audio.error?.code, audio.error?.message);
    handleAudioFailure();
  };

  if (sessionId === currentPlaybackSessionId) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[ADHAN] Playing Cairo Adhan successfully.');
        })
        .catch((err) => {
          if (sessionId !== currentPlaybackSessionId) return;

          console.warn('[ADHAN] audio.play() promise rejected:', err.name, err.message);

          if (err.name === 'NotAllowedError') {
            isAudioActive = false;
            currentAdhanAudio = null;
            if (typeof onAutoplayBlocked === 'function') {
              onAutoplayBlocked();
            }
            return;
          }

          handleAudioFailure();
        });
    }
  }

  return audio;
}

// Mechanical/Resonant click sound & completion chime for electronic Tasbeeh counting
export function playTasbeehClickAudio(type: 'click' | 'completion' = 'click') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'click') {
      // Crisp mechanical bead click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'completion') {
      // Spiritual completion chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.55);
      });
    }
  } catch (e) {
    console.warn('Tasbeeh audio click error:', e);
  }
}
