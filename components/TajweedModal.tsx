import AyahDialogButton from './AyahDialogButton';
import ModalLogo from './ModalLogo';
import React, { useEffect, useRef, useState } from 'react';
import { getTajweedVerse, TAJWEED_RULES, TajweedSegment } from '../services/tajweedService';
import { SURAHS } from '../constants/surahData';
import QuranHubTajweedSample from './QuranHubTajweedSample';
import TajweedBaqarahSample from './TajweedBaqarahSample';

export default function TajweedModal({ surahNumber, ayahNumber, onBack, onClose, language }: {
    surahNumber: number; ayahNumber: number; onBack: () => void; onClose: () => void; language: string;
}) {
    const [result, setResult] = useState<{ key: string; segments: TajweedSegment[] } | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [sample, setSample] = useState<'previous' | 'hub'>('previous');
    const dialog = useRef<HTMLDivElement>(null);
    const key = `${surahNumber}:${ayahNumber}`;
    const ar = language === 'ar';
    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        const timeout = setTimeout(() => controller.abort(), 15000);
        setResult(null); setError('');
        getTajweedVerse(surahNumber, ayahNumber, controller.signal).then(segments => {
            if (!cancelled) setResult({ key, segments });
        }).catch(e => {
            if (!cancelled) setError(e?.message === 'invalid' ? 'invalid' : 'network');
        }).finally(() => clearTimeout(timeout));
        return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
    }, [key, surahNumber, ayahNumber, attempt]);
    useEffect(() => { dialog.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, []);
    const segments = result?.key === key ? result.segments : null;
    const rules = [...new Set(segments?.flatMap(s => s.rule ? [s.rule] : []) || [])];
    return <div className="app-modal fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="tajweed-title" dir={ar ? 'rtl' : 'ltr'} className="w-full max-w-xl max-h-[90dvh] flex flex-col rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xl" onKeyDown={e => {
            if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
            if (e.key === 'Tab') {
                const items = [...(dialog.current?.querySelectorAll<HTMLElement>('button, a, summary') || [])].filter(item => {
                    const details = item.closest('details');
                    return (!details || details.open || item.tagName === 'SUMMARY') && item.getClientRects().length > 0;
                });
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        }}>
            <header className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between gap-3">
                <AyahDialogButton kind="back" language={language} onClick={onBack}/>
                <div className="min-w-0 flex-1"><h2 id="tajweed-title" className="modal-branded-title font-bold text-lg"><ModalLogo />{ar ? 'أحكام التجويد' : 'Tajweed rules'}</h2><p className="text-sm opacity-70">{SURAHS[surahNumber - 1]?.name} · {ayahNumber}</p></div>
                <AyahDialogButton kind="close" language={language} onClick={onClose}/>
            </header>
            {key === '2:22' && <div dir="rtl" style={{ padding: 12, borderBottom: '1px solid var(--border-primary)', flexShrink: 0 }}>
                <p style={{ fontSize: 14, marginBottom: 8 }}>مقارنة النموذجين — اختر طريقة العرض</p>
                <div style={{ display: 'flex', gap: 8 }}>
                    {([{ id: 'previous', label: 'السابق: الشرح التفصيلي' }, { id: 'hub', label: 'الجديد: QuranHub' }] as const).map(item => <button key={item.id} aria-pressed={sample === item.id} onClick={() => setSample(item.id)} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #64748b', background: sample === item.id ? '#166534' : '#fffdf7', color: sample === item.id ? '#fff' : '#20252c', fontWeight: 700 }}>{item.label}</button>)}
                </div><p style={{ fontSize: 12, marginTop: 8 }}>السابق: مواضع مختارة وشروح مصاغة من مراجع. الجديد: كلمة واحدة وتعريف المصدر كما ورد.</p>
            </div>}
            <div className="overflow-y-auto min-h-0 p-4">
                {key === '2:22' && (sample === 'hub' ? <QuranHubTajweedSample /> : <TajweedBaqarahSample />)}
                {!segments && !error && <p role="status">{ar ? 'جارٍ تحميل الآية…' : 'Loading verse…'}</p>}
                {error && <div role="alert"><p>{error === 'invalid' ? (ar ? 'تعذّر عرض التجويد لعدم سلامة بيانات المصدر لهذه الآية.' : 'Tajweed could not be displayed because the source data is invalid.') : (ar ? 'تعذّر تحميل التجويد. تحقق من اتصال الإنترنت وحاول مجددًا.' : 'Could not load tajweed. Check your connection and retry.')}</p><button className="p-3 mt-3 rounded-lg bg-[var(--bg-secondary)]" onClick={() => setAttempt(n => n + 1)}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></div>}
                {segments && <>
                    <div dir="rtl" lang="ar" translate="no" className="notranslate rounded-xl bg-[#fffdf7] text-[#20252c] p-4 mb-5 text-center" style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '32px', lineHeight: 2.2 }} data-testid="tajweed-verse">
                        {segments.map((s, i) => <span key={i} style={s.rule ? { color: TAJWEED_RULES[s.rule].color } : undefined}>{s.text}</span>)}
                    </div>
                    <h3 className="font-bold mb-3">{ar ? 'مفتاح ألوان الآية وتعريفات الأحكام' : 'Verse color key and rule definitions'}</h3>
                    <p className="text-sm opacity-75 mb-3">{ar ? 'قد يشترك أكثر من حكم في اللون نفسه؛ اسم الحكم هو المرجع. التعريفات التالية عامة وليست حصرًا لكل أحكام الآية.' : 'Several rules may share a color. These Arabic definitions are not an exhaustive analysis.'}</p>
                    {rules.map(rule => <details key={`${key}:${rule}`} dir="rtl" lang="ar" className="border-t border-[var(--border-primary)] py-2">
                        <summary className="py-3 cursor-pointer"><span aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', background: TAJWEED_RULES[rule].color, width: 24, height: 24, borderRadius: 6, marginInlineEnd: 10 }} />{TAJWEED_RULES[rule].name} <span className="text-sm">— {({ '#64748b': 'رمادي', '#c2410c': 'برتقالي داكن', '#be123c': 'أحمر قرمزي', '#7c3aed': 'بنفسجي', '#15803d': 'أخضر', '#0369a1': 'أزرق' } as Record<string, string>)[TAJWEED_RULES[rule].color]}</span></summary>
                        <p className="leading-loose text-sm mb-2">{TAJWEED_RULES[rule].description}</p>
                        <a href={TAJWEED_RULES[rule].source} target="_blank" rel="noopener noreferrer" className="underline text-sm">مرجع الحكم</a>
                    </details>)}
                    <p className="text-xs opacity-70 mt-4">{ar ? 'التلوين: Quran.com. الشروح تعريفات مختصرة مع روابط مراجعها. يتطلب التحميل اتصالًا بالإنترنت.' : 'Annotations: Quran.com. Concise definitions with references. Loading requires an internet connection.'}</p>
                </>}
            </div>
        </div>
    </div>;
}

