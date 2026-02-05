const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const AN_NISA_OFFSET = 493;

const AN_NISA_DATA = {
    "START_GREEN": {
        "color": "#10b981",
        "type": "START",
        "rules": {
            "وَآتُوا": [2, 4],
            "وَإِنْ خِفْتُمْ": [3, 35, 101],
            "وَقُولُوا لَهُمْ قَوْلًا مَعْرُوفًا": [5, 8],
            "وَإِذَا": [8, 61, 83, 86, 101, 102],
            "إِنَّ الَّذِينَ": [10, 56, 97, 137, 150, 167, 168],
            "يُوصِيكُمُ اللَّهُ": [11, 176],
            "تِلْكَ حُدُودُ اللَّهِ": [13, 14],
            "وَمَنْ يَعْصِ اللَّهَ وَرَسُولَهُ": [14],
            "وَلَيْسَتِ التَّوَّبَةُ": [18],
            "يَا أَيُّهَا الَّذِينَ آمَنُوا": [19, 29, 43, 59, 71, 94, 135, 136, 144],
            "يُرِيدُ اللَّهُ": [26, 27, 28],
            "فَكَيْفَ إِذَا": [41, 62],
            "أَلَمْ تَرَ إِلَى الَّذِينَ": [44, 49, 51, 60, 77],
            "أُولَئِكَ الَّذِينَ": [52, 63, 121, 150, 151],
            "إِنَّ اللَّهَ كَانَ بِمَا تَعْمَلُونَ خَبِيرًا": [94, 128],
            "إِنَّ اللَّهَ لَا يَغْفِرُ أَنْ يُشْرَكَ بِهِ": [48, 116],
            "لَا خَيْرَ فِي كَثِيرٍ مِنْ نَجْوَاهُمْ": [114],
            "وَمَنْ يَعْمَلْ": [110, 124],
            "وَلَنْ تَسْتَطِيعُوا": [129],
            "يَسْتَفْتُونَكَ": [127, 176],
            "إِنَّ الْمُنَافِقِينَ": [142, 145],
            "لَكِنِ الرَّاسِخُونَ فِي الْعِلْمِ": [162]
        }
    },
    "END_RED": {
        "color": "#ef4444",
        "type": "END",
        "rules": {
            "حُوبًا كَبِيرًا": [2],
            "حَسِيبًا": [6, 86],
            "نَصِيبًا مَفْرُوضًا": [7, 118],
            "إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا": [11, 17, 24, 26, 92, 104, 111, 170],
            "عَذَابًا مُهِينًا": [14, 37, 102, 151],
            "تَوَّابًا رَحِيمًا": [16, 64],
            "عَذَابًا أَلِيمًا": [18, 138, 161],
            "إِنَّ اللَّهَ كَانَ غَفُورًا رَحِيمًا": [23, 25, 96, 100, 106, 110, 129, 152],
            "وَكَانَ اللَّهُ عَلَى ذَلِكَ قَدِيرًا": [133],
            "وَكَانَ اللَّهُ سَمِيعًا بَصِيرًا": [58, 134],
            "ضَلَالًا بَعِيدًا": [60, 116, 136, 137],
            "صِرَاطًا مُسْتَقِيمًا": [68, 175],
            "أَجْرًا عَظِيمًا": [40, 67, 74, 95, 114, 146, 162],
            "وَكَفَى بِاللَّهِ شَهِيدًا": [79, 166],
            "وَكَفَى بِاللَّهِ وَكِيلًا": [81, 132, 171],
            "وَلِيًّا وَلَا نَصِيرًا": [89, 123, 173],
            "سُلْطَانًا مُبِينًا": [91, 144, 153],
            "مُحِيطًا": [108, 126]
        }
    },
    "MIDDLE_BLUE": {
        "color": "#3b82f6",
        "type": "MIDDLE",
        "rules": {
            "بُهْتَانًا وَإِثْمًا مُبِينًا": [20, 50, 112],
            "مِيثَاقًا غَلِيظًا": [21, 154],
            "فَلَا تَقْعَدُوا مَعَهُمْ": [140],
            "وَلِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ": [126, 131, 132],
            "عَلِيمًا بِذَاتِ الصُّدُورِ": [63],
            "وَكَفَى بِاللَّهِ حَسِيبًا": [6],
            "فَأَعْرِضْ عَنْهُمْ وَعِظْهُمْ": [63],
            "فَأَعْرِضْ عَنْهُمْ وَتَوَكَّلْ عَلَى اللَّهِ": [81]
        }
    }
};

function getJuz(ayahNumber) {
    if (ayahNumber <= 23) return "4";
    if (ayahNumber <= 147) return "5";
    return "6";
}

Object.keys(AN_NISA_DATA).forEach(catKey => {
    const cat = AN_NISA_DATA[catKey];
    const type = cat.type;
    const color = cat.color;

    Object.keys(cat.rules).forEach(phrase => {
        const ayahs = cat.rules[phrase];

        // Create cross-references
        for (let i = 0; i < ayahs.length; i++) {
            const srcAyah = ayahs[i];
            const srcAbs = AN_NISA_OFFSET + srcAyah;
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
                const targetAbs = AN_NISA_OFFSET + targetAyah;

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
console.log("Successfully added An-Nisa mutashabihat to constants/mutashabiha_data_full.json");
