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
        <h1 className="text-display font-black text-blue-900 dark:text-blue-100">{t('profile.title')}</h1>
        <p className="text-body text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden bg-card border border-border shadow-sm rounded-xl">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 p-6 sm:p-8">
            <div className="relative group">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-card rounded-full flex items-center justify-center border-4 border-muted shadow-md overflow-hidden text-blue-900 dark:text-blue-100">
                <span className="text-h1 font-black text-blue-900 dark:text-blue-100">
                  {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-h2 tracking-tight text-blue-900 dark:text-blue-100">
                    {profile?.firstName || ''} {profile?.lastName || ''}
                  </h2>
                  <p className="text-body text-muted-foreground font-medium">{profile?.email}</p>
                </div>

                <div className="flex flex-col items-center sm:items-end bg-muted/50 p-3 rounded-xl border border-border">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('profile.member_since')}</p>
                  <p className="text-body font-bold text-foreground">
                    {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '---'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-none">
                  {profile?.role}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider bg-muted text-muted-foreground hover:bg-muted/80 border-none">
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
      <h2 className="text-h3 font-black text-muted-foreground uppercase tracking-widest pt-4">{t('profile.financial_overview')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('common.contributions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-foreground">MWK {financials?.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('profile.lifetime_total')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('common.loans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-foreground">MWK {financials?.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('profile.total_loans')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('profile.active_balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 truncate text-foreground">MWK {financials?.outstandingLoanBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('profile.active_balance')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h3 sm:text-h2 text-foreground">{financials?.contributionStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('profile.streak_desc')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('profile.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="groups" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('profile.tabs.groups')}</TabsTrigger>
          <TabsTrigger value="contributions" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('profile.tabs.contributions')}</TabsTrigger>
          <TabsTrigger value="loans" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">{t('profile.tabs.loans')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-h3 text-blue-900 dark:text-blue-100">{t('loans.eligibility_title')}</CardTitle>
                <CardDescription className="text-body font-medium text-muted-foreground">{t('loans.eligibility_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-body mb-2 text-foreground">
                    <span>Eligibility Score</span>
                    <span className="font-black text-blue-900 dark:text-blue-100">{financials?.eligibilityScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-blue-900 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${financials?.eligibilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-xl border border-border">
                    <span className="text-body text-muted-foreground">Contribution History</span>
                    <Badge variant="outline" className="font-bold border-border text-foreground">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-xl border border-border">
                    <span className="text-body text-muted-foreground">Loan Repayment</span>
                    <Badge variant="outline" className="font-bold border-border text-foreground">Good</Badge>
                  </div>
                </div>
                <Link href="/loans">
                  <Button className="w-full rounded-xl font-black bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">{t('loans.view_details')}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-h3 text-blue-900 dark:text-blue-100">{t('profile.achievements.title')}</CardTitle>
                <CardDescription className="text-body font-medium text-muted-foreground">{t('profile.achievements.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative text-center p-4 bg-muted/50 rounded-2xl border border-border transition-all duration-200 hover:shadow-md hover:bg-card hover:border-blue-100">
                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider text-foreground">{t('profile.achievements.early_bird')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('profile.achievements.early_bird_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-muted/50 rounded-2xl border border-border transition-all duration-200 hover:shadow-md hover:bg-card hover:border-blue-100">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider text-foreground">{t('profile.achievements.consistent')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('profile.achievements.consistent_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-muted/50 rounded-2xl border border-border transition-all duration-200 hover:shadow-md hover:bg-card hover:border-blue-100">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider text-foreground">{t('profile.achievements.contributor')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('profile.achievements.contributor_desc')}</p>
                  </div>

                  <div className="group relative text-center p-4 bg-muted/50 rounded-2xl border border-border transition-all duration-200 hover:shadow-md hover:bg-card hover:border-blue-100">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500 transform group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xs uppercase tracking-wider text-foreground">{t('profile.achievements.rising_star')}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('profile.achievements.rising_star_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-h3 text-blue-900 dark:text-blue-100">{t('profile.tabs.groups')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="relative group p-6 bg-card rounded-3xl border border-border hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-h3 text-foreground">{membership.name}</h3>
                          <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{membership.role}</Badge>
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-muted-foreground">
                          <span>{membership.memberCount} {t('groups.members').toLowerCase()}</span>
                          <span>MWK {membership.monthlyContribution.toLocaleString()} / mo</span>
                        </div>
                      </div>
                      <Link href={`/groups/${membership.id}`}>
                        <Button variant="outline" className="rounded-xl font-black border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
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
          <Card className="p-8 text-center bg-card border border-border shadow-sm">
            <p className="text-body text-muted-foreground mb-4">View your complete records in the dedicated section</p>
            <Link href="/contributions">
              <Button className="rounded-xl font-black bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">{t('common.view_all')}</Button>
            </Link>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="p-8 text-center bg-card border border-border shadow-sm">
            <p className="text-body text-muted-foreground mb-4">Manage your applications in the dedicated section</p>
            <Link href="/loans">
              <Button className="rounded-xl font-black bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">{t('common.view_all')}</Button>
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
