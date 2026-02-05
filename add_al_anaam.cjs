const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const AL_ANAAM_OFFSET = 789; // (7 + 286 + 200 + 176 + 120)

const AL_ANAAM_DATA = {
    "START_GREEN": {
        "color": "#10b981",
        "type": "START",
        "rules": {
            "بِرَبِّهِمْ يَعْدِلُونَ": [1, 150],
            "وَهُوَ": [3, 18, 60, 61, 73, 97, 98, 99, 114, 141, 165],
            "وَمَا": [4, 32, 38, 48, 69, 91, 119],
            "قُلْ": [11, 12, 14, 15, 19, 37, 40, 46, 47, 50, 56, 57, 58, 63, 64, 65, 66, 71, 81, 90, 91, 109, 135, 143, 144, 145, 148, 149, 150, 151, 158, 161, 162, 164],
            "وَلَقَدْ": [10, 34, 42, 94],
            "لَوْلَا": [8, 37, 43, 138, 139],
            "وَلَوْ": [7, 27, 30, 107, 111],
            "فَلَمَّا": [44, 76, 77, 78],
            "قَالُوا": [8, 29, 37, 124, 138, 139],
            "وَإِذْ": [74, 121], // 187 is out of range for An'am, removed to avoid confusion
            "أُولَئِكَ": [89, 90],
            "وَكَذَلِكَ": [53, 55, 75, 105, 112, 123, 129],
            "وَمَنْ": [21, 93, 110, 124, 144, 157],
            "الَّذِينَ خَسِرُوا أَنْفُسَهُمْ": [12, 20],
            "يَحْشُرُهُمْ": [22, 38, 72, 128]
        }
    },
    "END_RED": {
        "color": "#ef4444",
        "type": "END",
        "rules": {
            "وَهُوَ السَّمِيعُ الْعَلِيمُ": [13, 115],
            "أَغَيْرَ اللَّهِ": [14, 40, 114],
            "وَلَا تَكُونَنَّ": [14, 35, 114],
            "وَهُوَ الْحَكِيمُ الْخَبِيرُ": [18, 73],
            "بِمَا كَانُوا يَعْمَلُونَ": [108, 127],
            "الْقَوْمُ الظَّالِمُونَ": [47, 68, 144],
            "تَعْقِلُونَ": [32, 151],
            "يَصْدِفُونَ": [46, 157],
            "رَبُّ الْعَالَمِينَ": [45, 71, 162]
        }
    },
    "MIDDLE_BLUE": {
        "color": "#3b82f6",
        "type": "MIDDLE",
        "rules": {
            "مَا كَانُوا بِهِ يَسْتَهْزِئُونَ": [5, 10],
            "صِرَاطٌ مُسْتَقِيمٌ": [39, 87, 161],
            "إِنْ كُنْتُمْ صَادِقِينَ": [40, 143],
            "فَإِنَّ اللَّهَ غَفُورٌ رَحِيمٌ": [54, 145, 165],
            "الَّذِينَ يَدْعُونَ": [52, 108],
            "يُبَيِّنُ اللَّهُ لَكُمُ الْآيَاتِ": [65, 98, 105]
        }
    }
};

function getJuz(ayahNumber) {
    if (ayahNumber <= 110) return "7";
    return "8";
}

Object.keys(AL_ANAAM_DATA).forEach(catKey => {
    const cat = AL_ANAAM_DATA[catKey];
    const type = cat.type;
    const color = cat.color;

    Object.keys(cat.rules).forEach(phrase => {
        const ayahs = cat.rules[phrase];

        // Create cross-references
        for (let i = 0; i < ayahs.length; i++) {
            const srcAyah = ayahs[i];
            if (srcAyah > 165) continue; // Safety check

            const srcAbs = AL_ANAAM_OFFSET + srcAyah;
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
                if (targetAyah > 165) continue; // Safety check
                const targetAbs = AL_ANAAM_OFFSET + targetAyah;

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
console.log("Successfully added Al-An'am mutashabihat to constants/mutashabiha_data_full.json");
