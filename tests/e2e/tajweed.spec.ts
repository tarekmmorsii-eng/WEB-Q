import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import fs from 'node:fs';
let script: string;
const fixture = JSON.parse(fs.readFileSync('artifacts/tajweed-2-22-source.json', 'utf8'));
test.beforeAll(async () => {
    const result = await build({ stdin: { contents: `
        import React from 'react';import{createRoot}from'react-dom/client';
        import TajweedModal from './components/TajweedModal';
        import {parseTajweedMarkup} from './services/tajweedService';
        window.parseTajweedMarkup=parseTajweedMarkup;
        function App(){const[open,setOpen]=React.useState(false);return <><button onClick={()=>setOpen(false)}>Open</button>{open?<TajweedModal onClose={()=>setOpen(false)} onBack={()=>setOpen(false)} surahNumber={2} ayahNumber={22} language="ar"/>:<><button onClick={()=>setOpen(true)}>أحكام التجويد</button><button>تفسير تجريبي</button></>}</>}
        createRoot(document.getElementById('root')).render(<App/>);
    `, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'iife' });
    script = result.outputFiles[0].text;
});
async function open(page: any, response: any = fixture) {
    await page.route('https://api.quran.com/**', (route: any) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(response) }));
    await page.setViewportSize({ width: 360, height: 740 });
    await page.setContent('<div id="root"></div>');
    const css = fs.readdirSync('dist/assets').find(n => n.startsWith('index-') && n.endsWith('.css'))!;
    await page.addStyleTag({ content: fs.readFileSync('dist/assets/' + css, 'utf8') });
    await page.addScriptTag({ content: script });
    await page.getByRole('button', { name: 'أحكام التجويد', exact: true }).click();
}
test('opens from ayah menu, preserves source text and returns to existing actions', async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('tajweed-verse')).toHaveText(fixture.verses[0].text_uthmani_tajweed.replace(/<[^>]*>/g, ''));
    await page.getByRole('button', { name: 'رجوع' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('summary').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'رجوع' })).toBeFocused();
    await page.locator('summary').filter({ hasText: 'مدّ بسبب الهمز' }).click();
    await expect(page.getByText('فئة مشتركة في المصدر', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await expect(page.getByRole('button', { name: 'رجوع' })).toBeInViewport();
    await page.screenshot({ path: 'artifacts/tajweed-integrated-mobile.png' });
    await page.getByRole('button', { name: 'رجوع' }).click();
    await expect(page.getByRole('button', { name: 'أحكام التجويد', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /تفسير/ })).toBeVisible();
});
test('rejects malformed markup without displaying a partially repaired verse', async ({ page }) => {
    await open(page, { verses: [{ verse_key: '2:22', text_uthmani_tajweed: 'أَمْ >ٮٰ</tajweed>' }] });
    await expect(page.getByRole('alert')).toContainText('لعدم سلامة');
    await expect(page.getByTestId('tajweed-verse')).toHaveCount(0);
});
test('rejects wrong verse and retries with valid response', async ({ page }) => {
    await open(page, { verses: [{ ...fixture.verses[0], verse_key: '2:23' }] });
    await expect(page.getByRole('alert')).toBeVisible();
    await page.unroute('https://api.quran.com/**');
    await page.route('https://api.quran.com/**', route => route.fulfill({ json: fixture }));
    await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
    await expect(page.getByTestId('tajweed-verse')).toBeVisible();
});
test('network failure recovers; Escape closes; parser blocks active content and unknown tags', async ({ page }) => {
    await open(page);
    await expect(page.getByTestId('tajweed-verse')).toBeVisible();
    const rejected = await page.evaluate(() => ['<img src=x onerror=alert(1)>', '<tajweed class=unknown>ن</tajweed>', '<tajweed class=ikhafa>ن', 'ن</tajweed>', '<span class=end onclick=x>١</span>'].every(s => { try { (window as any).parseTajweedMarkup(s); return false; } catch { return true; } }));
    expect(rejected).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.unroute('https://api.quran.com/**');
    await page.route('https://api.quran.com/**', route => route.abort());
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByRole('button', { name: 'أحكام التجويد', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('اتصال الإنترنت');
});
