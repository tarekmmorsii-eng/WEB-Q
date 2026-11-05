import DeleteIcon from './DeleteIcon';
import React,{useState} from 'react';
import {translations, Language} from '../i18n/translations';
import {WordReview,saveWordReview} from '../services/wordReview';
export default function WordReviewEditor({record,language='ar'}:{record:WordReview;language?:string}) {
 const locale=translations[language as Language]||translations.en;
 const text=locale.wordReview;
 const [error,setError]=useState('');
 const update=(patch:Partial<WordReview>)=>{try{saveWordReview({...record,...patch});setError('')}catch{setError('saveError')}};
 return <div dir={locale.dir} className="space-y-2 text-sm" style={{fontFamily:'system-ui',color:'var(--text-primary, #1e293b)'}}>
 <label className="flex items-center gap-2"><input type="checkbox" checked={record.forgotten} onChange={e=>update({forgotten:e.target.checked})}/><span aria-hidden="true" style={{width:12,height:12,flexShrink:0,borderRadius:3,backgroundColor:"rgba(250,204,21,0.35)",border:"1px solid #ca8a04"}}/><span>{text.forgotten}</span></label>
 <label className="flex items-center gap-2"><input type="checkbox" checked={record.pronunciation} onChange={e=>update({pronunciation:e.target.checked})}/><span aria-hidden="true" style={{width:12,height:12,flexShrink:0,borderRadius:3,backgroundColor:"rgba(251,146,60,0.35)",border:"1px solid #ea580c"}}/><span>{text.pronunciation}</span></label>
 <textarea style={{color:"var(--text-primary, #1e293b)",backgroundColor:"var(--bg-card, #fff)"}} aria-label={text.wordNoteLabel} placeholder={text.notePlaceholder} value={record.note} maxLength={2000} rows={2} onChange={e=>update({note:e.target.value})} className="w-full p-2 rounded border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"/>
 <div className="flex flex-wrap gap-3 text-xs"><button style={{color:"inherit"}} type="button" disabled={!record.forgotten&&!record.pronunciation} onClick={()=>update({forgotten:false,pronunciation:false})}>{text.clearMarks}</button>{record.note&&<button style={{color:"inherit",display:"inline-flex",alignItems:"center",gap:4}} type="button" onClick={()=>update({note:''})}><DeleteIcon size={16}/>{text.deleteNote}</button>}</div>
 {error&&<p role="alert">{text.saveError}</p>}
 </div>;
}
