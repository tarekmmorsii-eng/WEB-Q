const fs = require('fs');
const path = require('path');

const mutashabihatPath = path.join(__dirname, 'public', 'data', 'mutashabihat.json');

try {
    const rawData = fs.readFileSync(mutashabihatPath, 'utf8');
    const data = JSON.parse(rawData);

    // Target IDs for A'raf 109 and 110
    const targetIds = [1063, 1064];
    // Also look for Shu'ara 34/35 IDs just in case
    const lookForShuaraIds = [2965, 2966, 2967, 2968];

    console.log("Searching for references to A'raf 109 (1063) and 110 (1064)...");

    Object.keys(data).forEach(juz => {
        if (Array.isArray(data[juz])) {
            data[juz].forEach(entry => {
                let srcId = entry.src.ayah;
                if (Array.isArray(srcId)) srcId = srcId[0];

                let isTargetSource = targetIds.includes(srcId);
                let isShuaraSource = lookForShuaraIds.includes(srcId);
                let hasTargetMatch = false;
                let hasShuaraMatch = false;

                if (entry.muts) {
                    entry.muts.forEach(m => {
                        let mId = m.ayah;
                        if (Array.isArray(mId)) mId = mId[0];

                        if (targetIds.includes(mId)) hasTargetMatch = true;
                        if (lookForShuaraIds.includes(mId)) hasShuaraMatch = true;
                    });
                }

                // Log if it involves our targets in any way
                if (isTargetSource || hasTargetMatch || isShuaraSource || hasShuaraMatch) {
                    console.log(`\nFound relevant entry in Juz ${juz}:`);
                    console.log(JSON.stringify(entry, null, 2));
                }
            });
        }
    });

} catch (err) {
    console.error("Error:", err);
}
