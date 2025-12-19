'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function RegisterContinueContent() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard'

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push(redirectUrl)
    }
  }, [isLoaded, isSignedIn, router, redirectUrl])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Completing registration...</div>
    </div>
  )
}

export default function RegisterContinue() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContinueContent />
    </Suspense>
  )
}
