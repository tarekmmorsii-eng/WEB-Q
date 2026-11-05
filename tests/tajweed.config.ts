import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './e2e', testMatch: ['tajweed.spec.ts', 'juz-one-tajweed.spec.ts'], workers: 1, reporter: 'line', use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined } });
