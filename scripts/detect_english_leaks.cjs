/*
 * English Leak Detector (Advanced)
 * --------------------------------
 * Detects values that contain ENGLISH words inside non-English languages.
 * This catches half-translated / partially-translated strings that the
 * exact-match audit script misses.
 *
 * Detection logic:
 *   1. For each non-English language, extract Latin-script words (a-z, length >= 3).
 *   2. Remove a whitelist of Islamic/technical terms (Quran, Juz, URL, ...).
 *   3. If >= 3 suspicious English words remain, flag the value as a LEAK.
 *
 * Output: prints a detailed report to console + writes ENGLISH_LEAKS_REPORT.md
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'assets', 'i18n');
const REPORT_PATH = path.join(__dirname, '..', 'ENGLISH_LEAKS_REPORT.md');

const LANGS = [
    'ar','id','ms','ur','bn','tr','fa','ha','fr','es','de','ru','sw','zh','ko','ja',
    'bs','sq','uz','kk','ku','vi','tl','hi','ta','si','am','yo','om','rw'
];

// Keys to skip entirely (proper names, technical markers, brands)
const KEY_BLACKLIST = /^(dir|amLabel|pmLabel|facebook|youtube|surahNames|reciters\.|shareAppText|shareAppTitle|notif_surah)/;

// Latin words allowed in any language (Islamic terms, tech terms, units)
const LATIN_WHITELIST = new Set([
    'quran','mushaf','juz','hizb','rub','tafsir','mutashabihat','surah','ayah','ayat','sura','surahe',
    'html','url','http','https','www','com','org','net','app','apps','beta','csv','api','json','css',
    'am','pm','youtube','facebook','google','apple','android','ios','apk','mb','kb','gb','rgb','hex',
    'offline','online','pdf','jpg','png','svg','mp3','mp4','wav','id','ui','ux','ok','yes','error',
    'index','page','start','end','line','size','font','color','theme','dark','light','mode','default',
    'install','download','update','version','cache','data','file','files','settings','menu','button',
    'tab','modal','popup','toast','alert','notification','alarm','timer','reminder','search','filter',
    'sort','group','edit','delete','add','remove','save','cancel','close','open','next','previous',
    'first','last','home','back','forward','play','pause','stop','record','volume','mute','sound',
    'audio','video','image','photo','picture','camera','microphone','speaker','headphone','screen',
    'display','monitor','keyboard','mouse','touch','tap','click','double','swipe','scroll','zoom',
    'pin','unpin','lock','unlock','expand','collapse','show','hide','enable','disable','allow','deny',
    'accept','reject','agree','disagree','subscribe','unsubscribe','follow','share','report','block',
    'archive','restore','trash','spam','inbox','sent','drafts','starred','important','labels','folders',
    'categories','filters','rules','forwarding','auto','reply','vacation','signature','preferences',
    'accounts','privacy','security','password','twostep','verification','recovery','backup','restore',
    'devices','sessions','activity','logs','history','cookies','storage','memory','cpu','ram','disk',
    'network','internet','wifi','bluetooth','airplane','do','not','disturb','silent','vibrate','ring',
    'brightness','night','wallpaper','lock','apps','widgets','sounds','haptics','battery','power',
    'charging','documents','downloads','pictures','videos','music','podcasts','books','contacts',
    'calendar','clock','weather','maps','notes','reminders','health','fitness','wallet','stocks',
    'calculator','compass','voice','memos','translate','scanner','measure','find','tag','home','keychain',
    'passwords','content','restrictions','allowed','always','ask','never','limit','communications',
    'media','music','tv','game','center','siri','face','touch','pay','cash','card','family','sharing',
    'location','services','system','customize','control','focus','general','about','software','airdrop',
    'airplay','handoff','continuity','universal','clipboard','iphone','carrier','vpn','personal','hotspot',
    'charger','low','health','charge','level','status','percentage','indicator','warning','saver',
    'optimization','usage','statistics','screen','time','battery','mode','icon','alert','notification',
    'app','store','account','profile','avatar','logo','image','picture','photo','video','audio','sound',
    'music','song','track','album','artist','playlist','radio','podcast','episode','season','series',
    'movie','film','show','play','pause','stop','next','previous','shuffle','repeat','volume','mute',
    'subtitle','caption','language','audio','quality','speed','timer','sleep','alarm','stopwatch',
    'clock','calendar','date','day','week','month','year','time','hour','minute','second','today',
    'yesterday','tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday',
    'january','february','march','april','may','june','july','august','september','october','november',
    'december','spring','summer','autumn','winter','north','south','east','west','left','right','top',
    'bottom','center','middle','up','down','in','out','on','off','true','false','enable','disable',
    'allow','deny','grant','revoke','accept','reject','agree','disagree','yes','no','ok','cancel',
    'done','apply','save','edit','delete','remove','add','create','new','old','open','close','start',
    'end','pause','resume','restart','reset','refresh','reload','update','upgrade','install','uninstall',
    'download','upload','sync','backup','restore','import','export','share','print','scan','copy','cut',
    'paste','undo','redo','find','replace','select','all','none','invert','filter','sort','group','hide',
    'show','lock','unlock','pin','unpin','expand','collapse','zoom','in','out','fit','fill','stretch',
    'tile','cascade','arrange','align','distribute','rotate','flip','mirror','scale','resize','move',
    'drag','drop','click','double','right','left','middle','scroll','swipe','tap','hold','press',
    'release','type','enter','return','escape','tab','space','shift','ctrl','alt','cmd','win','fn',
    'caps','num','pause','break','insert','delete','home','end','page','up','down','arrow','key',
    'keys','button','buttons','menu','toolbar','ribbon','sidebar','panel','window','dialog','modal',
    'popup','tooltip','notification','alert','message','error','warning','info','success','status',
    'progress','bar','spinner','loader','icon','logo','image','avatar','profile','account','settings',
    'preferences','options','properties','tools','view','format','layout','references','review','help',
    'about','feedback','share','export','import','login','logout','signin','signup','register','forgot',
    'verify','confirm','next','back','previous','first','last','home','end','top','bottom','left',
    'right','center','middle','up','down','in','out','on','off','yes','no','true','false','enable',
    'disable','allow','deny','accept','reject','agree','disagree','subscribe','unsubscribe','follow',
    'like','comment','reply','report','block','mute','hide','show','pin','archive','delete','restore',
    'trash','spam','inbox','sent','drafts','starred','important','labels','folders','categories',
    'filters','rules','forwarding','auto','reply','vacation','signature','preferences','accounts',
    'privacy','security','password','verification','recovery','backup','restore','devices','sessions',
    'activity','logs','history','cache','cookies','data','storage','memory','cpu','ram','disk',
    'network','internet','wifi','bluetooth','airplane','mode','disturb','silent','vibrate','ring',
    'volume','brightness','night','light','dark','theme','font','size','color','background',
    'wallpaper','lock','screen','apps','widgets','notifications','sounds','haptics','battery','power',
    'charging','documents','downloads','pictures','videos','music','audio','podcasts','books',
    'contacts','calendar','clock','alarm','timer','stopwatch','weather','maps','camera','photos',
    'notes','reminders','health','fitness','wallet','stocks','calculator','compass','voice','memos',
    'translate','scanner','measure','files','find','tag','home','keychain','passwords','accounts',
    'privacy','security','screen','time','content','restrictions','allowed','apps','always','ask',
    'never','limit','communications','media','apple','music','tv','podcasts','books','app','store',
    'game','center','wallet','siri','face','id','touch','pay','cash','card','family','sharing',
    'location','services','system','customize','control','center','notifications','focus','do','not',
    'disturb','siri','search','screen','time','general','about','software','update','airdrop',
    'airplay','handoff','continuity','universal','clipboard','iphone','storage','battery','privacy',
    'security','accessibility','display','text','size','wallpaper','home','screen','sounds',
    'haptics','face','id','passcode','emergency','sos','exposure','notifications','background','app',
    'refresh','mobile','data','carrier','vpn','personal','hotspot','battery','charger','low','power',
    'mode','battery','health','charge','level','status','percentage','icon','indicator','warning',
    'alert','notification','battery','saver','optimization','usage','history','statistics','apps',
    'screen','time','battery','charger','low','power','mode','battery','health','charge','level',
    'status','percentage','icon','indicator','warning','alert','notification','battery','saver',
    'optimization','usage','history','statistics','apps','screen','time'
]);

function loadLang(lang) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function detectLeaksInValue(value) {
    if (typeof value !== 'string') return [];
    // Remove HTML tags and URLs before scanning
    const cleaned = value.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, ' ');
    const words = (cleaned.match(/[A-Za-z]{3,}/g) || []).map(w => w.toLowerCase());
    const suspicious = words.filter(w => !LATIN_WHITELIST.has(w));
    return suspicious;
}

function main() {
    const en = loadLang('en');
    const report = {};
    let totalCount = 0;

    for (const lang of LANGS) {
        const obj = loadLang(lang);
        const leaks = [];
        for (const [key, value] of Object.entries(obj)) {
            if (KEY_BLACKLIST.test(key)) continue;
            const suspicious = detectLeaksInValue(value);
            if (suspicious.length >= 3) {
                leaks.push({ key, value: String(value).slice(0, 120), suspicious: suspicious.slice(0, 8), en: String(en[key] || '').slice(0, 80) });
            }
        }
        if (leaks.length) {
            report[lang] = leaks;
            totalCount += leaks.length;
        }
    }

    // Print console summary
    console.log('\n===== ENGLISH LEAK DETECTION (Half-translated strings) =====\n');
    for (const lang of Object.keys(report)) {
        console.log(`${lang}: ${report[lang].length} suspicious value(s)`);
    }
    console.log(`\nTotal suspicious values: ${totalCount}`);

    // Write detailed Markdown report
    const lines = [];
    lines.push('# تقرير الكشف عن الكلمات الإنجليزية المتسربة (English Leak Report)');
    lines.push('');
    lines.push(`> إجمالي القيم المشتبهة: **${totalCount}**`);
    lines.push('> هذه قيم تحتوي على نص إنجليزي داخل لغة أخرى (نصف مترجمة أو غير مترجمة).');
    lines.push('');
    for (const lang of Object.keys(report)) {
        lines.push(`## ${lang} (${report[lang].length})`);
        lines.push('');
        lines.push('| المفتاح | الكلمات الإنجليزية المتسربة | القيمة الحالية (مختصرة) |');
        lines.push('|---|---|---|');
        for (const item of report[lang]) {
            const sus = item.suspicious.join(', ').replace(/\|/g, '\\|');
            const val = item.value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
            lines.push(`| \`${item.key}\` | ${sus} | ${val} |`);
        }
        lines.push('');
    }

    fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
    console.log(`\nDetailed report: ${REPORT_PATH}`);
}

main();