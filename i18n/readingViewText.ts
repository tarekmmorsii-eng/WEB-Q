import catalogue from './readingViewMessages.json';
import type { Language } from './translations';
export const readingViewMessages: Record<Language, typeof catalogue.en> = catalogue;
export function readingViewText(language: Language | string) {
    return readingViewMessages[Object.prototype.hasOwnProperty.call(readingViewMessages,language)?language as Language:'en'];
}
