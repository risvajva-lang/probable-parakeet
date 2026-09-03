# HDOFlix — GitHub Actions Android Build

هذا المشروع معد للبناء من GitHub Actions بدون كمبيوتر محلي.

## البناء

1. ارفع محتويات المشروع إلى Repository جديد على GitHub.
2. تأكد أن `package.json` و`android/` و`.github/` موجودة في جذر المستودع.
3. افتح **Actions**.
4. اختر **Build HDOFlix Android APK**.
5. اضغط **Run workflow**.
6. بعد نجاح المهمة افتح **Artifacts** وحمّل `HDOFlix-Android-APK`.

## لماذا لا يوجد package-lock.json؟

الـ workflow يستخدم `npm install` وليس `npm ci`، ولا يفعّل npm cache في `setup-node`. لذلك لا يحتاج المستودع إلى lockfile مسبقًا، ويتجنب خطأ GitHub الخاص بـ `Dependencies lock file is not found`.

## ملاحظة عن التوقيع

المفتاح الذي ينشئه الـ workflow مؤقت للبناء والتجربة. إذا كان الهدف نشر التطبيق على Google Play أو تحديث نفس التطبيق مستقبلًا، يجب استخدام keystore ثابت وسري عبر GitHub Secrets بدل مفتاح مؤقت.
