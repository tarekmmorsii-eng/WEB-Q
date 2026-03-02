// قاعدة بيانات المتشابهات الكاملة
// المصدر: https://github.com/Waqar144/Quran_Mutashabihat_Data
// البيانات مبنية على عمل القارئ إدريس العاصم (رحمه الله)

// Last updated: 2026-01-30 17:15 - with AYAH_RULE_MAP optimization
// Note: JSON loaded dynamically in getProcessedMutashabihat() to reduce initial bundle size

// Type definition
interface RawMutItem {
    ayah: number | number[];
    rule?: string;
}

// Lazy-loaded data — populated on first call to getProcessedMutashabihat()
export let MUTASHABIHAT_DATA_FULL: any[] = [];

/**
 * A centralized map of absolute ayah number -> Array of rules ({rule, type, color})
 * Built lazily after data is loaded.
 */
export const AYAH_RULE_MAP = new Map<number, any[]>();

export function buildAyahRuleMap(data: any[]): void {
    if (AYAH_RULE_MAP.size > 0) return; // Already built

    try {
        const addRuleToMap = (ayahNum: number, ruleObj: any) => {
            if (typeof ayahNum !== 'number') return;
            if (!AYAH_RULE_MAP.has(ayahNum)) AYAH_RULE_MAP.set(ayahNum, []);
            const rules = AYAH_RULE_MAP.get(ayahNum)!;
            const exists = rules.find(r => r.rule === ruleObj.rule);
            if (!exists) rules.push(ruleObj);
        };

        if (Array.isArray(data)) {
            data.forEach((entry: any) => {
                if (!entry || !entry.sourceAyah) return;

                const srcAbs = entry.sourceAyah.absoluteAyahNumber;

                if (entry.similarAyahs && Array.isArray(entry.similarAyahs)) {
                    entry.similarAyahs.forEach((mut: any) => {
                        if (!mut) return;
                        const mutAbs = mut.absoluteAyahNumber;

                        const ruleInfo = {
                            rule: mut.rule,
                            type: mut.ruleType || mut.type,
                            color: mut.color || mut.ruleColor
                        };

                        const colors: any = {
                            'START': '#10b981',
                            'END': '#ef4444',
                            'MIDDLE': '#3b82f6',
                            'OTHER': '#d97706'
                        };
                        if (colors[ruleInfo.type]) {
                            ruleInfo.color = colors[ruleInfo.type];
                        }

                        if (ruleInfo.rule) {
                            if (srcAbs) addRuleToMap(srcAbs, ruleInfo);
                            if (mutAbs) addRuleToMap(mutAbs, ruleInfo);
                        }
                    });
                }
            });
        }

        // Expert Supplementary Rules
        const SUPPLEMENTARY_RULES = [
            {
                ayahs: [55, 130],
                rule: "لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا",
                type: "MIDDLE",
                color: "#3b82f6"
            },
            {
                ayahs: [55, 130],
                rule: "وَلَا هُمْ يُنصَرُونَ",
                type: "END",
                color: "#ef4444"
            }
        ];

        SUPPLEMENTARY_RULES.forEach(supp => {
            supp.ayahs.forEach(a => addRuleToMap(a, { rule: supp.rule, type: supp.type, color: supp.color }));
        });

        console.log(`[MutashabihatData] Map initialized with ${AYAH_RULE_MAP.size} ayahs.`);
    } catch (error) {
        console.error("[MutashabihatData] Failed to initialize AYAH_RULE_MAP:", error);
    }
}
