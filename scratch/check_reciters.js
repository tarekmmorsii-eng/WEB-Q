
async function checkReciters() {
    const reciters = [];
    console.log("Starting fetch...");
    for (let id = 1; id <= 110; id++) {
        try {
            const res = await fetch(`https://api.quran.com/api/v4/resources/recitations?language=ar`);
            const allData = await res.json();
            // Actually, the resources/recitations endpoint returns ALL of them if you don't filter?
            // No, it returned 12.
            // Let's try individual ones if possible, or search for the full list.
            break;
        } catch (e) {
            console.error(e);
        }
    }
}

async function fetchFullList() {
    try {
        console.log("Fetching chapter_reciters...");
        const res = await fetch(`https://api.quran.com/api/v4/resources/chapter_reciters?language=ar`);
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            return;
        }
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

fetchFullList();
