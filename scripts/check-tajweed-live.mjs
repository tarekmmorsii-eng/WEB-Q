import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
const { outputFiles } = await build({ stdin: { contents: `
import React from 'react';import {createRoot} from 'react-dom/client';import JuzOneTajweedModal from './components/JuzOneTajweedModal';
createRoot(document.getElementById('root')).render(<JuzOneTajweedModal surahNumber={2} ayahNumber={22} language="ar" onBack={()=>{}} onClose={()=>{}}/>);
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', define: { 'import.meta.env.DEV': 'false', 'import.meta.env.MODE': '"tajweed-trial"' } });
const browser = await chromium.launch({ channel: 'chrome' });
try {
    const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    // Route only the shell. Both QuranHub requests run through browser CORS, unmocked.
    await page.route('https://localhost/tajweed-test', route => route.fulfill({ contentType: 'text/html', body: '<style>:root{--bg-card:#fff;--text-primary:#222;--bg-secondary:#eee}</style><div id="root"></div>' }));
    await page.goto('https://localhost/tajweed-test');
    const css = (await fs.readdir('dist/assets')).find(n => n.startsWith('index-') && n.endsWith('.css'));
    await page.addStyleTag({ content: await fs.readFile(`dist/assets/${css}`, 'utf8') });
    await page.addScriptTag({ content: outputFiles[0].text });
    await page.getByTestId('juz-tajweed-verse').waitFor({ timeout: 25000 });
    await page.screenshot({ path: 'artifacts/juz-one-live-verse-mobile.png' });
    await page.getByTestId('tajweed-word-21').click();
    const cards = await page.getByTestId('word-details-21').locator('article').count();
    if (cards !== 4 || errors.length) throw new Error(JSON.stringify({ cards, errors }));
    await page.screenshot({ path: 'artifacts/juz-one-live-word-mobile.png' });
    await page.getByRole('button', { name: 'العودة إلى كلمات الآية' }).click();
    await page.evaluate(() => { document.documentElement.style.setProperty('--bg-card', '#17202a'); document.documentElement.style.setProperty('--text-primary', '#f8fafc'); document.documentElement.style.setProperty('--bg-secondary', '#334155'); });
    await page.screenshot({ path: 'artifacts/juz-one-live-dark-mobile.png' });
    const report = { checkedAt: new Date().toISOString(), browser: 'Chrome', origin: 'https://localhost', source: 'QuranHub live, no API mocks', verse: '2:22', andadanCards: cards, errors, androidDeviceTested: false };
    await fs.writeFile('artifacts/juz-one-live-check.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
} finally { await browser.close(); }
