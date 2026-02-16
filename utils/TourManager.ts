import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Helper function to hide/show the line under the ayah number
const toggleAyahUnderline = (show: boolean) => {
    // Target the specific element for Ayah 1 in Fatiha (or generic if needed)
    const underlineElement = document.querySelector('.ayah-number-wrapper[data-surah="1"][data-ayah="1"] .mutashabihat-line-indicator');
    if (underlineElement) {
        (underlineElement as HTMLElement).style.display = show ? '' : 'none';
    }
};

// Helper function to simulate clicking colors for Ayah 1
const cycleAyahColors = () => {
    const wrapper = document.querySelector('.ayah-number-wrapper[data-surah="1"][data-ayah="1"]');
    if (!wrapper) return;

    const borderGroup = wrapper.querySelector('.ayah-border-group');
    const numberText = wrapper.querySelector('.ayah-text');

    if (!borderGroup || !numberText) return;

    const colors = ['#ef4444', '#eab308', '#22c55e']; // Red, Yellow, Green
    let colorIndex = 0;

    // Store original attributes to restore later
    const originalBorderStroke = borderGroup.getAttribute('stroke') || '';
    const originalTextFill = numberText.getAttribute('fill') || '';

    const intervalId = setInterval(() => {
        const color = colors[colorIndex];
        borderGroup.setAttribute('stroke', color);
        numberText.setAttribute('fill', color);
        colorIndex = (colorIndex + 1) % colors.length;
    }, 1000); // Change every second

    // Return cleanup function
    return () => {
        clearInterval(intervalId);
        if (originalBorderStroke) borderGroup.setAttribute('stroke', originalBorderStroke);
        if (originalTextFill) numberText.setAttribute('fill', originalTextFill);
    };
};



