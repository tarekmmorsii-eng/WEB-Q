import { Capacitor, registerPlugin } from '@capacitor/core';
import { Share } from '@capacitor/share';
import type { AyahNote } from './ayahNotes';
const files=registerPlugin<{saveText(options:{text:string}):Promise<void>}>('AyahFiles');
export function formatNotesText(notes:AyahNote[],surahName:(surah:number)=>string,ayahLabel:string):string {
 return [...notes].filter(note=>note.text.trim()).sort((a,b)=>a.surah-b.surah||a.ayah-b.ayah)
  .map(note=>`${surahName(note.surah)} · ${ayahLabel} ${note.ayah}\n${note.text}`).join('\n\n--------------------\n\n');
}
export async function saveNotesText(text:string):Promise<void> {
 if(Capacitor.getPlatform()==='android'){await files.saveText({text});return;}
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download='mushaf-notes.txt';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function shareNotesText(text:string,title:string):Promise<'opened'|'copied'> {
 if(Capacitor.getPlatform()==='android'){await Share.share({title,text,dialogTitle:title});return 'opened';}
 if(navigator.share){await navigator.share({title,text});return 'opened';}
 if(navigator.clipboard){await navigator.clipboard.writeText(text);return 'copied';}
 throw Error('Sharing unavailable');
}
export function isExportCancelled(error:unknown):boolean {
 return (error as {name?:string})?.name==='AbortError'||/cancel/i.test((error as {message?:string})?.message||'');
}
