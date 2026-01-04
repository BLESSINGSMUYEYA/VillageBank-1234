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

        // Use Gemini 1.5 Flash (updated model name)
        // Use Gemini 2.0 Flash (confirmed available)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `
      Analyze this image of a payment receipt (likely mobile money like Airtel Money, Mpamba/TNM, or a bank transfer).
      Extract the following information in strict JSON format:
      1. amount: The transaction amount (number only, remove currency symbols like MWK, MK).
      2. transactionRef: The transaction ID or reference number (e.g., CI240104.1234).
      3. date: The date of the transaction (ISO 8601 format YYYY-MM-DD if possible).
      4. sender: The name of the sender.
      5. receiver: The name of the receiver/recipient.
      6. paymentMethod: The provider (e.g., 'AIRTEL_MONEY', 'MPAMBA', 'BANK_CARD', 'CASH').
      
      If a field is not found, set it to null.
      Return ONLY the JSON. Do not include markdown formatting like \`\`\`json.
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

        // Clean up markdown code blocks if Gemini includes them despite instructions
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let data
        try {
            data = JSON.parse(cleanJson)
        } catch (e) {
            console.error('Failed to parse Gemini response:', text)
            return NextResponse.json(
                { error: 'Failed to extract data from receipt' },
                { status: 422 }
            )
        }

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Receipt scan error:', error)

        // Handle Rate Limiting
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
            return NextResponse.json(
                { error: 'AI Service busy (Rate Limit). Please wait a minute and try again.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error during scanning' },
            { status: 500 }
        )
    }
}
