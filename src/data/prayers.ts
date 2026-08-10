import { PrayerTime } from '../types';

export interface CityLocation {
  nameAr: string;
  nameEn: string;
  countryAr: string;
  lat: number;
  lng: number;
  timeZoneOffsetHours: number;
  defaultMethod?: string;
}

export const CITIES_LIST: CityLocation[] = [
  // مصر
  { nameAr: 'القاهرة', nameEn: 'Cairo', countryAr: 'مصر', lat: 30.0444, lng: 31.2357, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'الإسكندرية', nameEn: 'Alexandria', countryAr: 'مصر', lat: 31.2001, lng: 29.9187, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'الجيزة', nameEn: 'Giza', countryAr: 'مصر', lat: 30.0131, lng: 31.2089, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'طنطا', nameEn: 'Tanta', countryAr: 'مصر', lat: 30.7865, lng: 31.0004, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'أسيوط', nameEn: 'Asyut', countryAr: 'مصر', lat: 27.18096, lng: 31.18368, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'أسوان', nameEn: 'Aswan', countryAr: 'مصر', lat: 24.0889, lng: 32.8998, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'بورسعيد', nameEn: 'Port Said', countryAr: 'مصر', lat: 31.2565, lng: 32.2841, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },
  { nameAr: 'الأقصر', nameEn: 'Luxor', countryAr: 'مصر', lat: 25.6872, lng: 32.6396, timeZoneOffsetHours: 3, defaultMethod: 'egyptian' },

  // السعودية
  { nameAr: 'مكة المكرمة', nameEn: 'Makkah', countryAr: 'السعودية', lat: 21.3891, lng: 39.8579, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'المدينة المنورة', nameEn: 'Madinah', countryAr: 'السعودية', lat: 24.5247, lng: 39.5692, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'الرياض', nameEn: 'Riyadh', countryAr: 'السعودية', lat: 24.7136, lng: 46.6753, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'جدة', nameEn: 'Jeddah', countryAr: 'السعودية', lat: 21.5433, lng: 39.1728, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'الدمام', nameEn: 'Dammam', countryAr: 'السعودية', lat: 26.4207, lng: 50.0888, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'أبها', nameEn: 'Abha', countryAr: 'السعودية', lat: 18.2164, lng: 42.5053, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },
  { nameAr: 'تبوك', nameEn: 'Tabuk', countryAr: 'السعودية', lat: 28.3835, lng: 36.5662, timeZoneOffsetHours: 3, defaultMethod: 'umm_alqura' },

  // فلسطين
  { nameAr: 'القدس الشريف', nameEn: 'Jerusalem', countryAr: 'فلسطين', lat: 31.7683, lng: 35.2137, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'غزة', nameEn: 'Gaza', countryAr: 'فلسطين', lat: 31.5017, lng: 34.4668, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'الخليل', nameEn: 'Hebron', countryAr: 'فلسطين', lat: 31.5326, lng: 35.0998, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'نابلس', nameEn: 'Nablus', countryAr: 'فلسطين', lat: 32.2211, lng: 35.2544, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // الإمارات
  { nameAr: 'دبي', nameEn: 'Dubai', countryAr: 'الإمارات', lat: 25.2048, lng: 55.2708, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },
  { nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', countryAr: 'الإمارات', lat: 24.4539, lng: 54.3773, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },
  { nameAr: 'الشارقة', nameEn: 'Sharjah', countryAr: 'الإمارات', lat: 25.3463, lng: 55.4209, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },
  { nameAr: 'العين', nameEn: 'Al Ain', countryAr: 'الإمارات', lat: 24.2075, lng: 55.7447, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },

  // الأردن
  { nameAr: 'عَمّان', nameEn: 'Amman', countryAr: 'الأردن', lat: 31.9454, lng: 35.9284, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'إربد', nameEn: 'Irbid', countryAr: 'الأردن', lat: 32.5568, lng: 35.8500, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'الزرقاء', nameEn: 'Zarqa', countryAr: 'الأردن', lat: 32.0608, lng: 36.0942, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // الكويت
  { nameAr: 'الكويت', nameEn: 'Kuwait City', countryAr: 'الكويت', lat: 29.3759, lng: 47.9774, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // قطر
  { nameAr: 'الدوحة', nameEn: 'Doha', countryAr: 'قطر', lat: 25.2854, lng: 51.5310, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // عُمان
  { nameAr: 'مسقط', nameEn: 'Muscat', countryAr: 'عُمان', lat: 23.5880, lng: 58.3829, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },
  { nameAr: 'صلالة', nameEn: 'Salalah', countryAr: 'عُمان', lat: 17.0151, lng: 54.0924, timeZoneOffsetHours: 4, defaultMethod: 'mwl' },

  // البحرين
  { nameAr: 'المنامة', nameEn: 'Manama', countryAr: 'البحرين', lat: 26.2285, lng: 50.5860, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // العراق
  { nameAr: 'بغداد', nameEn: 'Baghdad', countryAr: 'العراق', lat: 33.3152, lng: 44.3661, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'الموصل', nameEn: 'Mosul', countryAr: 'العراق', lat: 36.3400, lng: 43.1300, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'البصرة', nameEn: 'Basra', countryAr: 'العراق', lat: 30.5081, lng: 47.7835, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'أربيل', nameEn: 'Erbil', countryAr: 'العراق', lat: 36.1901, lng: 44.0091, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // سوريا
  { nameAr: 'دمشق', nameEn: 'Damascus', countryAr: 'سوريا', lat: 33.5138, lng: 36.2765, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'حلب', nameEn: 'Aleppo', countryAr: 'سوريا', lat: 36.2021, lng: 37.1343, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'حمص', nameEn: 'Homs', countryAr: 'سوريا', lat: 34.7324, lng: 36.7137, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // لبنان
  { nameAr: 'بيروت', nameEn: 'Beirut', countryAr: 'لبنان', lat: 33.8938, lng: 35.5018, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'طرابلس (لبنان)', nameEn: 'Tripoli', countryAr: 'لبنان', lat: 34.4367, lng: 35.8497, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // اليمن
  { nameAr: 'صنعاء', nameEn: 'Sanaa', countryAr: 'اليمن', lat: 15.3694, lng: 44.1910, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'عدن', nameEn: 'Aden', countryAr: 'اليمن', lat: 12.7855, lng: 45.0186, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // المغرب
  { nameAr: 'الرباط', nameEn: 'Rabat', countryAr: 'المغرب', lat: 34.0209, lng: -6.8416, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'الدار البيضاء', nameEn: 'Casablanca', countryAr: 'المغرب', lat: 33.5731, lng: -7.5898, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'مراكش', nameEn: 'Marrakesh', countryAr: 'المغرب', lat: 31.6295, lng: -7.9811, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'فاس', nameEn: 'Fes', countryAr: 'المغرب', lat: 34.0331, lng: -5.0003, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'طنجة', nameEn: 'Tangier', countryAr: 'المغرب', lat: 35.7595, lng: -5.8340, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },

  // تونس
  { nameAr: 'تونس', nameEn: 'Tunis', countryAr: 'تونس', lat: 36.8065, lng: 10.1815, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'صفاقس', nameEn: 'Sfax', countryAr: 'تونس', lat: 34.7406, lng: 10.7603, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'سوسة', nameEn: 'Sousse', countryAr: 'تونس', lat: 35.8256, lng: 10.6369, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },

  // الجزائر
  { nameAr: 'الجزائر العاصمة', nameEn: 'Algiers', countryAr: 'الجزائر', lat: 36.7538, lng: 3.0588, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'وهران', nameEn: 'Oran', countryAr: 'الجزائر', lat: 35.6971, lng: -0.6308, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'قسنطينة', nameEn: 'Constantine', countryAr: 'الجزائر', lat: 36.3650, lng: 6.6147, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },

  // السودان
  { nameAr: 'الخرطوم', nameEn: 'Khartoum', countryAr: 'السودان', lat: 15.5007, lng: 32.5599, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },
  { nameAr: 'أم درمان', nameEn: 'Omdurman', countryAr: 'السودان', lat: 15.6445, lng: 32.4777, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },

  // ليبيا
  { nameAr: 'طرابلس (ليبيا)', nameEn: 'Tripoli', countryAr: 'ليبيا', lat: 32.8872, lng: 13.1913, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },
  { nameAr: 'بنغازي', nameEn: 'Benghazi', countryAr: 'ليبيا', lat: 32.1167, lng: 20.0667, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },

  // موريتانيا
  { nameAr: 'نواكشوط', nameEn: 'Nouakchott', countryAr: 'موريتانيا', lat: 18.0735, lng: -15.9582, timeZoneOffsetHours: 0, defaultMethod: 'mwl' },

  // الصومال
  { nameAr: 'مقديشو', nameEn: 'Mogadishu', countryAr: 'الصومال', lat: 2.0469, lng: 45.3182, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // تركيا
  { nameAr: 'إسطنبول', nameEn: 'Istanbul', countryAr: 'تركيا', lat: 41.0082, lng: 28.9784, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'أنقرة', nameEn: 'Ankara', countryAr: 'تركيا', lat: 39.9334, lng: 32.8597, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },
  { nameAr: 'إزمير', nameEn: 'Izmir', countryAr: 'تركيا', lat: 38.4237, lng: 27.1428, timeZoneOffsetHours: 3, defaultMethod: 'mwl' },

  // المملكة المتحدة
  { nameAr: 'لندن', nameEn: 'London', countryAr: 'المملكة المتحدة', lat: 51.5074, lng: -0.1278, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'مانشستر', nameEn: 'Manchester', countryAr: 'المملكة المتحدة', lat: 53.4808, lng: -2.2426, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },
  { nameAr: 'برمنغهام', nameEn: 'Birmingham', countryAr: 'المملكة المتحدة', lat: 52.4862, lng: -1.8904, timeZoneOffsetHours: 1, defaultMethod: 'mwl' },

  // الولايات المتحدة
  { nameAr: 'نيويورك', nameEn: 'New York', countryAr: 'الولايات المتحدة', lat: 40.7128, lng: -74.0060, timeZoneOffsetHours: -4, defaultMethod: 'isna' },
  { nameAr: 'واشنطن', nameEn: 'Washington D.C.', countryAr: 'الولايات المتحدة', lat: 38.9072, lng: -77.0369, timeZoneOffsetHours: -4, defaultMethod: 'isna' },
  { nameAr: 'شيكاغو', nameEn: 'Chicago', countryAr: 'الولايات المتحدة', lat: 41.8781, lng: -87.6298, timeZoneOffsetHours: -5, defaultMethod: 'isna' },
  { nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', countryAr: 'الولايات المتحدة', lat: 34.0522, lng: -118.2437, timeZoneOffsetHours: -7, defaultMethod: 'isna' },

  // كندا
  { nameAr: 'تورونتو', nameEn: 'Toronto', countryAr: 'كندا', lat: 43.6532, lng: -79.3832, timeZoneOffsetHours: -4, defaultMethod: 'isna' },
  { nameAr: 'مونتريال', nameEn: 'Montreal', countryAr: 'كندا', lat: 45.5017, lng: -73.5673, timeZoneOffsetHours: -4, defaultMethod: 'isna' },

  // فرنسا
  { nameAr: 'باريس', nameEn: 'Paris', countryAr: 'فرنسا', lat: 48.8566, lng: 2.3522, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },
  { nameAr: 'مارسيليا', nameEn: 'Marseille', countryAr: 'فرنسا', lat: 43.2965, lng: 5.3698, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },

  // ألمانيا
  { nameAr: 'برلين', nameEn: 'Berlin', countryAr: 'ألمانيا', lat: 52.5200, lng: 13.4050, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },
  { nameAr: 'فرانكفورت', nameEn: 'Frankfurt', countryAr: 'ألمانيا', lat: 50.1109, lng: 8.6821, timeZoneOffsetHours: 2, defaultMethod: 'mwl' },

  // إندونيسيا
  { nameAr: 'جاكرتا', nameEn: 'Jakarta', countryAr: 'إندونيسيا', lat: -6.2088, lng: 106.8456, timeZoneOffsetHours: 7, defaultMethod: 'mwl' },
  { nameAr: 'سورابايا', nameEn: 'Surabaya', countryAr: 'إندونيسيا', lat: -7.2575, lng: 112.7521, timeZoneOffsetHours: 7, defaultMethod: 'mwl' },

  // ماليزيا
  { nameAr: 'كوالالمبور', nameEn: 'Kuala Lumpur', countryAr: 'ماليزيا', lat: 3.1390, lng: 101.6869, timeZoneOffsetHours: 8, defaultMethod: 'mwl' },

  // باكستان
  { nameAr: 'إسلام آباد', nameEn: 'Islamabad', countryAr: 'باكستان', lat: 33.6844, lng: 73.0479, timeZoneOffsetHours: 5, defaultMethod: 'karachi' },
  { nameAr: 'كراتشي', nameEn: 'Karachi', countryAr: 'باكستان', lat: 24.8607, lng: 67.0011, timeZoneOffsetHours: 5, defaultMethod: 'karachi' },
  { nameAr: 'لاهور', nameEn: 'Lahore', countryAr: 'باكستان', lat: 31.5204, lng: 74.3587, timeZoneOffsetHours: 5, defaultMethod: 'karachi' },

  // الهند
  { nameAr: 'نيو دلهي', nameEn: 'New Delhi', countryAr: 'الهند', lat: 28.6139, lng: 77.2090, timeZoneOffsetHours: 5.5, defaultMethod: 'karachi' },
  { nameAr: 'مومباي', nameEn: 'Mumbai', countryAr: 'الهند', lat: 19.0760, lng: 72.8777, timeZoneOffsetHours: 5.5, defaultMethod: 'karachi' },

  // أستراليا
  { nameAr: 'سيدني', nameEn: 'Sydney', countryAr: 'أستراليا', lat: -33.8688, lng: 151.2093, timeZoneOffsetHours: 10, defaultMethod: 'mwl' },
  { nameAr: 'ملبورن', nameEn: 'Melbourne', countryAr: 'أستراليا', lat: -37.8136, lng: 144.9631, timeZoneOffsetHours: 10, defaultMethod: 'mwl' }
];

export const CALCULATION_METHODS = [
  { id: 'umm_alqura', nameAr: 'أم القرى - مكة المكرمة (السعودية)' },
  { id: 'egyptian', nameAr: 'الهيئة المصرية العامة للمساحة (مصر والدول المجاورة)' },
  { id: 'mwl', nameAr: 'رابطة العالم الإسلامي (الدول العربية والأوروبية)' },
  { id: 'isna', nameAr: 'الجمعية الإسلامية لشمال أمريكا (ISNA - أمريكا وكندا)' },
  { id: 'karachi', nameAr: 'جامعة العلوم الإسلامية بكراتشي (باكستان والهند)' }
];

export function getCountriesList(): string[] {
  const set = new Set<string>();
  CITIES_LIST.forEach(c => set.add(c.countryAr));
  return Array.from(set);
}

export function getCitiesForCountry(countryAr: string): CityLocation[] {
  return CITIES_LIST.filter(c => c.countryAr === countryAr);
}

// Astronomical Solar Calculation Engine for Prayer Times (NOAA Formulas)
function computeSolarPrayerTimes(
  lat: number,
  lng: number,
  tz: number,
  date: Date,
  methodId: string = 'mwl'
): { fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Date calculation
  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5;

  const d = JD - 2451545.0; // Days since J2000.0 epoch

  // Sun's mean anomaly in degrees
  let g = (357.529 + 0.98560028 * d) % 360;
  if (g < 0) g += 360;
  const gRad = (g * Math.PI) / 180;

  // Sun's mean longitude in degrees
  let q = (280.459 + 0.98564736 * d) % 360;
  if (q < 0) q += 360;

  // Sun's ecliptic longitude in degrees
  let L = (q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad)) % 360;
  if (L < 0) L += 360;
  const LRad = (L * Math.PI) / 180;

  // Obliquity of the ecliptic in degrees
  const e = 23.439 - 0.00000036 * d;
  const eRad = (e * Math.PI) / 180;

  // Right Ascension of the Sun in degrees
  let RA = (Math.atan2(Math.cos(eRad) * Math.sin(LRad), Math.cos(LRad)) * 180) / Math.PI;
  if (RA < 0) RA += 360;

  // Sun's declination
  const declinationRad = Math.asin(Math.sin(eRad) * Math.sin(LRad));
  const declinationDeg = (declinationRad * 180) / Math.PI;

  // Equation of Time in minutes
  let EoT = (q - RA) * 4;
  if (EoT > 20) EoT -= 1440;
  if (EoT < -20) EoT += 1440;

  // Solar Noon GMT (in minutes from midnight GMT)
  const solarNoonGmtMin = 12 * 60 - lng * 4 - EoT;
  const solarNoonLocalMin = solarNoonGmtMin + tz * 60;

  // Helper function to calculate Hour Angle (in minutes) for target altitude (in degrees)
  const getHourAngleMinutes = (altDeg: number): number => {
    const latRad = (lat * Math.PI) / 180;
    const altRad = (altDeg * Math.PI) / 180;
    const cosH =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declinationRad)) /
      (Math.cos(latRad) * Math.cos(declinationRad));

    if (cosH > 1) return 0; // Sun never reaches altitude
    if (cosH < -1) return 180 * 4; // Sun stays above altitude

    const hDeg = (Math.acos(cosH) * 180) / Math.PI;
    return hDeg * 4; // Convert degrees to minutes
  };

  // 1. Sunrise / Sunset (standard atmospheric refraction angle = -0.833 degrees)
  const hSunriseMin = getHourAngleMinutes(-0.833);
  const sunrise = solarNoonLocalMin - hSunriseMin;
  const sunset = solarNoonLocalMin + hSunriseMin;

  // 2. Dhuhr (Solar noon + 1 min buffer)
  const dhuhr = solarNoonLocalMin + 1;

  // 3. Fajr Angle by Method
  let fajrAngle = 18;
  if (methodId === 'egyptian') fajrAngle = 19.5;
  else if (methodId === 'umm_alqura') fajrAngle = 18.5;
  else if (methodId === 'isna') fajrAngle = 15;
  else if (methodId === 'karachi') fajrAngle = 18;
  else if (methodId === 'mwl') fajrAngle = 18;

  const hFajrMin = getHourAngleMinutes(-fajrAngle);
  const fajr = solarNoonLocalMin - hFajrMin;

  // 4. Maghrib
  const maghrib = sunset;

  // 5. Isha
  let isha = sunset + 90; // Default fallback
  if (methodId === 'umm_alqura') {
    isha = sunset + 90; // Umm Al Qura convention
  } else {
    let ishaAngle = 17.5;
    if (methodId === 'egyptian') ishaAngle = 17.5;
    else if (methodId === 'mwl') ishaAngle = 17;
    else if (methodId === 'isna') ishaAngle = 15;
    else if (methodId === 'karachi') ishaAngle = 18;

    const hIshaMin = getHourAngleMinutes(-ishaAngle);
    isha = solarNoonLocalMin + hIshaMin;
  }

  // 6. Asr (Standard Shafi'i / Maliki / Hanbali)
  const latDecDiffRad = (Math.abs(lat - declinationDeg) * Math.PI) / 180;
  const asrAltRad = Math.atan(1 / (1 + Math.tan(latDecDiffRad)));
  const asrAltDeg = (asrAltRad * 180) / Math.PI;
  const hAsrMin = getHourAngleMinutes(asrAltDeg);
  const asr = solarNoonLocalMin + hAsrMin;

  return { fajr, sunrise, dhuhr, asr, maghrib, isha };
}

// Fetch official exact prayer timings from Aladhan API
export async function fetchAladhanPrayerTimes(
  cityEn: string,
  countryEn: string,
  methodId: string = 'mwl'
): Promise<Record<string, string> | null> {
  try {
    const methodMap: Record<string, number> = {
      karachi: 1,
      isna: 2,
      mwl: 3,
      umm_alqura: 4,
      egyptian: 5
    };
    const methodNum = methodMap[methodId] || 3;
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
        cityEn
      )}&country=${encodeURIComponent(countryEn)}&method=${methodNum}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code === 200 && json.data && json.data.timings) {
      const t = json.data.timings;
      return {
        fajr: t.Fajr?.split(' ')[0],
        sunrise: t.Sunrise?.split(' ')[0],
        dhuhr: t.Dhuhr?.split(' ')[0],
        asr: t.Asr?.split(' ')[0],
        maghrib: t.Maghrib?.split(' ')[0],
        isha: t.Isha?.split(' ')[0]
      };
    }
  } catch (err) {
    console.warn('Aladhan API fetch fallback:', err);
  }
  return null;
}

// Helper to calculate accurate prayer times based on date, city, country, and manual offsets
export function calculatePrayerTimes(
  cityName: string, 
  date: Date = new Date(),
  manualGlobalOffsetMinutes: number = 0,
  perPrayerOffsets: Record<string, number> = {},
  customExactPrayerTimes: Record<string, string> = {},
  calculationMethodId: string = 'mwl',
  countryName?: string
): PrayerTime[] {
  // Find matching city
  let city = CITIES_LIST.find(c => c.nameAr === cityName && (!countryName || c.countryAr === countryName));
  
  if (!city && countryName) {
    city = CITIES_LIST.find(c => c.countryAr === countryName);
  }
  if (!city) {
    city = CITIES_LIST.find(c => c.nameAr === cityName);
  }
  if (!city) {
    city = CITIES_LIST[0]; // Default Cairo, Egypt
  }

  const effectiveMethod = calculationMethodId || city.defaultMethod || 'mwl';

  // Compute exact solar times
  const solarTimes = computeSolarPrayerTimes(
    city.lat,
    city.lng,
    city.timeZoneOffsetHours,
    date,
    effectiveMethod
  );

  const formatMinToTimeStr = (min: number) => {
    let normalized = Math.round(min);
    if (normalized < 0) normalized += 24 * 60;
    normalized = normalized % (24 * 60);
    const hrs = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const hStr = hrs.toString().padStart(2, '0');
    const mStr = mins.toString().padStart(2, '0');
    return `${hStr}:${mStr}`;
  };

  const formatMinTo12h = (min: number) => {
    let normalized = Math.round(min);
    if (normalized < 0) normalized += 24 * 60;
    normalized = normalized % (24 * 60);
    let hrs = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const period = hrs >= 12 ? 'م' : 'ص';
    hrs = hrs % 12 || 12;
    const mStr = mins.toString().padStart(2, '0');
    return `${hrs}:${mStr} ${period}`;
  };

  const nowMinutes = date.getHours() * 60 + date.getMinutes();

  const getStatus = (pMin: number, nextPMin: number): 'upcoming' | 'current' | 'passed' => {
    if (nowMinutes >= pMin && nowMinutes < pMin + 20) return 'current';
    if (nowMinutes < pMin) return 'upcoming';
    return 'passed';
  };

  const rawPrayers = [
    { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', baseMin: solarTimes.fajr, iconName: 'SunMoon' },
    { id: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', baseMin: solarTimes.sunrise, iconName: 'Sunrise' },
    { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', baseMin: solarTimes.dhuhr, iconName: 'Sun' },
    { id: 'asr', name: 'Asr', arabicName: 'العصر', baseMin: solarTimes.asr, iconName: 'SunMedium' },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', baseMin: solarTimes.maghrib, iconName: 'Sunset' },
    { id: 'isha', name: 'Isha', arabicName: 'العشاء', baseMin: solarTimes.isha, iconName: 'Moon' }
  ];

  const calculated = rawPrayers.map((p) => {
    // Check if user specified a direct exact time (e.g. "04:15")
    const customTimeStr = customExactPrayerTimes[p.id];
    let finalMin = p.baseMin + (manualGlobalOffsetMinutes || 0) + (perPrayerOffsets[p.id] || 0);

    if (customTimeStr && customTimeStr.includes(':')) {
      const parts = customTimeStr.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        finalMin = parts[0] * 60 + parts[1];
      }
    }

    return {
      id: p.id,
      name: p.name,
      arabicName: p.arabicName,
      min: finalMin,
      iconName: p.iconName
    };
  });

  return calculated.map((p, idx) => {
    const nextMin = idx < calculated.length - 1 ? calculated[idx + 1].min : calculated[0].min + 24 * 60;
    return {
      id: p.id,
      name: p.name,
      arabicName: p.arabicName,
      time: formatMinToTimeStr(p.min),
      formattedTime: formatMinTo12h(p.min),
      status: getStatus(p.min, nextMin),
      iconName: p.iconName,
      notificationEnabled: true,
      iqamaOffsetMinutes: 15
    };
  });
}

// Calculate time remaining to next prayer
export function getNextPrayerCountdown(prayers: PrayerTime[]): { nextPrayer: PrayerTime | null, hours: number, minutes: number, seconds: number } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  for (const prayer of prayers) {
    const [pHrs, pMins] = prayer.time.split(':').map(Number);
    const pTotalMin = pHrs * 60 + pMins;

    if (pTotalMin > currentMinutes || (pTotalMin === currentMinutes && currentSeconds < 59)) {
      const diffSecs = (pTotalMin * 60) - (currentMinutes * 60 + currentSeconds);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;
      return { nextPrayer: prayer, hours, minutes, seconds };
    }
  }

  // If all prayers today have passed, next is Fajr tomorrow
  const fajr = prayers[0];
  if (!fajr) {
    return { nextPrayer: null, hours: 0, minutes: 0, seconds: 0 };
  }
  const [fHrs, fMins] = fajr.time.split(':').map(Number);
  const fajrTotalMin = fHrs * 60 + fMins + (24 * 60);
  const diffSecs = (fajrTotalMin * 60) - (currentMinutes * 60 + currentSeconds);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  return { nextPrayer: fajr, hours, minutes, seconds };
}

// Hijri Date formatting helper
export function getFormattedHijriDate(): { hijriDateStr: string, gregorianDateStr: string } {
  const date = new Date();
  
  // Format Gregorian Date in Arabic
  const optionsG: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const gregorianDateStr = new Intl.DateTimeFormat('ar-EG', optionsG).format(date);

  // Approximate Hijri Calculation or standard Intl Islamic calendar format
  try {
    const optionsH: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
    const hijriDateStr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', optionsH).format(date);
    return { hijriDateStr, gregorianDateStr };
  } catch (e) {
    // Fallback Islamic date format
    return { hijriDateStr: '1448 هـ - صفر', gregorianDateStr };
  }
}

