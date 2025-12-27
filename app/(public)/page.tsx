'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, Shield, Clock, Award } from 'lucide-react'

export default function Home() {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (isAuthenticated) {
        return null // Will redirect to dashboard
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-blue-900 mb-4 sm:mb-6 leading-tight">
                        Village Banking System
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 font-medium">
                        Community banking management for Malawi villages and groups
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 sm:px-0">
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base sm:text-lg font-bold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base sm:text-lg font-bold rounded-xl border-2 border-blue-900 text-blue-900 hover:bg-blue-50 hover:text-blue-900 transition-all">
                                Register
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16 sm:mb-20 lg:mb-24">
                    <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="text-center p-6 sm:p-8">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-3 font-black text-blue-900">Group Management</CardTitle>
                            <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600 font-medium">
                                Create and manage village banking groups with role-based permissions
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="text-center p-6 sm:p-8">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-green-700" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-3 font-black text-blue-900">Loan System</CardTitle>
                            <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600 font-medium">
                                Apply for loans with eligibility checks and automated approval workflows
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                        <CardHeader className="text-center p-6 sm:p-8">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-purple-700" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl lg:text-2xl mb-3 font-black text-blue-900">Contribution Tracking</CardTitle>
                            <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600 font-medium">
                                Track monthly contributions and manage group finances efficiently
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Why Choose Section */}
                <div className="mt-16 sm:mt-20 lg:mt-24">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-blue-900 mb-4 sm:mb-6">
                            Why Choose Village Banking?
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 font-medium">
                            Empowering communities with transparent, secure, and efficient financial management
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
                        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-700 mx-auto mb-4 sm:mb-6" />
                            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 text-gray-900">Secure & Trusted</h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
                                Bank-level security for your financial data and transactions
                            </p>
                        </div>

                        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-green-700 mx-auto mb-4 sm:mb-6" />
                            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 text-gray-900">Real-time Updates</h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
                                Instant notifications and live tracking of all activities
                            </p>
                        </div>

                        <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-purple-700 mx-auto mb-4 sm:mb-6" />
                            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 text-gray-900">Easy to Use</h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
                                Intuitive interface designed for users of all technical levels
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
