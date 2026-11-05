import { test, expect } from '@playwright/test';
import { build } from 'esbuild';

// Exercise the real modal and restoration hook. Only the Android bridge and
// Quran data are mocked; a desktop browser cannot reproduce Samsung system UI.
let script: string;
test.beforeAll(async () => {
    const result = await build({
        stdin: { contents: `
            import React, { useState } from 'react';
            import { createRoot } from 'react-dom/client';
            import SearchModal from './components/SearchModal';
            import { useSearchImmersiveRestore } from './hooks/useSearchImmersiveRestore';
            window.calls = [];
            window.fetch = async () => ({ json: async () => ({ code: 200, data: {
                surahs: [{ number: 1, name: 'Test', englishName: 'Test', startPage: 55,
                    ayahs: [{ numberInSurah: 1, page: 55, text: 'sample', juz: 1 }] }]
            } }) });
            const t = new Proxy({ surahNames: ['Test'], enterPageNumber: 'Page {max}',
                verse: 'Verse', go: 'Go', search: 'Search', searchPlaceholder: 'Text',
                resultsFound: '{count}', page: 'Page' }, { get: (o,k) => o[k] || String(k) });
            function App() {
                const [open, setOpen] = useState(false);
                const [visible, setVisible] = useState(true);
                useSearchImmersiveRestore(open, visible, true);
                const select = page => {
                    window.calls.push({ type: 'select', page, focused: document.activeElement.tagName });
                    setOpen(false);
                };
                return <><button onClick={() => { window.calls = []; setOpen(true); }}>Open</button>
                    <button onClick={() => setVisible(v => !v)}>Toggle bars</button>
                    {open && <SearchModal isOpen onClose={() => setOpen(false)}
                        onSelectPage={select} onSelectResult={select}
                        totalPages={604} language="en" t={t} />}</>;
            }
            createRoot(document.getElementById('root')).render(<App />);
        `, resolveDir: process.cwd(), loader: 'tsx' },
        bundle: true, write: false, format: 'iife', outdir: 'out',
        plugins: [{ name: 'mock-native', setup(build) {
            build.onResolve({ filter: /^@capacitor\/core$/ }, () => ({ path: 'native', namespace: 'mock' }));
            build.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: `
                export const Capacitor = { getPlatform: () => window.platform };
                export const registerPlugin = () => ({ hideKeyboard: () => window.holdKeyboard ? new Promise(resolve => { window.finishKeyboard = resolve; }) : Promise.resolve(), setVisible: async options => { window.calls.push({
                    type: 'bars', ...options, inputsRemaining: document.querySelectorAll('input').length
                }); return { top: 32, bottom: 48 }; } });
            ` }));
        } }],
    });
    script = result.outputFiles.find(file => file.path.endsWith('.js'))!.text;
});

test('Android keeps search mounted and prevents duplicate navigation until keyboard settles', async ({ page }) => {
    await page.setContent('<div id="root"></div>');
    await page.evaluate(() => { (window as any).platform = 'android'; (window as any).holdKeyboard = true; });
    await page.addScriptTag({ content: script });
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.getByPlaceholder('Page 604', { exact: true }).fill('55');
    await page.getByRole('button', { name: 'Go', exact: true }).first().click();
    await expect.poll(() => page.evaluate(() => typeof (window as any).finishKeyboard)).toBe('function');
    await page.getByRole('button', { name: 'Go', exact: true }).first().click();
    expect(await page.evaluate(() => (window as any).calls.filter(c => c.type === 'select'))).toEqual([]);
    await expect(page.getByPlaceholder('Page 604', { exact: true })).toBeVisible();
    await page.evaluate(() => (window as any).finishKeyboard());
    await expect(page.locator('input')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).calls.filter(c => c.type === 'select').length)).toBe(1);
});

for (const platform of ['android', 'web']) {
    for (const mode of ['page', 'ayah', 'text']) {
        test(`${platform}: ${mode} releases focus and restores after dialog removal`, async ({ page }) => {
            await page.setContent('<div id="root"></div>');
            await page.evaluate(p => { (window as any).platform = p; }, platform);
            await page.addScriptTag({ content: script });
            await page.getByRole('button', { name: 'Open', exact: true }).click();
            await expect.poll(() => page.evaluate(() => (window as any).calls.length))
                .toBe(platform === 'android' ? 1 : 0);
            await page.evaluate(() => { (window as any).calls = []; });
            if (mode === 'text') {
                await page.getByPlaceholder('Text', { exact: true }).fill('sample');
                await page.getByPlaceholder('Text', { exact: true }).press('Enter');
                await page.getByText('sample', { exact: true }).click();
            } else {
                const input = page.getByPlaceholder(mode === 'page' ? 'Page 604' : 'Verse (١ - 1)', { exact: true });
                await input.fill(mode === 'page' ? '55' : '1');
                // Input stays focused without any software keyboard in this browser.
                // Cover both tapping Go and submitting with Enter.
                if (platform === 'android') {
                    await page.getByRole('button', { name: 'Go', exact: true }).nth(mode === 'page' ? 0 : 1).click();
                } else {
                    await input.press('Enter');
                }
            }
            await expect(page.locator('input')).toHaveCount(0);
            await expect.poll(() => page.evaluate(() => (window as any).calls.length))
                .toBe(platform === 'android' ? 2 : 1);
            const calls = await page.evaluate(() => (window as any).calls);
            expect(calls[0]).toMatchObject({ type: 'select', page: 55 });
            expect(calls[0].focused).not.toBe('INPUT');
            if (platform === 'android') {
                expect(calls[1]).toEqual({ type: 'bars', visible: true, darkIcons: true, inputsRemaining: 0 });
                expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--android-status-bar-height'))).toBe('32px');
                expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--android-navigation-bar-height'))).toBe('48px');
                await page.getByRole('button', { name: 'Toggle bars' }).click();
                await expect.poll(() => page.evaluate(() => (window as any).calls.at(-1).visible)).toBe(false);
                expect(await page.evaluate(() => document.documentElement.dataset.androidSystemBars)).toBe('false');
                await page.getByRole('button', { name: 'Toggle bars' }).click();
                await expect.poll(() => page.evaluate(() => (window as any).calls.at(-1).visible)).toBe(true);
            }
        });
    }
}
