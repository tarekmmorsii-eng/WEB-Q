import ModalLogo from './ModalLogo';
import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { TRANSLATION_EDITIONS } from '../utils/translationMapper';
import { prepareLanguage, isLanguageReady } from '../services/initialLanguageDownload';

export default function InitialLanguageDownload({ language, ready, onDismiss, requireConfirmation = false, onDownloadStart, forceTranslationRefresh = false }: {
    language: string | null; ready: boolean; onDismiss: () => void;
    requireConfirmation?: boolean; onDownloadStart?: () => void;
    forceTranslationRefresh?: boolean;
}) {
    const [status, setStatus] = useState<'loading' | 'done' | 'error' | 'checking' | 'offer' | 'cached'>(requireConfirmation ? 'checking' : 'loading');
    const [approved, setApproved] = useState(false);
    const [percent, setPercent] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const t = translations[language as Language] || translations.en;
    const edition = language ? TRANSLATION_EDITIONS[language] : undefined;
    useEffect(() => {
        if (!language) return;
        let active = true;
        if (requireConfirmation && !approved) {
            setStatus('checking');
            isLanguageReady(language).then(cached => { if (active) setStatus(cached ? 'cached' : 'offer'); })
                .catch(() => { if (active) setStatus('offer'); });
            return () => { active = false; };
        }
        setStatus('loading'); setPercent(0);
        prepareLanguage(language, p => { if (active) setPercent(p); }, forceTranslationRefresh)
            .then(() => { if (active) setStatus('done'); })
            .catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [language, attempt, requireConfirmation, approved, forceTranslationRefresh]);
    if (!language || !ready) return null;
    if (language === 'ar') return null;
    if (status === 'checking' || status === 'cached') return null;
    const unavailable = !edition?.editionId;
    const offering = status === 'offer' && !unavailable;
    return <div className="app-modal fixed inset-0 z-[100001] bg-black/60 flex items-center justify-center p-4" dir={t.dir === 'rtl' ? 'rtl' : 'ltr'}>
        <section role="dialog" aria-modal="true" aria-labelledby="language-download-title" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white text-slate-800 p-6 text-center shadow-xl">
            {status === 'loading' ? <Loader2 aria-hidden="true" className="animate-spin mx-auto text-amber-600 mb-4" size={36} /> : status === 'done' ? <CheckCircle aria-hidden="true" className="mx-auto text-green-700 mb-4" size={36} /> : null}
            <h2 id="language-download-title" className="modal-branded-title font-bold text-xl" aria-live="polite"><ModalLogo />{unavailable ? t.initialLanguageDownload.unavailable : offering ? (edition.hasWbw ? t.initialLanguageDownload.askBoth : t.initialLanguageDownload.askTafsir) : status === 'done' ? t.initialLanguageDownload.done : t.initialLanguageDownload.title}</h2>
            {offering && <button className="w-full p-3 mt-4 rounded-xl bg-amber-600 text-white" onClick={() => { onDownloadStart?.(); setApproved(true); }}>{t.download}</button>}
            {status === 'loading' && <p role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={t.initialLanguageDownload.title} className="my-3">{percent}%</p>}
            {!edition?.hasWbw && !unavailable && <p className="mt-4 text-sm leading-relaxed">{t.initialLanguageDownload.noWbw}</p>}
            {status === 'error' && !unavailable && <button className="w-full p-3 mt-4 rounded-xl bg-amber-600 text-white" onClick={() => setAttempt(n => n + 1)}>{t.privacyContribution.retry}</button>}
            <button className="w-full p-3 mt-4 rounded-xl border border-slate-300" onClick={onDismiss}>{t.privacyContribution.continue}</button>
        </section>
    </div>;
}
