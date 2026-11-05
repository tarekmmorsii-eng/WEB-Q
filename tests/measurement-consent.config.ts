import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './e2e', testMatch: 'measurement-consent.spec.ts', workers: 1, reporter: 'line', use: { browserName: 'chromium', channel: 'chrome' } });
