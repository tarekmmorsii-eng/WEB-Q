import AyahDialogButton from './AyahDialogButton';
import DeleteIcon from './DeleteIcon';
import ModalLogo from './ModalLogo';
import React,{useEffect,useRef,useState}from'react';
import{StickyNote,Share2}from'lucide-react';
import{ayahToolsText,notesDirection}from'../i18n/ayahToolsText';
import{translations,Language}from'../i18n/translations';
import{RECITERS_LIST}from'../services/reciterService';
import{NOTE_MAX_LENGTH,getAyahNote,saveAyahNote}from'../services/ayahNotes';
import{VerseShareContent,loadVerseShareContent,formatVerseShare,prepareVerseAudio,shareVerse}from'../services/ayahSharing';
import{Capacitor,registerPlugin}from'@capacitor/core';
import{useReadingUiScale}from'./ReadingUiScale';
import type{Mutashabiha}from'../types';

const readNotesViewport=()=>Capacitor.getPlatform()==='android'?{height:window.innerHeight,top:0}:{height:window.visualViewport?.height||window.innerHeight,top:window.visualViewport?.offsetTop||0};
const notesKeyboard=registerPlugin<{hideKeyboard():Promise<void>}>('MushafSystemBars');

interface Props{mode:'notes'|'share';surah:number;ayah:number;language:string;reciter:string;explanation?:string;groups:Mutashabiha[];onBack:()=>void;onClose:()=>void}
export default function AyahToolsModal({mode,surah,ayah,language,reciter,explanation,groups,onBack,onClose}:Props){
 const scale=useReadingUiScale();
 const[viewport,setViewport]=useState(readNotesViewport);
 useEffect(()=>{const update=()=>setViewport(readNotesViewport());window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);window.addEventListener('resize',update);update();return()=>{window.visualViewport?.removeEventListener('resize',update);window.visualViewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[]);
 const[savedNote,setSavedNote]=useState(''),[confirmDelete,setConfirmDelete]=useState(false);
 const[shared,setShared]=useState({text:false,audio:false});
 const[includeAudio,setIncludeAudio]=useState(false),[audioLoading,setAudioLoading]=useState(false),[audioError,setAudioError]=useState(''),[includeNote,setIncludeNote]=useState(false);
 const t=ayahToolsText(language),dictionary=translations[language as Language]||translations.en;
 const[note,setNote]=useState(''),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
 const[content,setContent]=useState<VerseShareContent|null>(null),[audio,setAudio]=useState<File|null>(null);
 const[include,setInclude]=useState({explanation:true,similar:true,words:true});
 const live=useRef(true),audioAbort=useRef<AbortController|null>(null);
 const noteWrites=useRef<Promise<void>>(Promise.resolve()),noteRevision=useRef(0);
 const groupsKey=JSON.stringify(groups.map(g=>[g.id,g.sourceAyah.surahNumber,g.sourceAyah.ayahNumber,...g.similarAyahs.map(a=>`${a.surahNumber}:${a.ayahNumber}`)]));
 useEffect(()=>{live.current=true;return()=>{live.current=false;audioAbort.current?.abort()}},[]);
 useEffect(()=>{
  let cancelled=false;setLoaded(false);setError('');setStatus('');setAudio(null);setContent(null);
  noteRevision.current++;
  if(mode!=='notes')return;
  const task=getAyahNote(surah,ayah).then(value=>{if(!cancelled){setNote(value);setSavedNote(value);setConfirmDelete(false)}});
  task.then(()=>{if(!cancelled)setLoaded(true)}).catch(()=>{if(!cancelled)setError(mode==='notes'?t.invalid:t.unavailable)});
  return()=>{cancelled=true;audioAbort.current?.abort()};
 },[mode,surah,ayah]);
 useEffect(()=>{
  if(mode!=='share')return;
  let cancelled=false;getAyahNote(surah,ayah).then(value=>{if(!cancelled)setSavedNote(value)}).catch(()=>{});setLoaded(false);setError('');setStatus('');setContent(null);
  loadVerseShareContent(surah,ayah,language,explanation,groups).then(value=>{if(!cancelled){setContent(value);setLoaded(true)}}).catch(()=>{if(!cancelled)setError(t.unavailable)});
  return()=>{cancelled=true};
 },[mode,surah,ayah,language,explanation,groupsKey,reciter]);
 const writeNote=(value:string)=>{
  const revision=++noteRevision.current;
  const task=noteWrites.current.catch(()=>{}).then(()=>saveAyahNote(surah,ayah,value));noteWrites.current=task;
  task.then(()=>{if(live.current&&revision===noteRevision.current){setSavedNote(value);setStatus(t.saved)}}).catch(()=>{if(live.current&&revision===noteRevision.current)setError(t.invalid)});
  return task;
 };
 const persist=async()=>{if(!loaded)throw Error('Not loaded');await writeNote(note.trim())};
 const run=async(task:()=>Promise<void>,message=t.invalid)=>{setBusy(true);setError('');setStatus('');try{await task()}catch(e){if(live.current&&!/cancel|abort/i.test(String((e as Error)?.message)+' '+(e as Error)?.name))setError(message)}finally{if(live.current)setBusy(false)}};
 const closeAfterKeyboard=async(action:()=>void)=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();if(Capacitor.getPlatform()==='android')await notesKeyboard.hideKeyboard();if(live.current)action()};
 const leave=(action:()=>void)=>{if(mode==='notes'&&loaded)void run(async()=>{await persist();await closeAfterKeyboard(action)});else action()};
 useEffect(()=>{
  if(mode!=='share'||!includeAudio){audioAbort.current?.abort();setAudio(null);setAudioLoading(false);setAudioError('');return}
  let cancelled=false;const controller=new AbortController();audioAbort.current=controller;setAudio(null);setAudioLoading(true);setAudioError('');
  prepareVerseAudio(surah,ayah,reciter,controller.signal).then(file=>{if(!cancelled)setAudio(file)}).catch(e=>{if(!cancelled&&!controller.signal.aborted)setAudioError(t.audioError)}).finally(()=>{if(!cancelled)setAudioLoading(false)});
  return()=>{cancelled=true;controller.abort()};
 },[mode,includeAudio,surah,ayah,reciter]);
 const preview=content?[formatVerseShare(content,language,include),includeNote&&savedNote?`${t.notes}\n${savedNote}`:''].filter(Boolean).join('\n\n'):'';
 const reader=dictionary.reciters?.[reciter]||RECITERS_LIST.find(r=>r.id===reciter)?.name||reciter;
 const share=(kind:'text'|'audio')=>void run(async()=>{
  const result=await shareVerse(kind==='text'?preview:'',kind==='audio'?audio||undefined:undefined,language);
  if(!live.current)return;
  if(result==='copied'){setStatus(t.copied);return}
  const next={...shared,[kind]:true};setShared(next);if(next.text&&next.audio)onClose();
 },t.shareError);
 const button='rounded-lg px-3 py-2 min-h-11 border border-[var(--border-primary)] font-bold disabled:opacity-40';
 return <div data-ayah-tools={mode} className="app-modal fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir={notesDirection(language)} style={mode==='notes'?{height:viewport.height/scale,top:viewport.top/scale,bottom:'auto',padding:8/scale,paddingTop:24/scale,alignItems:'flex-start'}:undefined}>
  <section style={mode==='notes'?{maxWidth:'28rem',maxHeight:Math.min(560,(viewport.height-40)/scale),overflow:'hidden'}:undefined} className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl shadow-xl w-full max-w-xl max-h-[90dvh] min-h-0 flex flex-col overflow-hidden">
   <header className="flex items-center justify-between gap-2 p-3 border-b border-[var(--border-primary)] shrink-0">
    <AyahDialogButton kind="back" language={language} disabled={busy&&mode==='notes'} onClick={()=>leave(onBack)}/>
    <h2 className="modal-branded-title font-bold text-center text-sm min-w-0"><ModalLogo />{mode==='notes'?t.notes:t.share} · {surah}:{ayah}</h2>
    <AyahDialogButton kind="close" language={language} disabled={busy&&mode==='notes'} onClick={()=>leave(onClose)}/>
   </header>
   <div className="p-4 overflow-y-auto min-h-0 flex-1 space-y-3" style={{overscrollBehavior:'contain'}}>
    {error&&<p role="alert" className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>}
    {status&&<p role="status" className="text-emerald-600 text-sm">{status}</p>}
    {!loaded&&!error&&<p>{t.busy}</p>}
    {mode==='notes'&&<>
     <p className="text-sm opacity-75">{t.local}</p>
     {savedNote&&<button type="button" className={`${button} text-red-600`} disabled={busy} style={{display:"inline-flex",alignItems:"center",gap:4}} onClick={()=>setConfirmDelete(true)}><DeleteIcon size={16}/>{t.delete}</button>}
     {confirmDelete&&<div className="p-2 border rounded-lg"><p>{t.deleteQuestion}</p><button type="button" className={`${button} text-red-600`} disabled={busy} onClick={()=>void run(async()=>{await writeNote('');setNote('');setConfirmDelete(false);setStatus(t.deleted)})}>{t.confirmDelete}</button><button type="button" className={button} disabled={busy} onClick={()=>setConfirmDelete(false)}>{t.cancel}</button></div>}

    </>}
    {mode==='share'&&content&&<>
     <p className="text-sm opacity-75">{t.hint}</p>
     {(['explanation','similar','words'] as const).map(key=>{const available=!!content[key];const label=key==='explanation'?(language==='ar'?t.tafsir:t.translation):t[key];return <label key={key} className="flex gap-2 items-start text-sm"><input type="checkbox" disabled={!available||busy} checked={available&&include[key]} onChange={e=>setInclude(v=>({...v,[key]:e.target.checked}))}/><span>{label}{!available&&` — ${t.missing}`}</span></label>})}
     <label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={includeNote&&!!savedNote} disabled={!savedNote||busy} onChange={e=>setIncludeNote(e.target.checked)}/><span>{t.noteShare}{!savedNote&&` — ${t.emptyNote}`}</span></label>
     <p className="font-bold text-sm">{t.preview}</p>
     <pre data-share-preview className="whitespace-pre-wrap break-words rounded-lg p-3 border border-[var(--border-primary)] text-base leading-relaxed max-h-72 overflow-auto" style={{fontFamily:'inherit'}} dir="auto">{preview}</pre>
     <button type="button" className={`${button} bg-blue-700 text-white w-full`} disabled={busy||!preview} onClick={()=>share('text')}><Share2 size={16} className="inline"/> {t.shareText}{shared.text?' ✓':''}</button>
     <label className="flex gap-2 items-start text-sm"><input type="checkbox" checked={includeAudio} disabled={busy} onChange={e=>setIncludeAudio(e.target.checked)}/><span>{t.audioOption} · {reader}</span></label>
     {includeAudio&&<p role="status" className="text-sm">{audioLoading?t.audioLoading:audio?t.ready:''}</p>}
     {audioError&&<p role="alert" className="text-red-600 text-sm">{audioError}</p>}
     <button type="button" className={`${button} w-full`} disabled={busy||!audio||!includeAudio} onClick={()=>share('audio')}><Share2 size={16} className="inline"/> {t.shareAudio}{shared.audio?' ✓':''}</button>
    </>}
   </div>
   {mode==='notes'&&<footer data-note-composer className="shrink-0 border-t border-[var(--border-primary)] p-2 space-y-2">
    <span className="sr-only">{t.editNote}</span>
    <textarea aria-label={t.notes} placeholder={t.placeholder} value={note} onChange={e=>{const value=e.target.value;setNote(value);setStatus('');setError('')}} maxLength={NOTE_MAX_LENGTH} disabled={!loaded||busy} rows={3} className="w-full p-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-base" style={{resize:'none',maxHeight:viewport.height/(scale*4)}}/>
    <button type="button" className={`${button} bg-emerald-700 text-white w-full`} disabled={!loaded||busy} onClick={()=>void run(async()=>{await persist();await closeAfterKeyboard(onClose)})}><StickyNote size={16} className="inline"/> {t.save}</button>
    <p role="status" aria-live="polite" className="text-emerald-600 text-sm font-bold min-h-5">{status===t.saved?`✓ ${t.saved}`:busy?t.busy:''}</p>
   </footer>}
  </section>
 </div>;
}
