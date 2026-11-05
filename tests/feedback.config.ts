import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'feedback.spec.ts',workers:1,reporter:'line',use:{browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL||undefined}});
