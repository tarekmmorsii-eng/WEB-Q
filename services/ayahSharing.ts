import { Capacitor, registerPlugin } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { getWbwData, getWbwWordMeaning } from './translationStorageService';
import { getAudioBlob } from './audioCacheService';
import { buildAudioUrl } from './reciterService';
import { getGlobalAyahNumber } from '../utils/quranUtils';
import type { Mutashabiha } from '../types';
import { translations } from '../i18n/translations';
import { notesLocale } from '../i18n/ayahToolsText';
import { ayahToolsText } from '../i18n/ayahToolsText';

const files=registerPlugin<{prepareFile(options:{name:string;base64:string}):Promise<{url:string}>;saveBackup(options:{text:string}):Promise<void>}>('AyahFiles');
let quran:Promise<any>|undefined;
export function normalizeSharedVerseText(text:string,surah:number,ayah:number):string {
    // The bundled Quran prefixes the first verse of most surahs with the
    // unnumbered basmalah. Match the app's verse-text helper, keeping 1:1 intact.
    if(surah!==1&&ayah===1)for(const opening of ['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ','بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ','بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ']){
        if(text.startsWith(opening))return text.slice(opening.length).trimStart();
    }
    return text;
}
async function localVerse(surah:number,ayah:number){
    if(!quran)quran=fetch('/quran.json').then(r=>{if(!r.ok)throw Error('Verse unavailable');return r.json()}).catch(e=>{quran=undefined;throw e});
    const data=await quran,chapter=data.data?.surahs?.find((s:any)=>s.number===surah),verse=chapter?.ayahs?.find((a:any)=>a.numberInSurah===ayah);
    if(!verse?.text)throw Error('Verse unavailable');return {text:normalizeSharedVerseText(verse.text,surah,ayah),surahName:chapter.name as string};
}
export interface VerseShareContent {verse:string; heading:string; explanation:string; similar:string; words:string; partial:boolean}
export async function loadVerseShareContent(surah:number,ayah:number,language:string,explanation:string|undefined,groups:Mutashabiha[]):Promise<VerseShareContent>{
    const names=translations[notesLocale(language)].surahNames;
    const verse=await localVerse(surah,ayah),key=`${surah}:${ayah}`;
    const arabic=(window as any).__ma3anyData?.[key]||{};
    const stored=language==='ar'?null:await getWbwData(language).catch(()=>null);
    const positions=[...new Set([...Object.keys(arabic),...Object.keys(stored?.data?.[key]||{})].filter(k=>/^\d+$/.test(k)))].sort((a,b)=>Number(a)-Number(b));
    const meanings=positions.map(position=>{
        const meaning=language==='ar'?arabic[position]?.meaning:getWbwWordMeaning(stored?.data,surah,ayah,Number(position));
        return meaning?`${arabic[position]?.phrase||`#${position}`}: ${meaning}`:null;
    });
    const refs=new Map<string,{surahNumber:number;ayahNumber:number}>();
    for(const group of groups)for(const ref of [group.sourceAyah,...group.similarAyahs]){
        const k=`${ref.surahNumber}:${ref.ayahNumber}`;if(k!==key)refs.set(k,ref);
    }
    const similar=await Promise.all([...refs.values()].map(async ref=>{const v=await localVerse(ref.surahNumber,ref.ayahNumber);return `${names?.[ref.surahNumber-1]||v.surahName} (${ref.surahNumber}:${ref.ayahNumber})\n${v.text}`}));
    return {verse:verse.text,heading:`${names?.[surah-1]||verse.surahName} (${surah}:${ayah})`,explanation:explanation&&!explanation.startsWith('__')?explanation:'',similar:similar.join('\n\n'),words:meanings.filter(Boolean).join('\n'),partial:meanings.some(m=>!m)||(language!=='ar'&&!Object.keys(arabic).some(k=>/^\d+$/.test(k)))};
}
export function formatVerseShare(content:VerseShareContent,language:string,include:{explanation:boolean;similar:boolean;words:boolean}):string{
    const t=ayahToolsText(language),parts=[content.heading,content.verse];
    if(include.explanation&&content.explanation)parts.push(`${language==='ar'?t.tafsir:t.translation}\n${content.explanation}`);
    if(include.similar&&content.similar)parts.push(`${t.similar}\n${content.similar}`);
    if(include.words&&content.words)parts.push(`${t.words}${content.partial?` (${t.partial})`:''}\n${content.words}`);
    return parts.join('\n\n');
}
export async function prepareVerseAudio(surah:number,ayah:number,reciter:string,signal?:AbortSignal):Promise<File>{
    const url=buildAudioUrl(reciter,getGlobalAyahNumber(surah,ayah));if(!url)throw Error('No reciter');
    let blob=await getAudioBlob(url);
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    if(!blob){const controller=new AbortController(),abort=()=>controller.abort(),timer=setTimeout(abort,20000);signal?.addEventListener('abort',abort,{once:true});try{const r=await fetch(url,{signal:controller.signal});if(!r.ok||/text\/|json|html/i.test(r.headers.get('content-type')||''))throw Error('Audio unavailable');blob=await r.blob()}catch(error){if(controller.signal.aborted&&!signal?.aborted)throw Error('Audio download timed out');throw error}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}}
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    if(blob.size<1024||blob.size>20000000)throw Error('Invalid audio');
    const signature=new Uint8Array(await blob.slice(0,3).arrayBuffer());
    if(!(signature[0]===73&&signature[1]===68&&signature[2]===51)&&!(signature[0]===255&&(signature[1]&224)===224))throw Error('Invalid MP3');
    return new File([blob],`ayah-${surah}-${ayah}-${reciter}.mp3`,{type:'audio/mpeg'});
}
const base64=(blob:Blob):Promise<string>=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)});
export async function shareVerse(text:string,audio?:File,language='en'):Promise<'opened'|'copied'>{
    if(Capacitor.getPlatform()==='android'){
        const file=audio?await files.prepareFile({name:audio.name,base64:await base64(audio)}):null;
        await Share.share({title:ayahToolsText(language).share,text:text||undefined,files:file?[file.url]:undefined,dialogTitle:ayahToolsText(language).share});return 'opened';
    }
    if(navigator.share){if(audio&&navigator.canShare&&!navigator.canShare({files:[audio]}))throw Error('Audio sharing unsupported');await navigator.share({text:text||undefined,files:audio?[audio]:undefined});return 'opened'}
    if(!audio&&navigator.clipboard){await navigator.clipboard.writeText(text);return 'copied'}throw Error('Sharing unavailable');
}
export async function exportNotesBackup(text:string){
    if(Capacitor.getPlatform()==='android'){await files.saveBackup({text});return}
    const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='mushaf-personal-notes.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
