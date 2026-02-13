import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = (stepIndex: number = 0, onExit?: () => void) => {
    const driverObj = driver({
        showProgress: false,
        animate: true,
        steps: [
            {
                element: '#tour-btn-SHOW_ALL',
                popover: {
                    title: 'إظهار الكل',
                    description: 'انقر هنا لعرض محتوى الصفحة كاملاً، وإلغاء أي إخفاء مفعّل للآيات أو الكلمات.',
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'close'],
                    nextBtnText: 'التالي',
                }
            },
            {
                element: '#tour-btn-HIDE_ALL_AYAHS',
                popover: {
                    title: 'إخفاء الكل',
                    description: `انقر هنا لحجب محتوى الصفحة بالكامل، مع خيارات مرنة للإظهار عند النقر على الآية للمراجعة:
• إظهار الآية حتى رقمها
• إظهار الآية حتى أقرب علامة وقف`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-btn-HIDE_RANDOM_AYAHS',
                popover: {
                    title: 'إخفاء الآيات',
                    description: `انقر هنا لإخفاء آيات محددة من الصفحة وفق عدة معايير متقدمة لاختبار الحفظ:
• إخفاء عشوائي للآيات
• إخفاء الآيات المصنفة:
  🔴 ضعيفة الحفظ
  🟡 متوسطة الحفظ
  🟢 جيدة الحفظ
• إخفاء الآيات غير المصنفة مسبقاً`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-btn-HIDE_RANDOM_WORDS',
                popover: {
                    title: 'إخفاء الكلمات',
                    description: `انقر هنا للتحكم في حجب كلمات محددة داخل الصفحة لتعزيز التركيز:
• إخفاء عشوائي للكلمات
• إخفاء كافة الكلمات في الصفحة`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-btn-TOGGLE_FIRST_WORD',
                popover: {
                    title: 'الكلمة الأولى',
                    description: `(مفاتيح الآيات)

التحكم في حالة (الكلمة الأولى) من كل آية في الصفحة لترسيخ بدايات الآيات:
• إخفاء الكلمة الأولى
• إظهار الكلمة الأولى`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-btn-TOGGLE_LAST_WORD',
                popover: {
                    title: 'الكلمة الأخيرة',
                    description: `(خواتيم الآيات)

التحكم في حالة (الكلمة الأخيرة) من كل آية في الصفحة لضبط نهايات الآيات:
• إخفاء الكلمة الأخيرة
• إظهار الكلمة الأخيرة`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-surah-name',
                popover: {
                    title: 'اسم السورة',
                    description: `انقر على اسم السورة للوصول إلى ميزات متقدمة:
• قيّم مستوى حفظك للسورة بالكامل
• قيّم مجموعة من الآيات في السورة بنفس التقييم مرة واحدة`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-ayah-number',
                popover: {
                    title: 'رقم الآية',
                    description: `انقر على رقم الآية للوصول إلى ميزات متقدمة:
• تقييم قوة الحفظ:
  🔴 ضعيف
  🟡 متوسط
  🟢 جيد
• إضافة علامة مرجعية للآية
• عرض المتشابهات مع الآية`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'إنهاء',
                    prevBtnText: 'السابق',
                }
            }
        ],
        nextBtnText: 'التالي',
        prevBtnText: 'السابق',
        doneBtnText: 'إنهاء',
        // @ts-ignore
        closeBtnText: 'إنهاء',
        allowClose: true,
        overlayColor: 'rgba(15, 23, 42, 0.4)',
        disableActiveInteraction: false,
        onDestroyed: () => {
            if (onExit) onExit();
        }
    });

    driverObj.drive(stepIndex);
};
