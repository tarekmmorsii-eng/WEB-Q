import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './e2e', testMatch: 'interaction-performance.spec.ts', workers: 1,
    timeout: 120000, reporter: 'line',
    use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block' },
});
