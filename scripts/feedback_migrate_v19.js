// Run once only after deploying the receiver that accepts both schemas.
function migrateFeedback19() {
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
        if (Session.getEffectiveUser().getEmail().toLowerCase() !== RETENTION_OWNER) throw new Error('Wrong account');
        const sheet = SpreadsheetApp.openById(RETENTION_SHEET_ID).getSheetByName(SHEET_NAME);
        if (feedbackSchema(sheet).version === 2) { console.log('Already migrated; no records removed.'); return; }
        const archive = SpreadsheetApp.openById('1Yq_HH0RobpqGfAHmJvjSZFrfy3Ag9tY-xQ3RKGjHxW0').getSheetByName(SHEET_NAME);
        if (sheet.getLastRow() !== 83 || archive.getLastRow() !== 83) throw new Error('Row count changed; archive must be reverified');
        const before = sheet.getRange(1,1,83,13).getValues();
        if (JSON.stringify(before) !== JSON.stringify(archive.getRange(1,1,83,13).getValues())) throw new Error('Archive does not match original');
        const maxRows = sheet.getMaxRows(), maxCols = sheet.getMaxColumns();
        try {
            if (sheet.getFilter()) sheet.getFilter().remove();
            sheet.getRange(1,1,83,13).clearContent();
            sheet.getRange(1,1,1,11).setValues([FEEDBACK_V19_HEADERS]);
            // Google requires one unfrozen row beneath the frozen header.
            if (sheet.getMaxRows() > 2) sheet.deleteRows(3,sheet.getMaxRows()-2);
            if (sheet.getMaxColumns() > 11) sheet.deleteColumns(12,sheet.getMaxColumns()-11);
            sheet.setFrozenRows(1);
            SpreadsheetApp.flush();
            if (feedbackSchema(sheet).version !== 2 || sheet.getLastRow() !== 1) throw new Error('Migration verification failed');
        } catch (e) {
            if (sheet.getMaxRows() < maxRows) sheet.insertRowsAfter(sheet.getMaxRows(), maxRows-sheet.getMaxRows());
            if (sheet.getMaxColumns() < maxCols) sheet.insertColumnsAfter(sheet.getMaxColumns(), maxCols-sheet.getMaxColumns());
            sheet.getRange(1,1,83,13).setValues(before); SpreadsheetApp.flush(); throw e;
        }
        console.log(JSON.stringify({schema:2,archivedRecords:82,activeRecords:0,columns:11,archiveUnchanged:true}));
    } finally { lock.releaseLock(); }
}
function verifyFeedback19Storage() {
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    let sheet, id;
    try {
        if (Session.getEffectiveUser().getEmail().toLowerCase() !== RETENTION_OWNER) throw new Error('Wrong account');
        sheet = SpreadsheetApp.openById(RETENTION_SHEET_ID).getSheetByName(SHEET_NAME);
        const schema = feedbackSchema(sheet);
        if (schema.version !== 2) throw new Error('Expected new schema');
        id = Utilities.getUuid();
        const data = {message:'INTERNAL-SCHEMA-CHECK-19',type:'schema-test',context:{test:true},deviceInfo:{androidVersion:'16',phoneBrand:'Test brand',phoneModel:'Test model'}};
        const image = {getId:()=> 'schema-check-only',getUrl:()=> 'https://drive.google.com/file/d/schema-check-only/view'};
        const row = feedbackRow(schema,data,new Date(),id,image);
        const number = appendFeedbackRow(sheet,row);
        SpreadsheetApp.flush();
        const actual = sheet.getRange(number,1,1,11).getValues()[0];
        if (!(actual[0] instanceof Date) || Math.abs(actual[0].getTime()-row[0].getTime())>1000 || actual.slice(1).some((v,i)=>String(v)!==String(row[i+1]))) throw new Error('Stored row mismatch');
        const record = feedbackRetentionRows(sheet).find(r=>r.id===id);
        if (!record || record.linkMismatch || record.fileId !== 'schema-check-only') throw new Error('Retention column mismatch');
        console.log(JSON.stringify({schema:2,writeReadVerified:true,retentionMappingVerified:true,emailSent:false,imageCreated:false}));
    } finally {
        try {
            if (sheet && id && sheet.getLastRow()>1) {
                const rows=sheet.getRange(2,1,sheet.getLastRow()-1,11).getValues();
                const matches=rows.map((r,i)=>r[9]===id && r[1]==='INTERNAL-SCHEMA-CHECK-19'?i+2:0).filter(Boolean);
                if(matches.length===1) {
                    if(sheet.getMaxRows()===2) sheet.getRange(matches[0],1,1,11).clearContent();
                    else sheet.deleteRow(matches[0]);
                }
            }
        } finally { lock.releaseLock(); }
    }
}
function inspectFeedback19Status() {
    const sheet=SpreadsheetApp.openById(RETENTION_SHEET_ID).getSheetByName(SHEET_NAME);
    const props=PropertiesService.getScriptProperties();
    console.log(JSON.stringify({schema:feedbackSchema(sheet).version,activeRows:sheet.getLastRow()-1,retentionEnabled:props.getProperty('FEEDBACK_RETENTION_ENABLED'),lastRun:props.getProperty('FEEDBACK_RETENTION_LAST_RUN'),dailyTriggers:ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='dailyFeedbackRetention').length}));
}
