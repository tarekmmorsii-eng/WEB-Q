const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {transformSync}=require('esbuild');

// Exercise the actual renderer's processing function without mounting 604 DOM
// pages. TypeScript is erased only; none of its data/layout logic is mocked.
function processor(file){
 const source=fs.readFileSync(file,'utf8');
 const start=source.indexOf('    const processPageData =');
 const end=source.indexOf('    // --- Synchronous cache update',start);
 assert.ok(start>=0&&end>start,'Renderer processing function must be present');
 const centered=source.match(/const CENTERED_SURAHS = new Set\(\[[^\]]+\]\);/)[0];
 const code=`const processedPageCache=new Map();${centered}\n${source.slice(start,end)}\nmodule.exports={run:processPageData,clear:()=>processedPageCache.clear()};`;
 const context={module:{exports:{}},window:{}};
 vm.runInNewContext(transformSync(code,{loader:'ts',format:'cjs'}).code,context);
 return context.module.exports;
}
const renderer=processor('components/QPCV2PageRenderer.tsx');
const beforeFile='artifacts/qpc-renderer-before-heading-fix.txt';
const before=fs.existsSync(beforeFile)?processor(beforeFile):null;
const pages=Object.fromEntries(Array.from({length:604},(_,i)=>[i+1,JSON.parse(fs.readFileSync(`public/data/v2/pages/${i+1}.json`,'utf8'))]));
const rawRows=page=>Object.entries(pages[page].lines).sort((a,b)=>Number(a[0])-Number(b[0]));
const headings=result=>result.lines.filter(l=>l.lineType!=='ayah').map(l=>[l.lineNumber,l.lineType,l.surahNumber]);
const plain=value=>JSON.parse(JSON.stringify(value));
const run=(p,cache)=>{renderer.clear();return renderer.run(pages[p],p,cache,false,'siraj')};

test('bundled 604 pages contain exactly one heading per surah and all standalone basmallahs',()=>{
 const headers=[],basmallahs=[];let lastSurah=0;
 for(let p=1;p<=604;p++)for(const[line,words]of rawRows(p)){
  assert.equal(new Set(words.map(w=>w.line_type)).size,1,`Mixed row types on ${p}:${line}`);
  if(words[0].line_type==='surah_name'){lastSurah=Number(words[0].surah_number);headers.push(lastSurah)}
  if(words[0].line_type==='basmallah')basmallahs.push(lastSurah);
 }
 assert.deepEqual(headers,Array.from({length:114},(_,i)=>i+1));
 assert.deepEqual(basmallahs,Array.from({length:113},(_,i)=>i+2).filter(s=>s!==9));
});

test('every rendered heading/basmallah stays on its recorded row for all 604 cold pages',()=>{
 let headers=0,basmallahs=0,ayahTokens=0;
 for(let p=1;p<=604;p++){
  const result=run(p);
  const expected=rawRows(p).filter(([,ws])=>ws[0].line_type!=='ayah').map(([line,ws])=>[Number(line),ws[0].line_type,Number(ws[0].surah_number)]);
  assert.deepEqual(plain(headings(result)),expected,`Ornaments changed on page ${p}`);
  headers+=result.lines.filter(l=>l.lineType==='surah_name').length;
  basmallahs+=result.lines.filter(l=>l.lineType==='basmallah').length;
  const expectedWords=rawRows(p).filter(([,ws])=>ws[0].line_type==='ayah').flatMap(([,ws])=>ws.map(w=>[w.id,w.code_v2]));
  const actual=result.lines.filter(l=>l.lineType==='ayah').flatMap(l=>l.words.map(w=>[w.id,w.text]));
  assert.deepEqual(plain(actual),expectedWords,`Quran words changed on page ${p}`);
  ayahTokens+=actual.length;
  assert.deepEqual(plain(headings(run(p,pages))),expected,`Warm-cache ornaments changed on page ${p}`);
 }
 assert.equal(headers,114);assert.equal(basmallahs,112);assert.equal(ayahTokens,83668);
 fs.writeFileSync('artifacts/qpc-heading-audit-after.json',JSON.stringify({pages:604,headers,standaloneBasmallahs:basmallahs,ayahTokens,wordsPreserved:true,coldAndWarmHeadingsMatch:true},null,2));
});

test('page 76 owns the Nisa frame; page 77 contains one basmallah and no extra frame',()=>{
 assert.deepEqual(plain(headings(run(76))),[[15,'surah_name',4]]);
 assert.deepEqual(plain(headings(run(77))),[[1,'basmallah',0]]);
});

test('cached, direct and reverse-order loads cannot reintroduce an extra heading',()=>{
 for(const order of [[77,76,77],[585,584,585],[208,207,208]]){
  renderer.clear();const cache={};
  for(const p of order){
   const result=renderer.run(pages[p],p,cache,false,'siraj');
   const expected=rawRows(p).filter(([,ws])=>ws[0].line_type!=='ayah').map(([line,ws])=>[Number(line),ws[0].line_type,Number(ws[0].surah_number)]);
   assert.deepEqual(plain(headings(result)),expected,`Navigation order changed page ${p}`);
   cache[p]=pages[p];
  }
 }
});

test('all correctly rendered warm-page layouts remain identical to the pre-fix renderer',{skip:!before},()=>{
 for(let p=1;p<=604;p++){
  before.clear();const original=before.run(pages[p],p,pages,false,'siraj');
  assert.deepEqual(plain(run(p,pages)),plain(original),`Existing correct layout changed on ${p}`);
 }
});

test('full audit reproduces exactly the 18 cache-dependent faults before the fix',{skip:!before},()=>{
 const affected=[];
 for(let p=1;p<=604;p++){
  before.clear();const old=before.run(pages[p],p,undefined,false,'siraj');
  if(JSON.stringify(headings(old))!==JSON.stringify(headings(run(p))))affected.push(p);
 }
 assert.deepEqual(affected,[77,208,332,342,350,367,377,415,418,446,453,499,507,526,549,556,558,585]);
});
