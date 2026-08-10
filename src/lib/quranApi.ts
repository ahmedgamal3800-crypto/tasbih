export interface SurahVerse {
  numberInSurah: number;
  text: string;
  juz?: number;
  page?: number;
  audioUrl?: string;
}

// In-memory cache for full surah texts
const surahCache: Record<number, SurahVerse[]> = {
  // Pre-loaded Surah 1: Al-Fatihah
  1: [
    { numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
    { numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
    { numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
    { numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
    { numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
    { numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
    { numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
  ],
  // Pre-loaded Surah 112: Al-Ikhlas
  112: [
    { numberInSurah: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" },
    { numberInSurah: 2, text: "اللَّهُ الصَّمَدُ" },
    { numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" },
    { numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ" }
  ],
  // Pre-loaded Surah 113: Al-Falaq
  113: [
    { numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ" },
    { numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ" },
    { numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" },
    { numberInSurah: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ" },
    { numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ" }
  ],
  // Pre-loaded Surah 114: An-Nas
  114: [
    { numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ" },
    { numberInSurah: 2, text: "مَلِكِ النَّاسِ" },
    { numberInSurah: 3, text: "إِلَٰهِ النَّاسِ" },
    { numberInSurah: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ" },
    { numberInSurah: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ" },
    { numberInSurah: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ" }
  ],
  // Pre-loaded Surah 94: Ash-Sharh
  94: [
    { numberInSurah: 1, text: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ" },
    { numberInSurah: 2, text: "وَوَضَعْنَا عَنكَ وِزْرَكَ" },
    { numberInSurah: 3, text: "الَّذِي أَنقَضَ ظَهْرَكَ" },
    { numberInSurah: 4, text: "وَرَفَعْنَا لَكَ ذِكْرَكَ" },
    { numberInSurah: 5, text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا" },
    { numberInSurah: 6, text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا" },
    { numberInSurah: 7, text: "فَإِذَا فَرَغْتَ فَانصَبْ" },
    { numberInSurah: 8, text: "وَإِلَىٰ رَبِّكَ فَارْغَب" }
  ],
  // Pre-loaded Surah 97: Al-Qadr
  97: [
    { numberInSurah: 1, text: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ" },
    { numberInSurah: 2, text: "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ" },
    { numberInSurah: 3, text: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ" },
    { numberInSurah: 4, text: "تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ" },
    { numberInSurah: 5, text: "سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ" }
  ],
  // Pre-loaded Surah 108: Al-Kawthar
  108: [
    { numberInSurah: 1, text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ" },
    { numberInSurah: 2, text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ" },
    { numberInSurah: 3, text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ" }
  ],
  // Pre-loaded Surah 110: An-Nasr
  110: [
    { numberInSurah: 1, text: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ" },
    { numberInSurah: 2, text: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا" },
    { numberInSurah: 3, text: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا" }
  ],
  // Pre-loaded Surah 67: Al-Mulk (First 10 verses sample)
  67: [
    { numberInSurah: 1, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ" },
    { numberInSurah: 2, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ" },
    { numberInSurah: 3, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ" },
    { numberInSurah: 4, text: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ" },
    { numberInSurah: 5, text: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ" },
    { numberInSurah: 6, text: "وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ" },
    { numberInSurah: 7, text: "إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ" },
    { numberInSurah: 8, text: "تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ" },
    { numberInSurah: 9, text: "قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ" },
    { numberInSurah: 10, text: "وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ" }
  ]
};

export async function fetchSurahVerses(surahNumber: number): Promise<SurahVerse[]> {
  // Check if we already have it in cache
  if (surahCache[surahNumber] && surahCache[surahNumber].length > 0) {
    return surahCache[surahNumber];
  }

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to load surah ${surahNumber}`);
    }

    const json = await response.json();
    if (json.code === 200 && json.data && Array.isArray(json.data.ayahs)) {
      const verses: SurahVerse[] = json.data.ayahs.map((ayah: any) => ({
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        juz: ayah.juz,
        page: ayah.page,
        audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`
      }));

      surahCache[surahNumber] = verses;
      return verses;
    }
  } catch (error) {
    console.warn(`Fallback for Surah ${surahNumber}:`, error);
  }

  // Fallback if network offline: return preloaded or basic template
  return surahCache[surahNumber] || [];
}
