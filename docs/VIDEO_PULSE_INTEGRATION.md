# توثيق تكامل مشغل Video Pulse في تطبيق HDOFLIX (نافذة السينما)

## 1. نظرة عامة (Overview)
تمت إضافة دعم تطبيق **Video Pulse** كمشغل فيديو خارجي اختياري في تطبيق HDOFLIX Android مع الحفاظ الكامل على المشغل الداخلي المدمج كخيار افتراضي أساسي.

---

## 2. قواعد التصميم والسياسات الأساسية (Architectural Rules)
1. **المشغل الافتراضي**:
   - المشغل الافتراضي **هو دومًا HDOFLIX Internal Player**.
   - لا يتم فرض Video Pulse على المستخدم إلا إذا قام باختياره يدويًا في الإعدادات أو اختاره من شاشة التشغيل.
2. **التحقق من التثبيت (Installation Verification)**:
   - يتم فحص تثبيت حزمة `com.videopulse.pkvideo.pulsepk` قبل تنفيذ أي Intent.
   - في حال عدم التثبيت، لا ينهار التطبيق إطلاقًا، بل يظهر حوار واضح:
     - **"Video Pulse غير مثبت"**
     - مع زر مباشر: **[تثبيت Video Pulse]** يفتح صفحة التطبيق في Google Play.
     - مع خيار استكمال المشاهدة فورًا: **[تشغيل بواسطة HDOFLIX]**.
3. **عدم استخدام WebView مع Video Pulse**:
   - مشغل Video Pulse يتم تشغيله حصريًا عبر **Android Native Intent (`Intent.ACTION_VIEW`)** مع `setDataAndType(uri, "video/*")`.
   - المشغل الداخلي HDOFLIX هو فقط من يستخدم بيئة الـ WebView المخصصة مع طبقة حماية الخصوصية ومستوى تفاعل الإيماءات.
4. **الأمان وحماية البيانات (Security & Safe Logging)**:
   - لا يتم تمرير أي أسرار، مفاتيح API، توكنات جلسات، أو كلمات مرور إلى الـ Intent الخارجي.
   - يتم تنقية جميع الروابط والعناوين عبر `SafeLogger` لحجب أي وسائط حساسة (`[REDACTED]`).
5. **التحكم عن بعد (Remote Config Kill Switch)**:
   - يتوفر مفتاح فوري لتعطيل Video Pulse من الخادم أو الإعدادات السحابية عند الحاجة، مع Fallback تلقائي لمشغل HDOFLIX.

---

## 3. معمارية المشغل (Player Architecture)

```
                       PlayerService
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
      InternalPlayer                   ExternalPlayer
      (WebView Engine)                        │
                                       VideoPulseAdapter
                                              │
                                   Android Native Intent
                               (com.videopulse.pkvideo.pulsepk)
```

### حزم وكلاسات المشروع (Native Kotlin):
- `com.example.player.PlayerService`: المنسق العام للمشغلات وإدارة تفضيلات المستخدم.
- `com.example.player.InternalPlayer`: المشغل الداخلي المدمج.
- `com.example.player.ExternalPlayerService`: طبقة فحص وتنسيق المشغلات الخارجية.
- `com.example.player.VideoPulseAdapter`: المحول الخاص بـ Video Pulse وتجهيز الـ Intent.
- `com.example.player.PlayerIntentModuleContract`: عقد البيانات وحقول Intent Extras.
- `com.example.player.SafeLogger`: مسجل أحداث آمن ومنقّى للمعلومات الحساسة.
- `com.example.player.PlaybackMedia`: كائن بيانات التشغيل (أفلام ومسلسلات).

---

## 4. بنية الـ Intent وعقد البيانات (Intent Contract)

```kotlin
val intent = Intent(Intent.ACTION_VIEW).apply {
    setPackage("com.videopulse.pkvideo.pulsepk")
    setDataAndType(Uri.parse(streamUrl), "video/*")
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
    
    // البيانات الوصفية الأساسية
    putExtra("title", media.title)
    putExtra("poster_url", media.posterUrl)
    putExtra("is_tv", media.type != MediaType.MOVIE)
    
    // للمسلسلات التلفزيونية
    if (media.type != MediaType.MOVIE) {
        putExtra("series_name", media.seriesName ?: media.title)
        putExtra("season", media.season)
        putExtra("episode", media.episode)
    }
    
    // ملفات الترجمة (Subtitles Bundle)
    val subBundle = Bundle().apply {
        media.subtitles.forEach { sub ->
            putString(sub.name, sub.url)
        }
    }
    putExtra("subBundle", subBundle)
    
    // الترويسات الآمنة (Headers Bundle)
    val linkBundle = Bundle().apply {
        putString("User-Agent", "HDOFLIX-Player/2.0")
        putString("Referer", "https://vidsrc.to/")
    }
    putExtra("linkBundle", linkBundle)
}
```

---

## 5. مصفوفة حالات الاستجابة (Launch Results Matrix)

| الحالة | النتيجة البرمجية | السلوك في الواجهة (UI Behavior) |
|---|---|---|
| **HDOFLIX Player** | `PlayerLaunchResult.Success(HDOFLIX_INTERNAL)` | فتح المشغل المدمج داخل التطبيق فورًا |
| **Video Pulse مثبت** | `PlayerLaunchResult.Success(VIDEO_PULSE)` | إطلاق التطبيق الخارجي وتسجيل المشاهدة في السجل |
| **Video Pulse غير مثبت** | `PlayerLaunchResult.NotInstalled` | عرض حوار التثبيت مع خيار المتابعة بالمشغل الداخلي |
| **فشل تشغيل Intent** | `PlayerLaunchResult.LaunchFailed(reason)` | عرض حوار الخطأ مع زر الرجوع للمشغل الداخلي تلقائيًا |
| **التعطيل من Remote Config** | `isRemoteConfigEnabled == false` | الرجوع التلقائي لمشغل HDOFLIX الداخلي مع إشعار |

---

## 6. إعدادات المستخدم (User Settings UI)
- تم توفير زر الإعدادات في الشريط العلوي `top_bar_settings_button`.
- يعرض خيار:
  - **HDOFLIX Player (افتراضي)** - موصى به
  - **Video Pulse** - يوضح حالة التثبيت مع زر تثبيت مباشر إذا كان مفقودًا.
- إمكانية التبديل بين المشغلين أيضًا من:
  1. زر المشغل المخصص في بطاقة تفاصيل الفيلم/المسلسل (`details_choose_player_cta`).
  2. شاشة المشغل الداخلي عبر زر التحويل المباشر إلى Video Pulse (`player_videopulse_button`).
