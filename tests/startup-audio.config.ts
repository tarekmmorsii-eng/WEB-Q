import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'startup-audio.spec.ts',workers:1,reporter:'line',use:{browserName:'chromium'}});
