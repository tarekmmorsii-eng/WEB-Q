// Install only after approval of recurring permanent deletion.
async function dailyFeedbackRetention() {
    const props=PropertiesService.getScriptProperties();
    if(props.getProperty('FEEDBACK_RETENTION_ENABLED')!=='true')return;
    const startedAt=new Date().toISOString();
    props.setProperty('FEEDBACK_RETENTION_LAST_RUN',JSON.stringify({startedAt,status:'running'}));
    try {
        const result=await runFeedbackRetention();
        props.setProperty('FEEDBACK_RETENTION_LAST_RUN',JSON.stringify({startedAt,finishedAt:new Date().toISOString(),status:'success',deleted:result.filter(r=>r.status==='deleted').length}));
    } catch(error) {
        props.setProperty('FEEDBACK_RETENTION_LAST_RUN',JSON.stringify({startedAt,finishedAt:new Date().toISOString(),status:'failed'}));
        // An uncaught failure is reported by Apps Script's trigger notifications.
        throw error;
    }
}

function installApprovedFeedbackSchedule() {
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    try {
        if(Session.getEffectiveUser().getEmail().toLowerCase()!==RETENTION_OWNER)throw new Error('Wrong account');
        const props=PropertiesService.getScriptProperties();
        const existing=ScriptApp.getProjectTriggers().filter(t=>['dailyFeedbackRetention','runFeedbackRetention'].includes(t.getHandlerFunction()));
        if(existing.length)throw new Error('Existing retention trigger requires review');
        props.setProperty('FEEDBACK_RETENTION_ENABLED','false');
        const trigger=ScriptApp.newTrigger('dailyFeedbackRetention').timeBased().everyDays(1).atHour(3).inTimezone('Europe/Istanbul').create();
        props.setProperty('FEEDBACK_RETENTION_TRIGGER_ID',trigger.getUniqueId());
        props.setProperty('FEEDBACK_RETENTION_ENABLED','true');
        console.log('Daily retention enabled: 03:00–04:00 Europe/Istanbul; 90 days; verified references only.');
    } finally {lock.releaseLock();}
}
