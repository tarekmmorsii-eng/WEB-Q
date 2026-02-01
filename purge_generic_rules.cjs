const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');

try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    const noiseRules = ["الَّذِينَ", "وَإِذْ", "يَا أَيُّهَا"];
    const preservedRules = ["يَا أَيُّهَا الَّذِينَ آمَنُوا", "وَإِذْ قَالَ"];

    let totalRemoved = 0;
    const newData = {};

    Object.entries(data).forEach(([juz, mutations]) => {
        const filteredMutations = mutations.map(mut => {
            const filteredMuts = mut.muts.filter(m => {
                const isNoise = noiseRules.includes(m.rule);
                const isPreserved = preservedRules.some(p => m.rule.includes(p) && m.rule !== "وَإِذْ" && m.rule !== "الَّذِينَ");

                if (isNoise && !isPreserved) {
                    totalRemoved++;
                    return false;
                }
                return true;
            });

            return { ...mut, muts: filteredMuts };
        }).filter(mut => mut.muts.length > 0);

        if (filteredMutations.length > 0) {
            newData[juz] = filteredMutations;
        }
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(newData, null, 4));
    console.log(`✅ Success! Removed ${totalRemoved} generic/noise entries.`);
    console.log(`Cleaned file saved to: ${FILE_PATH}`);

} catch (error) {
    console.error("❌ Error during purge:", error);
}
