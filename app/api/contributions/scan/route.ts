import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No receipt file provided' },
                { status: 400 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set')
            return NextResponse.json(
                { error: 'Scanner configuration missing' },
                { status: 503 }
            )
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = buffer.toString('base64')

        // Use Gemini 1.5 Flash (Stable, High Speed)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json"
            }
        })

        const prompt = `
      Analyze this image of a payment receipt.
      Extract the following information in strict JSON format:
      {
        "amount": number | null, // Remove currency symbols
        "transactionRef": string | null,
        "date": string | null, // ISO 8601 YYYY-MM-DD
        "sender": string | null,
        "receiver": string | null,
        "paymentMethod": "AIRTEL_MONEY" | "MPAMBA" | "BANK_CARD" | "CASH" | null
      }
      
      If a field is not found, set it to null.
      Return ONLY the JSON object.
    `

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || 'image/jpeg',
                },
            },
        ])

        const response = await result.response
        const text = response.text()

        console.log('Gemini Raw Response:', text)

        let data
        try {
            // Robust JSON extraction: Find first '{' and last '}'
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            const jsonString = jsonMatch ? jsonMatch[0] : text
            data = JSON.parse(jsonString)
        } catch (e) {
            console.error('Failed to parse Gemini response:', text)
            // Attempt to clean markdown if regex failed
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
            try {
                data = JSON.parse(cleanJson)
            } catch (e2) {
                return NextResponse.json(
                    { error: 'Failed to read receipt data. Please enter manually.' },
                    { status: 422 }
                )
            }
        }

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Receipt scan error:', error)

        // Handle Rate Limiting
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
            return NextResponse.json(
                { error: 'AI Service busy. Please try again in a moment.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error during scanning' },
            { status: 500 }
        )
    }
}
