const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const AL_ARAF_OFFSET = 954;

const AL_ARAF_DATA = {
    "START_GREEN": {
        "color": "#10b981",
        "type": "START",
        "rules": {
            "تَذَكَّرُونَ": [3, 26, 57, 130, 174, 176, 201],
            "بَأْسُنَا": [4, 97, 98],
            "أُولَئِكَ هُمُ الْمُفْلِحُونَ": [8, 157],
            "خَسِرُوا أَنْفُسَهُمْ": [9, 53, 177, 178],
            "بِمَا كَانُوا": [9, 51, 162, 165, 118, 147],
            "وَلَقَدْ": [10, 11, 52, 130, 179],
            "قَالَ": [12, 13, 14, 15, 16, 18, 24, 38, 60, 61, 65, 66, 67, 71, 75, 76, 77, 88, 106, 109, 114, 116, 123, 128, 140, 144, 151, 155],
            "ثُمَّ": [17, 95, 103],
            "يَا بَنِي آدَمَ": [26, 27, 31, 35],
            "لَعَلَّهُمْ": [26, 94, 130, 164, 168, 174, 176],
            "وَإِذَا": [28, 47, 203, 204],
            "قُلْ": [29, 32, 33, 158, 188],
            "يَا قَوْمِ": [59, 65, 73, 85],
            "يَا أَيُّهَا النَّاسُ": [158],
            "وَإِذْ": [141, 161, 164, 167, 171, 172]
        }
    },
    "END_RED": {
        "color": "#ef4444",
        "type": "END",
        "rules": {
            "تَشْكُرُونَ": [10, 58],
            "الظَّالِمِينَ": [19, 41, 44, 47, 148, 150, 161],
            "الْخَاسِرِينَ": [23, 90, 92, 99, 149, 155, 178],
            "لَا تَعْلَمُونَ": [28, 33],
            "مُؤْمِنِينَ": [85, 143, 203],
            "يَعْلَمُونَ": [182, 187, 188],
            "مُسْلِمِينَ": [126]
        }
    },
    "MIDDLE_BLUE": {
        "color": "#3b82f6",
        "type": "MIDDLE",
        "rules": {
            "فَكُلَا مِنْ حَيْثُ شِئْتُمَا": [19, 161],
            "الشَّجَرَةَ": [19, 20, 22],
            "كَذَّبُوا بِآيَاتِنَا": [36, 147, 182],
            "رُسُلُنَا": [37, 43, 101],
            "أُولَئِكَ الَّذِينَ": [37, 42, 101, 179],
            "أَصْحَابُ الْجَنَّةِ": [42, 44, 46, 47, 50],
            "إِنَّ اللَّهَ": [54, 128, 180, 199]
        }
    }
};

function getJuz(ayahNumber) {
    if (ayahNumber <= 87) return "8";
    return "9";
}

Object.keys(AL_ARAF_DATA).forEach(catKey => {
    const cat = AL_ARAF_DATA[catKey];
    const type = cat.type;
    const color = cat.color;

    Object.keys(cat.rules).forEach(phrase => {
        const ayahs = cat.rules[phrase];

        // Create cross-references
        for (let i = 0; i < ayahs.length; i++) {
            const srcAyah = ayahs[i];
            if (srcAyah > 206) continue;

            const srcAbs = AL_ARAF_OFFSET + srcAyah;
            const juz = getJuz(srcAyah);

            if (!data[juz]) data[juz] = [];

            let entry = data[juz].find(e => e.src.ayah === srcAbs);
            if (!entry) {
                entry = { src: { ayah: srcAbs }, muts: [] };
                data[juz].push(entry);
            }

            for (let j = 0; j < ayahs.length; j++) {
                if (i === j) continue;
                const targetAyah = ayahs[j];
                if (targetAyah > 206) continue;
                const targetAbs = AL_ARAF_OFFSET + targetAyah;

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
console.log("Successfully added Al-Araf mutashabihat to constants/mutashabiha_data_full.json");
