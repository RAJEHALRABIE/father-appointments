# مواعيد الوالد v19.5 (أحدث نسخة مع إصلاحات كاملة)

## المميزات
- وظائف Netlify في المسار الصحيح: netlify/functions
  - send-sms.js (Twilio)
  - save-state.js (Netlify Blobs)
  - reminders.scheduled.js (تذكير تلقائي قبل الموعد بساعة–ساعتين كل 15 دقيقة)
- إصلاح تسجيل الدخول و OTP بالكامل + رسائل الأخطاء
- PWA جاهز (manifest + icons + sw.js)

## التهيئة
1) ارفع المجلد كامل إلى Netlify.
2) أضف متغيرات البيئة:
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_FROM
   FATHER_PHONE
   REMIND_PATIENT=true