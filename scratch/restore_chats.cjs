const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(
    process.env.APPDATA,
    'Code/User/workspaceStorage/0321ba5d7a4a398702c1808310dcd679/state.vscdb'
);

const conversationsDir = 'C:\\Users\\NoteBook\\.gemini\\antigravity-ide\\conversations';
const brainDir = 'C:\\Users\\NoteBook\\.gemini\\antigravity-ide\\brain';

try {
    console.log('Connecting to state.vscdb...');
    const db = new Database(dbPath);
    
    console.log('Reading conversations folder...');
    const files = fs.readdirSync(conversationsDir).filter(f => f.endsWith('.pb'));
    console.log(`Found ${files.length} conversation (.pb) files.`);
    
    const entries = {};
    
    for (const file of files) {
        const uuid = file.replace('.pb', '');
        const filePath = path.join(conversationsDir, file);
        const stats = fs.statSync(filePath);
        
        let title = '';
        
        // Try to get title from brain transcript
        const transcriptPath = path.join(brainDir, uuid, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(transcriptPath)) {
            try {
                const content = fs.readFileSync(transcriptPath, 'utf8');
                const lines = content.split('\n').filter(Boolean);
                for (const line of lines) {
                    const data = JSON.parse(line);
                    if (data.source === 'USER_EXPLICIT' && data.content) {
                        // Extract first clean user request as title
                        const match = data.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                        let cleanText = match ? match[1].trim() : data.content.trim();
                        cleanText = cleanText.replace(/[\r\n\t]+/g, ' ');
                        if (cleanText) {
                            title = cleanText.substring(0, 40) + (cleanText.length > 40 ? '...' : '');
                            break;
                        }
                    }
                }
            } catch (err) {
                // Ignore error parsing individual transcript
            }
        }
        
        // Fallback title
        if (!title) {
            const dateStr = stats.mtime.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            title = `محادثة سابقة (${dateStr})`;
        }
        
        entries[uuid] = {
            id: uuid,
            title: title,
            createdAt: stats.birthtimeMs || stats.mtimeMs,
            lastActiveAt: stats.mtimeMs
        };
    }
    
    const indexValue = JSON.stringify({
        version: 1,
        entries: entries
    });
    
    console.log('Updating state.vscdb ItemTable...');
    const stmt = db.prepare('INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)');
    const info = stmt.run('chat.ChatSessionStore.index', indexValue);
    
    console.log(`SUCCESS: Restored ${Object.keys(entries).length} conversations into the IDE index!`);
    console.log(`Changes applied to state.vscdb. Rows affected: ${info.changes}`);
    
} catch (err) {
    console.error('Error during restoration:', err);
}
