// Add alongside the feedback receiver and the retention engine in Apps Script.
// Requires advanced Drive v3 and Gmail v1 services. No automatic activation.
const RETENTION_OWNER = 'tarek.m.morsii@gmail.com';
const RETENTION_SHEET_ID = '1q2cG8EgyBGBFs57n41cQG4onm5oAeG57ppeH8TKKWxc';

function initializeFeedbackRetentionColumns() {
    const lock=LockService.getScriptLock(); lock.waitLock(10000);
    try {
        if(Session.getEffectiveUser().getEmail().toLowerCase()!==RETENTION_OWNER)throw new Error('Wrong account');
        const sheet=SpreadsheetApp.openById(RETENTION_SHEET_ID).getSheetByName(SHEET_NAME);
        const expected=['Feedback ID','Screenshot File ID'];
        const current=sheet.getRange(1,12,1,2).getValues()[0];
        current.forEach(function(value,i){if(value && value!==expected[i])throw new Error('Unexpected column header');});
        if(sheet.getLastRow()>1 && sheet.getRange(2,12,sheet.getLastRow()-1,2).getValues().some(function(row){return row.some(function(v){return v!=='';});}) && current.some(function(v){return !v;}))throw new Error('Unlabeled existing data');
        sheet.getRange(1,12,1,2).setValues([expected]);
        console.log('Reference headers ready; existing feedback unchanged.');
    } finally {lock.releaseLock();}
}

function feedbackRetentionAdapter() {
    const props = PropertiesService.getScriptProperties();
    let sheet;
    function rows() {
        return feedbackRetentionRows(sheet);
    }
    function key(id) { return 'FEEDBACK_RETENTION_' + id; }
    function saved(id) { return JSON.parse(props.getProperty(key(id)) || 'null'); }
    function persist(id, state) { props.setProperty(key(id), JSON.stringify(state)); }
    function verifyFile(record) {
        if (record.linkMismatch) throw new Error('Screenshot link mismatch');
        const folder = props.getProperty('FEEDBACK_SCREENSHOTS_FOLDER_ID');
        if (!folder) throw new Error('Screenshot folder missing');
        const file = Drive.Files.get(record.fileId, {fields:'id,name,parents,ownedByMe,mimeType'});
        if (!file.ownedByMe || file.name !== 'feedback-' + record.id + '.jpg' ||
            file.mimeType !== 'image/jpeg' || !(file.parents || []).includes(folder)) throw new Error('Unverified screenshot');
    }
    function verifyMessage(record, messageId) {
        const message = Gmail.Users.Messages.get('me', messageId, {format:'metadata',metadataHeaders:['Subject','From','To']});
        const headers = message.payload.headers || [];
        const field = name => (headers.find(h => h.name.toLowerCase() === name) || {}).value || '';
        const email = value => {const match = value.match(/<([^<>]+)>/);return (match ? match[1] : value).trim().toLowerCase();};
        if (field('subject') !== 'ملاحظة جديدة في تطبيق المصحف [feedback:' + record.id + ']' ||
            email(field('from')) !== RETENTION_OWNER || email(field('to')) !== RETENTION_OWNER ||
            !Number.isFinite(Number(message.internalDate)) ||
            Math.abs(Number(message.internalDate) - record.receivedAt) > 10 * 60 * 1000) throw new Error('Unverified email');
    }
    function resolve(record, previous) {
        if (record.linkMismatch) throw new Error('Screenshot link mismatch');
        if (previous && (previous.fileId !== record.fileId || previous.receivedAt !== record.receivedAt)) throw new Error('Changed record');
        if (record.fileId && !(previous && previous.fileDeleted)) verifyFile(record);
        let pageToken, ids = [];
        do {
            const page = Gmail.Users.Messages.list('me', {q:'in:anywhere subject:"' + record.id + '"',maxResults:100,pageToken:pageToken});
            ids = ids.concat((page.messages || []).map(m => m.id));
            pageToken = page.nextPageToken;
            if (ids.length > 100) throw new Error('Too many matching messages');
        } while (pageToken);
        ids = Array.from(new Set(ids.concat(previous ? previous.messageIds : [])));
        ids.forEach(messageId => verifyMessage(record, messageId));
        // A missing email may mean failed delivery or a query mismatch: require review.
        if (!ids.length && !previous) throw new Error('Email not found; review required');
        return {verified:true, fileId:record.fileId,receivedAt:record.receivedAt,
            fileDeleted:!!(previous && previous.fileDeleted),messageIds:ids};
    }
    return {
        withLock: async function (callback) {
            const lock = LockService.getScriptLock();lock.waitLock(10000);
            try {
                if (Session.getEffectiveUser().getEmail().toLowerCase() !== RETENTION_OWNER) throw new Error('Wrong account');
                sheet = SpreadsheetApp.openById(RETENTION_SHEET_ID).getSheetByName(SHEET_NAME);
                if (!sheet) throw new Error('Feedback sheet missing');
                return await callback();
            } finally {lock.releaseLock();}
        },
        readRecords: async function () {return rows();},
        inspect: function (record) {return resolve(record, saved(record.id));},
        prepareVerifiedResources: async function (record) {
            const state = resolve(record, saved(record.id));persist(record.id, state);return state;
        },
        deleteVerifiedFile: async function (record) {verifyFile(record);Drive.Files.remove(record.fileId);},
        markFileDeleted: async function (id) {const state=saved(id);state.fileDeleted=true;persist(id,state);},
        deleteVerifiedMessage: async function (record, messageId) {verifyMessage(record,messageId);Gmail.Users.Messages.remove('me',messageId);},
        markMessageDeleted: async function (id, messageId) {
            const state=saved(id);state.messageIds=state.messageIds.filter(value=>value!==messageId);persist(id,state);
        },
        deleteRecordById: async function (id) {
            const current=rows(), matches=current.map((r,i)=>r.id===id?i:-1).filter(i=>i>=0);
            const state=saved(id);
            if (matches.length!==1 || !state || state.messageIds.length || (state.fileId && !state.fileDeleted)) throw new Error('Incomplete cleanup');
            const record=current[matches[0]];
            if(record.fileId!==state.fileId || record.receivedAt!==state.receivedAt)throw new Error('Changed record');
            if (sheet.getMaxRows() > 2) sheet.deleteRow(matches[0]+2);
            else sheet.getRange(matches[0]+2,1,1,feedbackSchema(sheet).width).clearContent();
            props.deleteProperty(key(id));
        }
    };
}

async function previewFeedbackRetention() {
    const adapter=feedbackRetentionAdapter();
    return adapter.withLock(async function () {
        const records=await adapter.readRecords(), plan=planRetention(records,Date.now());
        for (const item of plan.filter(p=>p.eligible)) {
            try {adapter.inspect(records.find(r=>r.id===item.id));item.resources='verified';}
            catch (_) {item.resources='review-required';}
        }
        console.log(JSON.stringify(plan)); // IDs and outcomes only, never feedback content.
        return plan;
    });
}

async function runFeedbackRetention() {
    if (PropertiesService.getScriptProperties().getProperty('FEEDBACK_RETENTION_ENABLED') !== 'true') throw new Error('Retention is disabled');
    const result=await executeRetention(feedbackRetentionAdapter(),Date.now(),{dryRun:false});
    console.log(JSON.stringify(result));
    if(result.some(r=>r.status==='retry-required'))throw new Error('Feedback retention needs review; see outcome IDs');
    return result;
}
