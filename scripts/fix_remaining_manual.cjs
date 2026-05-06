/**
 * Manual fix — 94 remaining untranslated keys across 8 languages
 */
const fs = require('fs');
const path = require('path');
const I18N = path.join(__dirname, '..', 'src', 'assets', 'i18n');

function load(f) { return JSON.parse(fs.readFileSync(path.join(I18N, f), 'utf-8')); }
function save(f, d) { fs.writeFileSync(path.join(I18N, f), JSON.stringify(d, null, 2), 'utf-8'); }

// MS (Malay) — 1 key
const ms = load('ms.json');
ms.exportHeaderAyah = 'Ayat Terakhir';
save('ms.json', ms);
console.log('✅ MS — 1 key fixed');

// OM (Oromo) — 3 keys
const om = load('om.json');
om.modeRange = 'Gabaabsa dhuunfaa';
om.shareApp = 'Qoodi App';
om.liveUpdate = 'Saffisa har\'aa';
save('om.json', om);
console.log('✅ OM — 3 keys fixed');

// SI (Sinhala) — 1 key
const si = load('si.json');
si.tourMutashabihatDescShort = 'එම ආයතය සමඟ මුතෂාබිහාත් බලන්න';
save('si.json', si);
console.log('✅ SI — 1 key fixed');

// TL (Tagalog) — 3 keys
const tl = load('tl.json');
tl.feedback = 'Puna';
tl.juzHizbRub = 'Juz / Hizb / Kapat';
tl.repeatMode = 'Ulitin ang Mode';
save('tl.json', tl);
console.log('✅ TL — 3 keys fixed');

// UZ (Uzbek) — 14 keys
const uz = load('uz.json');
uz.failedDownloadWords = 'Kechirasiz, sura so\'zlarini yuklab bo\'lmadi.';
uz.alreadyDownloadedLabel = 'Allaqachon yuklangan';
uz.appUpdateAvailableAlt = 'Ilova yangilanishi mavjud';
uz.appInstalledAlt = 'Ilova qurilmangizga o\'rnatilgan';
uz.startingInstallAlt = 'O\'rnatish boshlanmoqda...';
uz.clickToInstallLatestAlt = 'Eng so\'nggi xususiyatlar va tuzatishlarni o\'rnating';
uz.weWillUpdateCodeAlt = 'Biz yangi kodlarni bu yerda yangilab boramiz';
uz.installFrameAlt = 'Tezkor kirish uchun ilova doirasini o\'rnating';
uz.mushafUpdatedSaved = 'Mushaf to\'liq yangilandi va saqlandi';
uz.browseOfflineNowAlt = 'Endi oflayn ko\'rib chiqishingiz mumkin';
uz.confirmDeleteTitle = 'Tasdiqlash';
uz.internetRequiredDownload = '(Yuklab olish uchun internet kerak)';
uz.stop = 'To\'xtatish';
uz.repeatMode = 'Takrorlash rejimi';
save('uz.json', uz);
console.log('✅ UZ — 14 keys fixed');

// VI (Vietnamese) — 24 keys
const vi = load('vi.json');
vi.tourMemorizationPwr = 'Đánh giá mức độ ghi nhớ:';
vi.tourBookmarkDesc = 'Thêm dấu trang cho câu thơ';
vi.tourMutashabihatDescShort = 'Xem Mutashabihat với câu thơ';
vi.confirmDeleteCacheMsg = 'Bạn có chắc chắn muốn xóa tất cả âm thanh đã tải xuống không? Bạn sẽ cần internet để tải lại.';
vi.yesClearDownloads = 'Có, xóa các bản tải xuống';
vi.noConnection = 'Không có kết nối internet';
vi.noConnectionRetry = 'Không có kết nối internet. Vui lòng kết nối và thử lại.';
vi.downloadFailed = 'Tải xuống thất bại — Kiểm tra kết nối internet';
vi.downloadFailedServer = 'Xin lỗi, tải xuống thất bại. Một số tệp cho người đọc này không có trên máy chủ.';
vi.audioCacheCleared = 'Đã xóa bộ nhớ đệm âm thanh thành công';
vi.failedDownloadWords = 'Xin lỗi, không thể tải xuống các từ surah.';
vi.alreadyDownloadedLabel = 'Đã tải xuống';
vi.appUpdateAvailableAlt = 'Có bản cập nhật ứng dụng';
vi.appInstalledAlt = 'Ứng dụng đã được cài đặt trên thiết bị của bạn';
vi.startingInstallAlt = 'Đang bắt đầu cài đặt...';
vi.clickToInstallLatestAlt = 'Nhấp để cài đặt các tính năng và bản sửa lỗi mới nhất';
vi.weWillUpdateCodeAlt = 'Chúng tôi sẽ cập nhật bất kỳ mã mới nào cho bạn tại đây';
vi.installFrameAlt = 'Cài đặt khung ứng dụng để truy cập nhanh';
vi.mushafUpdatedSaved = 'Mushaf đã được cập nhật và lưu hoàn toàn';
vi.browseOfflineNowAlt = 'Bạn có thể duyệt và xem lại ngoại tuyến ngay bây giờ';
vi.confirmDeleteTitle = 'Xác nhận';
vi.internetRequiredDownload = '(Cần internet để tải xuống)';
vi.stop = 'Dừng';
vi.repeatMode = 'Chế độ lặp lại';
save('vi.json', vi);
console.log('✅ VI — 24 keys fixed');

