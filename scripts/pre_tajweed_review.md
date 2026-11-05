# مراجعة التعديلات قبل التجويد — 24 أكتوبر 2026

## الحدود المتفق عليها
لا إنشاء APK/AAB ولا رفع أو نشر للموقع. التجويد مؤجل وتبقى ملفاته كما هي. هذه مراجعة لنسخة العمل وليست اعتماداً لإصدار نهائي.

## نتيجة المراجعة المحلية
- الصوت: 18 اختباراً ناجحاً. تجهيز الآية التالية، ترتيب التلاوة والتكرار والإيقاف، ومعالجة أول وآخر 3 مللي ثانية لجميع القراء، مع الرجوع إلى الصوت الأصلي عند فشل المعالجة.
- نافذة الملاحظات: 4 اختبارات واجهة ناجحة و7 اختبارات استقبال ناجحة. اختبار المستخدم الحقيقي حفظ الصف 53 مع الصورة، ثم أفاد بإتمام تجربة البريد.
- البحث: 6 اختبارات ناجحة لاستعادة وضع الشاشة بعد إغلاق البحث، بمحاكاة أندرويد والويب.
- نجح npm run build للواجهة؛ هذا ليس بناء أندرويد. السجل في artifacts/web-build-review.txt.
- إجمالي الاختبارات الناجحة: 35. استخدم PLAYWRIGHT_CHANNEL=chrome؛ متصفح Playwright المخصص غير مثبت حالياً.

## Meta
- معرف التطبيق والحزمة وموارد Android متوافقة في الكود. Client Token موجود في ملف محلي متجاهل من Git؛ لم يُنسخ إلى هذا التقرير.
- SDK مشروط بـ -PmetaEventsEnabled=true، ومعطل افتراضياً. لا يوجد إرسال يدوي مكرر لحدث التفعيل.
- آخر مراجعة للوحة Meta يوم 23 أكتوبر: التسجيل التلقائي On، وحساب إعلانات معتمد موجود، وKey hashes فارغ؛ التطبيق غير منشور.
- لم نغيّر لوحة Meta مجدداً في مراجعة 24 أكتوبر.
- محاولة فحص الاعتمادات توقفت قبل البدء بسبب محاولة Gradle الكتابة في C:\.gradle. إصدار wrapper المطلوب 8.14.3 غير موجود في ذاكرة المستخدم المتاحة (الموجود 8.11.1 و9.2.0). لم نبدّل إصدار Gradle عشوائياً، ولم نعلن نجاح فحص التعارضات أو دمج manifest.
- لا توجد مكتبة Supabase في package.json؛ هذا وحده لا يثبت خلو Android من تعارضات الاعتمادات.
- public/privacy.html لا يذكر Meta/Facebook حالياً. يلزم تجهيز الإفصاح المناسب قبل التفعيل العام؛ لا نغيّر إعداد جمع معرّف الإعلانات دون قرار واضح.

## الخطوات المتبقية بالترتيب
1. استكمال بيئة Gradle 8.14.3 وفحص الاعتمادات وmanifest دون إنشاء حزمة إن أمكن.
2. مراجعة شهادة App signing من Google Play عند تسجيل بصمة Meta؛ لا نفترض أن مفتاح الرفع المحلي هو مفتاح النسخ المثبتة من المتجر.
3. إعداد إفصاح الخصوصية وإعدادات بيانات المتجر بما يطابق التتبع الفعلي قبل إطلاقه.
4. بعد موافقة المالك على نسخة الاختبار: إنشاء نسخة واحدة واختبار الحصري والقطامي والتكرار والإيقاف واختيار الصور والبحث على الهاتف.
5. اختبار وصول أحداث Meta ثم اختبار إسناد التثبيت إلى الحملة منفصلاً. الحزمة beta لها معرف مختلف ويجب تسجيلها إن استُخدمت.

تفاصيل الحساب وروابط الجدول والسكربت في scripts/feedback_setup.md؛ تفاصيل Meta في scripts/meta_app_events_setup.md.

