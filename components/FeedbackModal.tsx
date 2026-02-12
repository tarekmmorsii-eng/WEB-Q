import React, { useState } from 'react';
import { X, Send, Bug, FileText, Smartphone, MessageSquare, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useFeedback } from '../contexts/FeedbackContext';

const FEEDBACK_TYPES = [
    { id: 'interface_notes', label: 'ملاحظات في الواجهة', icon: Smartphone, color: 'text-purple-500 bg-purple-50' },
    { id: 'settings_notes', label: 'ملاحظات في الإعدادات', icon: Settings, color: 'text-amber-500 bg-amber-50' },
    { id: 'bug_tech', label: 'مشكلة تقنية', icon: Bug, color: 'text-blue-500 bg-blue-50' },
    { id: 'suggestion', label: 'اقتراح / تحسين', icon: MessageSquare, color: 'text-green-500 bg-green-50' },
];

const FeedbackModal = () => {
    const { isOpen, closeFeedback, initialType, contextData } = useFeedback();
    const [selectedType, setSelectedType] = useState(initialType);
    const [subType, setSubType] = useState(''); // Store selected sub-option value
    const [subTypeLabel, setSubTypeLabel] = useState(''); // Store selected sub-option label/text
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Update selected type if initial type changes when opening
    React.useEffect(() => {
        if (isOpen) {
            setSelectedType(initialType);
            setSubType('');
            setSubTypeLabel('');
            setIsSuccess(false);
            setMessage('');
        }
    }, [isOpen, initialType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare data
        const payload = {
            type: selectedType,
            subType: subType, // Send structured sub-type
            subTypeLabel: subTypeLabel,
            message,
            context: contextData,
            deviceInfo: {
                userAgent: navigator.userAgent,
                screen: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };

        try {
            // Google Apps Script Web App URL
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHQSC6rUqDtRUPfPXCMycrHL5Isn9j68H-fXr1x24behoWrYgPYuP6s2W598jM6VA-1A/exec';

            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Essential for Google Apps Script to handle CORS
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Since we use 'no-cors', we won't get a readable response if successful, 
            // but the request should reach the script.
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                closeFeedback();
            }, 3000);
        } catch (error) {
            console.error('Feedback Error:', error);
            alert('حدث خطأ أثناء إرسال الملاحظة. يرجى المحاولة مرة أخرى.');
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-100 transition-all"
                dir="rtl"
            >
                {/* Header */}
                <div className="bg-gradient-to-l from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare size={20} className="text-amber-600" />
                        إرسال ملاحظة
                    </h3>
                    <button onClick={closeFeedback} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Send size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">تم الإرسال بنجاح!</h4>
                            <p className="text-slate-500 dark:text-slate-400">شكرًا لمساهمتك في تحسين التطبيق.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                {FEEDBACK_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = selectedType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.id as any)}
                                            className={clsx(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer",
                                                isSelected
                                                    ? `border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm ring-1 ring-amber-500`
                                                    : "border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                                            )}
                                        >
                                            <Icon size={24} className={clsx("mb-2", isSelected ? "text-amber-600" : "text-slate-400")} />
                                            <span className={clsx("text-xs font-medium", isSelected ? "text-amber-800 dark:text-amber-100" : "text-slate-500 dark:text-slate-400")}>
                                                {type.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Dynamic Sub-options based on Type */}
                            {selectedType === 'interface_notes' && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        ما هو العنصر الذي عليه ملاحظة؟
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={subType}
                                        onChange={(e) => {
                                            setSubType(e.target.value);
                                            // Find label for better logging if needed, or just rely on value
                                            const index = e.target.selectedIndex;
                                            setSubTypeLabel(e.target.options[index].text);
                                        }}
                                    >
                                        <option value="">اختر العنصر...</option>
                                        <option value="زر الإظهار">1. زر الإظهار</option>
                                        <option value="زر إخفاء الآيات">2. زر إخفاء الآيات</option>
                                        <option value="زر إخفاء الآيات عشوائي">3. زر إخفاء الآيات عشوائي</option>
                                        <option value="زر إخفاء الكلمات">4. زر إخفاء الكلمات</option>
                                        <option value="زر إخفاء أول كلمة">5. زر إخفاء أول كلمة</option>
                                        <option value="زر إخفاء آخر كلمة">6. زر إخفاء آخر كلمة</option>
                                        <option value="القائمة السفلية">7. القائمة السفلية</option>
                                        <option value="ملاحظة في آية">8. ملاحظة في آية</option>
                                        <option value="عند النقر على رقم الآية">9. عند النقر على رقم الآية</option>
                                        <option value="الخط">10. الخط</option>
                                        <option value="اسم السورة">11. اسم السورة</option>
                                        <option value="رقم الصفحة">12. رقم الصفحة</option>
                                        <option value="أخرى">13. أخرى</option>
                                    </select>
                                </div>
                            )}

                            {selectedType === 'settings_notes' && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        ما هو الإعداد الذي فيه المشكلة؟
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={subType}
                                        onChange={(e) => {
                                            setSubType(e.target.value);
                                            const index = e.target.selectedIndex;
                                            setSubTypeLabel(e.target.options[index].text);
                                        }}
                                    >
                                        <option value="">اختر الإعداد...</option>
                                        <option value="الفهرس">1. الفهرس</option>
                                        <option value="البحث">2. البحث</option>
                                        <option value="قوة الحفظ">3. قوة الحفظ</option>
                                        <option value="الإشعارات">4. الإشعارات</option>
                                        <option value="فهرس المتشابهات">5. فهرس المتشابهات</option>
                                        <option value="حساب الآيات">6. حساب الآيات</option>
                                        <option value="الإضاءة (ليلي/نهاري)">7. الإضاءة (ليلي/نهاري)</option>
                                        <option value="وضع الصلاة">8. وضع الصلاة</option>
                                        <option value="المرجعية">9. المرجعية</option>
                                        <option value="ملء الشاشة">10. ملء الشاشة</option>
                                        <option value="اللغة">11. اللغة</option>
                                        <option value="الألوان والسمات">12. الألوان والسمات</option>
                                        <option value="تلوين علامات الوقف">13. تلوين علامات الوقف</option>
                                        <option value="إظهار علامات المتشابهات">14. إظهار علامات المتشابهات</option>
                                        <option value="إعدادات الصوت">15. إعدادات الصوت</option>
                                        <option value="تخصيص القائمة السفلية">16. تخصيص القائمة السفلية</option>
                                        <option value="العمل بدون إنترنت">17. العمل بدون إنترنت</option>
                                        <option value="التواصل">18. التواصل</option>
                                        <option value="أخرى">19. أخرى</option>
                                    </select>
                                </div>
                            )}

                            {/* Context Info (if any) */}
                            {contextData && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                    <Bug size={14} className="mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-bold block mb-1">بيانات مرفقة:</span>
                                        <code className="block font-mono bg-white/50 dark:bg-black/20 p-1 rounded">
                                            {JSON.stringify(contextData, null, 2)}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    تفاصيل الملاحظة
                                </label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اشرح المشكلة أو الاقتراح بالتفصيل..."
                                    className="w-full h-32 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className={clsx(
                                    "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
                                    (isSubmitting || !message.trim())
                                        ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-200 dark:shadow-none"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="rtl:rotate-180" />
                                        إرسال الملاحظة
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
