
const fs = require('fs');

// Surah Data (Ayah counts)
const SURAHS = [
    { number: 1, ayahCount: 7 }, { number: 2, ayahCount: 286 }, { number: 3, ayahCount: 200 },
    { number: 4, ayahCount: 176 }, { number: 5, ayahCount: 120 }, { number: 6, ayahCount: 165 },
    { number: 7, ayahCount: 206 }, { number: 8, ayahCount: 75 }, { number: 9, ayahCount: 129 },
    { number: 10, ayahCount: 109 }, { number: 11, ayahCount: 123 }, { number: 12, ayahCount: 111 },
    { number: 13, ayahCount: 43 }, { number: 14, ayahCount: 52 }, { number: 15, ayahCount: 99 },
    { number: 16, ayahCount: 128 }, { number: 17, ayahCount: 111 }, { number: 18, ayahCount: 110 },
    { number: 19, ayahCount: 98 }, { number: 20, ayahCount: 135 }, { number: 21, ayahCount: 112 },
    { number: 22, ayahCount: 78 }, { number: 23, ayahCount: 118 }, { number: 24, ayahCount: 64 },
    { number: 25, ayahCount: 77 }, { number: 26, ayahCount: 227 }, { number: 27, ayahCount: 93 },
    { number: 28, ayahCount: 88 }, { number: 29, ayahCount: 69 }, { number: 30, ayahCount: 60 },
    { number: 31, ayahCount: 34 }, { number: 32, ayahCount: 30 }, { number: 33, ayahCount: 73 },
    { number: 34, ayahCount: 54 }, { number: 35, ayahCount: 45 }, { number: 36, ayahCount: 83 },
    { number: 37, ayahCount: 182 }, { number: 38, ayahCount: 88 }, { number: 39, ayahCount: 75 },
    { number: 40, ayahCount: 85 }, { number: 41, ayahCount: 54 }, { number: 42, ayahCount: 53 },
    { number: 43, ayahCount: 89 }, { number: 44, ayahCount: 59 }, { number: 45, ayahCount: 37 },
    { number: 46, ayahCount: 35 }, { number: 47, ayahCount: 38 }, { number: 48, ayahCount: 29 },
    { number: 49, ayahCount: 18 }, { number: 50, ayahCount: 45 }, { number: 51, ayahCount: 60 },
    { number: 52, ayahCount: 49 }, { number: 53, ayahCount: 62 }, { number: 54, ayahCount: 55 },
    { number: 55, ayahCount: 78 }, { number: 56, ayahCount: 96 }, { number: 57, ayahCount: 29 },
    { number: 58, ayahCount: 22 }, { number: 59, ayahCount: 24 }, { number: 60, ayahCount: 13 },
    { number: 61, ayahCount: 14 }, { number: 62, ayahCount: 11 }, { number: 63, ayahCount: 11 },
    { number: 64, ayahCount: 18 }, { number: 65, ayahCount: 12 }, { number: 66, ayahCount: 12 },
    { number: 67, ayahCount: 30 }, { number: 68, ayahCount: 52 }, { number: 69, ayahCount: 52 },
    { number: 70, ayahCount: 44 }, { number: 71, ayahCount: 28 }, { number: 72, ayahCount: 28 },
    { number: 73, ayahCount: 20 }, { number: 74, ayahCount: 56 }, { number: 75, ayahCount: 40 },
    { number: 76, ayahCount: 31 }, { number: 77, ayahCount: 50 }, { number: 78, ayahCount: 40 },
    { number: 79, ayahCount: 46 }, { number: 80, ayahCount: 42 }, { number: 81, ayahCount: 29 },
    { number: 82, ayahCount: 19 }, { number: 83, ayahCount: 36 }, { number: 84, ayahCount: 25 },
    { number: 85, ayahCount: 22 }, { number: 86, ayahCount: 17 }, { number: 87, ayahCount: 19 },
    { number: 88, ayahCount: 26 }, { number: 89, ayahCount: 30 }, { number: 90, ayahCount: 20 },
    { number: 91, ayahCount: 15 }, { number: 92, ayahCount: 21 }, { number: 93, ayahCount: 11 },
    { number: 94, ayahCount: 8 }, { number: 95, ayahCount: 8 }, { number: 96, ayahCount: 19 },
    { number: 97, ayahCount: 5 }, { number: 98, ayahCount: 8 }, { number: 99, ayahCount: 8 },
    { number: 100, ayahCount: 11 }, { number: 101, ayahCount: 11 }, { number: 102, ayahCount: 8 },
    { number: 103, ayahCount: 3 }, { number: 104, ayahCount: 9 }, { number: 105, ayahCount: 5 },
    { number: 106, ayahCount: 4 }, { number: 107, ayahCount: 7 }, { number: 108, ayahCount: 3 },
    { number: 109, ayahCount: 6 }, { number: 110, ayahCount: 3 }, { number: 111, ayahCount: 5 },
    { number: 112, ayahCount: 4 }, { number: 113, ayahCount: 5 }, { number: 114, ayahCount: 6 }
];

function surahAyahToAbsolute(surah, ayah) {
    let acc = 0;
    for (let i = 0; i < surah - 1; i++) {
        acc += SURAHS[i].ayahCount;
    }
    return acc + ayah;
}

function absoluteToSurahAyah(abs) {
    let acc = 0;
    for (const s of SURAHS) {
        if (abs <= acc + s.ayahCount) {
            return { surah: s.number, ayah: abs - acc };
        }
        acc += s.ayahCount;
    }
    return null;
}

// IDs to find
const IDS = {
    "Araf_109": surahAyahToAbsolute(7, 109),
    "Araf_110": surahAyahToAbsolute(7, 110),
    "Shuara_33": surahAyahToAbsolute(26, 33),
    "Shuara_34": surahAyahToAbsolute(26, 34),
    "Shuara_35": surahAyahToAbsolute(26, 35),
};

console.log("=== Target IDs ===");
console.log(IDS);

const MUT_PATH = './public/data/mutashabihat.json';
if (!fs.existsSync(MUT_PATH)) {
    console.error("File not found!");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(MUT_PATH, 'utf8'));

console.log("\n=== Searching in Data ===");
let found = false;

Object.keys(data).forEach(juz => {
    if (Array.isArray(data[juz])) {
        data[juz].forEach(entry => {
            let srcId = entry.src.ayah;
            if (Array.isArray(srcId)) srcId = srcId[0]; // handle array if needed (though usually number)

            // Check if Source matches any target
            Object.entries(IDS).forEach(([name, id]) => {
                // Check source
                if (srcId == id) {
                    console.log(`[MATCH SOURCE] ${name} (${id}) found as Source!`);
                    console.log(JSON.stringify(entry, null, 2));
                    found = true;
                }

                // Check muts
                if (entry.muts) {
                    entry.muts.forEach(m => {
                        let mId = m.ayah;
                        if (Array.isArray(mId)) mId = mId[0];

                        if (mId == id) {
                            console.log(`[MATCH MUT] ${name} (${id}) found in Matches of Source ${srcId} (${JSON.stringify(absoluteToSurahAyah(srcId))})`);
                            console.log(JSON.stringify(entry, null, 2));
                            found = true;
                        }
                    });
                }
            });
        });
    }
});

if (!found) {
    console.log("No exact matches found for these IDs.");
}
