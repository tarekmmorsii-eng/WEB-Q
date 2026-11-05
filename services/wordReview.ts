import { useSyncExternalStore } from 'react';
export interface WordReview { key:string; surah:number; ayah:number; position:number; page:number; word:string; context?:string; updatedAt?:number; pinned?:boolean; forgotten:boolean; pronunciation:boolean; note:string }
const storageKey='mushaf-word-review-v1';
let records:Record<string,WordReview>={};
try { const data=JSON.parse(localStorage.getItem(storageKey)||'{}'); for(const [key,v] of Object.entries(data)) { const r=v as WordReview; if(r && key===`${r.surah}:${r.ayah}:${r.position}` && Number.isInteger(r.position) && r.position>0 && typeof r.note==='string' && typeof r.forgotten==='boolean' && typeof r.pronunciation==='boolean') records[key]=r; } } catch { /* Keep reading available if storage is unavailable. */ }
const listeners=new Set<()=>void>();
export const wordReviewKey=(surah:number,ayah:number,position:number)=>`${surah}:${ayah}:${position}`;
export function saveWordReview(record:WordReview) {
 const next={...records};
 if(record.forgotten||record.pronunciation||record.note.trim()) next[record.key]={...record,updatedAt:Date.now()}; else delete next[record.key];
 localStorage.setItem(storageKey,JSON.stringify(next));
 records=next; listeners.forEach(fn=>fn());
}
export function removeWordReview(key:string) {
 const next={...records}; delete next[key];
 localStorage.setItem(storageKey,JSON.stringify(next)); records=next; listeners.forEach(fn=>fn());
}
export function clearWordReviews() {
 localStorage.setItem(storageKey,JSON.stringify({}));
 records={}; listeners.forEach(fn=>fn());
}
export function useWordReviews(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}},()=>records)}
