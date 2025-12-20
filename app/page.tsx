'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, Shield, Clock, Award } from 'lucide-react'

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Village Banking System
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Community banking management for Malawi villages and groups
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3">Sign In</Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3">Register</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center sm:text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Group Management</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create and manage village banking groups with role-based permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center sm:text-left">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Loan System</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Apply for loans with eligibility checks and automated approval workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center sm:text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Contribution Tracking</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track monthly contributions and manage group finances efficiently
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Village Banking?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              Empowering communities with transparent, secure, and efficient financial management
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="text-center p-6">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure & Trusted</h3>
              <p className="text-gray-600 text-sm">Bank-level security for your financial data and transactions</p>
            </div>
            
            <div className="text-center p-6">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">Instant notifications and live tracking of all activities</p>
            </div>
            
            <div className="text-center p-6">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-sm">Intuitive interface designed for users of all technical levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
