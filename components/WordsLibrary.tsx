import DeleteIcon from './DeleteIcon';
import React, { useEffect, useRef, useState } from 'react';
import { X, Star, Search, Pencil, MapPin,  Volume2, Square, Loader2 } from 'lucide-react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { translations, Language } from '../i18n/translations';
import { SURAHS } from '../constants/surahData';
import { useWordReviews, saveWordReview, removeWordReview, clearWordReviews, WordReview } from '../services/wordReview';
import { loadWordReviewVerses, loadReviewWordFont, ReviewVerse } from '../services/wordReviewVerses';
import { useWordByWordAudio } from '../hooks/useWordByWordAudio';
import LibraryDeleteAllDialog from './LibraryDeleteAllDialog';
import WordReviewEditor from './WordReviewEditor';
import './wordsLibrary.css';
import './libraryDesign.css';

const keyboard = registerPlugin<{ hideKeyboard(): Promise<void> }>('MushafSystemBars');
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').toLowerCase();
const format = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
const hasGlyphs = (text: string) => /[\uE000-\uF8FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

function ReviewWord({ record, fallbackLabel }: { record: WordReview; fallbackLabel: string }) {
    const glyph = hasGlyphs(record.word);
    const [loaded, setLoaded] = useState(!glyph);
    useEffect(() => {
        let active = true;
        setLoaded(!glyph);
        if (glyph) loadReviewWordFont(record.page).then(() => { if (active) setLoaded(true); }).catch(() => {});
        return () => { active = false; };
    }, [glyph, record.page]);
    return <span data-review-word dir="rtl" style={{ fontFamily: glyph ? `review-p${record.page}-v2` : "'Amiri', serif", fontSize: 28, lineHeight: 1.8 }}>
        {loaded ? record.word : fallbackLabel}
    </span>;
}

export default function WordsLibrary({ language = 'ar', onClose, onNavigate, onBeforeWordAudio }: {
    language?: string; onClose: () => void; onNavigate?: (surah: number, ayah: number) => Promise<void>; onBeforeWordAudio?: () => void;
}) {
    const locale = translations[language as Language] || translations.en;
    const text = locale.wordReview;
    const bulk = locale.libraryActions;
    const [deleteAll,setDeleteAll] = useState(false);
    const number = (value: number) => new Intl.NumberFormat(language).format(value);
    const surahName = (value: number) => locale.surahNames?.[value - 1] || SURAHS.find(s => s.number === value)?.name || String(value);
    const { activeWord, playWordAudio, stopAudio } = useWordByWordAudio(text.wordAudioError);
    const [loadingWord, setLoadingWord] = useState<string | null>(null);
    const audioRequest = useRef(0);
    useEffect(() => () => { audioRequest.current++; }, []);
    const playingKey = activeWord ? `${activeWord.surah}:${activeWord.ayah}:${activeWord.word}` : null;
    const stopWordAudio = () => { audioRequest.current++; setLoadingWord(null); stopAudio(); };
    const toggleWordAudio = async (record: WordReview) => {
        if (playingKey === record.key || loadingWord === record.key) { stopWordAudio(); return; }
        const request = ++audioRequest.current;
        setLoadingWord(record.key);
        try {
            onBeforeWordAudio?.();
            await playWordAudio(record.surah, record.ayah, record.position);
        } catch { setError('wordAudioError'); }
        finally { if (request === audioRequest.current) setLoadingWord(null); }
    };
    const records = useWordReviews();
    const words = Object.values(records);
    const [query, setQuery] = useState('');
    const [surah, setSurah] = useState('');
    const [filter, setFilter] = useState('all');
    const [order, setOrder] = useState('recent');
    const [verses, setVerses] = useState<Record<string, ReviewVerse>>({});
    const [verseState, setVerseState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [retry, setRetry] = useState(0);
    const [error, setError] = useState<'wordAudioError' | 'operationError' | ''>('');
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [deleting, setDeleting] = useState<string | null>(null);
    const [removed, setRemoved] = useState<WordReview | null>(null);

    useEffect(() => {
        let active = true;
        setVerseState('loading');
        loadWordReviewVerses().then(value => { if (active) { setVerses(value); setVerseState('ready'); } })
            .catch(() => { if (active) setVerseState('error'); });
        return () => { active = false; };
    }, [retry]);

    const run = async (action: () => void | Promise<void>) => {
        setError(''); setBusy(true);
        try { await action(); } catch { setError('operationError'); }
        finally { setBusy(false); }
    };
    const dismissKeyboard = async () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (Capacitor.getPlatform() === 'android') await keyboard.hideKeyboard();
    };
    const filtered = words.filter(record => {
        if (surah && record.surah !== Number(surah)) return false;
        if (filter === 'forgotten' && !record.forgotten) return false;
        if (filter === 'pronunciation' && !record.pronunciation) return false;
        if (filter === 'both' && !(record.forgotten && record.pronunciation)) return false;
        if (filter === 'notes' && (record.forgotten || record.pronunciation || !record.note.trim())) return false;
        const text = `${hasGlyphs(record.word) ? '' : record.word} ${record.note} ${surahName(record.surah)} ${record.surah}:${record.ayah} ${verses[`${record.surah}:${record.ayah}`]?.text || ''}`;
        return normalize(text).includes(normalize(query.trim()));
    }).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) ||
        (order === 'recent' ? (b.updatedAt || 0) - (a.updatedAt || 0) : 0) ||
        a.surah - b.surah || a.ayah - b.ayah || a.position - b.position);

    const audioVisible = (!playingKey || filtered.some(record => record.key === playingKey)) &&
        (!loadingWord || filtered.some(record => record.key === loadingWord));
    useEffect(() => {
        if (!audioVisible) { audioRequest.current++; setLoadingWord(null); stopAudio(); }
    }, [audioVisible, stopAudio]);

    return <div className="app-modal library-backdrop fixed inset-0 z-[100000]"><div data-words-library role="dialog" aria-modal="true" aria-label={text.wordsTitle} dir={locale.dir} className="app-modal-panel words-library library-design">
        <header className="words-library-header library-header">
            <img src="/final_logo.png" alt="" className="library-logo" /><h2>{text.wordsTitle}</h2>
            <div className="library-header-actions">
                <button type="button" className="library-danger library-header-delete" aria-label={bulk.deleteAllWords} title={bulk.deleteAllWords} disabled={busy||!words.length} onClick={()=>void run(async()=>{await dismissKeyboard();setDeleteAll(true)})}><DeleteIcon size={20}/></button>
                <button className="library-close" aria-label={text.closeWords} disabled={busy} onClick={() => void run(async () => { stopWordAudio(); await dismissKeyboard(); onClose(); })}><X size={20} /></button>
            </div>
        </header>
        <div className="words-library-controls">
            <label className="words-library-search"><Search size={18} /><input aria-label={text.searchLabel} placeholder={text.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} /></label>
            <div className="words-library-filters">
                <select aria-label={text.surahFilterLabel} value={surah} onChange={e => setSurah(e.target.value)}><option value="">{text.allSurahs}</option>{SURAHS.filter(s => words.some(w => w.surah === s.number)).map(s => <option key={s.number} value={s.number}>{surahName(s.number)}</option>)}</select>
                <select aria-label={text.difficultyFilterLabel} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">{text.allStates}</option><option value="forgotten">{text.forgotten}</option><option value="pronunciation">{text.pronunciation}</option><option value="both">{text.bothProblems}</option><option value="notes">{text.notesOnlyFilter}</option></select>
                <select aria-label={text.sortLabel} value={order} onChange={e => setOrder(e.target.value)}><option value="recent">{text.recentOrder}</option><option value="quran">{text.quranOrder}</option></select>
            </div>
            <div className="words-library-results"><span>{format(text.resultCount, {shown: number(filtered.length), total: number(words.length)})}</span>{(query || surah || filter !== 'all') && <button onClick={() => { setQuery(''); setSurah(''); setFilter('all'); }}>{text.clearFilters}</button>}</div>
        </div>
        {error && <p role="alert" className="words-library-message">{text[error]}</p>}
        {verseState === 'error' && <div role="alert" className="words-library-message">{text.verseLoadError} <button onClick={() => setRetry(v => v + 1)}>{text.retry}</button></div>}
        {removed && <div role="status" className="words-library-message">{text.deletedWithNote} <button disabled={busy} onClick={() => void run(() => { saveWordReview(removed); setRemoved(null); })}>{text.undoDelete}</button></div>}
        <main className="words-library-list">
            {!words.length ? <p className="words-library-empty">{text.emptyLibrary}</p> : !filtered.length ? <p className="words-library-empty">{text.noResults}</p> : filtered.map(record => {
                const verse = verses[`${record.surah}:${record.ayah}`];
                return <article key={record.key} data-word-review-key={record.key} className="words-library-card">
                    <div className="words-library-card-heading"><div><h3>{format(text.verseHeading, {surah: surahName(record.surah), ayah: number(record.ayah)})}</h3><p className="words-library-reference">{format(text.wordReference, {page: number(record.page), position: number(record.position)})}</p></div>
                        <button className="words-library-pin" aria-label={record.pinned ? text.unpinWord : text.pinWord} aria-pressed={!!record.pinned} disabled={busy} onClick={() => void run(() => saveWordReview({ ...record, pinned: !record.pinned }))}><Star size={18} fill={record.pinned ? 'currentColor' : 'none'} /></button>
                    </div>
                    <div className="words-library-word-row">
                        <ReviewWord record={record} fallbackLabel={format(text.wordOrdinal, {position: number(record.position)})} />
                        <button className="words-library-audio" type="button" aria-label={playingKey === record.key ? text.stopWordLabel : loadingWord === record.key ? text.cancelWordLoadLabel : text.playWordLabel} aria-pressed={playingKey === record.key || loadingWord === record.key} aria-busy={loadingWord === record.key} disabled={busy} onClick={() => void toggleWordAudio(record)}>
                            {playingKey === record.key ? <Square size={17} /> : loadingWord === record.key ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                            {playingKey === record.key ? text.stop : loadingWord === record.key ? text.audioLoading : text.listen}
                        </button>
                    </div>
                    <div className="words-library-status">{record.forgotten && <span className="forgotten">{text.forgotten}</span>}{record.pronunciation && <span className="pronunciation">{text.pronunciation}</span>}{!record.forgotten && !record.pronunciation && <span>{text.noteOnlyStatus}</span>}</div>
                    {verse ? <div><p data-review-verse dir="rtl" className={`words-library-verse ${expanded[record.key] ? '' : 'words-library-preview'}`}>{verse.text}</p><button className="words-library-expand" aria-expanded={!!expanded[record.key]} onClick={() => setExpanded(value => ({ ...value, [record.key]: !value[record.key] }))}>{expanded[record.key] ? text.collapseVerse : text.expandVerse}</button></div> : <p className="words-library-reference">{verseState === 'loading' ? text.verseLoading : text.verseUnavailable}</p>}
                    {record.note && editing !== record.key && <p data-review-note dir="auto" className="words-library-note">{record.note}</p>}
                    {editing === record.key && <div className="words-library-editor"><WordReviewEditor record={record} language={language} /><button disabled={busy} onClick={() => void run(async () => { await dismissKeyboard(); setEditing(null); })}>{text.done}</button></div>}
                    <div className="words-library-actions">
                        {onNavigate && <button disabled={busy} onClick={() => void run(async () => { stopWordAudio(); await dismissKeyboard(); await onNavigate(record.surah, record.ayah); onClose(); })}><MapPin size={16} />{text.goToOccurrence}</button>}
                        <button aria-expanded={editing === record.key} onClick={() => setEditing(value => value === record.key ? null : record.key)}><Pencil size={16} />{text.edit}</button>
                        {editing !== record.key && (record.forgotten || record.pronunciation) && <button disabled={busy} onClick={() => void run(() => saveWordReview({ ...record, forgotten: false, pronunciation: false }))}>{text.clearMarks}</button>}
                        <button className="library-danger" disabled={busy} onClick={() => setDeleting(record.key)}><DeleteIcon size={16} />{text.delete}</button>
                    </div>
                    {deleting === record.key && <div className="words-library-confirm"><p>{text.confirmDeleteQuestion}</p><div className="words-library-actions"><button className="library-danger" disabled={busy} onClick={() => void run(() => { removeWordReview(record.key); setRemoved(record); setDeleting(null); })}>{text.confirmDelete}</button><button onClick={() => setDeleting(null)}>{text.cancel}</button></div></div>}
                </article>;
            })}
        </main>
        {deleteAll&&<LibraryDeleteAllDialog title={bulk.deleteAllWords} message={bulk.wordsWarning} confirmLabel={text.confirmDelete} cancelLabel={text.cancel} busy={busy} error={error?text[error]:undefined} onCancel={()=>setDeleteAll(false)} onConfirm={()=>void run(()=>{stopWordAudio();clearWordReviews();setRemoved(null);setDeleting(null);setEditing(null);setDeleteAll(false)})}/>}
    </div></div>;
}
