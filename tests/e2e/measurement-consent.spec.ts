import { test, expect } from '@playwright/test';
import { build } from 'esbuild';
import fs from 'node:fs';
const languages=[...fs.readFileSync('i18n/translations.ts','utf8').matchAll(/^import (\w+) from '\.\.\/src\/assets\/i18n\//gm)].map(m=>m[1]);
const locales=Object.fromEntries(languages.map(lang=>[lang,JSON.parse(fs.readFileSync(`src/assets/i18n/${lang}.json`,'utf8'))]));
let script: string;
test.beforeAll(async () => {
    const result = await build({ stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import Consent from './components/MeasurementConsent';createRoot(document.getElementById('root')).render(<Consent language={window.testLanguage || 'ar'} ready={true}/>);`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'iife', plugins: [{ name: 'bridge', setup(b) {
        b.onResolve({ filter: /^@capacitor\/core$/ }, () => ({ path: 'core', namespace: 'mock' }));
        b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: `export const Capacitor={getPlatform:()=> 'android'};export const registerPlugin=()=>({applyChoice:async c=>{(window.nativeChoices ||= []).push(c);if(window.failNext){window.failNext=false;throw new Error("test failure")}return {available:true,enabled:c.allowed}}});` }));
    } }] });
    script = result.outputFiles[0].text;
});
async function open(page: any, language='ar') {
    await page.route('https://consent.test/**', (route: any) => route.fulfill({ contentType: 'text/html', body: '<div id="root"></div>' }));
    await page.goto('https://consent.test');
    await page.evaluate(language=>{localStorage.clear();(window as any).testLanguage=language},language);
    await page.addScriptTag({ content: script });
}
test('no preselection; skipping persists no measurement across reload', async ({ page }) => {
    await open(page);
    await expect(page.getByLabel('اختر فئتك العمرية')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'أوافق على المساهمة' })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => (window as any).nativeChoices)).toEqual([{ version: 1, age: 'unknown', allowed: false }]);
    await page.getByRole('button', { name: 'المتابعة دون موافقة' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!))).toMatchObject({ age: 'unknown', allowed: false });
    await page.reload(); await page.addScriptTag({ content: script });
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('all 31 privacy locales show localized adult, minor, returning and error states', async ({ page }) => {
    test.setTimeout(120000);
    expect(languages).toHaveLength(31);
    const keys=Object.keys(locales.en.privacyContribution).sort();
    for(const language of languages){
        const {privacyContribution:copy,dir,feedbackForm}=locales[language];
        expect(Object.keys(copy).sort(),language).toEqual(keys);
        for(const value of Object.values(copy)) expect(typeof value==='string' && value.trim().length>0,language).toBe(true);
        expect(feedbackForm.ageUnavailable.trim().length,language).toBeGreaterThan(0);
        if(language!=='en') expect(copy.disclosure,language).not.toBe(locales.en.privacyContribution.disclosure);
        await open(page,language);
        await expect(page.getByRole('heading')).toHaveText(copy.title);
        await expect(page.getByRole('dialog').locator('..')).toHaveAttribute('dir',dir === 'rtl' ? 'rtl' : 'ltr');
        await page.locator('#measurement-age').selectOption('adult');
        await expect(page.getByText(copy.disclosure,{exact:true})).toBeVisible();
        await expect(page.getByRole('link')).toHaveText(copy.policy);
        await page.getByRole('button',{name:copy.skip,exact:true}).click();
        await page.evaluate(()=>window.dispatchEvent(new Event('open-measurement-choice')));
        await expect(page.locator('#measurement-age')).toHaveValue('adult');
        await expect(page.getByText(copy.pending,{exact:true})).toBeVisible();
        await expect(page.getByText(copy.withdraw,{exact:true})).toBeVisible();
        await page.evaluate(()=>{(window as any).failNext=true});
        await page.getByRole('button',{name:copy.allow,exact:true}).click();
        await expect(page.getByRole('alert')).toHaveText(copy.error);
        await expect(page.getByRole('button',{name:copy.retry,exact:true})).toBeVisible();
        for(const age of ['under18']){
            await page.locator('#measurement-age').selectOption(age);
            await expect(page.getByRole('button',{name:copy.allow,exact:true})).toHaveCount(0);
            await expect(page.getByText(copy.disclosure,{exact:true})).toHaveCount(0);
            await expect(page.getByText(copy.minor,{exact:true})).toBeVisible();
            await expect(page.getByRole('button',{name:copy.continue,exact:true})).toBeVisible();
        }
        await page.getByRole('button',{name:copy.continue,exact:true}).click();
        expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(false);
    }
});
test('under-18 choice cannot opt into measurement', async ({ page }) => {
    await open(page);
    for (const age of ['under18']) {
        await page.getByLabel('اختر فئتك العمرية').selectOption(age);
        await expect(page.getByRole('button', { name: 'أوافق على المساهمة' })).toHaveCount(0);
        await expect(page.getByText('Meta', { exact: false })).toHaveCount(0);
        await expect(page.getByText('يمكنك استخدام مصحف المراجعة والاستفادة من جميع خدماته دون الموافقة على المساهمة.')).toBeVisible();
    }
    await page.getByRole('button', { name: 'المتابعة إلى المصحف' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(false);
});

test('failed adult choice can be retried explicitly', async ({ page }) => {
    await open(page);
    await page.getByLabel('اختر فئتك العمرية').selectOption('adult');
    await page.evaluate(() => { (window as any).failNext = true; });
    await page.getByRole('button', { name: 'أوافق على المساهمة' }).click();
    await expect(page.getByRole('alert')).toHaveText('تعذر حفظ اختيارك حاليًا. يُرجى المحاولة مرة أخرى.');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(false);
    await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(true);
});
test('adult consent is explicit and can be withdrawn through settings event', async ({ page }) => {
    await open(page); await page.getByLabel('اختر فئتك العمرية').selectOption('adult');
    await expect(page.getByText('ساهم في تطوير مصحف المراجعة', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('mushaf_measurement_choice_v1'))).toBeNull();
    await page.getByRole('button', { name: 'أوافق على المساهمة' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(true);
    await expect.poll(() => page.evaluate(() => (window as any).nativeChoices.at(-1).allowed)).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event('open-measurement-choice')));
    await page.getByRole('button', { name: 'المتابعة دون موافقة' }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mushaf_measurement_choice_v1')!).allowed)).toBe(false);
    await expect.poll(() => page.evaluate(() => (window as any).nativeChoices.at(-1).allowed)).toBe(false);
    await page.evaluate(() => window.dispatchEvent(new Event('open-measurement-choice')));
    await expect(page.getByText('عند الموافقة مجددًا، قد تُرسل إحصاءات سابقة', { exact: false })).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as any).nativeChoices.at(-1).allowed)).toBe(false);
});


test('adult disclosure scrolls while both actions remain visible on small screens',async({page})=>{
 const file=fs.readdirSync('dist/assets').find(n=>n.startsWith('index-')&&n.endsWith('.css'))!;
 const css=fs.readFileSync('dist/assets/'+file,'utf8');
 for(const viewport of [{width:360,height:640},{width:832,height:384}]){
  await page.setViewportSize(viewport);await open(page,'en');await page.addStyleTag({content:css});
  await page.locator('#measurement-age').selectOption('adult');
  const scroll=page.locator('[data-age-scroll]'),actions=page.locator('[data-age-actions]');
  await expect(page.getByRole('button',{name:'I agree to contribute',exact:true})).toBeInViewport();
  await expect(page.getByRole('button',{name:'Continue without agreeing',exact:true})).toBeInViewport();
  const before=await actions.boundingBox();
  expect(await scroll.evaluate(e=>getComputedStyle(e).overflowY)).toBe('auto');
  expect(await scroll.evaluate(e=>e.scrollHeight>e.clientHeight)).toBe(true);
  const box=await scroll.boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.wheel(0,1200);
  await expect.poll(()=>scroll.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);
  const after=await actions.boundingBox();expect(Math.abs(after!.y-before!.y)).toBeLessThan(1);
  await expect(page.getByRole('button',{name:'I agree to contribute',exact:true})).toBeInViewport();
  await expect(page.getByRole('button',{name:'Continue without agreeing',exact:true})).toBeInViewport();
 }
});
