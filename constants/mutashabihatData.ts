// قاعدة بيانات المتشابهات الكاملة
// المصدر: https://github.com/Waqar144/Quran_Mutashabihat_Data
// البيانات مبنية على عمل القارئ إدريس العاصم (رحمه الله)

// Last updated: 2026-01-30 17:15 - with AYAH_RULE_MAP optimization
import mutashabihatData from './mutashabiha_data_full.json';

// Type definition to avoid circular dependency if possible, or use 'any' for now since we know the structure
// We just need to extract rules once.
interface RawMutItem {
    ayah: number | number[];
    rule?: string;
}

export const MUTASHABIHAT_DATA_FULL = mutashabihatData;

/**
 * A centralized map of absolute ayah number -> Array of rules ({rule, type, color})
 * Generated once at startup to avoid re-parsing large JSON in components.
 */
export const AYAH_RULE_MAP = new Map<number, any[]>();

try {
    // Helper to add a rule to the map without duplicates
    const addRuleToMap = (ayahNum: number, ruleObj: any) => {
        if (typeof ayahNum !== 'number') return;
        if (!AYAH_RULE_MAP.has(ayahNum)) AYAH_RULE_MAP.set(ayahNum, []);
        const rules = AYAH_RULE_MAP.get(ayahNum)!;
        const exists = rules.find(r => r.rule === ruleObj.rule);
        if (!exists) rules.push(ruleObj);
    };

    // Populate the map from the full JSON data
    Object.values(MUTASHABIHAT_DATA_FULL).forEach((juzData: any) => {
        if (Array.isArray(juzData)) {
            juzData.forEach((entry: any) => {
                if (!entry || !entry.src) return; // Safety check

                const srcAbs = entry.src.ayah;

                if (entry.muts && Array.isArray(entry.muts)) {
                    entry.muts.forEach((mut: any) => {
                        if (!mut) return;
                        const mutAbs = Array.isArray(mut.ayah) ? mut.ayah[0] : mut.ayah;

                        // Rule info
                        const ruleInfo = {
                            rule: mut.rule,
                            type: mut.type,
                            color: mut.color
                        };

                        // Standardize colors based on type
                        const colors: any = {
                            'START': '#10b981',
                            'END': '#ef4444',
                            'MIDDLE': '#3b82f6',
                            'OTHER': '#d97706'
                        };
                        if (colors[mut.type]) {
                            ruleInfo.color = colors[mut.type];
                        }

                        if (mut.rule) {
                            addRuleToMap(srcAbs, ruleInfo);
                            addRuleToMap(mutAbs, ruleInfo);
                        }
                    });
                }
            });
        }
    });
    // 🚀 Expert Supplementary Rules (User Feedback Corrections)
    // Absolute numbers: Baqarah 48 -> 55, Baqarah 123 -> 130 (including 7 Fatiha ayahs)
    const SUPPLEMENTARY_RULES = [
        {
            ayahs: [55, 130],
            rule: "لَّا تَجْزِي نَفْسٌ عَن نَّفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا",
            type: "MIDDLE",
            color: "#3b82f6" // Blue
        },
        {
            ayahs: [55, 130],
            rule: "وَلَا هُمْ يُنصَرُونَ",
            type: "END",
            color: "#ef4444" // Red
        }
    ];

    SUPPLEMENTARY_RULES.forEach(supp => {
        supp.ayahs.forEach(a => addRuleToMap(a, { rule: supp.rule, type: supp.type, color: supp.color }));
    });

    console.log(`[MutashabihatData] Map initialized with ${AYAH_RULE_MAP.size} ayahs + ${SUPPLEMENTARY_RULES.length} manual additions.`);
} catch (error) {
    console.error("[MutashabihatData] Failed to initialize AYAH_RULE_MAP:", error);
}
