'use client'

import { useAuth } from '@/components/providers/AuthProvider'
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
  Settings,
  Mail,
  MapPin
} from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

// ... interfaces remain same ...

export default function ProfilePage() {
  const { user } = useAuth()
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
      window.location.href = '/login'
    }
  }, [user])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/profile')
      if (response.status === 401) {
        window.location.href = '/login'
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-h3 animate-pulse text-muted-foreground">{t('common.loading')}</div>

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl group">
        {/* Gradient Banner */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 dark:from-blue-950 dark:to-slate-900" />

        <div className="relative pt-20 px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-950 p-1.5 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full rounded-[1.2rem] bg-gradient-to-br from-banana to-yellow-500 flex items-center justify-center text-white text-5xl font-black">
                {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
              </div>
            </div>
            {profile?.isActive && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-card w-8 h-8 rounded-full flex items-center justify-center" title="Active">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left -mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-1">
              {profile?.firstName || ''} {profile?.lastName || ''}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-banana" /> {profile?.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-banana" /> Since {profile?.joinedAt ? new Date(profile.joinedAt).getFullYear() : '---'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-banana" /> {profile?.region}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-3 py-1 text-xs uppercase font-black tracking-wider">
                {profile?.role}
              </Badge>
              <Badge variant="outline" className="border-banana text-yellow-700 bg-banana/10 px-3 py-1 text-xs uppercase font-black tracking-wider">
                Level 3 Member
              </Badge>
            </div>
          </div>

          <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Financial Stats - Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-none shadow-md overflow-hidden relative group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">{t('common.contributions')}</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl sm:text-3xl font-black truncate">MWK {financials?.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-emerald-200/80 mt-1 font-medium">{t('profile.lifetime_total')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('common.loans')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-foreground">MWK {financials?.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{t('profile.total_loans')}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('profile.active_balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-foreground">MWK {financials?.outstandingLoanBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Outstanding</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-banana to-yellow-500 text-white border-none shadow-md relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 bg-white/20 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black text-yellow-900 uppercase tracking-widest">Master Streak</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-1">
              <div className="text-4xl font-black text-white">{financials?.contributionStreak}</div>
              <span className="text-sm font-black text-yellow-900">mo</span>
            </div>
            <p className="text-xs text-yellow-900/80 mt-1 font-bold">{t('profile.streak_desc')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm p-1 rounded-2xl border border-border/50 w-full justify-start overflow-x-auto flex-nowrap no-scrollbar h-14">
          <TabsTrigger value="overview" className="rounded-xl px-6 h-10 font-bold data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">{t('profile.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="groups" className="rounded-xl px-6 h-10 font-bold data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">{t('profile.tabs.groups')}</TabsTrigger>
          <TabsTrigger value="contributions" className="rounded-xl px-6 h-10 font-bold data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">{t('profile.tabs.contributions')}</TabsTrigger>
          <TabsTrigger value="loans" className="rounded-xl px-6 h-10 font-bold data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">{t('profile.tabs.loans')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <CardTitle className="text-xl font-black text-foreground">{t('loans.eligibility_title')}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{t('loans.eligibility_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2 text-foreground">
                    <span>Credit Score</span>
                    <span className="font-black text-blue-600 dark:text-blue-400">{financials?.eligibilityScore}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${financials?.eligibilityScore}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Contribution History</span>
                    <Badge variant="outline" className="font-bold border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Loan Repayment</span>
                    <Badge variant="outline" className="font-bold border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">Good</Badge>
                  </div>
                </div>
                <Link href="/loans">
                  <Button className="w-full rounded-xl font-black h-12 bg-foreground text-background hover:opacity-90">{t('loans.view_details')}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-banana to-yellow-500" />
              <CardHeader>
                <CardTitle className="text-xl font-black text-foreground">{t('profile.achievements.title')}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{t('profile.achievements.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Award, color: 'text-yellow-500', title: t('profile.achievements.early_bird'), desc: t('profile.achievements.early_bird_desc') },
                    { icon: Target, color: 'text-blue-500', title: t('profile.achievements.consistent'), desc: t('profile.achievements.consistent_desc') },
                    { icon: Users, color: 'text-green-500', title: t('profile.achievements.contributor'), desc: t('profile.achievements.contributor_desc') },
                    { icon: TrendingUp, color: 'text-purple-500', title: t('profile.achievements.rising_star'), desc: t('profile.achievements.rising_star_desc') }
                  ].map((achievement, i) => (
                    <div key={i} className="group relative text-center p-4 bg-muted/20 rounded-2xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:bg-card hover:border-banana/50 hover:-translate-y-1">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                      </div>
                      <p className="font-black text-[10px] uppercase tracking-wider text-foreground mb-1">{achievement.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium leading-tight opacity-80">{achievement.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card className="bg-card border border-border/50 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-black text-foreground">{t('profile.tabs.groups')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="relative group p-5 bg-muted/20 rounded-2xl border border-border/50 hover:shadow-md hover:bg-card hover:border-banana/30 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-300">
                            {membership.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">{membership.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium">Joined {new Date(membership.joinedAt).getFullYear()}</p>
                          </div>
                          <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none ml-auto sm:ml-0">{membership.role}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground pl-[3.25rem]">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {membership.memberCount} members</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> MWK {membership.monthlyContribution.toLocaleString()} / mo</span>
                        </div>
                      </div>
                      <Link href={`/groups/${membership.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto rounded-xl font-bold bg-background border-border hover:border-blue-500 hover:text-blue-600 transition-colors">
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
          {/* Placeholder content reused with better styling */}
          <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">Detailed Records</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">View your complete contribution history and download reports in the dedicated section.</p>
            <Link href="/contributions">
              <Button className="rounded-xl font-black bg-foreground text-background px-8 h-12 shadow-lg hover:scale-105 transition-all">{t('common.view_all')}</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">Loan Management</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">Track your loan applications, repayment schedules, and credit limits.</p>
            <Link href="/loans">
              <Button className="rounded-xl font-black bg-foreground text-background px-8 h-12 shadow-lg hover:scale-105 transition-all">{t('common.view_all')}</Button>
            </Link>
          </div>
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
