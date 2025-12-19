'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Village Banking</CardTitle>
          <CardDescription>
            Create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp 
            path="/register"
            routing="path"
            signInUrl="/login"
            redirectUrl="/dashboard"
          />
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
