import {defineConfig}from'@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:['all-dialogs-design.spec.ts','word-review-library.spec.ts'],workers:1,reporter:'line',timeout:60000,use:{browserName:'chromium',viewport:{width:390,height:844}}});
