const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const AL_MAIDAH_OFFSET = 669;

const AL_MAIDAH_DATA = {
    "START_GREEN": {
        "color": "#10b981",
        "type": "START",
        "rules": {
            "يَا أَيُّهَا الَّذِينَ آمَنُوا": [1, 2, 6, 8, 11, 35, 51, 54, 57, 87, 94, 95, 101, 105, 106],
            "إِنَّ اللَّهَ": [1, 7, 98],
            "حُرِّمَتْ عَلَيْكُمْ": [3],
            "يَسْأَلُونَكَ مَاذَا أُحِلَّ لَهُمْ": [4],
            "وَاذْكُرُوا نِعْمَةَ اللَّهِ عَلَيْكُمْ": [7, 11, 20],
            "وَلَقَدْ أَخَذَ اللَّهُ مِيثَاقَ": [12],
            "فَبِمَا نَقْضِهِمْ مِيثَاقَهُمْ": [13],
            "وَمِنَ الَّذِينَ قَالُوا إِنَّا نَصَارَى": [14],
            "يَا أَهْلَ الْكِتَابِ قَدْ جَاءَكُمْ رَسُولُنَا": [15, 19],
            "لَقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّهَ هُوَ الْمَسِيحُ": [17, 72],
            "وَقَالَتِ الْيَهُودُ وَالنَّصَارَى": [18],
            "يَا قَوْمِ": [20, 21],
            "قَالُوا يَا مُوسَى": [22, 24],
            "قَالَ": [25, 26, 39, 109, 110, 112, 114, 115, 116],
            "وَاتْلُ عَلَيْهِمْ نَبَأَ": [27],
            "إِنَّمَا جَزَاءُ الَّذِينَ يُحَارِبُونَ اللَّهَ": [33],
            "إِنَّ الَّذِينَ كَفَرُوا": [36, 72, 73],
            "يُرِيدُونَ أَنْ يَخْرُجُوا مِنَ النَّارِ": [37],
            "يَا أَيُّهَا الرَّسُولُ": [41, 67],
            "سَمَّاعُونَ لِلْكَذِبِ": [41, 42],
            "إِنَّا أَنْزَلْنَا": [44, 48],
            "وَقَفَّيْنَا عَلَى آثَارِهِمْ": [46]
        }
    },
    "END_RED": {
        "color": "#ef4444",
        "type": "END",
        "rules": {
            "إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ": [4],
            "وَاتَّقُوا اللَّهَ إِنَّ اللَّهَ خَبِيرٌ بِمَا تَعْمَلُونَ": [8],
            "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ": [11],
            "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ": [13],
            "إِنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ": [17, 19, 40, 120],
            "فَإِنَّ اللَّهَ غَفُورٌ رَحِيمٌ": [3, 34, 39, 98],
            "لَعَلَّكُمْ تَشْكُرُونَ": [6, 89],
            "وَمَنْ لَمْ يَحْكُمْ بِمَا أَنْزَلَ اللَّهُ فَأُولَئِكَ هُمُ": [44, 45, 47],
            "أَفَلَا تَعْقِلُونَ": [58],
            "وَاللَّهُ يَهْدِي مَنْ يَشَاءُ إِلَى صِرَاطٍ مُسْتَقِيمٍ": [16]
        }
    },
    "MIDDLE_BLUE": {
        "color": "#3b82f6",
        "type": "MIDDLE",
        "rules": {
            "وَاتَّقُوا اللَّهَ إِنَّ اللَّهَ": [7, 8, 35, 96, 108],
            "تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا": [12, 85, 119],
            "أَفَلَا يَتُوبُونَ إِلَى اللَّهِ وَيَسْتَغْفِرُونَهُ": [74],
            "وَاللَّهُ يَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ": [99]
        }
    }
};

function getJuz(ayahNumber) {
    if (ayahNumber <= 82) return "6";
    return "7";
}

Object.keys(AL_MAIDAH_DATA).forEach(catKey => {
    const cat = AL_MAIDAH_DATA[catKey];
    const type = cat.type;
    const color = cat.color;

    Object.keys(cat.rules).forEach(phrase => {
        const ayahs = cat.rules[phrase];

        // Create cross-references
        for (let i = 0; i < ayahs.length; i++) {
            const srcAyah = ayahs[i];
            const srcAbs = AL_MAIDAH_OFFSET + srcAyah;
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
                const targetAbs = AL_MAIDAH_OFFSET + targetAyah;

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
console.log("Successfully added Al-Ma'idah mutashabihat to constants/mutashabiha_data_full.json");
