import fs from 'node:fs/promises';
import { build } from 'esbuild';
const result = await build({ entryPoints: ['services/juzOneTajweed.ts'], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.DEV': 'false', 'import.meta.env.MODE': '"audit"' } });
const { HUB_API, parseHubDefinitions, parseHubVerse, contextualReason } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
async function read(path) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const r = await fetch(`${HUB_API}/${path}`, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return await r.json();
        } catch (e) { if (attempt === 1) throw e; }
    }
}
const definitions = parseHubDefinitions(await read('tajweed/rules?lang=ar'));
const rows = [];
for (const [surah, count] of [[1, 7], [2, 141]]) {
    for (let ayah = 1; ayah <= count; ayah++) {
        const key = `${surah}:${ayah}`;
        try {
            const verse = parseHubVerse(await read(`ayah/${key}/tajweed?tajweedLevel=advanced`), surah, ayah, definitions);
            const marks = verse.words.flatMap(w => w.marks.map(m => ({ word: w, mark: m })));
            rows.push({ key, words: verse.words.length, marks: marks.length,
                contextualReasons: marks.filter(({ word, mark }) => contextualReason(word, mark, verse.words[word.position])).length,
                mismatches: marks.filter(({ mark }) => mark.start === null).map(({ word, mark }) => ({ location: word.location, rule: mark.cls, span: mark.span })),
                unknown: [...new Set(marks.filter(({ mark }) => !definitions[mark.cls]).map(({ mark }) => mark.cls))],
            });
        } catch (e) { rows.push({ key, error: e.message }); }
        if (rows.length % 20 === 0) console.log(`Checked ${rows.length}/148 verses`);
    }
}
const report = { date: new Date().toISOString(), source: HUB_API, scope: '1:1–1:7; 2:1–2:141', scientificReview: false, sourceTextStored: false, definitions: Object.keys(definitions).length,
    totals: { verses: rows.length, errors: rows.filter(r => r.error).length, words: rows.reduce((n, r) => n + (r.words || 0), 0), marks: rows.reduce((n, r) => n + (r.marks || 0), 0), mismatches: rows.reduce((n, r) => n + (r.mismatches?.length || 0), 0), unknown: [...new Set(rows.flatMap(r => r.unknown || []))], contextualReasons: rows.reduce((n, r) => n + (r.contextualReasons || 0), 0) }, rows };
await fs.writeFile('artifacts/juz-one-tajweed-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.totals));
if (report.totals.errors) process.exitCode = 1;