// YO (Yoruba) — 24 keys
const yo = load('yo.json');
yo.tourMemorizationPwr = 'Oye ipo iranti:';
yo.tourBookmarkDesc = 'Fi ami-eye si ẹsẹ naa';
yo.tourMutashabihatDescShort = 'Wo Mutashabihat pẹlu ẹsẹ naa';
yo.confirmDeleteCacheMsg = 'Ṣe o da ẹ lọ́jú pe o fẹ pa gbogbo ahọn ti o ti gbasilẹ rẹ? O nilo intanẹẹti lati gbasilẹ wọn lẹẹkansi.';
yo.yesClearDownloads = 'Bẹẹni, pa awọn igbasilẹ';
yo.noConnection = 'Ko si asopọ intanẹẹti';
yo.noConnectionRetry = 'Ko si asopọ intanẹẹti. Jọwọ soopọ ki o si gbiyanju lẹẹkansi.';
yo.downloadFailed = 'Igbasilẹ kuna — Ṣayẹwo asopọ intanẹẹti rẹ';
yo.downloadFailedServer = 'Ma binu, igbasilẹ kuna. Awọn faili kan fun oluka yi ko si lori server naa.';
yo.audioCacheCleared = 'A ti pa ahọn ohun kọọkan pẹ̀rẹ̀wọ';
yo.failedDownloadWords = 'Ma binu, kuna lati gbasilẹ awọn ọrọ surah.';
yo.alreadyDownloadedLabel = 'A ti gbasilẹ tẹlẹ';
yo.appUpdateAvailableAlt = 'Imudojuiwọn app ti wa';
yo.appInstalledAlt = 'App ti fi sori ẹrọ rẹ';
yo.startingInstallAlt = 'N bẹrẹ fifi sori ẹrọ...';
yo.clickToInstallLatestAlt = 'Tẹ lati fi awọn ẹya tuntun ati atunṣe sori ẹrọ';
yo.weWillUpdateCodeAlt = 'A yoo ṣe imudojuiwọn koodu tuntun fun ọ nibi';
yo.installFrameAlt = 'Fi frame app sori ẹrọ fun iraye tẹtẹ';
yo.mushafUpdatedSaved = 'Mushaf ti ni imudojuiwọn pẹkipẹki ati pipamọ';
yo.browseOfflineNowAlt = 'O le wo ati tunwo laisi intanẹẹti bayi';
yo.confirmDeleteTitle = 'Ẹri';
yo.internetRequiredDownload = '(Intanẹẹti nilo fun igbasilẹ)';
yo.stop = 'Duro';
yo.repeatMode = 'Ipo itẹle';
save('yo.json', yo);
console.log('✅ YO — 24 keys fixed');

// ZH (Chinese) — 24 keys
const zh = load('zh.json');
zh.tourMemorizationPwr = '记忆强度评分：';
zh.tourBookmarkDesc = '为经文添加书签';
zh.tourMutashabihatDescShort = '查看该经文的相似经文';
zh.confirmDeleteCacheMsg = '您确定要清除所有已下载的音频吗？您需要网络才能重新下载。';
zh.yesClearDownloads = '是的，清除下载';
zh.noConnection = '没有网络连接';
zh.noConnectionRetry = '没有网络连接。请连接后重试。';
zh.downloadFailed = '下载失败 — 请检查网络连接';
zh.downloadFailedServer = '抱歉，下载失败。此诵读者的一些文件在服务器上不可用。';
zh.audioCacheCleared = '音频缓存已成功清除';
zh.failedDownloadWords = '抱歉，下载古兰经词语失败。';
zh.alreadyDownloadedLabel = '已下载';
zh.appUpdateAvailableAlt = '应用更新可用';
zh.appInstalledAlt = '应用已安装在您的设备上';
zh.startingInstallAlt = '正在开始安装...';
zh.clickToInstallLatestAlt = '点击安装最新功能和修复';
zh.weWillUpdateCodeAlt = '我们将在此为您更新任何新代码';
zh.installFrameAlt = '安装应用框架以快速访问';
zh.mushafUpdatedSaved = '穆沙夫已完全更新并保存';
zh.browseOfflineNowAlt = '您现在可以离线浏览和复习';
zh.confirmDeleteTitle = '确认';
zh.internetRequiredDownload = '（下载需要网络）';
zh.stop = '停止';
zh.repeatMode = '重复模式';
save('zh.json', zh);
console.log('✅ ZH — 24 keys fixed');

console.log('\n🎉 Total: 94 keys fixed across 8 languages!');