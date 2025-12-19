'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isSignedIn) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Village Banking System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Community banking management for Malawi villages and groups
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">Register</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Group Management</CardTitle>
              <CardDescription>
                Create and manage village banking groups with role-based permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan System</CardTitle>
              <CardDescription>
                Apply for loans with eligibility checks and automated approval workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contribution Tracking</CardTitle>
              <CardDescription>
                Track monthly contributions and manage group finances efficiently
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
