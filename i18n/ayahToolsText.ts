import catalogue from './notesMessages.json';
import type { Language } from './translations';
// Exhaustive typing keeps every supported locale on the same key set.
export const notesMessages: Record<Language, typeof catalogue.en> = catalogue;
export function notesLocale(language:string):Language {
    return Object.prototype.hasOwnProperty.call(notesMessages,language)?language as Language:'en';
}
export const notesDirection=(language:string):'rtl'|'ltr'=>['ar','ur','fa','ku'].includes(language)?'rtl':'ltr';
export function ayahToolsText(language:string) {
    const text=notesMessages[notesLocale(language)];
    return {...text,invalid:text.error,editNote:text.placeholder};
}
