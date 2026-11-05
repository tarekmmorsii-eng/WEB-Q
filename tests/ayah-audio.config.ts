import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:['ayah-audio.spec.ts','audio-edge-smoothing.spec.ts','buffered-verse-audio.spec.ts','verse-pitch.spec.ts'],workers:1,reporter:'line',use:{browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL||undefined}});

