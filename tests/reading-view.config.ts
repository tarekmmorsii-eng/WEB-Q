import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './e2e', testMatch: ['reading-view.spec.ts', 'reading-ui-scale.spec.ts', 'word-review-library.spec.ts', 'word-review-i18n.spec.ts'], workers: 1, reporter: 'line',
    use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, screenshot: 'only-on-failure', serviceWorkers: 'block' },
    webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5180', url: 'http://127.0.0.1:5180', reuseExistingServer: true },
});
