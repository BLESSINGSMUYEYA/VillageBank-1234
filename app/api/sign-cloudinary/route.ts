import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { public_id, version, timestamp, signature } = body

    // In development, we'll use unsigned uploads
    // In production, you should implement proper signature generation
    // using your Cloudinary API secret
    
    return NextResponse.json({
      signature: 'dev_signature',
      timestamp: timestamp || Math.floor(Date.now() / 1000)
    })
  } catch (error) {
    console.error('Cloudinary signature error:', error)
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    )
  }
}
