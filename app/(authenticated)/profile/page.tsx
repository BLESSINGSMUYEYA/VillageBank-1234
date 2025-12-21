'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  User,
  DollarSign,
  CreditCard,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Target,
  Eye,
  Settings
} from 'lucide-react'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  region: string
  joinedAt: string
  isActive: boolean
}

interface GroupMembership {
  id: string
  name: string
  role: string
  status: string
  joinedAt: string
  monthlyContribution: number
  memberCount: number
}

interface FinancialSummary {
  totalContributions: number
  totalLoans: number
  outstandingLoanBalance: number
  contributionStreak: number
  eligibilityScore: number
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [financials, setFinancials] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfileData()
    } else {
      // If no user, redirect to sign-in
      window.location.href = '/sign-in'
    }
  }, [user])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/profile')

      if (response.status === 401) {
        // User is not authenticated, redirect to sign-in
        window.location.href = '/sign-in'
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile data: ${response.statusText}`)
      }

      const data = await response.json()
      setProfile({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
        region: data.region,
        joinedAt: data.joinedAt,
        isActive: data.isActive
      })

      setMemberships(data.memberships || [])
      setFinancials(data.financialSummary || {
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoanBalance: 0,
        contributionStreak: 0,
        eligibilityScore: 0
      })
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
      setError('Failed to load profile data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error loading profile</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProfileData()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View your personal information and activity</p>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 p-6 sm:p-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6c47ff] to-[#9d81ff] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-950 shadow-2xl overflow-hidden">
                <span className="text-3xl font-black bg-gradient-to-br from-[#6c47ff] to-[#9d81ff] bg-clip-text text-transparent">
                  {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    {profile?.firstName || ''} {profile?.lastName || ''}
                  </h2>
                  <p className="text-gray-500 font-medium">{profile?.email}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member since</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '---'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <Badge variant="secondary" className="bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20 hover:bg-[#6c47ff]/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  {profile?.role}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  {profile?.region} Region
                </Badge>
                <Badge variant={profile?.isActive ? 'default' : 'secondary'} className={`${profile?.isActive ? 'bg-green-500 text-white' : ''} px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contributions</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate">MWK {financials?.totalContributions.toLocaleString()}</div>
            <p className="text-[10px] text-gray-500 mt-1">Lifetime total</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Borrowed</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate">MWK {financials?.totalLoans.toLocaleString()}</div>
            <p className="text-[10px] text-gray-500 mt-1">Total loans</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Debt</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate text-orange-600">MWK {financials?.outstandingLoanBalance.toLocaleString()}</div>
            <p className="text-[10px] text-gray-500 mt-1">Active balance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Streak</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-purple-600">{financials?.contributionStreak}</div>
            <p className="text-[10px] text-gray-500 mt-1">Consecutive months</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Group Memberships</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loan History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Eligibility</CardTitle>
                <CardDescription>
                  Your current eligibility for new loans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Eligibility Score</span>
                    <span>{financials?.eligibilityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${financials?.eligibilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contribution History</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Repayment</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Standing</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                <Button className="w-full">Check Loan Eligibility</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Achievements</CardTitle>
                <CardDescription>
                  Your milestones and badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Award className="w-10 h-10 mx-auto mb-3 text-yellow-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider mb-1">Early Bird</p>
                    <p className="text-[10px] text-gray-500 font-medium">Foundation Member</p>
                  </div>

                  <div className="group relative text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Target className="w-10 h-10 mx-auto mb-3 text-blue-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider mb-1">Consistent</p>
                    <p className="text-[10px] text-gray-500 font-medium">6 Month Streak</p>
                  </div>

                  <div className="group relative text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Users className="w-10 h-10 mx-auto mb-3 text-green-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider mb-1">Contributor</p>
                    <p className="text-[10px] text-gray-500 font-medium">Active Member</p>
                  </div>

                  <div className="group relative text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 text-purple-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider mb-1">Rising Star</p>
                    <p className="text-[10px] text-gray-500 font-medium">Growth Leader</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Group Memberships</CardTitle>
              <CardDescription>
                Groups you belong to and your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="relative group p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6c47ff]/5 to-transparent rounded-bl-[5rem] -mr-8 -mt-8"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-4 sm:space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">{membership.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-[#6c47ff]/10 text-[#6c47ff] border-none font-bold text-[9px] uppercase tracking-wider">{membership.role}</Badge>
                            <Badge variant={membership.status === 'ACTIVE' ? 'default' : 'secondary'} className="font-bold text-[9px] uppercase tracking-wider">
                              {membership.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#6c47ff]" /> Members
                            </p>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{membership.memberCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-green-500" /> Monthly
                            </p>
                            <p className="font-bold text-gray-900 dark:text-gray-100">MWK {membership.monthlyContribution.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 col-span-2 sm:col-span-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-orange-500" /> Joined
                            </p>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{new Date(membership.joinedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <Link href={`/groups/${membership.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                            <Eye className="w-4 h-4 mr-2" /> View
                          </Button>
                        </Link>
                        {membership.role === 'ADMIN' && (
                          <Link href={`/groups/${membership.id}/settings`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:text-blue-500 transition-colors">
                              <Settings className="w-4 h-4 mr-2" /> Manage
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                Your monthly contribution records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Contribution history interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>
                Your loan applications and repayment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Loan history interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
