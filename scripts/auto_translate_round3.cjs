/**
 * Round 3 — MyMemory API + استثناءات كاملة
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const LANG_MAP = { am:'am',ar:'ar',bn:'bn',bs:'bs',de:'de',en:'en',es:'es',fa:'fa',fr:'fr',ha:'ha',hi:'hi',id:'id',ja:'ja',kk:'kk',ko:'ko',ku:'ku',ms:'ms',om:'om',ru:'ru',rw:'rw',si:'si',sq:'sq',sw:'sw',ta:'ta',tl:'tl',tr:'tr',ur:'ur',uz:'uz',vi:'vi',yo:'yo',zh:'zh-CN' };

// مفاتيح مستثناة تماماً من الترجمة
const SKIP_KEYS = new Set([
  'dir','surah','basmallah','juz','hizb','rub','ayahText',
  'youtube','facebook','surahNames','reciters',
  'go','goAction','add','apply','amLabel','pmLabel',
  // مفاتيح قيمتها صالحة بكل اللغات
  'juzType','hizbType','rubType','exportHeaderJuz','notificationJuzHizb',
  'mushafAlMurajaa','index','indexTitle','guideIndex','startPagePlaceholder',
  'tourMedium','error','similarBadge','countryIndonesia','countrySaudi','countryJordan',
  'countryMalaysia','countryTurkey','countryEgypt','countryUAE','countryKuwait','countryMorocco',
  'notifications','page','exportHeaderPage','platformAnalytics',
  'playAyah','surahPrefix','rateSurah','rateAyah','toAyah',
  'mutashabihatIndex','addMutashabihat','matchedCount','searchSurah','guideQuranUI',
  'tourAyahColorsTitle','tourMutashabihatTitle','tourLastWordTitle','tourAyahNumberTitle',
  'bookmark','darkMode','lightMode','hideRandomAyahs','hideRandomWords',
  'toggleLastWord','stopSignsLabel','coolWhite','softCream','pureBlack','warmDark','warmBeige',
  'pageBookmarks','verseBookmarks','verseBookmarksSection','notificationManagerTitle',
  'firstRub','secondRub','thirdRub','fourthRub','rateMemorization','saveAyah',
  'lineSpacingLabel','fullscreen','moreSettings','stopAlarm','memorizationStatsTitle',
  'verseCalculatorTitle','startPoint','alarmMode','testAlarm','presetIslamic','tinyUpdate',
  'pageFlipSound','settings','settingsTitle','languages','textBrightness','notRated','hideRatedVerses',
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday',
  'tourAssessment','tourBookmark','tourViewMutashabihat',
  'tourAyahColorsDescText','tourMutashabihatDescText','tourHideAyahsDescText','tourAyahNumberDescText',
]);

function skip(key) {
  if (SKIP_KEYS.has(key)) return true;
  if (key.startsWith('surahNames.') || key.startsWith('reciters.')) return true;
  return false;
}

const GLOBAL_WORDS = new Set(['YouTube','Facebook','Telegram','WhatsApp','Instagram','Google','Apple','Android','iOS','OK','ok','MP3','PDF','URL']);
function isGlobal(v) { return typeof v==='string' && (GLOBAL_WORDS.has(v.trim()) || /^[\d\s.,:;\-+/()%#°]+$/.test(v.trim())); }

function flat(obj,p='') {
  const r={};
  for (const k of Object.keys(obj)) {
    const fk=p?p+'.'+k:k; const v=obj[k];
    if (v&&typeof v==='object'&&!Array.isArray(v)) Object.assign(r,flat(v,fk));
    else r[fk]=v;
  }
  return r;
}
function unflat(f) {
  const r={};
  for (const [k,v] of Object.entries(f)) {
    const p=k.split('.'); let c=r;
    for (let i=0;i<p.length-1;i++) { if(!(p[i] in c)) c[p[i]]={}; c=c[p[i]]; }
    c[p[p.length-1]]=v;
  }
  return r;
}
const delay = ms => new Promise(r=>setTimeout(r,ms));

function myMemoryTranslate(text, lang) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
    https.get(url, {timeout:15000}, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end', () => {
        try {
          const j=JSON.parse(d);
          if (j.responseStatus===200 && j.responseData && j.responseData.translatedText) {
            let t=j.responseData.translatedText;
            if (t.toUpperCase().includes('MYMEMORY WARNING')) return reject(new Error('Warning'));
            resolve(t);
          } else reject(new Error('Bad response'));
        } catch(e) { reject(e); }
      });
    }).on('error',reject).on('timeout',function(){this.destroy();reject(new Error('Timeout'));});
  });
}

async function translate(text, lang, retries=3) {
  for (let i=0;i<retries;i++) {
    try {
      const r = await myMemoryTranslate(text,lang);
      if (r && r.trim() && r.trim().toLowerCase() !== text.trim().toLowerCase()) return r;
      return null;
    } catch(e) {
      if (i<retries-1) { console.log(`    ⏳ retry ${i+1}...`); await delay(3000*(i+1)); }
    }
  }
  return null;
}

async function main() {
  console.log('\n🔄 Round 3 — MyMemory API\n');
  const refData = JSON.parse(fs.readFileSync(path.join(I18N_DIR,'en.json'),'utf-8'));
  const refFlat = flat(refData);
  console.log(`📋 ${Object.keys(refFlat).length} keys\n`);
  
  const files = fs.readdirSync(I18N_DIR).filter(f=>f.endsWith('.json')&&f!=='en.json').sort();
  let total=0, fails=0;
  
  for (const file of files) {
    const lc=file.replace('.json','');
    const tl=LANG_MAP[lc]||lc;
    const fp=path.join(I18N_DIR,file);
    const data=JSON.parse(fs.readFileSync(fp,'utf-8'));
    const lf=flat(data);
    const todo=[];
    
    for (const [k,rv] of Object.entries(refFlat)) {
      if (Array.isArray(rv)||skip(k)) continue;
      const v=lf[k];
      if (v===undefined||v===null||v==='') continue;
      if (typeof v==='string'&&typeof rv==='string'&&v===rv&&!isGlobal(rv)) todo.push({k,rv});
    }
    
    if (!todo.length) { console.log(`✅ ${lc.toUpperCase()}`); continue; }
    console.log(`\n📝 ${lc.toUpperCase()} → ${tl} | ${todo.length} keys`);
    
    let ok=0,fl=0;
    for (let i=0;i<todo.length;i++) {
      const {k,rv}=todo[i];
      const t=await translate(rv,tl);
      if (t) { lf[k]=t; ok++; console.log(`  ✓ [${i+1}/${todo.length}] ${k}`); }
      else { fl++; console.log(`  ✗ [${i+1}/${todo.length}] ${k}`); }
      if (i<todo.length-1) await delay(1500);
    }
    
    const rebuilt=unflat(lf);
    const ordered={};
    for (const k of Object.keys(refData)) if(rebuilt[k]!==undefined) ordered[k]=rebuilt[k];
    for (const k of Object.keys(rebuilt)) if(ordered[k]===undefined) ordered[k]=rebuilt[k];
    fs.writeFileSync(fp,JSON.stringify(ordered,null,2),'utf-8');
    console.log(`💾 ${file} (${ok} ok, ${fl} fail)`);
    total+=ok; fails+=fl;
    await delay(3000);
  }
  console.log(`\n📊 ✅ ${total} | ❌ ${fails}`);
}
main().catch(e=>{console.error(e);process.exit(1);});