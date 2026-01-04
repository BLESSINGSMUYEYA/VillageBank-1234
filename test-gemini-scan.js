/**
 * Test script to validate Gemini API key
 * Run with: node test-gemini-scan.js
 */

require('dotenv').config({ path: '.env.local' })
const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

console.log('🔍 Testing Gemini API Configuration...\n')

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    console.log('\n📋 To fix:')
    console.log('1. Get a new API key from: https://aistudio.google.com/app/apikey')
    console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here')
    console.log('3. Restart the dev server')
    process.exit(1)
}

console.log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 20)}...`)

async function testGeminiKey() {
    try {
        console.log('\n🧪 Testing API key validity...')
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = "Respond with exactly: 'API key is valid'"
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log('✅ API key is VALID')
        console.log(`📝 Test response: "${text.trim()}"`)
        console.log('\n✨ Gemini API is working correctly!')

    } catch (error) {
        console.error('\n❌ API Key Test FAILED')
        console.error('Error:', error.message)

        if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
            console.log('\n🔧 Solution:')
            console.log('Your API key is invalid or has been revoked.')
            console.log('1. Generate a new key at: https://aistudio.google.com/app/apikey')
            console.log('2. Update .env.local with: GEMINI_API_KEY=new_key_here')
            console.log('3. Restart your dev server: npm run dev')
        } else if (error.status === 429) {
            console.log('\n⏳ Rate Limit Reached')
            console.log('Wait 60 seconds and try again, or upgrade your Gemini plan.')
        } else {
            console.log('\nFull error:', error)
        }

        process.exit(1)
    }
}

testGeminiKey()
