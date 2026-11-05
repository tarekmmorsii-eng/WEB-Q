import DeleteIcon from './DeleteIcon';
import React,{useEffect,useRef,useState}from'react';
import{X,Star,Search,FileDown,Share2}from'lucide-react';
import{Capacitor,registerPlugin}from'@capacitor/core';
import{AyahNote,listAyahNotes,saveAyahNote,setAyahNotePinned,importAyahNotes,clearAyahNotes}from'../services/ayahNotes';
import{translations}from'../i18n/translations';
import{SURAHS}from'../constants/surahData';
import{normalizeSharedVerseText}from'../services/ayahSharing';
import LibraryDeleteAllDialog from './LibraryDeleteAllDialog';
import {formatNotesText,saveNotesText,shareNotesText,isExportCancelled} from '../services/notesTextExport';
import AyahToolsModal from'./AyahToolsModal';
import './libraryDesign.css';
import{ayahToolsText,notesDirection,notesLocale}from'../i18n/ayahToolsText';
const keyboard=registerPlugin<{hideKeyboard():Promise<void>}>('MushafSystemBars');
const groups:never[]=[];
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLowerCase();
interface Props{language:string;onClose:()=>void;onNavigate:(surah:number,ayah:number)=>Promise<void>}
export default function NotesLibrary({language,onClose,onNavigate}:Props){
 const tools=ayahToolsText(language),dictionary=translations[notesLocale(language)],t={...tools,question:tools.deleteQuestion,loading:tools.busy};
 const bulk=dictionary.libraryActions;
 const[deleteAll,setDeleteAll]=useState(false),[exportOpen,setExportOpen]=useState(false),[exportStatus,setExportStatus]=useState('');
 const exportRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!exportOpen)return;const close=(e:PointerEvent)=>{if(!exportRef.current?.contains(e.target as Node))setExportOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[exportOpen]);
 const[notes,setNotes]=useState<AyahNote[]>([]),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const[query,setQuery]=useState(''),[surah,setSurah]=useState(''),[order,setOrder]=useState('recent'),[expanded,setExpanded]=useState<Record<string,boolean>>({});
 const[editing,setEditing]=useState<AyahNote|null>(null),[deleting,setDeleting]=useState<string|null>(null),[removed,setRemoved]=useState<AyahNote|null>(null);
 const[verses,setVerses]=useState<Record<string,{text:string;page:number}>>({});const live=useRef(true);
 const load=async()=>{const value=await listAyahNotes();if(live.current){setNotes(value.filter(n=>n.text.trim()));setLoaded(true)}};
 useEffect(()=>{live.current=true;load().catch(()=>setError(t.error));return()=>{live.current=false}},[]);
 useEffect(()=>{let cancelled=false;fetch('/quran.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{const wanted=new Set(notes.map(n=>n.key)),next:Record<string,{text:string;page:number}>={};for(const s of data.data.surahs)for(const a of s.ayahs){const key=`${s.number}:${a.numberInSurah}`;if(wanted.has(key))next[key]={text:normalizeSharedVerseText(a.text,s.number,a.numberInSurah),page:a.page}}if(!cancelled)setVerses(next)}).catch(()=>{});return()=>{cancelled=true}},[notes]);
 const run=async(action:()=>Promise<void>)=>{setBusy(true);setError('');try{await action()}catch{if(live.current)setError(t.error)}finally{if(live.current)setBusy(false)}};
 const dismissKeyboard=async()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();if(Capacitor.getPlatform()==='android')await keyboard.hideKeyboard()};
 const close=()=>void run(async()=>{await dismissKeyboard();onClose()});
 const name=(n:number)=>dictionary.surahNames?.[n-1]||SURAHS.find(s=>s.number===n)?.name||String(n);
 const filtered=notes.filter(n=>(!surah||n.surah===Number(surah))&&normalize(`${n.text} ${name(n.surah)} ${n.surah}:${n.ayah}`).includes(normalize(query.trim()))).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(order==='recent'?b.updatedAt-a.updatedAt:a.surah-b.surah||a.ayah-b.ayah));
 const exportAll=(kind:'save'|'share')=>void run(async()=>{
  setExportOpen(false);setExportStatus('');await dismissKeyboard();
  const all=await listAyahNotes();const text=formatNotesText(all,name,t.ayah);if(!text)return;
  try{if(kind==='save')await saveNotesText(text);else if(await shareNotesText(text,tools.notes)==='copied')setExportStatus(tools.copied)}catch(error){if(!isExportCancelled(error))throw error}
 });
 const button='px-3 py-2 min-h-11 border border-[var(--border-primary)] rounded-lg font-bold disabled:opacity-40';
 if(editing)return <AyahToolsModal mode="notes" surah={editing.surah} ayah={editing.ayah} language={language} reciter="husary" groups={groups} onBack={()=>{setEditing(null);void run(load)}} onClose={()=>{setEditing(null);void run(load)}}/>;
 return <div className="app-modal library-backdrop fixed inset-0 z-[1100]"><div data-notes-library role="dialog" aria-modal="true" aria-label={tools.notes} className="app-modal-panel library-design notes-library flex flex-col" dir={notesDirection(language)}>
 <header className="library-header"><img src="/final_logo.png" alt="" className="library-logo"/><h2>{tools.notes}<small>{notes.length} {t.count}</small></h2><div className="library-header-actions" ref={exportRef} onKeyDown={e=>{if(e.key==='Escape'&&exportOpen){e.stopPropagation();setExportOpen(false)}}}>
 <button type="button" className="library-danger library-header-delete" title={bulk.deleteAllNotes} aria-label={bulk.deleteAllNotes} disabled={busy||!notes.length||!loaded} onClick={()=>void run(async()=>{setExportOpen(false);await dismissKeyboard();setDeleteAll(true)})}><DeleteIcon size={20}/></button>
 <button type="button" title={bulk.exportNotes} aria-label={bulk.exportNotes} aria-expanded={exportOpen} disabled={busy||!notes.length} onClick={()=>setExportOpen(v=>!v)}><FileDown size={20}/></button>
 <button className="library-close" disabled={busy} onClick={close} aria-label={tools.close}><X size={24}/></button>
 {exportOpen&&<div className="library-export-menu" role="group" aria-label={bulk.exportNotes}><button type="button" disabled={busy} onClick={()=>exportAll('save')}><FileDown size={18}/>{bulk.saveText}</button><button type="button" disabled={busy} onClick={()=>exportAll('share')}><Share2 size={18}/>{bulk.shareText}</button></div>}
 </div></header>
 <div className="library-controls p-3 space-y-2 shrink-0"><label className="flex items-center gap-2"><Search size={18}/><input aria-label={t.search} placeholder={t.search} value={query} onChange={e=>setQuery(e.target.value)} className="w-full min-w-0 p-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)]"/></label><div className="flex gap-2"><select aria-label={t.all} value={surah} onChange={e=>setSurah(e.target.value)} className="min-w-0 flex-1 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]"><option value="">{t.all}</option>{SURAHS.filter(s=>notes.some(n=>n.surah===s.number)).map(s=><option key={s.number} value={s.number}>{name(s.number)}</option>)}</select><select aria-label={t.recent} value={order} onChange={e=>setOrder(e.target.value)} className="min-w-0 flex-1 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]"><option value="recent">{t.recent}</option><option value="quran">{t.quran}</option></select></div></div>
 {exportStatus&&<p role="status" className="p-2">{exportStatus}</p>}
 {error&&<p role="alert" className="p-2 text-red-600">{error}</p>}
 {removed&&<div role="status" className="p-2 flex gap-2 items-center"><span>{t.deleted}</span><button className={button} disabled={busy} onClick={()=>void run(async()=>{await importAyahNotes([removed]);setRemoved(null);await load()})}>{t.undo}</button></div>}
 <main className="library-list overflow-y-auto min-h-0 flex-1 p-3 space-y-3" style={{overscrollBehavior:'contain'}}>
 {!loaded?<p>{t.loading}</p>:!notes.length?<p>{t.empty}</p>:!filtered.length?<p>{t.noResults}</p>:filtered.map(n=><article data-note-key={n.key} key={n.key} className="library-card p-3 space-y-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)]">
 <div className="flex gap-2 items-start"><h3 className="font-bold flex-1">{name(n.surah)} · {t.ayah} {n.ayah}{verses[n.key]&&<span className="library-reference">{t.page} {verses[n.key].page}</span>}</h3><button aria-label={n.pinned?t.unpin:t.pin} aria-pressed={!!n.pinned} className={`${button} text-amber-600`} disabled={busy} onClick={()=>void run(async()=>{await setAyahNotePinned(n.surah,n.ayah,!n.pinned);await load()})}><Star size={18} fill={n.pinned?'currentColor':'none'}/></button></div>
 {verses[n.key]&&<p dir="rtl" className="library-verse line-clamp-2">{verses[n.key].text}</p>}
 <p data-note-text dir="auto" className={`library-note whitespace-pre-wrap break-words leading-relaxed ${expanded[n.key]||!(n.text.length>180||n.text.split('\n').length>4)?'':'line-clamp-4'}`}>{n.text}</p>
 {n.text.length>180||n.text.split('\n').length>4?<button className={button} onClick={()=>setExpanded(v=>({...v,[n.key]:!v[n.key]}))}>{expanded[n.key]?t.less:t.more}</button>:null}
 <div className="library-actions flex flex-wrap gap-2"><button className={`${button} library-go`} disabled={busy} onClick={()=>void run(async()=>{await dismissKeyboard();await onNavigate(n.surah,n.ayah)})}>{t.go}</button><button className={`${button} library-edit`} disabled={busy} onClick={()=>void run(async()=>{await dismissKeyboard();setEditing(n)})}>{t.edit}</button><button className={`${button} text-red-600 inline-flex items-center gap-1`} disabled={busy} onClick={()=>setDeleting(n.key)}><DeleteIcon size={16}/>{t.remove}</button></div>
 {deleting===n.key&&<div className="p-2 space-y-2 border rounded-lg"><p>{t.question}</p><button className={`${button} text-red-600`} disabled={busy} onClick={()=>void run(async()=>{await saveAyahNote(n.surah,n.ayah,'');setRemoved(n);setDeleting(null);await load()})}>{tools.confirmDelete}</button><button className={button} disabled={busy} onClick={()=>setDeleting(null)}>{t.cancel}</button></div>}
 </article>)}
 </main>
 {deleteAll&&<LibraryDeleteAllDialog title={bulk.deleteAllNotes} message={bulk.notesWarning} confirmLabel={tools.confirmDelete} cancelLabel={tools.cancel} busy={busy} error={error} onCancel={()=>setDeleteAll(false)} onConfirm={()=>void run(async()=>{await clearAyahNotes();setRemoved(null);setDeleting(null);setDeleteAll(false);await load()})}/>}
 </div></div>;
}
