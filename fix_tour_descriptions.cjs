const fs = require('fs');
const path = require('path');
const translate = require('translate-google');

const targetLangs = [
    'id', 'ms', 'ur', 'bn', 'tr', 'fa', 'ha', 'fr', 'es', 'de',
    'ru', 'sw', 'zh', 'ko', 'ja', 'bs', 'sq', 'uz', 'kk', 'ku',
    'vi', 'tl', 'hi', 'ta', 'si', 'am', 'yo', 'om', 'rw', 'ar'
];

const newKeys = {
    tourAyahColorsDescText: "The color of the Ayah number changes based on the memorization level you set:",
    tourMutashabihatDescText: "A colored line appears below the Ayah number to indicate Mutashabihat:",
    tourHideAyahsDescText: "Click here to hide specific verses from the page according to several advanced criteria to test memorization:",
    hideRatedVerses: "Hide rated verses:"
};

async function main() {
    console.log('Fetching translations using translate-google...');
    
    const enPath = path.join(__dirname, 'src', 'assets', 'i18n', 'en.json');
    let enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    for (const k in newKeys) {
        enJson[k] = newKeys[k];
    }
    fs.writeFileSync(enPath, JSON.stringify(enJson, null, 4));

    for (const lang of targetLangs) {
        console.log(`Translating for ${lang}...`);
        const langPath = path.join(__dirname, 'src', 'assets', 'i18n', `${lang}.json`);
        let langJson = {};
        try {
            langJson = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
        } catch(e) {
            console.error(`Could not read ${lang}.json`);
            continue;
        }

        const transObj = {
            tourAyahColorsDescText: newKeys.tourAyahColorsDescText,
            tourMutashabihatDescText: newKeys.tourMutashabihatDescText,
            tourHideAyahsDescText: newKeys.tourHideAyahsDescText,
            hideRatedVerses: newKeys.hideRatedVerses
        };

        let result;
        try {
            // translate-google expects ISO code, 'zh' requires 'zh-cn' usually but library handles it
            result = await translate(transObj, { to: lang });
        } catch (e) {
            console.log(`Failed library translation for ${lang}, using English fallback. Error: ${e.message}`);
            result = transObj;
        }

        langJson.tourAyahColorsDescText = result.tourAyahColorsDescText;
        langJson.tourMutashabihatDescText = result.tourMutashabihatDescText;
        langJson.tourHideAyahsDescText = result.tourHideAyahsDescText;
        langJson.hideRatedVerses = result.hideRatedVerses;

        fs.writeFileSync(langPath, JSON.stringify(langJson, null, 4));
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("Translation injection complete. Updating translations.ts interface...");
    
    const tsFile = fs.readFileSync('i18n/translations.ts', 'utf-8');
    const startIdx = tsFile.indexOf('export interface Translations {');
    const endIdx = tsFile.indexOf('}', startIdx);
    
    const keys = Object.keys(enJson); 
    const interfaceBody = keys.map(k => '    ' + k + ': string;').join('\\n'); 
    
    let newTsFile = tsFile.substring(0, startIdx + 'export interface Translations {\\n'.length) + interfaceBody + '\\n' + tsFile.substring(endIdx);
    
    fs.writeFileSync('i18n/translations.ts', newTsFile);
    console.log("translations.ts updated successfully!");
}

main().catch(console.error);
