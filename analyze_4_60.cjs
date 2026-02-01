const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

(async () => {
    try {
        console.log("Fetching 4:60 words...");
        const response = await fetchUrl('http://api.alquran.cloud/v1/ayah/4:60/quran-tajweed');
        const words = response.verse.words;

        words.forEach((w, i) => {
            console.log(`Word ${i + 1}: ${w.text_uthmani} (Type: ${w.char_type_name})`);
        });

    } catch (e) {
        console.error(e);
    }
})();
