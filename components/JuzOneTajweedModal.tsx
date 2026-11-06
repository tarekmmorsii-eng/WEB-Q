import AyahDialogButton from './AyahDialogButton';
import ModalLogo from './ModalLogo';
import React, { useEffect, useRef, useState } from 'react';
import { SURAHS } from '../constants/surahData';
import { contextualReason, getHubVerse, HUB_API, HubMark, HubVerse, HubWord, ruleAppearance, ruleCondition } from '../services/juzOneTajweed';
import TajweedModal from './TajweedModal';

const paper: React.CSSProperties = { background: '#fffdf7', color: '#20252c', border: '1px solid #d6cdbd', borderRadius: 12, padding: 14 };
function WordText({ word, verse }: { word: HubWord; verse: HubVerse }) {
    // Keep combining signs with their base character; never recompose the source text.
    const clusters = [...new Intl.Segmenter('ar', { granularity: 'grapheme' }).segment(word.text)];
    return <>{clusters.map(({ segment, index }) => {
        const marks = word.marks.filter(m => verse.definitions[m.cls] && m.start !== null && m.end !== null && m.start < index + segment.length && m.end > index);
        const colors = [...new Set(marks.map(m => ruleAppearance(m.cls).color))];
        return <span key={index} style={{ color: colors.length === 1 ? colors[0] : undefined, borderBottom: colors.length > 1 ? '2px dotted #475569' : undefined }}>{segment}</span>;
    })}</>;
}

function RuleCard({ word, mark, verse, next }: { word: HubWord; mark: HubMark; verse: HubVerse; next?: HubWord }) {
    const definition = verse.definitions[mark.cls];
    const appearance = ruleAppearance(mark.cls);
    const reason = contextualReason(word, mark, next);
    return <article style={{ ...paper, marginTop: 10, lineHeight: 1.9 }}>
        <h4 className="font-bold"><span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 14, background: appearance.color, borderRadius: 3, marginInlineEnd: 8 }} />{definition?.name || 'علامة تحتاج تعريفًا من المصدر'} — {appearance.name}</h4>
        <p className="text-sm font-bold">{ruleCondition(mark.cls)}</p>
        {mark.start === null ? <p className="text-sm text-amber-900">تعذّر تثبيت موضع هذه العلامة حرفيًا؛ لم نلوّنها أو نعدّل النص.</p> : <p>الموضع المحدد في المصدر: <span className="notranslate" translate="no" style={{ fontFamily: 'Amiri, serif', fontSize: 25 }}>{mark.span}</span>{mark.cls.includes('tanween') && ' (الحرف الحامل للتنوين)'}</p>}
        {reason && <p><strong>سبب الحكم في السياق: </strong>{reason}</p>}
        <p><strong>تعريف المصدر وطريقة الأداء: </strong>{definition?.description || 'لا يتوفر تعريف لهذه العلامة؛ لا نستنتج شرحًا لها.'}</p>
        {!reason && <p className="text-sm opacity-75">المتاح هنا تعريف الحكم؛ لم يُعتمد شرح سببه الخاص بهذا الموضع.</p>}
        <a className="underline text-sm" href={`${HUB_API}/tajweed/rules/${encodeURIComponent(mark.cls)}?lang=ar`} target="_blank" rel="noopener noreferrer">مرجع تعريف الحكم</a>
    </article>;
}

