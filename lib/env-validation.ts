// Environment validation for production deployment
export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GEMINI_API_KEY', // Critical for OCR
    'RESEND_API_KEY', // Critical for Emails
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', // Critical for Auth
    'CLERK_SECRET_KEY', // Critical for Auth
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    const errorMsg = `❌ Missing required environment variables: ${missing.join(', ')}. Please check your environment configuration.`

    // During build process, we might want to just warn to allow static analysis to finish
    // However, for actual production runtime, we should throw
    // Check for build-time environment
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.CI === 'true' || process.env.VERCEL === '1';

    if (isBuildTime) {
      console.warn(errorMsg)
      return false
    }

    throw new Error(errorMsg)
  }

  // Log warnings for optional variables
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.warn(`⚠️ Optional environment variable not set: ${envVar}`)
    }
  })

  return true
}

// Validate environment on import in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  validateEnvironment()
}
