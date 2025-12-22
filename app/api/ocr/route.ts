import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiApiKey = process.env.GEMINI_API_KEY

if (!geminiApiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(geminiApiKey || "")

export async function POST(req: Request) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
        }

        // Fetch the image from Cloudinary
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        // Determine mime type from URL or default to image/jpeg
        const mimeType = imageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this transaction receipt from a mobile money service in Malawi (Airtel Money or TNM Mpamba).
        
        EXTRACT:
        1. Amount: The total transaction amount in MWK. Look for "Amount:", "Amt:", or values near "MWK" / "K".
        2. Transaction Reference: The unique ID. Look for "Trans ID:", "Ref:", or "External ID:".
        3. Payment Method: Identify if it's "AIRTEL_MONEY" or "MPAMBA" based on keywords like "Airtel", "TNM", "Mpamba".
        4. Date: The transaction date in YYYY-MM-DD format.

        RETURN JSON ONLY:
        {
            "amount": number,
            "transactionRef": string,
            "paymentMethod": "AIRTEL_MONEY" | "MPAMBA" | "BANK_CARD" | "CASH" | "OTHER",
            "date": "YYYY-MM-DD" | null
        }

        If data is missing, use null. Be extremely precise with the amount - remove any currency symbols or commas.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(buffer).toString("base64"),
                    mimeType,
                },
            },
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return NextResponse.json({ error: "Failed to parse receipt data" }, { status: 500 });
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("OCR Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
