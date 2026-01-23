
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Please provide GEMINI_API_KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // There is no listModels on the client instance in some versions, 
        // but let's try a simple generation to see the specific error or if ANY model works.

        console.log("Testing gemini-2.0-flash...");
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-2.0-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-2.0-flash:", error.message);
    }

    try {
        console.log("Testing gemini-1.5-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Success with gemini-1.5-pro:", resultPro.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-pro:", error.message);
    }
}

listModels();
