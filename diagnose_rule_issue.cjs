const fs = require('fs');
const path = require('path');

console.log("=== Diagnostic Report: Rule Property Issue ===\n");

// 1. Check JSON file
const jsonPath = path.join(__dirname, 'constants', 'mutashabiha_data_full.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const firstJuz = Object.keys(data)[0];
const firstEntry = data[firstJuz][0];

console.log("1. JSON File Check:");
console.log("   First entry structure:");
console.log(JSON.stringify(firstEntry, null, 2));
console.log("");

// Count entries with/without rule
let totalMuts = 0;
let withRule = 0;
let ruleTypes = { START: 0, END: 0, MIDDLE: 0, FREQ: 0, OTHER: 0 };

Object.values(data).forEach(juzData => {
    juzData.forEach(entry => {
        entry.muts.forEach(mut => {
            totalMuts++;
            if (mut.rule) {
                withRule++;
                if (ruleTypes[mut.rule] !== undefined) {
                    ruleTypes[mut.rule]++;
                } else {
                    ruleTypes.OTHER = (ruleTypes.OTHER || 0) + 1;
                }
            }
        });
    });
});

console.log("2. Statistics:");
console.log(`   Total matches: ${totalMuts}`);
console.log(`   With 'rule' property: ${withRule} (${((withRule / totalMuts) * 100).toFixed(1)}%)`);
console.log(`   Without 'rule' property: ${totalMuts - withRule}`);
console.log("");
console.log("3. Rule Distribution:");
Object.entries(ruleTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} (${((count / totalMuts) * 100).toFixed(1)}%)`);
});
console.log("");

// Sample from each rule type
console.log("4. Sample Matches by Rule:");
const samples = {};
Object.values(data).forEach(juzData => {
    juzData.forEach(entry => {
        entry.muts.forEach(mut => {
            const rule = mut.rule || 'MISSING';
            if (!samples[rule]) {
                samples[rule] = { src: entry.src.ayah, target: mut.ayah, rule: mut.rule };
            }
        });
    });
});

Object.entries(samples).forEach(([rule, sample]) => {
    console.log(`   ${rule}: Source=${sample.src}, Target=${sample.target}`);
});

console.log("\n=== End of Report ===");
