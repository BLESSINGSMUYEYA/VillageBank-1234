
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Please provide GEMINI_API_KEY");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const models = JSON.parse(data);
            console.log("Available Models:");
            models.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log(`Error Status: ${res.statusCode}`);
            console.log("Error Body:", data);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
