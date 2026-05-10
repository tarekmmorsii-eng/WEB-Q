# نظام الظل الموحد للآيات - Unified Ayah Shadow

## الوصف العام
نظام يجعل إخفاء الآيات يظهر كقطعة واحدة مدمجة (ظل متصل) بدلاً من كلمات فردية منفصلة.  
يعمل على مستوى الآيات وليس الكلمات.

## الأوضاع المدعومة

### 1. إخفاء الآيات (Ayah Hiding)
| الزر | الوضع | نوع الظل |
|------|-------|----------|
| إخفاء الكل | `HIDE_ALL_AYAHS` state 0 | ظل موحد متصل |
| علامات الوقف | `HIDE_ALL_AYAHS` state 1 | ظل موحد متصل |
| آيات عشوائية | `HIDE_RANDOM_AYAHS` state 0 | ظل موحد متصل |
| تقييم الآيات | `HIDE_RANDOM_AYAHS` state 1-4 | ظل موحد متصل |

### 2. إخفاء الكلمات (Word Hiding)
| الزر | الوضع | نوع الظل |
|------|-------|----------|
| كلمات عشوائية | `HIDE_RANDOM_WORDS` state 0 | ظل فردي لكل كلمة |
| كل الكلمات | `HIDE_RANDOM_WORDS` state 1 | ظل فردي لكل كلمة |

### 3. أول كلمة / آخر كلمة
| الزر | الوضع | نوع الظل |
|------|-------|----------|
| إخفاء أول كلمة | `TOGGLE_FIRST_WORD` state 0 | ظل موحد (كلمة واحدة) |
| علامات الوقف | `TOGGLE_FIRST_WORD` state 1 | ظل موحد متصل |
| إخفاء آخر كلمة | `TOGGLE_LAST_WORD` state 0 | ظل موحد (كلمة واحدة) |
| علامات الوقف | `TOGGLE_LAST_WORD` state 1 | ظل موحد متصل |

## التعديلات المطبقة

### التعديل 1: useLayoutEffect للظل الموحد
**الموقع:** `useLayoutEffect` الخاص بـ `ayah-shadow-overlay`  
**الشرط:** يتفعل لجميع أوضاع إخفاء الآيات + TOGGLE_FIRST_WORD + TOGGLE_LAST_WORD
```
mode === HIDE_ALL_AYAHS || HIDE_RANDOM_AYAHS || TOGGLE_FIRST_WORD || TOGGLE_LAST_WORD
```
**ما يفعله:** ينشئ overlay DOM واحد لكل آية في كل سطر (قطعة ظل واحدة متصلة)

### التعديل 2: إزالة المسافات (Spacers)
**الموقع:** في كود render الكلمات  
**الشرط:** في الأوضاع التالية يتم حذف الفاصل بين الكلمات المخفية المتتالية من نفس الآية:
- `HIDE_ALL_AYAHS`
- `HIDE_RANDOM_AYAHS`
- `TOGGLE_FIRST_WORD` state 1
- `TOGGLE_LAST_WORD` state 1

### التعديل 3: className للكلمات المخفية
- أوضاع الآيات + Toggle → `text-transparent` (شفافة، الظل من الـ overlay)
- `HIDE_RANDOM_WORDS` → `rounded-sm` (ظل فردي من الـ backgroundColor)

### التعديل 4: style الخلفية
- أوضاع الآيات + Toggle → بدون خلفية (الظل من الـ overlay الخارجي)
- `HIDE_RANDOM_WORDS` → `backgroundColor: isDarkMode ? '#1e293b' : '#334155'`

### التعديل 5: كشف المقاطع في toggleReveal
**يخص الأوضاع التالية عند الضغط على كلمة مخفية:**
- `HIDE_ALL_AYAHS` state 0 → يكشف الآية كاملة
- `HIDE_ALL_AYAHS` state 1 → يكشف المقطع بين علامتي وقف
- `HIDE_RANDOM_AYAHS` → يكشف المقطع بين علامتي وقف
- `TOGGLE_FIRST_WORD` state 1 → يكشف المقطع بين علامتي وقف
- `TOGGLE_LAST_WORD` state 1 → يكشف المقطع بين علامتي وقف

## الملف المعدل
- `components/QPCV2PageRenderer.tsx`

## كيفية الاختبار
1. افتح المصحف
2. اضغط على أي زر إخفاء آيات → يجب أن ترى الآيات كقطع مدمجة بدون فجوات
3. اضغط على أي زر إخفاء كلمات → يجب أن ترى كل كلمة بظل فردي
4. اضغط على زر "أول كلمة" → الكلمة الأولى فقط مخفية بظل
5. اضغط على زر علامات الوقف → الضغط على كلمة يكشف المقطع بين علامات الوقف
6. رقم كل آية يبقى ظاهراً دائماً