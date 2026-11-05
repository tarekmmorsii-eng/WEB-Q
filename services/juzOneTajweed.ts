// A private, online trial. Never project these offsets onto another Quran text.
export const HUB_API = 'https://api.quranhub.com/v1';
export const isJuzOne = (surah: number, ayah: number) => Number.isInteger(ayah) && ayah >= 1 && ((surah === 1 && ayah <= 7) || (surah === 2 && ayah <= 141));
export const tajweedTrialEnabled = import.meta.env.DEV || import.meta.env.MODE === 'tajweed-trial';
export interface HubDefinition { name: string; description: string; }
export interface HubMark { cls: string; span: string; start: number | null; end: number | null; }
export interface HubWord { position: number; text: string; location: string; marks: HubMark[]; }
export interface HubVerse { key: string; words: HubWord[]; definitions: Record<string, HubDefinition>; }
const safeText = (v: unknown, max = 500) => typeof v === 'string' && v.length > 0 && v.length <= max && !/[<>\u0000-\u001f]/.test(v);

export function parseHubDefinitions(raw: any): Record<string, HubDefinition> {
    if (raw?.code !== 200 || !Array.isArray(raw.data) || raw.data.length > 150) throw new Error('invalid');
    const result: Record<string, HubDefinition> = Object.create(null);
    for (const d of raw.data) {
        if (!/^[a-z_]+$/.test(d?.rule_key) || !safeText(d.name) || !safeText(d.description, 2500) || result[d.rule_key]) throw new Error('invalid');
        result[d.rule_key] = { name: d.name, description: d.description };
    }
    return result;
}

// The byte convention is only accepted when both boundaries and the exact span agree.
export function exactHubRange(text: string, rule: any): [number, number] | null {
    if (!Number.isInteger(rule.offset) || rule.offset < 1 || !Number.isInteger(rule.len) || rule.len < 1 || rule.len !== [...rule.span].length) return null;
    let bytes = 1, index = 0;
    for (const char of text) {
        if (bytes === rule.offset) {
            const found = [...text.slice(index)].slice(0, rule.len).join('');
            return found === rule.span ? [index, index + found.length] : null;
        }
        bytes += new TextEncoder().encode(char).length;
        index += char.length;
    }
    return null;
}

export function parseHubVerse(raw: any, surah: number, ayah: number, definitions: Record<string, HubDefinition>): HubVerse {
    const d = raw?.data;
    if (!isJuzOne(surah, ayah) || raw?.code !== 200 || d?.surah_number !== surah || d?.ayah_number !== ayah || !Array.isArray(d.words) || !d.words.length || d.words.length > 300) throw new Error('invalid');
    const key = `${surah}:${ayah}`;
    const words = d.words.map((w: any, i: number): HubWord => {
        if (w?.position !== i + 1 || w.location !== `${key}:${i + 1}` || !safeText(w.text) || /\s/.test(w.text) || !/[\u0621-\u064a]/.test(w.text)) throw new Error('invalid');
        if (w.tajweed && (w.tajweed.text !== w.text || !Array.isArray(w.tajweed.rules) || w.tajweed.rules.length > 100)) throw new Error('invalid');
        return { position: w.position, text: w.text, location: w.location, marks: (w.tajweed?.rules || []).map((r: any) => {
            if (!/^[a-z_]+$/.test(r?.cls) || !safeText(r.span, 100)) throw new Error('invalid');
            const range = exactHubRange(w.text, r);
            return { cls: r.cls, span: r.span, start: range?.[0] ?? null, end: range?.[1] ?? null };
        }) };
    });
    return { key, words, definitions };
}

export async function getHubVerse(surah: number, ayah: number, signal: AbortSignal): Promise<HubVerse> {
    if (!isJuzOne(surah, ayah)) throw new Error('invalid');
    const read = async (path: string) => {
        const response = await fetch(`${HUB_API}/${path}`, { signal, cache: 'no-store', credentials: 'omit' });
        if (!response.ok) throw new Error('network');
        return response.json();
    };
    const [verse, definitions] = await Promise.all([read(`ayah/${surah}:${ayah}/tajweed?tajweedLevel=advanced`), read('tajweed/rules?lang=ar')]);
    return parseHubVerse(verse, surah, ayah, parseHubDefinitions(definitions));
}

