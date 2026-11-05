import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import fs from 'node:fs';
const fixture = JSON.parse(fs.readFileSync('artifacts/quranhub-sample-2-22.json', 'utf8'));
const definitions = JSON.parse(fs.readFileSync('artifacts/quranhub-audit-1.json', 'utf8'));
let trial: string, production: string;
async function bundle(mode: string) {
    const r = await build({ stdin: { contents: `
        import React from 'react'; import {createRoot} from 'react-dom/client';
        import AyahOptionsModal from './components/AyahOptionsModal';
        import * as service from './services/juzOneTajweed';
        window.service=service;
        function App(){const[open,setOpen]=React.useState(true);const[ayah,setAyah]=React.useState(22);return <><button onClick={()=>setOpen(true)}>Open</button><button onClick={()=>setAyah(141)}>Last</button><button onClick={()=>setAyah(142)}>Outside</button><button onClick={()=>setAyah(22)}>Sample</button><AyahOptionsModal isOpen={open} onClose={()=>setOpen(false)} surahNumber={2} ayahNumber={ayah} language="ar" currentRating={null} onRate={()=>{}} onBookmark={()=>{}} isBookmarked={false} tafsir="تفسير تجريبي"/></>}
        createRoot(document.getElementById('root')).render(<App/>);
    `, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', define: { 'import.meta.env.DEV': 'false', 'import.meta.env.MODE': JSON.stringify(mode) } });
    return r.outputFiles[0].text;
}
test.beforeAll(async () => { trial = await bundle('tajweed-trial'); production = await bundle('production'); });
async function mount(page: any, raw = fixture, script = trial) {
    await page.goto('about:blank');
    await page.setViewportSize({ width: 360, height: 740 });
    await page.route('https://api.quranhub.com/**', (route: any) => route.fulfill({ json: route.request().url().includes('/tajweed/rules') ? definitions : raw }));
    await page.setContent('<style>:root{--bg-card:#fff;--text-primary:#222;--bg-secondary:#eee}</style><div id="root"></div>');
    const css = fs.readdirSync('dist/assets').find(n => n.startsWith('index-') && n.endsWith('.css'))!;
    await page.addStyleTag({ content: fs.readFileSync('dist/assets/' + css, 'utf8') });
    await page.addScriptTag({ content: script });
}
async function open(page: any) { await page.getByRole('button', { name: 'أحكام التجويد', exact: true }).click(); }

test('word and whole-verse views retain exact source text, overlap and stop context on mobile', async ({ page }) => {
    await mount(page); await open(page);
    await expect(page.getByTestId('juz-tajweed-verse')).toHaveText(fixture.data.words.map((w: any) => w.text).join(' '));
    await page.getByTestId('tajweed-word-21').click();
    const details = page.getByTestId('word-details-21');
    await expect(details.locator('article')).toHaveCount(4);
    await expect(details).toContainText('حرف «د»');
    await expect(details).toContainText('حرف «و»');
    await expect(details).toContainText('عند الوقف فقط');
    await expect(page.getByTestId('word-details-20')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await page.screenshot({ path: 'artifacts/juz-one-word-mobile.png' });
    await page.getByRole('button', { name: 'عرض أحكام الآية بالترتيب' }).click();
    await expect(page.locator('[data-testid^="word-details-"]')).toHaveCount(23);
    await expect(page.getByTestId('word-details-1')).toContainText('تعذّر تثبيت');
    await expect(page.getByTestId('word-details-23')).toContainText('عند الوقف');
    await expect(page.getByTestId('word-details-5').locator('article')).toHaveCount(4);
    await page.getByRole('button', { name: 'رجوع', exact: true }).click();
    await expect(page.getByRole('button', { name: /تفسير/ })).toBeVisible();
});

test('production hides the trial and its boundary stops at 2:141', async ({ page }) => {
    await mount(page, fixture, production);
    await expect(page.getByRole('button', { name: 'أحكام التجويد', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => { const s = (window as any).service; return [s.isJuzOne(1, 1), s.isJuzOne(1, 7), s.isJuzOne(2, 141), s.isJuzOne(2, 142), s.isJuzOne(1, 8), s.isJuzOne(2, 0)]; })).toEqual([true, true, true, false, false, false]);
    await mount(page);
    await page.getByRole('button', { name: 'Last', exact: true }).dispatchEvent('click');
    await expect(page.getByRole('button', { name: 'أحكام التجويد', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Outside', exact: true }).dispatchEvent('click');
    await expect(page.getByRole('button', { name: 'أحكام التجويد', exact: true })).toHaveCount(0);
});

test('malformed or wrong identity is rejected and retry recovers', async ({ page }) => {
    await mount(page, { ...fixture, data: { ...fixture.data, ayah_number: 23 } }); await open(page);
    await expect(page.getByRole('alert')).toContainText('سلامة');
    await expect(page.getByTestId('juz-tajweed-verse')).toHaveCount(0);
    await page.unroute('https://api.quranhub.com/**');
    await page.route('https://api.quranhub.com/**', route => route.fulfill({ json: route.request().url().includes('/tajweed/rules') ? definitions : fixture }));
    await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
    await expect(page.getByTestId('juz-tajweed-verse')).toBeVisible();
});

test('unknown definitions stay explicit; invalid offsets never mutate Quran text', async ({ page }) => {
    const raw = structuredClone(fixture);
    raw.data.words[1].tajweed.rules = [{ cls: 'new_rule', span: 'ج', offset: 1, len: 1 }];
    await mount(page, raw); await open(page);
    await page.getByTestId('tajweed-word-2').click();
    await expect(page.getByTestId('word-details-2')).toContainText('لا يتوفر تعريف');
    const results = await page.evaluate(({ raw, definitions }) => {
        const s = (window as any).service, defs = s.parseHubDefinitions(definitions);
        const reject = (mutate: any) => { const bad = structuredClone(raw); mutate(bad); try { s.parseHubVerse(bad, 2, 22, defs); return false; } catch { return true; } };
        return [reject((b: any) => b.data.words[0].text = '<img>'), reject((b: any) => b.data.words[0].location = '2:23:1'), reject((b: any) => b.data.words[0].tajweed.text = 'آخر'), s.exactHubRange('ن', { span: 'ن', len: 1, offset: 2 }) === null, s.exactHubRange('ي', { span: 'ى', len: 1, offset: 1 }) === null];
    }, { raw, definitions });
    expect(results).toEqual([true, true, true, true, true]);
});

test('offline error, timeout and close cancellation', async ({ page }) => {
    await mount(page);
    await page.unroute('https://api.quranhub.com/**');
    await page.route('https://api.quranhub.com/**', route => route.abort());
    await open(page);
    await expect(page.getByRole('alert')).toContainText('اتصال بالإنترنت');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.unroute('https://api.quranhub.com/**');
    await page.route('https://api.quranhub.com/**', async () => {});
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.clock.install(); await open(page);
    await page.clock.fastForward(21000);
    await expect(page.getByRole('alert')).toContainText('اتصال بالإنترنت');
});

test('keyboard focus remains inside the dialog and legacy comparison remains separate', async ({ page }) => {
    await mount(page); await open(page);
    await expect(page.getByTestId('juz-tajweed-verse')).toBeVisible();
    await page.getByRole('button', { name: 'رجوع', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'فتح النموذجين السابقين للمقارنة' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'رجوع', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'فتح النموذجين السابقين للمقارنة' }).click();
    await expect(page.getByText('مقارنة النموذجين — اختر طريقة العرض')).toBeVisible();
    await page.getByRole('button', { name: 'الجديد: QuranHub' }).click();
    await expect(page.getByRole('heading', { name: 'تجربة QuranHub — البقرة ٢٢' })).toBeVisible();
    await page.getByRole('button', { name: 'رجوع', exact: true }).click();
    await expect(page.getByTestId('juz-tajweed-verse')).toBeVisible();
});
