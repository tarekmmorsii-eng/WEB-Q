import { useEffect, useState } from 'react';
import { LANGUAGE_DATA_UPDATED } from '../services/initialLanguageDownload';

export function useLanguageDataVersion(language: string) {
    const [version, setVersion] = useState(0);
    useEffect(() => {
        const update = (event: Event) => {
            if ((event as CustomEvent<string>).detail === language) setVersion(n => n + 1);
        };
        window.addEventListener(LANGUAGE_DATA_UPDATED, update);
        return () => window.removeEventListener(LANGUAGE_DATA_UPDATED, update);
    }, [language]);
    return version;
}
