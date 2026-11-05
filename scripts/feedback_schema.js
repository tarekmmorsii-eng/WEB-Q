// Shared by the web receiver and daily retention. Legacy stays readable during rollout.
const FEEDBACK_V19_HEADERS = ['وقت الاستلام','الملاحظة','إصدار أندرويد','الشركة','موديل الهاتف','الصورة','سياق الملاحظة','مصدر الإرسال','بيانات تقنية','رقم الملاحظة','معرّف الصورة'];
function feedbackSchema(sheet) {
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    if (headers.length === 11 && headers.every((v,i) => v === FEEDBACK_V19_HEADERS[i]))
        return {version:2,width:11,date:0,message:1,image:5,id:9,file:10};
    const old = ['Date','Type','SubType','SubTypeLabel','Message','Context',null,'Info','Android Version','Phone Model','Screenshot URL','Feedback ID','Screenshot File ID'];
    if (headers.length === 13 && old.every((v,i) => v === null ? ['Device','Device Info'].includes(headers[i]) : headers[i] === v))
        return {version:1,width:13,date:0,message:4,image:10,id:11,file:12};
    throw new Error('Unexpected feedback schema; no data written');
}
function feedbackRow(schema, data, receivedAt, feedbackId, uploadedFile) {
    const device = data.deviceInfo || {};
    const image = uploadedFile ? uploadedFile.getUrl() : '';
    const fileId = uploadedFile ? uploadedFile.getId() : '';
    if (schema.version === 2) return [receivedAt,plainCell(data.message,10000),plainCell(device.androidVersion,30),plainCell(device.phoneBrand,120),plainCell(device.phoneModel,120),image,plainCell(JSON.stringify(data.context || null)),plainCell(data.type,80),plainCell(JSON.stringify(device)),feedbackId,fileId];
    return [receivedAt,plainCell(data.type,80),plainCell(data.subType,150),plainCell(data.subTypeLabel,250),plainCell(data.message,10000),plainCell(JSON.stringify(data.context || null)),plainCell(JSON.stringify(device)),'',plainCell(device.androidVersion,30),plainCell([device.phoneBrand,device.phoneModel].filter(Boolean).join(' / '),250),image,feedbackId,fileId];
}
function appendFeedbackRow(sheet, row) {
    const next = sheet.getLastRow() + 1;
    if (next > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), next - sheet.getMaxRows());
    sheet.getRange(next,1,1,row.length).setValues([row]);
    // Formatting must not turn a successful write into a failed submission.
    try {
        sheet.getRange(next,1,1,row.length).setFontWeight('normal').setBackground('#ffffff').setFontColor('#172b2a').setWrap(true).setVerticalAlignment('top');
        sheet.getRange(next,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    } catch (_) { console.warn('Feedback saved; row formatting needs review.'); }
    return next;
}
function feedbackRetentionRows(sheet) {
    const schema = feedbackSchema(sheet);
    if (sheet.getLastRow() < 2) return [];
    return sheet.getRange(2,1,sheet.getLastRow()-1,schema.width).getValues().map(function(v) {
        const linked = String(v[schema.image] || '').match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)(?:\/|$)/);
        return {id:String(v[schema.id] || ''),receivedAt:v[schema.date] instanceof Date ? v[schema.date].getTime() : NaN,
            hasScreenshot:!!v[schema.image],fileId:String(v[schema.file] || (linked && linked[1]) || ''),
            linkMismatch:!!v[schema.image] && (!linked || linked[1] !== v[schema.file])};
    });
}
