import { useState, useEffect } from 'react';

export interface Reciter {
    id: string;
    nameAr: string;
    nameEn: string;
}

const CACHE_KEY = 'quran_audio_reciters_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useReciters() {
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReciters = async () => {
            try {
                // Check cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
                        setReciters(parsed.data);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from API
                const res = await fetch('https://api.alquran.cloud/v1/edition?format=audio&language=ar');
                const json = await res.json();
                
                if (json.code === 200 && json.data) {
                    const mapped: Reciter[] = json.data.map((r: any) => ({
                        id: r.identifier,
                        nameAr: r.name,
                        nameEn: r.englishName
                    }));
                    
                    // Add some hardcoded fallbacks just in case the API misses common ones
                    const ensureExists = (id: string, ar: string, en: string) => {
                        if (!mapped.find(x => x.id === id)) {
                            mapped.unshift({ id, nameAr: ar, nameEn: en });
                        }
                    };
                    
                    ensureExists('ar.alafasy', 'مشاري العفاسي', 'Mishary Al-Afasy');
                    ensureExists('ar.husary', 'محمود خليل الحصري', 'Mahmoud Khalil Al-Husary');
                    
                    setReciters(mapped);
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        timestamp: Date.now(),
                        data: mapped
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch reciters", error);
                // Fallback to manual list if network fails and cache is empty
                setReciters([
                    { id: 'ar.alafasy', nameAr: 'مشاري العفاسي', nameEn: 'Mishary Al-Afasy' },
                    { id: 'ar.husary', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Khalil Al-Husary' },
                    { id: 'ar.husarymujawwad', nameAr: 'الحصري (مجود)', nameEn: 'Al-Husary (Mujawwad)' },
                    { id: 'ar.abdulbasitmurattal', nameAr: 'عبد الباسط عبد الصمد', nameEn: 'Abdulbasit Abdulsamad' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchReciters();
    }, []);

    return { reciters, loading };
}
