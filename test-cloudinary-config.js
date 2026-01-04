/**
 * Test script to validate Cloudinary upload configuration
 * Run with: node test-cloudinary-config.js
 */

require('dotenv').config({ path: '.env.local' })
const https = require('https')

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

console.log('☁️ Testing Cloudinary Configuration...\n')

if (!CLOUD_NAME) {
    console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not found in .env.local')
    process.exit(1)
}

if (!UPLOAD_PRESET) {
    console.error('❌ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET not found in .env.local')
    console.log('\n📋 Using default: ml_default')
}

console.log(`✅ Cloud Name: ${CLOUD_NAME}`)
console.log(`✅ Upload Preset: ${UPLOAD_PRESET || 'ml_default'}`)

async function testCloudinaryUpload() {
    try {
        console.log('\n🧪 Testing unsigned upload...')

        // Create a minimal test image (1x1 red pixel PNG)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='

        const formData = new URLSearchParams()
        formData.append('file', testImageBase64)
        formData.append('upload_preset', UPLOAD_PRESET || 'ml_default')
        formData.append('folder', 'receipts')

        const data = formData.toString()

        const options = {
            hostname: 'api.cloudinary.com',
            port: 443,
            path: `/v1_1/${CLOUD_NAME}/image/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        }

        const req = https.request(options, (res) => {
            let responseData = ''

            res.on('data', (chunk) => {
                responseData += chunk
            })

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(responseData)
                    console.log('✅ Upload SUCCESSFUL!')
                    console.log(`📸 Image URL: ${result.secure_url}`)
                    console.log(`📁 Folder: ${result.folder || 'root'}`)
                    console.log('\n✨ Cloudinary is configured correctly!')
                } else {
                    console.error(`\n❌ Upload FAILED (Status ${res.statusCode})`)
                    const error = JSON.parse(responseData)
                    console.error('Error:', error.error?.message || error)

                    if (error.error?.message?.includes('preset')) {
                        console.log('\n🔧 Solution:')
                        console.log(`1. Go to: https://cloudinary.com/console/${CLOUD_NAME}/settings/upload`)
                        console.log(`2. Create an upload preset named: "${UPLOAD_PRESET || 'ml_default'}"`)
                        console.log('3. Set "Signing Mode" to "Unsigned"')
                        console.log('4. Set "Folder" to "receipts" (optional)')
                        console.log('5. Save the preset')
                        console.log('6. Retry this test')
                    }
                }
            })
        })

        req.on('error', (error) => {
            console.error('\n❌ Network Error:', error.message)
        })

        req.write(data)
        req.end()

    } catch (error) {
        console.error('\n❌ Test Error:', error.message)
        process.exit(1)
    }
}

testCloudinaryUpload()
