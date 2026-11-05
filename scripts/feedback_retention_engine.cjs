'use strict';

// Local preparation only. No Google credentials, network access or scheduler.
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function planRetention(records, now) {
    if (!Number.isFinite(now)) throw new Error('Invalid server time');
    const idCounts = new Map(), fileCounts = new Map();
    for (const record of records) {
        idCounts.set(record.id, (idCounts.get(record.id) || 0) + 1);
        if (record.fileId) fileCounts.set(record.fileId, (fileCounts.get(record.fileId) || 0) + 1);
    }
    return records.map(record => {
        let reason = null;
        if (!UUID.test(record.id || '')) reason = 'legacy-or-invalid-reference';
        else if (idCounts.get(record.id) !== 1) reason = 'duplicate-reference';
        else if (!Number.isFinite(record.receivedAt)) reason = 'invalid-date';
        else if (record.receivedAt > now - RETENTION_MS) reason = 'not-expired';
        else if (record.hasScreenshot && !record.fileId) reason = 'missing-file-reference';
        else if (record.fileId && fileCounts.get(record.fileId) !== 1) reason = 'shared-file';
        return {id: record.id || null, eligible: !reason, reason};
    });
}

// Adapter must hold the same lock as submissions for the entire callback.
// It must re-read current records, verify resource ownership and persist progress.
// Permanent deletion adapters are intentionally not connected to live services.
async function executeRetention(adapter, now, {dryRun = true} = {}) {
    return adapter.withLock(async () => {
        const records = await adapter.readRecords();
        const plan = planRetention(records, now);
        if (dryRun) return plan;
        const results = [];
        for (const item of plan.filter(item => item.eligible)) {
            const record = records.find(record => record.id === item.id);
            try {
                // Resolve and persist exact message IDs before deleting anything.
                // Uncertain matches must throw; never delete an entire mail thread.
                const resources = await adapter.prepareVerifiedResources(record);
                if (resources.verified !== true) throw new Error('Unverified resources');
                if (record.fileId && !resources.fileDeleted) {
                    await adapter.deleteVerifiedFile(record, resources);
                    await adapter.markFileDeleted(record.id);
                }
                for (const messageId of resources.messageIds) {
                    await adapter.deleteVerifiedMessage(record, messageId);
                    await adapter.markMessageDeleted(record.id, messageId);
                }
                // Last step: don't lose the references needed to retry a failure.
                await adapter.deleteRecordById(record.id);
                results.push({id: record.id, status: 'deleted'});
            } catch (_) {
                results.push({id: record.id, status: 'retry-required'});
            }
        }
        return results;
    });
}

module.exports = {RETENTION_MS, planRetention, executeRetention};
