// CODE FOR GOOGLE APPS SCRIPT (Extensions > Apps Script)

// 1. Create a Google Sheet.
// 2. Open Extensions > Apps Script.
// 3. Paste this code.
// 4. Save and Deploy > New Deployment.
// 5. Select type: Web App.
// 6. Execute as: Me.
// 7. Who has access: Anyone.
// 8. Copy the Web App URL.

const SHEET_NAME = 'Sheet1'; // Default sheet name

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = doc.getSheetByName(SHEET_NAME);

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        const data = JSON.parse(e.postData.contents);

        // Customize columns here based on what we send from Frontend
        // Order: Date, Type, SubType, SubTypeLabel, Message, Context, Device Info
        const newRow = [
            new Date(),
            data.type,
            data.subType,
            data.subTypeLabel,
            data.message,
            JSON.stringify(data.context),
            JSON.stringify(data.deviceInfo)
        ];

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    finally {
        lock.releaseLock();
    }
}

// Handle OPTIONS requests for CORS (though usually POST is enough for no-cors mode, good practice)
function doOptions(e) {
    return ContentService.createTextOutput('');
}