function WordDetails({ word, next, verse }: { word: HubWord; next?: HubWord; verse: HubVerse }) {
    return <section data-testid={`word-details-${word.position}`} style={{ marginBottom: 18 }}>
        <h3 style={{ fontFamily: 'Amiri, serif', fontSize: 28 }}><span className="notranslate" translate="no">{word.text}</span> <span style={{ fontFamily: 'sans-serif', fontSize: 13 }}>— الكلمة {word.position}</span></h3>
        {word.marks.length === 0 && <p style={paper}>لا توجد علامات لهذه الكلمة في البيانات المتاحة؛ لا يعني ذلك خلوها من أحكام وصفات الأداء.</p>}
        {word.marks.map((mark, i) => <RuleCard key={i} word={word} mark={mark} verse={verse} next={next} />)}
        {word.location === '2:22:21' && <article style={{ ...paper, marginTop: 10, lineHeight: 1.9 }}>
            <h4 className="font-bold">مد العوض — برتقالي داكن</h4><p className="text-sm font-bold">عند الوقف فقط — إضافة تعليمية لعينة البقرة 22</p>
            <p><strong>الموضع: </strong>نهاية «أندادًا». <strong>السبب والأداء: </strong>عند الوقف يُعوّض عن تنوين الفتح بألف تمد حركتين، ولا يطبق إدغام التنوين في الواو حينئذ.</p>
            <a className="underline text-sm" href="https://tajweed.quranpedia.net/lessons/show/content/27" target="_blank" rel="noopener noreferrer">مرجع قاعدة مد العوض</a>
        </article>}
        <a className="underline text-sm" href={`${HUB_API}/word/tajweed?location=${word.location}`} target="_blank" rel="noopener noreferrer">مصدر مواضع هذه الكلمة</a>
    </section>;
}

