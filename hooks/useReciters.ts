import { useState, useEffect } from 'react';
import { RECITERS_LIST } from '../services/reciterService';

export interface Reciter {
    id: string;
    name: string;
    disabled?: boolean;
}

const CACHE_KEY = 'quran_reciters_v2'; 
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Maps Quran.com numeric recitation ID → our internal string ID */
const QURANCOM_ID_TO_INTERNAL: Record<number, string> = {
    7:  'alafasy',
    6:  'husary',
    12: 'husary_muallim',
    3:  'sudais',
    2:  'abdul_basit',
    1:  'abdul_basit_mujawwad',
    4:  'shatri',
    9:  'minshawy',
    8:  'minshawy_mujawwad',
    10: 'shuraym',
    5:  'rifai',
    11: 'tablawi',
    19: 'ajamy'
};

export function useReciters() {
    const [reciters, setReciters] = useState<Reciter[]>(RECITERS_LIST);
    const [loading, setLoading] = useState(false);

    // We no longer fetch from the API since we have the definitive static list
    // of supported reciters that work perfectly with our audio mapping.
    // This ensures consistency and prevents broken audio links from API changes.

    return { reciters, loading };
}
