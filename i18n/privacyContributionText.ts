import { translations, type Language } from './translations';

export function getPrivacyContributionText(language: string) {
    const locale = Object.prototype.hasOwnProperty.call(translations, language)
        ? language as Language
        : 'en';
    return {
        copy: translations[locale].privacyContribution,
        dir: translations[locale].dir === 'rtl' ? 'rtl' as const : 'ltr' as const,
    };
}
