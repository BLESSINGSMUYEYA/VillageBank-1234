// Environment validation for production deployment
export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Log warnings for optional variables
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.warn(`Optional environment variable not set: ${envVar}`)
    }
  })

  return true
}

// Validate environment on import in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  validateEnvironment()
}
