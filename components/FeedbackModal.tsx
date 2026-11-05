import DeleteIcon from './DeleteIcon';
import ModalLogo from './ModalLogo';
import React, { useState, useRef } from 'react';
import { X, Send, Bug, ImagePlus, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { useFeedback } from '../contexts/FeedbackContext';
import { translations, Language } from '../i18n/translations';
import { getFeedbackFormText } from '../i18n/feedbackFormText';
import { FeedbackScreenshot, prepareFeedbackScreenshot } from '../services/feedbackScreenshot';
const FeedbackModal = () => {
    const { isOpen, closeFeedback, initialType, contextData, language } = useFeedback();
    const t = translations[language as Language] || translations['ar'];
    const copy = getFeedbackFormText(language);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [androidVersion, setAndroidVersion] = useState('');
    const [otherAndroidVersion, setOtherAndroidVersion] = useState('');
    const [phoneBrand, setPhoneBrand] = useState('');
    const [phoneModel, setPhoneModel] = useState('');
    const [screenshot, setScreenshot] = useState<FeedbackScreenshot | null>(null);
    const [imageError, setImageError] = useState('');
    const [isPreparingImage, setIsPreparingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRequestRef = useRef(0);
    const sessionRef = useRef(0);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset the draft when opening a feedback session
    React.useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setMessage('');
            setAndroidVersion('');
            setOtherAndroidVersion('');
            setPhoneBrand('');
            setPhoneModel('');
            setScreenshot(null);
            setImageError('');
            setIsPreparingImage(false);
            setIsSubmitting(false);
        }
        return () => {
            ++imageRequestRef.current;
            ++sessionRef.current;
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, [isOpen, initialType]);

    const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const request = ++imageRequestRef.current;
        setImageError('');
        setIsPreparingImage(true);
        try {
            const prepared = await prepareFeedbackScreenshot(file);
            if (request === imageRequestRef.current) setScreenshot(prepared);
        } catch (error) {
            if (request !== imageRequestRef.current) return;
            const code = error instanceof Error ? error.message : '';
            setImageError(code === 'type' ? copy.invalidType : code === 'size' ? copy.invalidSize : copy.invalidImage);
        } finally {
            if (request === imageRequestRef.current) setIsPreparingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isPreparingImage || !message.trim()) return;
        // Feedback eligibility is separate from optional advertising measurement.
        // A known minor choice must not be bypassed by an adult confirmation.
        try {
            const ageChoice = JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1') || 'null');
            if (ageChoice?.version === 1 && ['under13', '13to17'].includes(ageChoice.age)) {
                alert(copy.adultRequired);
                return;
            }
        } catch {
            alert(copy.ageUnavailable);
            return;
        }
        if (!window.confirm(copy.adultConfirm)) return;
        const session = sessionRef.current;
        setIsSubmitting(true);

        // Prepare data
        const payload = {
            type: initialType, // Preserve the entry-point context for the existing backend.
            subType: '',
            subTypeLabel: '',
            message: message.trim(),
            screenshot,
            context: contextData,
            deviceInfo: {
                androidVersion: androidVersion === 'other' ? otherAndroidVersion.trim() : androidVersion,
                phoneBrand: phoneBrand.trim(),
                phoneModel: phoneModel.trim(),
                userAgent: navigator.userAgent,
                screen: `${window.innerWidth}x${window.innerHeight}`,
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
                    'Content-Type': 'text/plain;charset=UTF-8',
                },
                body: JSON.stringify(payload),
            });

            // An opaque response confirms dispatch, not server-side persistence.
            if (session !== sessionRef.current) return;
            setIsSubmitting(false);
            setIsSuccess(true);
            closeTimerRef.current = setTimeout(() => {
                closeFeedback();
            }, 3000);
        } catch (error) {
            if (session !== sessionRef.current) return;
            console.error('Feedback Error:', error);
            alert(t.feedbackErrorSending);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="app-modal fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md max-h-[90dvh] flex flex-col bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden transform scale-100 transition-all"
                dir={t.dir === 'rtl' ? 'rtl' : 'ltr'}
                role="dialog" aria-modal="true" aria-labelledby="feedback-title"
            >
                {/* Header */}
                <div className="shrink-0 bg-[var(--bg-secondary)] px-6 py-4 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <h3 id="feedback-title" className="modal-branded-title text-lg font-bold text-[var(--text-primary)] flex items-center gap-2"><ModalLogo />
                        <MessageSquare size={20} className="text-amber-600" />
                        {t.sendFeedback}
                    </h3>
                    <button onClick={closeFeedback} disabled={isSubmitting} aria-label={copy.close} className="p-2 hover:bg-[var(--text-primary)] hover:bg-opacity-10 rounded-full transition-colors text-[var(--text-primary)] opacity-50">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Send size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">{copy.requestSent}</h4>
                            <p className="text-[var(--text-primary)] opacity-60">{t.feedbackThanks}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                          <fieldset disabled={isSubmitting} className="space-y-4 min-w-0">

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
                            <div className="space-y-2">
                                <label htmlFor="feedback-android" className="block text-sm font-medium text-[var(--text-primary)]">{copy.android}</label>
                                <select id="feedback-android" value={androidVersion} onChange={e => setAndroidVersion(e.target.value)} className="w-full min-w-0 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500">
                                    <option value="">{copy.selectAndroid}</option>
                                    {Array.from({ length: 11 }, (_, i) => 16 - i).map(version => <option key={version} value={String(version)}>Android {version}</option>)}
                                    <option value="other">{copy.other}</option>
                                    <option value="unknown">{copy.unknown}</option>
                                    <option value="not_android">{copy.notAndroid}</option>
                                </select>
                                {androidVersion === 'other' && <input required aria-label={copy.otherVersion} placeholder={copy.otherVersion} maxLength={30} value={otherAndroidVersion} onChange={e => setOtherAndroidVersion(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]" />}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="feedback-phone" className="block text-sm font-medium text-[var(--text-primary)]">{copy.phone}</label>
                                <input id="feedback-phone" list="feedback-phone-models" value={phoneBrand} onChange={e => setPhoneBrand(e.target.value)} maxLength={120} placeholder={copy.phonePlaceholder} aria-describedby="feedback-phone-hint" className="w-full min-w-0 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500" />
                                <datalist id="feedback-phone-models">
                                    {['Samsung', 'Xiaomi / Redmi', 'OPPO', 'realme', 'vivo', 'Huawei', 'HONOR', 'Google Pixel', 'OnePlus', 'Motorola', 'Nokia', 'Infinix', 'TECNO', 'iPhone'].map(model => <option key={model} value={model} />)}
                                </datalist>
                                <label htmlFor="feedback-phone-model" className="block text-sm font-medium text-[var(--text-primary)]">{copy.model}</label>
                                <input id="feedback-phone-model" value={phoneModel} onChange={e => setPhoneModel(e.target.value)} maxLength={120} placeholder={copy.modelPlaceholder} aria-describedby="feedback-phone-hint" className="w-full min-w-0 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500" />
                                <p id="feedback-phone-hint" className="text-xs text-[var(--text-primary)] opacity-60">{copy.phoneHint}</p>
                            </div>
                            <div>
                                <label htmlFor="feedback-message" className="block text-sm font-medium text-[var(--text-primary)] opacity-80 mb-1">
                                    {t.feedbackDetails}
                                </label>
                                <textarea
                                    id="feedback-message"
                                    maxLength={10000}
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t.feedbackPlaceholder}
                                    className="w-full h-32 p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm font-medium text-[var(--text-primary)]">{copy.screenshot}</p>
                                <p id="feedback-screenshot-hint" className="text-sm rounded-xl p-3 bg-amber-50 text-amber-900 border border-amber-200">{copy.screenshotHint}</p>
                                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleScreenshot} className="hidden" aria-label={copy.add} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isPreparingImage} aria-describedby="feedback-screenshot-hint" className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500 p-3 text-[var(--text-primary)] disabled:opacity-50">
                                    <ImagePlus size={20} />{isPreparingImage ? copy.preparing : screenshot ? copy.replace : copy.add}
                                </button>
                                <p className="text-xs text-[var(--text-primary)] opacity-60">{copy.imageLimits}</p>
                                {imageError && <p role="alert" className="text-sm text-red-600">{imageError}</p>}
                                {screenshot && <div className="rounded-xl border border-[var(--border-primary)] p-2 space-y-2">
                                    <img src={`data:${screenshot.mimeType};base64,${screenshot.base64}`} alt={copy.screenshot} className="max-h-40 max-w-full mx-auto rounded-lg object-contain" />
                                    <button type="button" onClick={() => { ++imageRequestRef.current; setScreenshot(null); setImageError(''); setIsPreparingImage(false); }} className="text-sm text-red-600 flex items-center gap-1 mx-auto"><DeleteIcon size={16} />{copy.remove}</button>
                                </div>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || isPreparingImage || !message.trim()}
                                className={clsx(
                                    "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
                                    (isSubmitting || isPreparingImage || !message.trim())
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
                          </fieldset>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
