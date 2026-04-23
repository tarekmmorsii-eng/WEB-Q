import React, { useState } from 'react';
import { X, Send, Bug, FileText, Smartphone, MessageSquare, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useFeedback } from '../contexts/FeedbackContext';
import { translations, Language } from '../i18n/translations';
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();

const getFeedbackTypes = (t: any) => [
    { id: 'interface_notes', label: t.feedbackInterfaceNotes, icon: Smartphone, color: 'text-purple-500 bg-purple-50' },
    { id: 'settings_notes', label: t.feedbackSettingsNotes, icon: Settings, color: 'text-amber-500 bg-amber-50' },
    { id: 'bug_tech', label: t.feedbackBugTech, icon: Bug, color: 'text-blue-500 bg-blue-50' },
    { id: 'suggestion', label: t.feedbackSuggestion, icon: MessageSquare, color: 'text-green-500 bg-green-50' },
];

const FeedbackModal = () => {
    const { isOpen, closeFeedback, initialType, contextData, language } = useFeedback();
    const t = translations[language as Language] || translations['ar'];
    const FEEDBACK_TYPES = getFeedbackTypes(t);
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
            alert(t.feedbackErrorSending);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden transform scale-100 transition-all"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="bg-[var(--bg-secondary)] px-6 py-4 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <MessageSquare size={20} className="text-amber-600" />
                        {t.sendFeedback}
                    </h3>
                    <button onClick={closeFeedback} className="p-2 hover:bg-[var(--text-primary)] hover:bg-opacity-10 rounded-full transition-colors text-[var(--text-primary)] opacity-50">
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
                            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.feedbackSentSuccessfully}</h4>
                            <p className="text-[var(--text-primary)] opacity-60">{t.feedbackThanks}</p>
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
                                                    : "border-[var(--border-primary)] hover:border-amber-300 bg-[var(--bg-card)]"
                                            )}
                                        >
                                            <Icon size={24} className={clsx("mb-2", isSelected ? "text-amber-600" : "text-slate-400")} />
                                            <span className={clsx("text-xs font-medium", isSelected ? "text-amber-800 dark:text-amber-100" : "text-[var(--text-primary)] opacity-60")}>
                                                {type.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Dynamic Sub-options based on Type */}
                            {selectedType === 'interface_notes' && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-medium text-[var(--text-primary)] opacity-80">
                                        {t.feedbackTargetItem}
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={subType}
                                        onChange={(e) => {
                                            setSubType(e.target.value);
                                            // Find label for better logging if needed, or just rely on value
                                            const index = e.target.selectedIndex;
                                            setSubTypeLabel(e.target.options[index].text);
                                        }}
                                    >
                                        <option value="">{t.feedbackSelectTarget}</option>
                                        <option value="Show Button">{language === 'ar' ? '1. زر الإظهار' : '1. Show Button'}</option>
                                        <option value="Hide Ayahs">{language === 'ar' ? '2. زر إخفاء الآيات' : '2. Hide Ayahs'}</option>
                                        <option value="Random Hide Ayahs">{language === 'ar' ? '3. زر إخفاء الآيات عشوائي' : '3. Random Hide Ayahs'}</option>
                                        <option value="Hide Words">{language === 'ar' ? '4. زر إخفاء الكلمات' : '4. Hide Words'}</option>
                                        <option value="Hide First Word">{language === 'ar' ? '5. زر إخفاء أول كلمة' : '5. Hide First Word'}</option>
                                        <option value="Hide Last Word">{language === 'ar' ? '6. زر إخفاء آخر كلمة' : '6. Hide Last Word'}</option>
                                        <option value="Bottom Bar">{language === 'ar' ? '7. القائمة السفلية' : '7. Bottom Bar'}</option>
                                        <option value="Verse Note">{language === 'ar' ? '8. ملاحظة في آية' : '8. Verse Note'}</option>
                                        <option value="Ayah Number Click">{language === 'ar' ? '9. عند النقر على رقم الآية' : '9. Ayah Number Click'}</option>
                                        <option value="Font">{language === 'ar' ? '10. الخط' : '10. Font'}</option>
                                        <option value="Surah Name">{language === 'ar' ? '11. اسم السورة' : '11. Surah Name'}</option>
                                        <option value="Page Number">{language === 'ar' ? '12. رقم الصفحة' : '12. Page Number'}</option>
                                        <option value="Other">{language === 'ar' ? '13. أخرى' : '13. Other'}</option>
                                    </select>
                                </div>
                            )}

                            {selectedType === 'settings_notes' && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-medium text-[var(--text-primary)] opacity-80">
                                        {t.feedbackTargetSetting}
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={subType}
                                        onChange={(e) => {
                                            setSubType(e.target.value);
                                            const index = e.target.selectedIndex;
                                            setSubTypeLabel(e.target.options[index].text);
                                        }}
                                    >
                                        <option value="">{t.feedbackSelectSetting}</option>
                                        <option value="Index">{language === 'ar' ? '1. الفهرس' : '1. Index'}</option>
                                        <option value="Search">{language === 'ar' ? '2. البحث' : '2. Search'}</option>
                                        <option value="Memorization Strength">{language === 'ar' ? '3. قوة الحفظ' : '3. Memorization Strength'}</option>
                                        <option value="Notifications">{language === 'ar' ? '4. الإشعارات' : '4. Notifications'}</option>
                                        <option value="Mutashabihat Index">{language === 'ar' ? '5. فهرس المتشابهات' : '5. Mutashabihat Index'}</option>
                                        <option value="Verse Calculator">{language === 'ar' ? '6. حساب الآيات' : '6. Verse Calculator'}</option>
                                        <option value="Lighting (Day/Night)">{language === 'ar' ? '7. الإضاءة (ليلي/نهاري)' : '7. Lighting (Day/Night)'}</option>
                                        <option value="Prayer Mode">{language === 'ar' ? '8. وضع الصلاة' : '8. Prayer Mode'}</option>
                                        <option value="Bookmark">{language === 'ar' ? '9. المرجعية' : '9. Bookmark'}</option>
                                        {!isNative && <option value="Fullscreen">{language === 'ar' ? '10. ملء الشاشة' : '10. Fullscreen'}</option>}
                                        <option value="Language">{language === 'ar' ? '11. اللغة' : '11. Language'}</option>
                                        <option value="Themes">{language === 'ar' ? '12. الألوان والسمات' : '12. Themes'}</option>
                                        <option value="Stop Signs Color">{language === 'ar' ? '13. تلوين علامات الوقف' : '13. Stop Signs Color'}</option>
                                        <option value="Mutashabihat Indicators">{language === 'ar' ? '14. إظهار علامات المتشابهات' : '14. Mutashabihat Indicators'}</option>
                                        <option value="Sound Settings">{language === 'ar' ? '15. إعدادات الصوت' : '15. Sound Settings'}</option>
                                        <option value="Bottom Bar Customization">{language === 'ar' ? '16. تخصيص القائمة السفلية' : '16. Bottom Bar Customization'}</option>
                                        {!isNative && <option value="Offline Work">{language === 'ar' ? '17. العمل بدون إنترنت' : '17. Offline Work'}</option>}
                                        <option value="Contact">{language === 'ar' ? '18. التواصل' : '18. Contact'}</option>
                                        <option value="Other">{language === 'ar' ? '19. أخرى' : '19. Other'}</option>
                                    </select>
                                </div>
                            )}

                            {/* Context Info (if any) */}
                            {contextData && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                    <Bug size={14} className="mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-bold block mb-1">{t.feedbackAttachedData}</span>
                                        <code className="block font-mono bg-white/50 dark:bg-black/20 p-1 rounded">
                                            {JSON.stringify(contextData, null, 2)}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] opacity-80 mb-1">
                                    {t.feedbackDetails}
                                </label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t.feedbackPlaceholder}
                                    className="w-full h-32 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className={clsx(
                                    "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
                                    (isSubmitting || !message.trim())
                                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-40 cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-200 dark:shadow-none"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t.feedbackSending}
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="rtl:rotate-180" />
                                        {t.sendFeedback}
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