export default function JuzOneTajweedModal({ surahNumber, ayahNumber, language, onBack, onClose }: {
    surahNumber: number; ayahNumber: number; language: string; onBack: () => void; onClose: () => void;
}) {
    const [data, setData] = useState<HubVerse | null>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [all, setAll] = useState(false);
    const [comparison, setComparison] = useState(false);
    const dialog = useRef<HTMLDivElement>(null);
    const details = useRef<HTMLDivElement>(null);
    const wordsPanel = useRef<HTMLDivElement>(null);
    const key = `${surahNumber}:${ayahNumber}`;
    const verse = data?.key === key ? data : null;
    useEffect(() => {
        const controller = new AbortController(); let active = true;
        const timer = setTimeout(() => controller.abort(), 20000);
        setData(null); setError(''); setSelected(null); setAll(false); setComparison(false);
        getHubVerse(surahNumber, ayahNumber, controller.signal).then(v => { if (active) setData(v); }).catch(e => {
            controller.abort();
            if (active) setError(e?.message === 'invalid' ? 'invalid' : 'network');
        }).finally(() => clearTimeout(timer));
        return () => { active = false; controller.abort(); clearTimeout(timer); };
    }, [key, surahNumber, ayahNumber, attempt]);
    useEffect(() => { if (!comparison) dialog.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, [comparison]);
    useEffect(() => { if (selected !== null || all) { details.current?.focus({ preventScroll: true }); details.current?.scrollIntoView({ block: 'nearest' }); } }, [selected, all]);
    if (comparison) return <TajweedModal surahNumber={surahNumber} ayahNumber={ayahNumber} language={language} onBack={() => setComparison(false)} onClose={onClose} />;
    const uncertain = verse?.words.reduce((n, w) => n + w.marks.filter(m => m.start === null || !verse.definitions[m.cls]).length, 0) || 0;
    return <div className="app-modal fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="juz-tajweed-title" dir="rtl" lang="ar" className="w-full max-w-xl flex flex-col rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xl" style={{ maxHeight: '92dvh', minHeight: 0 }} onKeyDown={e => {
            if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
            if (e.key === 'Tab') {
                const items = [...(dialog.current?.querySelectorAll<HTMLElement>('button, a[href], summary') || [])].filter(el => el.getClientRects().length > 0);
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        }}>
            <header className="p-3 border-b border-[var(--border-primary)] flex items-center justify-between gap-2">
                <AyahDialogButton kind="back" language={language} onClick={onBack}/>
                <div className="min-w-0 flex-1"><h2 id="juz-tajweed-title" className="modal-branded-title font-bold text-lg"><ModalLogo />أحكام التجويد</h2><p className="text-sm">{SURAHS[surahNumber - 1]?.name} · {ayahNumber} — تجربة الجزء الأول</p></div>
                <AyahDialogButton kind="close" language={language} onClick={onClose}/>
            </header>
            <div className="overflow-y-auto min-h-0 p-3" style={{ overflowWrap: 'anywhere' }}>
                <p className="text-sm leading-relaxed mb-3">تجربة تعليمية ببيانات QuranHub. تعرض العلامات المتاحة، ولم تُعتمد حصرًا لجميع الأحكام. أحكام الوقف والوصل تُبيّن داخل كل بطاقة.</p>
                {language !== 'ar' && <p className="text-sm mb-3" dir="ltr">This trial currently provides Arabic explanations.</p>}
                {!verse && !error && <p role="status">جارٍ تحميل الآية وأحكامها…</p>}
                {error && <div role="alert" style={paper}><p>{error === 'invalid' ? 'تعذّر عرض الآية لعدم سلامة بيانات المصدر.' : 'تعذّر التحميل. يلزم اتصال بالإنترنت؛ تحقق منه ثم أعد المحاولة.'}</p><button className="p-3 underline" onClick={() => setAttempt(n => n + 1)}>إعادة المحاولة</button></div>}
                {verse && <>
                    <p className="text-sm mb-2">اضغط على كلمة لعرض مواضع أحكامها وأسبابها المتاحة.</p>
                    <div ref={wordsPanel} data-testid="juz-tajweed-verse" className="notranslate" translate="no" style={{ ...paper, fontFamily: 'Amiri, Traditional Arabic, serif', fontSize: 30, lineHeight: 2.3, textAlign: 'center' }}>
                        {verse.words.map((word, i) => <React.Fragment key={word.position}><button aria-label={`شرح الكلمة ${word.position}: ${word.text}`} aria-pressed={selected === word.position && !all} data-testid={`tajweed-word-${word.position}`} onClick={() => { setSelected(word.position); setAll(false); }} style={{ font: 'inherit', minWidth: 44, minHeight: 44, padding: '0 3px', borderRadius: 6, background: selected === word.position && !all ? '#fef3c7' : 'transparent', outlineOffset: 2 }}><WordText word={word} verse={verse} /></button>{i < verse.words.length - 1 ? ' ' : ''}</React.Fragment>)}
                    </div>
                    <p className="text-xs my-2">اللون دليل مساعد؛ اسم الحكم هو المرجع. الخط المنقّط يعني اجتماع أكثر من لون في الموضع.</p>
                    {uncertain > 0 && <p role="status" className="text-sm my-2">توجد {uncertain} علامة تحتاج تحققًا من موضعها أو تعريفها؛ تُوضح في بطاقات الكلمات.</p>}
                    <button className="w-full rounded-lg bg-emerald-800 text-white p-3 my-3 font-bold" aria-pressed={all} onClick={() => { setAll(v => !v); setSelected(null); }}>{all ? 'إخفاء شرح الآية' : 'عرض أحكام الآية بالترتيب'}</button>
                    <div ref={details} tabIndex={-1} aria-label="شرح مواضع الأحكام">
                        {(all || selected !== null) && <button className="p-3 mb-2 rounded-lg bg-[var(--bg-secondary)]" onClick={() => { setAll(false); setSelected(null); wordsPanel.current?.scrollIntoView({ block: 'start' }); wordsPanel.current?.querySelector('button')?.focus({ preventScroll: true }); }}>العودة إلى كلمات الآية</button>}
                        {!all && selected === null && <p className="text-sm mb-3">اختر كلمة أو اعرض الشرح الكامل للعلامات المتاحة.</p>}
                        {verse.words.filter(w => all || w.position === selected).map(word => <WordDetails key={word.location} word={word} next={verse.words[word.position]} verse={verse} />)}
                    </div>
                    <p className="text-xs leading-relaxed mt-3">التعريفات من المصدر كما وردت؛ قد تذكر أكثر من طريق للقراءة. أسباب السياق المتاحة صياغة تعليمية منفصلة، وليست مراجعة علمية شاملة. التحميل عبر الإنترنت دون حفظ دائم.</p>
                </>}
                {key === '2:22' && <button className="p-3 underline text-sm" onClick={() => setComparison(true)}>فتح النموذجين السابقين للمقارنة</button>}
            </div>
        </div>
    </div>;
}
