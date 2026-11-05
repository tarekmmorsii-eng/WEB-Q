import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'ui-fixes.spec.ts',workers:1,reporter:'line',timeout:90000,
use:{browserName:'chromium',viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block',screenshot:'only-on-failure'}});