## استكمال 24 أكتوبر — نتائج أحدث من الملاحظات السابقة
- تم تنزيل Gradle 8.14.3 داخل artifacts/gradle-cache وتوجيه ANDROID_USER_HOME إلى artifacts/android-user، دون تغيير إصدار المشروع.
- نجح :app:dependencies مع standardReleaseRuntimeClasspath وmetaEventsEnabled=true؛ حُلّت facebook-core وfacebook-bolts بالإصدار 19.0.0 ولم تظهر FAILED في التقرير.
- نجح :app:processStandardReleaseMainManifest. لم تنفذ assemble أو bundle، ولم تُنشأ حزمة أندرويد.
- الملف الناتج الذي فُحص: android/app/build/intermediates/merged_manifest/standardRelease/processStandardReleaseMainManifest/AndroidManifest.xml. تهيئة Meta والتسجيل التلقائي true عند تمرير الخيار، وجمع معرّف الإعلانات false، ومزوّد التهيئة غير مصدّر.
- أضاف SDK أذونات AD_ID وACCESS_ADSERVICES_ATTRIBUTION وACCESS_ADSERVICES_AD_ID وACCESS_ADSERVICES_CUSTOM_AUDIENCE. وجود الإذن لا يثبت استخدامه، وتعطيل AdvertiserIDCollectionEnabled لا يزيل هذه الأذونات من manifest. يلزم حسم الإبقاء عليها أو إزالتها وفق تصميم القياس قبل الإصدار.
- تحذيرات Gradle عن واجهات قديمة لا تمنع هذه المهام، ولا تعني أن الترقية إلى Gradle 9 آمنة.
- تم التحقق من شهادة توقيع Google Play وتجهيز Meta Key Hash؛ التفاصيل في meta_signing_review.md. إضافة البصمة إلى لوحة Meta لم تتم.
- جهزت مسودة خصوصية وورقة عمل أمان بيانات في privacy_meta_draft.md، دون تعديل الصفحة المنشورة أو تقديم إقرارات المتجر.
- المتبقي قبل الإصدار: قرار الأذونات/الموافقة والفئة العمرية والاحتفاظ بالصور، ثم اعتماد الإفصاح وتسجيل البصمة، ثم نسخة الهاتف عند طلب المالك واختبار الأحداث والإسناد.

## حسم الأذونات — 24 أكتوبر 2026
تم تعديل AndroidManifest.xml لإزالة الأذونات الموروثة AD_ID وACCESS_ADSERVICES_AD_ID وACCESS_ADSERVICES_CUSTOM_AUDIENCE وACCESS_ADSERVICES_TOPICS. يبقى AdvertiserIDCollectionEnabled=false. أُبقي ACCESS_ADSERVICES_ATTRIBUTION لعدم تعطيل مسار قياس الإسناد الذي يستهدفه التكامل.

نجح دمج manifest مع metaEventsEnabled=true، والتحقق آلياً من غياب الأذونات الأربعة وبقاء مزوّد Meta وإذن الإسناد. نجح أيضاً الدمج بالحالة الافتراضية دون الخيار، وتحقق غياب مزوّد Meta وبقاء AutoInitEnabled=false. لم تُنشأ APK/AAB.

هذا تقليل للأذونات وليس ضماناً لتوقف كل البيانات أو لاستمرار دقة الإسناد بنفس المستوى. يجب اختبار الأحداث والإسناد على الهاتف؛ إذن الإسناد وحده لا يثبت أن SDK سيستخدمه أو أن كل الأجهزة تدعمه. الخصوصية والموافقة وتسجيل بصمة Meta تبقى خطوات مستقلة.

المراجع الفنية:
https://raw.githubusercontent.com/facebook/facebook-android-sdk/sdk-version-19.0.0/facebook-core/src/main/AndroidManifest.xml
https://developer.android.com/build/manage-manifests
https://privacysandbox.google.com/private-advertising/attribution-reporting/android
