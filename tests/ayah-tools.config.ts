import{defineConfig}from'@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'ayah-tools.spec.ts',workers:1,reporter:'line',timeout:60000,use:{browserName:'chromium',viewport:{width:390,height:844}},webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5180',url:'http://127.0.0.1:5180',reuseExistingServer:true}});