// Helper function to animate mutashabihat lines for Ayah 1
const cycleMutashabihatColors = () => {
    const wrapper = document.querySelector('.ayah-number-wrapper[data-surah="1"][data-ayah="1"]');
    if (!wrapper) return;

    const indicatorGroup = wrapper.querySelector('.mutashabihat-line-indicator');
    if (!indicatorGroup) return;

    const originalContent = indicatorGroup.innerHTML;

    const states = [
        // Green (Inside)
        `<line x1="20" y1="96" x2="80" y2="96" stroke="#22c55e" stroke-width="6" stroke-linecap="round" />`,
        // Red (Outside)
        `<line x1="20" y1="96" x2="80" y2="96" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />`,
        // Both
        `<line x1="20" y1="96" x2="50" y2="96" stroke="#22c55e" stroke-width="6" stroke-linecap="round" />
         <line x1="50" y1="96" x2="80" y2="96" stroke="#ef4444" stroke-width="6" stroke-linecap="round" />`
    ];

    let stateIndex = 0;

    const intervalId = setInterval(() => {
        indicatorGroup.innerHTML = states[stateIndex];
        stateIndex = (stateIndex + 1) % states.length;
    }, 1500); // Change every 1.5 seconds

    return () => {
        clearInterval(intervalId);
        indicatorGroup.innerHTML = originalContent;
    };
};

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
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                }
            },
            {
                element: '#tour-ayah-number',
                popover: {
                    title: 'ألوان تقييم الحفظ 🎨',
                    description: `<div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
    <div style="font-size: 0.95em; color: #cbd5e1;">يتغيّر لون رقم الآية بحسب مستوى الحفظ الذي تحدّده لنفسك عند الضغط علي رقم الايه:</div>
    
    <div style="display: flex; justify-content: space-around; align-items: center; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
        <!-- Weak -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center; position: relative;">
                 <span style="color: #ef4444; font-size: 18px; font-weight: bold;">١</span>
            </div>
            <span style="font-size: 0.8em; color: #ef4444;">ضعيف</span>
        </div>
        
        <!-- Medium -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(234, 179, 8, 0.2); border: 2px solid #eab308; display: flex; align-items: center; justify-content: center; position: relative;">
                 <span style="color: #eab308; font-size: 18px; font-weight: bold;">٢</span>
            </div>
            <span style="font-size: 0.8em; color: #eab308;">متوسط</span>
        </div>

        <!-- Good -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center; position: relative;">
                 <span style="color: #22c55e; font-size: 18px; font-weight: bold;">٣</span>
            </div>
            <span style="font-size: 0.8em; color: #22c55e;">جيد</span>
        </div>
    </div>
</div>`,
                    side: "bottom",
                    align: 'start',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                },
                onHighlightStarted: () => {
                    // Hide the underline for valid visual
                    toggleAyahUnderline(false);
                    // Start cycling colors on the actual ayah number in the page
                    if ((window as any).__tourColorIntervalCleanup) {
                        (window as any).__tourColorIntervalCleanup();
                    }
                    (window as any).__tourColorIntervalCleanup = cycleAyahColors();
                },
                onDeselected: () => {
                    // Restore underline and stop color cycling
                    toggleAyahUnderline(true);
                    if ((window as any).__tourColorIntervalCleanup) {
                        (window as any).__tourColorIntervalCleanup();
                        (window as any).__tourColorIntervalCleanup = undefined;
                    }
                }
            },
            {
                element: '#tour-ayah-number',
                popover: {
                    title: 'تنبيهات المتشابهات',
                    description: `<div style="display: flex; flex-direction: column; gap: 8px; margin-top: 5px;">
    <div style="font-size: 0.85em; color: #cbd5e1;">يظهر خط ملوّن أسفل رقم الآية للدلالة على المتشابهات:</div>
    
    <div style="display: flex; justify-content: space-around; align-items: flex-start; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px;">
        <!-- Inside -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 33%;">
            <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 50%; border: 1px solid #fbbf24;">
                 <span style="font-size: 12px; font-weight: bold; color: #fbbf24;">١</span>
                 <div style="position: absolute; bottom: -2px; left: 15%; right: 15%; height: 2px; background-color: #22c55e; border-radius: 2px;"></div>
            </div>
        </div>
        
        <!-- Outside -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 33%;">
            <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 50%; border: 1px solid #fbbf24;">
                 <span style="font-size: 12px; font-weight: bold; color: #fbbf24;">٢</span>
                 <div style="position: absolute; bottom: -2px; left: 15%; right: 15%; height: 2px; background-color: #ef4444; border-radius: 2px;"></div>
            </div>
        </div>

        <!-- Both -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 33%;">
            <div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 50%; border: 1px solid #fbbf24;">
                 <span style="font-size: 12px; font-weight: bold; color: #fbbf24;">٣</span>
                 <div style="position: absolute; bottom: -2px; left: 15%; width: 35%; height: 2px; background-color: #22c55e; border-radius: 2px 0 0 2px;"></div>
                 <div style="position: absolute; bottom: -2px; right: 15%; width: 35%; height: 2px; background-color: #ef4444; border-radius: 0 2px 2px 0;"></div>
            </div>
        </div>
    </div>
    
    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.75em; color: #94a3b8; line-height: 1.3; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; justify-content: center;">
        <span><span style="color: #22c55e;">●</span> نفس السورة</span>
        <span><span style="color: #ef4444;">●</span> سور أخرى</span>
        <span><span style="color: #fbbf24;">●</span> كلاهما</span>
    </div>
</div>`,
                    side: "bottom",
                    align: 'center',
                    showButtons: ['next', 'previous', 'close'],
                    nextBtnText: 'التالي',
                    prevBtnText: 'السابق',
                },
                onHighlightStarted: () => {
                    // 1. Cleanup previous step (Ayah Number Colors) if active
                    if ((window as any).__tourColorIntervalCleanup) {
                        (window as any).__tourColorIntervalCleanup();
                        (window as any).__tourColorIntervalCleanup = undefined;
                    }

                    // 2. Ensure Ayah Number is back to normal text/border (handled by cleanup above)
                    // But we need to make sure the underline is VISIBLE (it was hidden in prev step)
                    const underlineElement = document.querySelector('.ayah-number-wrapper[data-surah="1"][data-ayah="1"] .mutashabihat-line-indicator');
                    if (underlineElement) {
                        (underlineElement as HTMLElement).style.display = '';
                    }

                    // 3. Start Mutashabihat Cycling
                    (window as any).__tourMutashabihatCleanup = cycleMutashabihatColors();
                },
                onDeselected: () => {
                    // Cleanup Mutashabihat Animation
                    if ((window as any).__tourMutashabihatCleanup) {
                        (window as any).__tourMutashabihatCleanup();
                        (window as any).__tourMutashabihatCleanup = undefined;
                    }
                }
            },
            {
                element: '#tour-settings-btn',
                popover: {
                    title: 'المزيد من المزايا بانتظارك!',
                    description: '<span style="color: #ffffff; font-size: 1.25rem; font-weight: bold;">استكشف باقي الأدوات في قائمة الإعدادات</span>',
                    side: "top",
                    align: 'center',
                    showButtons: ['previous', 'next', 'close'],
                    prevBtnText: 'السابق',
                    nextBtnText: 'إنهاء',
                    doneBtnText: 'إنهاء',
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
        popoverOffset: 20, // Push popover further away from highlight
        stagePadding: 5, // Slightly enlarge the highlight area
        onDestroyed: () => {
            if ((window as any).__tourColorIntervalCleanup) (window as any).__tourColorIntervalCleanup();
            if ((window as any).__tourMutashabihatCleanup) (window as any).__tourMutashabihatCleanup();
            if (onExit) onExit();
        }
    });

    driverObj.drive(stepIndex);
};






