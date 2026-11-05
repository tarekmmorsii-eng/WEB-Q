import { SURAHS } from '../constants/surahData';

// Keep the provider isolated so a future authenticated backend can replace it.
export const TAJWEED_API = 'https://api.quran.com/api/v4/quran/verses/uthmani_tajweed';
const lessons = 'https://tajweed.quranpedia.net/lessons/show/content/';
export const TAJWEED_RULES: Record<string, { name: string; description: string; source: string; color: string }> = {
    ham_wasl: { name: 'همزة الوصل', description: 'تثبت في الابتداء وتسقط عند وصل الكلام.', source: 'https://quranpedia.net/tajweed-rules/hamzat-wasl', color: '#64748b' },
    laam_shamsiyah: { name: 'اللام الشمسية', description: 'تُدغم لام التعريف في الحرف الشمسي الذي يليها.', source: 'https://quranpedia.net/tajweed-rules/laam-shamsiyah', color: '#64748b' },
    slnt: { name: 'حرف غير منطوق', description: 'علامة من مصدر التلوين لحرف لا يُنطق في هذا الموضع؛ لا تحدد وحدها سبب ذلك.', source: 'https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/quran-verses-uthmani-tajweed/', color: '#64748b' },
    madda_normal: { name: 'مدّ بمقدار حركتين', description: 'تشمل هذه الفئة المد الطبيعي وما يلحق به؛ لا يميز اللون وحده الصلة من المد الطبيعي.', source: lessons + '27', color: '#c2410c' },
    madda_obligatory: { name: 'مدّ بسبب الهمز', description: 'فئة مشتركة في المصدر للمتصل والمنفصل؛ لا نحدد النوع التفصيلي أو المقدار من اللون وحده.', source: lessons + '27', color: '#be123c' },
    madda_permissible: { name: 'مدّ يحتاج مراعاة الوقف والوصل', description: 'تُراجع قاعدة المد وحالة الوقف أو الوصل؛ لا يدل هذا الترميز وحده على نوع تفصيلي واحد.', source: lessons + '27', color: '#7c3aed' },
    madda_necessary: { name: 'المد اللازم', description: 'مدّ سببه سكون أصلي بعد حرف المد، ومقداره ست حركات؛ له أنواع يشرحها المرجع.', source: lessons + '27', color: '#be123c' },
    idgham_ghunnah: { name: 'إدغام بغنة', description: 'إدخال النون الساكنة أو التنوين في الحرف التالي مع الغنة عند الوصل.', source: lessons + '23', color: '#15803d' },
    idgham_wo_ghunnah: { name: 'إدغام بغير غنة', description: 'إدغام النون الساكنة أو التنوين في اللام أو الراء دون غنة لهما عند الوصل.', source: lessons + '23', color: '#7c3aed' },
    ikhafa: { name: 'الإخفاء الحقيقي', description: 'أداء النون الساكنة أو التنوين بين الإظهار والإدغام مع الغنة عند حرف الإخفاء.', source: lessons + '23', color: '#15803d' },
    iqlab: { name: 'الإقلاب', description: 'قلب النون الساكنة أو التنوين ميمًا مخفاة مع الغنة قبل الباء.', source: lessons + '23', color: '#15803d' },
    ghunnah: { name: 'الغنة', description: 'صوت يخرج من الخيشوم ملازم للنون والميم.', source: 'https://tajweed.quranpedia.net/term/show/85', color: '#15803d' },
    qalaqah: { name: 'القلقلة', description: 'اضطراب صوت حرف القلقلة حال سكونه، دون تحويله إلى حرف متحرك.', source: 'https://tajweed.quranpedia.net/term/show/78', color: '#0369a1' },
    ikhafa_shafawi: { name: 'الإخفاء الشفوي', description: 'إخفاء الميم الساكنة قبل الباء مع الغنة.', source: lessons + '24', color: '#15803d' },
    idgham_shafawi: { name: 'الإدغام الشفوي', description: 'إدغام الميم الساكنة في ميم بعدها مع الغنة.', source: lessons + '24', color: '#15803d' },
    idgham_mutajanisayn: { name: 'إدغام المتجانسين', description: 'باب إدغام الحروف المتحدة مخرجًا والمختلفة صفةً؛ يعرض المرجع حالاته وتفاصيله.', source: lessons + '21', color: '#7c3aed' },
    idgham_mutaqaribayn: { name: 'إدغام المتقاربين', description: 'باب إدغام الحروف المتقاربة؛ يعرض المرجع شروطه ومواضعه، ولا نفصّل الأداء من اللون وحده.', source: lessons + '21', color: '#7c3aed' },
};

export interface TajweedSegment { text: string; rule?: string; }

// Strict grammar: never insert upstream HTML into the DOM or repair Quran text.
export function parseTajweedMarkup(markup: string): TajweedSegment[] {
    if (!markup || markup.length > 100000) throw new Error('invalid');
    const result: TajweedSegment[] = [];
    let active: { tag: string; rule?: string } | undefined;
    for (const token of markup.split(/(<[^>]*>)/g).filter(Boolean)) {
        if (!token.startsWith('<')) {
            if (/[<>&]/.test(token)) throw new Error('invalid');
            result.push({ text: token, ...(active?.rule ? { rule: active.rule } : {}) });
            continue;
        }
        const opening = token.match(/^<(tajweed|span) class=(?:"([a-z_]+)"|'([a-z_]+)'|([a-z_]+))>$/);
        if (opening) {
            const rule = opening[2] || opening[3] || opening[4];
            if (active || (opening[1] === 'span' ? rule !== 'end' : !Object.prototype.hasOwnProperty.call(TAJWEED_RULES, rule))) throw new Error('invalid');
            active = { tag: opening[1], rule: opening[1] === 'tajweed' ? rule : undefined };
        } else if (active && token === `</${active.tag}>`) {
            active = undefined;
        } else throw new Error('invalid');
    }
    if (active || !result.some(s => /[\u0621-\u064a]/.test(s.text))) throw new Error('invalid');
    return result;
}

export async function getTajweedVerse(surah: number, ayah: number, signal: AbortSignal): Promise<TajweedSegment[]> {
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || ayah < 1 || ayah > (SURAHS[surah - 1]?.ayahCount || 0)) throw new Error('invalid');
    const key = `${surah}:${ayah}`;
    const response = await fetch(`${TAJWEED_API}?verse_key=${encodeURIComponent(key)}`, { signal, cache: 'no-store' });
    if (!response.ok) throw new Error('network');
    const data = await response.json();
    if (!Array.isArray(data.verses) || data.verses.length !== 1 || data.verses[0].verse_key !== key || typeof data.verses[0].text_uthmani_tajweed !== 'string') throw new Error('invalid');
    return parseTajweedMarkup(data.verses[0].text_uthmani_tajweed);
}
