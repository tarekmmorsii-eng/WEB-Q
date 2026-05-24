const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(
    process.env.APPDATA,
    'Code/User/workspaceStorage/0321ba5d7a4a398702c1808310dcd679/state.vscdb'
);

try {
    const db = new Database(dbPath, { readonly: true });
    
    // Select all keys from ItemTable
    const rows = db.prepare('SELECT key, value FROM ItemTable').all();
    
    console.log(`Total rows found: ${rows.length}`);
    
    // Filter for chat and antigravity keys
    const filtered = rows.filter(r => r.key.includes('chat') || r.key.includes('antigravity'));
    console.log(`Filtered rows: ${filtered.length}`);
    
    filtered.forEach(r => {
        console.log(`KEY: ${r.key}`);
        console.log(`VALUE length: ${r.value ? r.value.length : 0}`);
        if (r.key.includes('ChatSessionStore.index') || r.key.includes('chat.history') || r.key.includes('chat.sessions')) {
            console.log(`VALUE: ${r.value}`);
        }
        console.log('-----------------------------------');
    });
    
} catch (err) {
    console.error('Error reading vscdb:', err);
}
