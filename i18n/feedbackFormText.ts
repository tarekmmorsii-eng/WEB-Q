import { translations, type Language } from './translations';

export const getFeedbackFormText = (language: string) => {
    const locale = Object.prototype.hasOwnProperty.call(translations, language)
        ? language as Language
        : 'en';
    return translations[locale].feedbackForm;
};