export function ruleAppearance(cls: string) {
    if (cls.includes('qalqalah')) return { color: '#0369a1', name: 'أزرق' };
    if (cls === 'madd_normal' || cls === 'madd_silah_sughra' || cls === 'madd_badal' || cls === 'madd_iwad') return { color: '#b45309', name: 'برتقالي داكن' };
    if (cls.startsWith('madd_')) return { color: '#be123c', name: 'أحمر قرمزي' };
    if (cls.startsWith('ham_') || cls.startsWith('slnt_') || cls === 'laam_shamsiyah') return { color: '#475569', name: 'رمادي' };
    if (cls.includes('wo_ghunnah') || cls.startsWith('idgham_muta') || cls === 'tafkheem' || cls === 'tarqeeq') return { color: '#7c3aed', name: 'بنفسجي' };
    return { color: '#15803d', name: 'أخضر' };
}

export function ruleCondition(cls: string) {
    if (['madd_arid_lissukun', 'madd_leen', 'madd_iwad', 'qalqalah_kubra'].includes(cls)) return 'عند الوقف';
    if (['ham_wasl_fatha', 'ham_wasl_kasra', 'ham_wasl_damma'].includes(cls)) return 'عند الابتداء';
    if (cls === 'ham_wasl_silent' || cls.startsWith('madd_silah') || cls === 'madd_permissible' || cls === 'slnt_iltiqaa_sakinayn' || cls.includes('tanween') || cls === 'izhar_shafawi' || cls === 'ikhafa_shafawi' || cls === 'idgham_shafawi') return 'عند الوصل';
    return 'بحسب سياق الموضع';
}

// These are structural observations on an already supplied annotation, not a rule detector.
// If the source span/context disagrees, do not manufacture a per-location explanation.
export function contextualReason(word: HubWord, mark: HubMark, next?: HubWord): string | null {
    if (mark.start === null || mark.end === null) return null;
    const letters = (text: string) => [...text].filter(c => /[\u0621-\u063a\u0641-\u064a\u0671]/.test(c));
    const following = letters(word.text.slice(mark.end))[0] || (next ? letters(next.text)[0] : undefined);
    const afterWord = next ? letters(next.text)[0] : undefined;
    const cls = mark.cls;
    const target = cls.includes('tanween') ? afterWord : following;
    const noun = cls.includes('tanween') ? 'التنوين' : 'النون الساكنة';
    if ((cls === 'ikhafa_noon' || cls === 'ikhafa_tanween') && target && 'صذثكجشقسدطزفتضظ'.includes(target)) return `جاء بعد ${noun} حرف «${target}»، وهو من حروف الإخفاء.`;
    if ((cls.startsWith('idgham_ghunnah_')) && target && 'ينمو'.includes(target)) return `جاء بعد ${noun} حرف «${target}» عند الوصل، وهو من حروف الإدغام بغنة.`;
    if ((cls.startsWith('idgham_wo_ghunnah_')) && target && 'لر'.includes(target)) return `جاء بعد ${noun} حرف «${target}» عند الوصل، وهو من حرفي الإدغام بغير غنة.`;
    if (cls.startsWith('iqlab_') && target === 'ب') return `جاء حرف الباء بعد ${noun}.`;
    if (cls === 'izhar_shafawi' && mark.span === 'م' && afterWord && !'مب'.includes(afterWord)) return `جاء بعد الميم الساكنة حرف «${afterWord}»، وهو غير الميم والباء.`;
    if (cls === 'laam_shamsiyah' && following && 'تثدذرزسشصضطظلن'.includes(following)) return `جاء بعد لام التعريف الحرف الشمسي «${following}».`;
    if (cls === 'madd_obligatory_mottasel' && letters(word.text.slice(mark.end)).some(c => 'ءأإؤئ'.includes(c))) return 'جاءت الهمزة بعد حرف المد في الكلمة نفسها.';
    if (cls === 'qalqalah_sughra' && 'قطبجد'.includes(mark.span)) return `الحرف «${mark.span}» من حروف القلقلة، ومعلّم في المصدر بالقلقلة الصغرى.`;
    if (cls === 'madd_silah_sughra') return 'المصدر يحدد صلة صغرى لهاء الضمير: بين متحركين، ولا يليها همز؛ وتكون الصلة عند الوصل.';
    if (cls === 'madd_arid_lissukun') return 'السكون الناتج عن الوقف بعد حرف المد هو سبب المد العارض؛ لا يُنقل مقدار الوقف إلى الوصل.';
    return null;
}
