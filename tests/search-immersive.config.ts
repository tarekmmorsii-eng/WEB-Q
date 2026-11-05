import { defineConfig } from '@playwright/test';

// The component harness is bundled in memory; no app server/data download.
export default defineConfig({
    testDir: './e2e',
    testMatch: 'search-immersive.spec.ts',
    workers: 1,
    reporter: 'line',
    use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
});
