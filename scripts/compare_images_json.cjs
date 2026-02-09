const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/antigravity/X3 8app Q/constants/mutashabiha_data_full.json', 'utf8'));

const testPhrases = [
    { phrase: "هل أتاك", surahs: [79, 85, 88] },
    { phrase: "متاعا لكم ولأنعامكم", surahs: [79, 80] },
    { phrase: "يومئذ يتذكر الإنسان", surahs: [79, 89] },
    { phrase: "فلينظر الإنسان", surahs: [80, 86] },
    { phrase: "وجوه يومئذ", surahs: [80, 88] },
    { phrase: "وإذا البحار", surahs: [81, 82] },
    { phrase: "فلا أقسم", surahs: [81, 84] },
    { phrase: "والليل إذا", surahs: [81, 91, 92, 93] },
    { phrase: "علمت نفس ما", surahs: [81, 82] },
    { phrase: "يا أيها الإنسان", surahs: [82, 84] },
    { phrase: "إن الأبرار لفي نعيم", surahs: [82, 83] }
];

console.log('Comparison: Images vs JSON');
console.log('---------------------------');

testPhrases.forEach(test => {
    let found = false;
    let matchSurahs = new Set();

    data.forEach(mut => {
        const rule = (mut.similarAyahs[0]?.rule || "").trim();
        if (rule.includes(test.phrase) || test.phrase.includes(rule)) {
            // Check if it involves the surahs we expect
            const involvedSurahs = new Set([mut.sourceAyah.surahNumber, ...mut.similarAyahs.map(a => a.surahNumber)]);
            const hasTargetSurahs = test.surahs.some(s => involvedSurahs.has(s));

            if (hasTargetSurahs) {
                found = true;
                involvedSurahs.forEach(s => matchSurahs.add(s));
            }
        }
    });

    if (found) {
        console.log(`[OK] Phrase "${test.phrase}" found in JSON. Surahs: ${Array.from(matchSurahs).join(', ')}`);
    } else {
        console.log(`[MISSING] Phrase "${test.phrase}" NOT found in JSON for expected surahs.`);
    }
});
