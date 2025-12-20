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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Village Banking System
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            Community banking management for Malawi villages and groups
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base">Sign In</Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 text-sm sm:text-base">Register</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <CardTitle className="text-base sm:text-lg lg:text-xl">Group Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base">
                Create and manage village banking groups with role-based permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <CardTitle className="text-base sm:text-lg lg:text-xl">Loan System</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base">
                Apply for loans with eligibility checks and automated approval workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <CardTitle className="text-base sm:text-lg lg:text-xl">Contribution Tracking</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base">
                Track monthly contributions and manage group finances efficiently
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="text-center mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Village Banking?</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
              Empowering communities with transparent, secure, and efficient financial management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center p-4 sm:p-6">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2">Secure & Trusted</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Bank-level security for your financial data and transactions</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Instant notifications and live tracking of all activities</p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Intuitive interface designed for users of all technical levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
