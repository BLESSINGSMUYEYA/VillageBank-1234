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
import { useLanguage } from '@/components/providers/LanguageProvider'

// ... interfaces remain same ...

export default function ProfilePage() {
  const { user } = useUser()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [financials, setFinancials] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfileData()
    } else {
      window.location.href = '/sign-in'
    }
  }, [user])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/profile')
      if (response.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`)
      const data = await response.json()
      setProfile(data)
      setMemberships(data.memberships || [])
      setFinancials(data.financialSummary || {
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoanBalance: 0,
        contributionStreak: 0,
        eligibilityScore: 0
      })
    } catch (error) {
      console.error(error)
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-h3">{t('common.loading')}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-gray-900">{t('profile.title')}</h1>
        <p className="text-body text-gray-600">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 p-6 sm:p-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-950 shadow-2xl overflow-hidden">
                <span className="text-h1 bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-h2 tracking-tight text-gray-900 dark:text-white">
                    {profile?.firstName || ''} {profile?.lastName || ''}
                  </h2>
                  <p className="text-body text-gray-500 font-medium">{profile?.email}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('profile.member_since')}</p>
                  <p className="text-body font-bold text-gray-900 dark:text-gray-100">
                    {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '---'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider">
                  {profile?.role}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider">
                  {profile?.region} {t('profile.region')}
                </Badge>
                <Badge variant={profile?.isActive ? 'default' : 'secondary'} className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider">
                  {profile?.isActive ? t('profile.active') : t('profile.inactive')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <h2 className="text-h3 font-black text-gray-400 uppercase tracking-widest pt-4">{t('profile.financial_overview')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('common.contributions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-green-600">MWK {financials?.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{t('profile.lifetime_total')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('common.loans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-blue-600">MWK {financials?.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{t('profile.total_loans')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('profile.active_balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-orange-600">MWK {financials?.outstandingLoanBalance.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{t('profile.active_balance')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 text-purple-600">{financials?.contributionStreak}</div>
            <p className="text-xs text-gray-500 mt-1">{t('profile.streak_desc')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl font-bold">{t('profile.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="groups" className="rounded-xl font-bold">{t('profile.tabs.groups')}</TabsTrigger>
          <TabsTrigger value="contributions" className="rounded-xl font-bold">{t('profile.tabs.contributions')}</TabsTrigger>
          <TabsTrigger value="loans" className="rounded-xl font-bold">{t('profile.tabs.loans')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-h3">{t('loans.eligibility_title')}</CardTitle>
                <CardDescription className="text-body">{t('loans.eligibility_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-body mb-2">
                    <span>Eligibility Score</span>
                    <span className="font-black">{financials?.eligibilityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${financials?.eligibilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-body">Contribution History</span>
                    <Badge variant="outline" className="font-bold">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-body">Loan Repayment</span>
                    <Badge variant="outline" className="font-bold">Good</Badge>
                  </div>
                </div>
                <Link href="/loans">
                  <Button className="w-full rounded-xl font-black">{t('loans.view_details')}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-h3">{t('profile.achievements.title')}</CardTitle>
                <CardDescription className="text-body">{t('profile.achievements.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider">{t('profile.achievements.early_bird')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('profile.achievements.early_bird_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider">{t('profile.achievements.consistent')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('profile.achievements.consistent_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider">{t('profile.achievements.contributor')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('profile.achievements.contributor_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider">{t('profile.achievements.rising_star')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('profile.achievements.rising_star_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-h3">{t('profile.tabs.groups')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="relative group p-6 bg-white/60 dark:bg-gray-800/60 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-h3 text-gray-900 dark:text-white">{membership.name}</h3>
                          <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-wider">{membership.role}</Badge>
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-gray-500">
                          <span>{membership.memberCount} {t('groups.members').toLowerCase()}</span>
                          <span>MWK {membership.monthlyContribution.toLocaleString()} / mo</span>
                        </div>
                      </div>
                      <Link href={`/groups/${membership.id}`}>
                        <Button variant="outline" className="rounded-xl font-black group-hover:border-blue-500 transition-colors">
                          {t('groups.view')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md p-8 text-center">
            <p className="text-body text-gray-500 mb-4">View your complete records in the dedicated section</p>
            <Link href="/contributions">
              <Button className="rounded-xl font-black">{t('common.view_all')}</Button>
            </Link>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md p-8 text-center">
            <p className="text-body text-gray-500 mb-4">Manage your applications in the dedicated section</p>
            <Link href="/loans">
              <Button className="rounded-xl font-black">{t('common.view_all')}</Button>
            </Link>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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
