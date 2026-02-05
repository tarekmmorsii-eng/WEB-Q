const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const AL_IMRAN_OFFSET = 293;

const AL_IMRAN_DATA = {
    "START_GREEN": {
        "color": "#10b981",
        "type": "START",
        "rules": {
            "هُوَ الَّذِي": [6, 7],
            "رَبَّنَا": [8, 9, 53, 192, 193, 194],
            "إِنَّ الَّذِينَ كَفَرُوا": [10, 90, 91, 116],
            "قُلْ": [12, 15, 26, 29, 31, 32, 64, 84, 95],
            "قَدْ": [13, 137],
            "الَّذِينَ": [16, 134, 168, 172, 173, 183, 191],
            "أُولَئِكَ": [22, 87, 136],
            "وَمَا لَهُمْ مِنْ نَاصِرِينَ": [22, 56, 91],
            "ذَلِكَ": [24, 44, 58, 182],
            "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ": [25, 161, 185],
            "أَطِيعُوا اللَّهَ وَالرَّسُولَ": [32, 132],
            "إِنَّ اللَّهَ": [33, 51],
            "إِذْ": [35, 45, 55, 122, 124, 153],
            "فَلَمَّا": [36, 52],
            "قَالَ": [40, 41],
            "وَإِذْ": [42, 81, 121, 187],
            "يَا أَهْلَ الْكِتَابِ": [65, 70, 71, 98, 99],
            "هَا أَنْتُمْ": [66, 119],
            "مَا كَانَ - وَمَا كَانَ": [67, 79, 145, 147, 161],
            "ذُو الْفَضْلِ الْعَظِيمِ": [74, 174],
            "بَلَى": [76, 125],
            "فَمَنْ": [82, 94],
            "لَنْ": [92, 111],
            "يَا أَيُّهَا الَّذِينَ آمَنُوا": [100, 102, 118, 130, 149, 156, 200],
            "وَلَا": [105, 139, 169, 176, 178, 180],
            "وَلَقَدْ": [123, 143, 152]
        }
    },
    "END_RED": {
        "color": "#ef4444",
        "type": "END",
        "rules": {
            "الْعَزِيزُ الْحَكِيمُ": [6, 18, 62, 126],
            "وَاللَّهُ بَصِيرٌ بِالْعِبَادِ": [15, 20],
            "وَبِئْسَ الْمِهَادُ": [12, 197],
            "سَرِيعُ الْحِسَابِ": [19, 199],
            "وَاللَّهُ لا يُحِبُّ الظَّالِمِينَ": [57, 140],
            "عَلَى كُلِّ شَيْءٍ قَدِيرٌ": [26, 29, 165, 189],
            "بِغَيْرِ حِسَابٍ": [27, 37],
            "غَفُورٌ رَحِيمٌ": [31, 89, 129],
            "سَمِيعٌ عَلِيمٌ": [34, 121],
            "إِنَّ كُنْتُمْ مُؤْمِنِينَ": [49, 139, 175],
            "لَعَلَّكُمْ تُفْلِحُونَ": [130, 200],
            "وَلَهُمْ عَذَابٌ أَلِيمٌ": [77, 91, 177, 188],
            "وَهُمْ يَعْلَمُونَ": [75, 78, 135]
        }
    },
    "MIDDLE_BLUE": {
        "color": "#3b82f6",
        "type": "MIDDLE",
        "rules": {
            "جَنَّاتٌ تَجْرِي مِنْ تَحْتِهَا الأَنْهَارُ": [15, 136, 195, 198],
            "هُمْ فِيهَا خَالِدُونَ": [107, 116],
            "وَاللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ": [153, 180],
            "وَلِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ": [109, 129],
            "عَلِيمٌ بِذَاتِ الصُّدُورِ": [119, 154],
            "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ": [122, 160],
            "وَإِنْ تَصْبِرُوا وَتَتَّقُوا": [120, 125, 179, 186],
            "يُبَيِّنُ اللَّهُ لَكُمْ آيَاتِهِ": [118, 119],
            "بِمَا تَعْمَلُونَ بَصِيرٌ": [156, 163]
        }
    }
};

function getJuz(ayahNumber) {
    if (ayahNumber <= 91) return "3";
    return "4";
}

Object.keys(AL_IMRAN_DATA).forEach(catKey => {
    const cat = AL_IMRAN_DATA[catKey];
    const type = cat.type;
    const color = cat.color;

    Object.keys(cat.rules).forEach(phrase => {
        const ayahs = cat.rules[phrase];

        // Create cross-references
        for (let i = 0; i < ayahs.length; i++) {
            const srcAyah = ayahs[i];
            const srcAbs = AL_IMRAN_OFFSET + srcAyah;
            const juz = getJuz(srcAyah);

            if (!data[juz]) data[juz] = [];

            // Find or create entry for this ayah in this juz
            let entry = data[juz].find(e => e.src.ayah === srcAbs);
            if (!entry) {
                entry = { src: { ayah: srcAbs }, muts: [] };
                data[juz].push(entry);
            }

            // Add all other ayahs as muts
            for (let j = 0; j < ayahs.length; j++) {
                if (i === j) continue;
                const targetAyah = ayahs[j];
                const targetAbs = AL_IMRAN_OFFSET + targetAyah;

                // Check if already exists
                const exists = entry.muts.find(m => m.ayah === targetAbs && m.rule === phrase);
                if (!exists) {
                    entry.muts.push({
                        ayah: targetAbs,
                        rule: phrase,
                        type: type,
                        color: color
                    });
                }
            }
        }
    });
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
console.log("Successfully added Al Imran mutashabihat to constants/mutashabiha_data_full.json");
