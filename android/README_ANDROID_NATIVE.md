# 🕌 دليل تحويل نظام الأذان إلى Android Native حقيقي (Kotlin)

يقدم هذا المستند توثيقاً فنياً كاملاً لبنية **Android Native Adhan System** المُصمم خصيصاً لتشغيل الأذان تلقائياً في الخلفية وأثناء قفل الشاشة ووضع السكون بدون الاعتماد على Browser Audio أو أي مصادر MP3 خارجية عبر شبكة الإنترنت.

---

## 1. فحص طبيعة المشروع الحالي (Technical Assessment)
- **نوع المشروع الحالي:** Web Application (React 19 + TypeScript + Vite + Express Node.js Server).
- **المنصة الحالية:** تعمل ضمن بيئة Cloud Run Container وتُعرض داخل المتصفح (Browser / WebView).
- **سبب عدم قدرة Web Audio على العمل في الخلفية:**
  تفرك متصفحات أنظمة التشغيل (Chrome / WebView) قيوداً صارمة على تطبيقات الويب، حيث تُوقف تشغيل الأكواد البرمجية (JavaScript Execution) وأصوات HTML5 Audio تلقائياً بمجرد:
  1. تصغير التطبيق أو الانتقال لتطبيق آخر (App Minimized / Background).
  2. إغلاق شاشة الهاتف (Screen Locked / Sleep Mode).
  3. دخول الجهاز في وضع توفير الطاقة العميق (Doze Mode).
  4. سياسة Autoplay Policy التي تمنع `audio.play()` بدون تفاعل لمسي مباشر من المستخدم.

---

## 2. بنية المعمارية للحل المطور (Android Native Architecture)

تمت إضافة مجلد كامل برمجياً يحتوي على جميع كودات Kotlin والمنظومة الخارجية: `android/app/src/main/java/com/tasbeeh/app/`

### Component 1: `AdhanScheduler.kt` (جدولة المنبه الدقيق)
- يستخدم `AlarmManager.setAlarmClock()` أو `setExactAndAllowWhileIdle()` في أندرويد.
- يقوم بإيقاظ معالج الهاتف (CPU Wakeup) في الوقت المالي الدقيق لكل صلاة حتى وإن كان الهاتف في أعمق درجات السكون (Deep Doze Mode).

### Component 2: `AdhanAlarmReceiver.kt` (مستقبل التنبيه والتمهيد)
- يعمل كـ `BroadcastReceiver` يستقبل شارة الوقت من `AlarmManager`.
- يتلقى شارة إعادة تشغيل الهاتف `BOOT_COMPLETED` لإعادة جدولة جميع مواعيد الصلاة فور فتح الهاتف تلقائياً.
- يطلق الخدمة الأمامية `AdhanForegroundService`.

### Component 3: `AdhanForegroundService.kt` (خدمة التشغيل الأمامية)
- يعتمد على `ForegroundService` مع إشعار دائم وحالي عالي الأولوية (`PRIORITY_MAX` / `CATEGORY_ALARM`).
- يستخدم `PowerManager.WakeLock` لحظر نوم معالج الهاتف أثناء تلاوة الأذان.
- يعتمد على `MediaPlayer` ناطق بالخاصية `AudioAttributes.USAGE_ALARM` ليصدح الأذان حتى في وضع الصامت إذا تم ضبطه كمنبه.
- يقرأ الأصوات المحلية المضمنة داخل التطبيق `res/raw/` (أوفلاين بدون إنترنت وبدون CDN خاري).

### Component 4: `AndroidAdhanBridge.kt` + `androidBridge.ts` (جسر الاتصال)
- يربط بين واجهة React ومحرك Android Native عبر `@JavascriptInterface`.
- يرسل مواعيد الصلاوات وصوت المؤذن المختار فور حسابها في React إلى كوتلن مباشرة تلقائياً.

---

## 3. هيكل الملفات المُضافة في المشروع

```
android/
├── app/
│   ├── build.gradle.kts                   # إعدادات البناء والمكتبات لكوتلن
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml        # الصلاحيات والتصاريح والخدمات
│           └── java/com/tasbeeh/app/
│               ├── MainActivity.kt        # النشاط الرئيسي المستضيف لـ WebView والجسر
│               ├── AndroidAdhanBridge.kt   # `@JavascriptInterface` بين React وKotlin
│               ├── AdhanScheduler.kt      # جدولة AlarmManager
│               ├── AdhanAlarmReceiver.kt  # استقبال التنبيهات وBoot Completed
│               └── AdhanForegroundService.kt # خدمة التشغيل الصوتية في الخلفية
```

---

## 4. خطوات تصدير التطبيق إلى تطبيق أندرويد نهائي (APK / AAB)

1. **تثبيت Android Studio** على جهاز التطوير.
2. فتح مجلد `android/` داخل Android Studio.
3. إضافة ملفات الصوت الصوتية المحفوطة محلياً في مجلد:
   `android/app/src/main/res/raw/adhan_abdulbasit.mp3`
   `android/app/src/main/res/raw/adhan_cairo.mp3`
   `android/app/src/main/res/raw/adhan_makkah.mp3`
4. تشغيل خيار **Build -> Build Bundle(s) / APK(s) -> Build APK**.
5. سيتم إنتاج تطبيق Android Native جاهز للتثبيت والمشاركة والعمل في الخلفية بنسبة 100%.
