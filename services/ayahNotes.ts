import { SURAHS } from '../constants/surahData';
export interface AyahNote { key:string; surah:number; ayah:number; text:string; updatedAt:number; pinned?:boolean }
const LIMIT=5000;
export const NOTE_MAX_LENGTH=LIMIT;
// UTF-8 may need up to three bytes per UTF-16 character. Accept every file
// that the 40-million-character native backup exporter can produce.
export const NOTES_BACKUP_MAX_BYTES=120_000_000;
function validate(n:any):AyahNote {
    const surah=SURAHS.find(s=>s.number===n?.surah);
    if(!surah||!Number.isInteger(n.ayah)||n.ayah<1||n.ayah>surah.ayahCount||typeof n.text!=='string'||n.text.length>LIMIT||!Number.isFinite(n.updatedAt)||n.updatedAt<0)throw Error('Invalid note');
    return {key:`${n.surah}:${n.ayah}`,surah:n.surah,ayah:n.ayah,text:n.text,updatedAt:n.updatedAt,...(n.pinned===true?{pinned:true}:{})};
}
async function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('MushafPersonalNotes',1);r.onupgradeneeded=()=>r.result.createObjectStore('notes',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function listAyahNotes():Promise<AyahNote[]>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readonly'),r=tx.objectStore('notes').getAll();tx.oncomplete=()=>{db.close();resolve(r.result.sort((a:AyahNote,b:AyahNote)=>a.surah-b.surah||a.ayah-b.ayah))};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function getAyahNote(surah:number,ayah:number):Promise<string>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readonly'),r=tx.objectStore('notes').get(`${surah}:${ayah}`);tx.oncomplete=()=>{db.close();resolve(r.result?.text||'')};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function saveAyahNote(surah:number,ayah:number,text:string){const note=validate({surah,ayah,text,updatedAt:Date.now()});const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('notes','readwrite'),store=tx.objectStore('notes');if(text.trim()){const r=store.get(note.key);r.onsuccess=()=>store.put({...note,...(r.result?.pinned?{pinned:true}:{})})}else store.delete(note.key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
export async function setAyahNotePinned(surah:number,ayah:number,pinned:boolean){const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('notes','readwrite'),store=tx.objectStore('notes'),r=store.get(`${surah}:${ayah}`);r.onsuccess=()=>{if(r.result)store.put({...r.result,pinned})};tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
export function serializeNotes(notes:AyahNote[]):string{return JSON.stringify({format:'mushaf-personal-notes',version:1,notes:notes.map(validate)},null,2)}
export function parseNotesBackup(text:string):AyahNote[]{
    if(text.length>40_000_000)throw Error('Backup too large');
    const data=JSON.parse(text);if(data?.format!=='mushaf-personal-notes'||data.version!==1||!Array.isArray(data.notes)||data.notes.length>6236)throw Error('Invalid backup');
    const notes=data.notes.map(validate);if(new Set(notes.map(n=>n.key)).size!==notes.length)throw Error('Duplicate notes');return notes;
}
export async function importAyahNotes(notes:AyahNote[],overwrite=false):Promise<number>{
    const clean=notes.map(validate),db=await database();let count=0;
    return new Promise((resolve,reject)=>{const tx=db.transaction('notes','readwrite'),store=tx.objectStore('notes');for(const note of clean){const r=store.get(note.key);r.onsuccess=()=>{if(overwrite||!r.result){store.put(note);count++}}}tx.oncomplete=()=>{db.close();resolve(count)};tx.onerror=()=>{db.close();reject(tx.error)}});
}

export async function clearAyahNotes():Promise<void> {
 const db=await database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('notes','readwrite');tx.objectStore('notes').clear();
  tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error||Error('Delete cancelled'))};
 });
}
