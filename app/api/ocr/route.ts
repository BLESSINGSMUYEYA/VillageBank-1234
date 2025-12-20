import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
        }

        // Fetch the image from Cloudinary
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this transaction receipt from a mobile money service (likely Airtel Money or Mpamba in Malawi) and extract the following information in JSON format:
        {
            "amount": number,
            "transactionRef": string,
            "paymentMethod": "AIRTEL_MONEY" | "MPAMBA" | "BANK_CARD" | "CASH" | "OTHER",
            "date": "YYYY-MM-DD"
        }
        Only return the JSON object, nothing else. If a field is not found, use null.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(buffer).toString("base64"),
                    mimeType: "image/jpeg", // Assuming JPEG/PNG from Cloudinary
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
