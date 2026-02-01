
const https = require('https');

const url = "https://gray-trout-987932.hostingersite.com/assets/index-D2smqVKP.js";

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const index = data.indexOf("popstate");
        if (index !== -1) {
            const start = Math.max(0, index - 500);
            const end = Math.min(data.length, index + 1000);
            console.log(`Found 'popstate' at index ${index}`);
            console.log("--- Context ---");
            console.log(data.substring(start, end));
        } else {
            console.log("'popstate' not found");
        }

        const index2 = data.indexOf("pushState");
        if (index2 !== -1) {
            const start = Math.max(0, index2 - 500);
            const end = Math.min(data.length, index2 + 1000);
            console.log(`\nFound 'pushState' at index ${index2}`);
            console.log("--- Context ---");
            console.log(data.substring(start, end));
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
