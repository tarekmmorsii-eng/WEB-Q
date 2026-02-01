# 🚀 دليل رفع تطبيق القرآن على Hostinger

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر:
- ✅ حساب Hostinger نشط
- ✅ Node.js مثبت على جهازك
- ✅ الوصول إلى File Manager أو FTP

---

## 🔧 الخطوة 1: بناء المشروع (Build)

### على جهازك المحلي:

```bash
# 1. افتح Terminal في مجلد المشروع
cd "d:\app Q\antigravity app Q\app-Q-ai-studio"

# 2. تأكد من تثبيت المكتبات
npm install

# 3. بناء المشروع للإنتاج
npm run build
```

بعد تنفيذ الأمر، سيتم إنشاء مجلد جديد اسمه **`dist`** يحتوي على الملفات الجاهزة للرفع.

---

## 📁 الخطوة 2: تحضير الملفات

### الملفات التي يجب رفعها:

```
dist/
├── index.html          ← الملف الرئيسي
├── assets/             ← ملفات CSS و JS
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
└── .htaccess          ← ملف التوجيه (مهم جداً!)
```

> **⚠️ مهم:** يجب نسخ ملف `.htaccess` من مجلد `public` إلى مجلد `dist` قبل الرفع!

```bash
# نسخ ملف .htaccess إلى مجلد dist
copy "public\.htaccess" "dist\.htaccess"
```

---

## 🌐 الخطوة 3: رفع الملفات على Hostinger

### الطريقة 1: استخدام File Manager (الأسهل)

1. **تسجيل الدخول:**
   - اذهب إلى [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - سجل دخولك

2. **فتح File Manager:**
   - اختر موقعك من القائمة
   - اضغط على "File Manager"

3. **الانتقال إلى المجلد الصحيح:**
   - اذهب إلى مجلد `public_html` (للنطاق الرئيسي)
   - أو `public_html/subdomain` (للنطاق الفرعي)

4. **حذف الملفات القديمة:**
   - احذف جميع الملفات الموجودة في المجلد (إن وجدت)
   - **لا تحذف** مجلد `.well-known` إذا كان موجوداً

5. **رفع الملفات:**
   - اضغط على "Upload Files"
   - اختر **جميع** محتويات مجلد `dist`
   - انتظر حتى يكتمل الرفع

6. **التحقق من ملف .htaccess:**
   - تأكد من وجود ملف `.htaccess` في المجلد
   - إذا لم يظهر، فعّل "Show Hidden Files" من الإعدادات

### الطريقة 2: استخدام FTP

```
Host: ftp.yourdomain.com
Username: your-username
Password: your-password
Port: 21
```

1. استخدم FileZilla أو أي برنامج FTP
2. ارفع محتويات مجلد `dist` إلى `public_html`

---

## ✅ الخطوة 4: التحقق من عمل الموقع

1. افتح المتصفح واذهب إلى نطاقك: `https://yourdomain.com`
2. يجب أن يظهر التطبيق بشكل صحيح
3. جرّب التنقل بين الصفحات للتأكد من عمل التوجيه

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: صفحة بيضاء فارغة

**الأسباب المحتملة:**
- لم يتم رفع ملفات `dist` بشكل صحيح
- ملف `index.html` غير موجود

**الحل:**
```bash
# تأكد من بناء المشروع أولاً
npm run build

# ثم ارفع محتويات dist كاملة
```

### المشكلة 2: خطأ 404 عند التنقل

**السبب:** ملف `.htaccess` غير موجود أو غير صحيح

**الحل:**
1. تأكد من وجود ملف `.htaccess` في `public_html`
2. تأكد من محتوياته (انظر القسم التالي)

### المشكلة 3: الموقع يعمل على الصفحة الرئيسية فقط

**السبب:** مشكلة في التوجيه (Routing)

**الحل:** تحقق من ملف `.htaccess` وتأكد من وجود هذا الكود:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### المشكلة 4: الخطوط أو الأيقونات لا تظهر

**السبب:** مشكلة في CORS أو مسارات الملفات

**الحل:**
1. تأكد من رفع مجلد `assets` كاملاً
2. تحقق من إعدادات `base` في `vite.config.ts`

---

## 🔐 إعدادات إضافية (اختيارية)

### تفعيل HTTPS (SSL)

1. في Hostinger Panel، اذهب إلى "SSL"
2. اختر "Install SSL"
3. اختر "Free SSL" (Let's Encrypt)
4. انتظر بضع دقائق للتفعيل

### تفعيل إعادة التوجيه من HTTP إلى HTTPS

في ملف `.htaccess`، أزل علامة التعليق (#) من هذه الأسطر:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 📊 هيكل الملفات النهائي على Hostinger

```
public_html/
├── index.html
├── .htaccess          ← مهم جداً!
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── vendor-xxxxx.js
└── .well-known/       ← لا تحذف (للـ SSL)
```

---

## 🎯 نصائح مهمة

1. ✅ **دائماً** استخدم `npm run build` قبل الرفع
2. ✅ **لا ترفع** مجلد `node_modules` أبداً
3. ✅ **تأكد** من وجود ملف `.htaccess`
4. ✅ **احذف** الملفات القديمة قبل رفع الجديدة
5. ✅ **انتظر** 5-10 دقائق بعد الرفع لظهور التغييرات
6. ✅ **امسح** الكاش (Cache) في المتصفح إذا لم تظهر التحديثات

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من سجلات الأخطاء (Error Logs) في Hostinger Panel
2. تأكد من أن جميع الملفات تم رفعها بنجاح
3. جرّب فتح الموقع في وضع التصفح الخفي (Incognito)

---

## 🔄 تحديث الموقع مستقبلاً

عند إجراء تعديلات على الكود:

```bash
# 1. بناء المشروع مرة أخرى
npm run build

# 2. نسخ .htaccess
copy "public\.htaccess" "dist\.htaccess"

# 3. رفع محتويات dist الجديدة
# (استبدل الملفات القديمة)
```

---

## ✨ تم بنجاح!

الآن موقعك يعمل على Hostinger! 🎉

يمكنك زيارته على: `https://yourdomain.com`
