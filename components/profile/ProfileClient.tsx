'use client'

import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
    Mail,
    MapPin,
    Calendar,
    TrendingUp,
    Award,
    Users,
    Settings,
    Wallet,
    Shield,
    Zap,
    CheckCircle2,
    History,
    ArrowLeft
} from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { StatsCard } from '@/components/ui/stats-card'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'

interface ProfileData {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    phoneNumber: string | null
    role: string
    region: string | null
    joinedAt: Date
    isActive: boolean
}

interface GroupMembership {
    id: string
    name: string
    role: string
    status: string
    joinedAt: Date
    monthlyContribution: number
    memberCount: number
}

interface FinancialSummary {
    totalContributions: number
    totalLoans: number
    outstandingLoanBalance: number
    contributionStreak: number
    eligibilityScore: number
    recentContributions?: {
        amount: number
        status: string
        date: Date
        groupName: string
    }[]
    recentLoans?: {
        id: string
        amount: number
        status: string
        date: Date
    }[]
}

interface ProfileClientProps {
    profile: ProfileData
    memberships: GroupMembership[]
    financials: FinancialSummary
}

export function ProfileClient({ profile, memberships, financials }: ProfileClientProps) {
    const { t } = useLanguage()

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8 sm:space-y-12 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={fadeIn}>
                <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Hub
                </Link>
                <PageHeader
                    title={t('profile.title') || 'Member Profile'}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-banana" />
                            {t('profile.subtitle') || 'Synchronized identity and financial standing across the global network.'}
                        </span>
                    }
                    action={
                        <Link href="/settings">
                            <Button variant="banana" className="px-6 group">
                                <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                {t('profile.edit_profile') || 'Manage Account'}
                            </Button>
                        </Link>
                    }
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                {/* Left Column: Identity & Milestoness */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-0 border-none overflow-hidden" hover={false}>
                            {/* Banner */}
                            <div className="h-32 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-900 relative">
                                <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]" />
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background/80 to-transparent" />
                            </div>

                            <CardContent className="relative pt-0 px-6 pb-8">
                                {/* Avatar */}
                                <div className="flex justify-center sm:justify-start -mt-16 mb-6">
                                    <div className="p-1.5 rounded-[2.5rem] bg-background/50 backdrop-blur-3xl shadow-2xl">
                                        <div className="w-28 h-28 rounded-[2.2rem] bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 dark:from-banana dark:via-yellow-400 dark:to-yellow-600 flex items-center justify-center text-white dark:text-blue-950 text-4xl font-black shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                                            {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-3xl font-black text-foreground tracking-tight leading-none mb-3">
                                            {profile?.firstName} {profile?.lastName}
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                            <Badge variant="info">
                                                {profile?.role?.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="success">
                                                Active Node
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {[
                                            { icon: Mail, label: 'Transmission Code', value: profile?.email },
                                            { icon: MapPin, label: 'Regional Sector', value: profile?.region || 'Central Domain' },
                                            { icon: Calendar, label: 'Node Activated', value: profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '---' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group/item">
                                                <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-banana/10 text-blue-600 dark:text-banana group-hover/item:scale-110 transition-transform">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest opacity-60 mb-0.5">{item.label}</p>
                                                    <p className="text-sm font-black text-foreground truncate">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </motion.div>

                    {/* Milestone Card */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 border-none bg-gradient-to-br from-blue-700/10 to-transparent" hover={true}>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4 text-banana" />
                                Investor Status Tier
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-2xl font-black text-foreground tracking-tighter">Diamond</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">75% to Elite</span>
                                </div>
                                <div className="w-full bg-blue-900/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '75%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-blue-600 dark:bg-banana h-full rounded-full"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground opacity-70 leading-relaxed uppercase tracking-wider">
                                    Maintain a perfect streak for 45 more days to unlock priority credit access and lower interest premiums.
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Right Column: Financial Performance */}
                <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-2 no-scrollbar">
                        <StatsCard
                            index={1}
                            variant="gradient"
                            gradient="bg-gradient-to-br from-blue-600 to-indigo-800"
                            icon={Wallet}
                            label="Net Capital Stake"
                            value={formatCurrency(financials?.totalContributions || 0)}
                            description="Real-time synchronized balance"
                            className="shrink-0 w-[280px] sm:w-auto"
                        />
                        <StatsCard
                            index={2}
                            variant="glass"
                            icon={TrendingUp}
                            label="Reliability Rating"
                            value={`${financials?.eligibilityScore}%`}
                            description="Trust factor optimized"
                            className="shrink-0 w-[280px] sm:w-auto"
                        />
                    </div>

                    <Tabs defaultValue="overview" className="space-y-8">
                        <div className="sticky top-0 z-20 pt-2 pointer-events-none">
                            <TabsList className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/40 dark:border-white/10 w-full justify-start h-14 shadow-xl pointer-events-auto no-scrollbar overflow-x-auto">
                                <TabsTrigger value="overview" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-950 dark:data-[state=active]:bg-blue-950 data-[state=active]:text-white dark:data-[state=active]:text-white">Overview</TabsTrigger>
                                <TabsTrigger value="groups" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-950 dark:data-[state=active]:bg-blue-950 data-[state=active]:text-white dark:data-[state=active]:text-white">Memberships</TabsTrigger>
                                <TabsTrigger value="history" className="rounded-xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-950 dark:data-[state=active]:bg-blue-950 data-[state=active]:text-white dark:data-[state=active]:text-white">Ledger</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-6 mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div variants={itemFadeIn}>
                                    <GlassCard className="p-8 h-full" hover={false}>
                                        <h3 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            Credit Protocol
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-5 rounded-2xl">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status</p>
                                                    <p className="text-lg font-black text-emerald-500">OPTIMAL</p>
                                                </div>
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span>Eligibility Strength</span>
                                                    <span>{financials.eligibilityScore}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 dark:bg-banana rounded-full" style={{ width: `${financials.eligibilityScore}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>

                                <motion.div variants={itemFadeIn}>
                                    <GlassCard className="p-8 h-full" hover={false}>
                                        <h3 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-banana" />
                                            Active Liabilities
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Outstanding</span>
                                                <span className="text-xl font-black text-red-500">{formatCurrency(financials.outstandingLoanBalance)}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground opacity-70 leading-relaxed uppercase tracking-widest">
                                                You have {financials.recentLoans?.filter(l => l.status === 'ACTIVE').length || 0} active borrowing cycles in progress.
                                            </p>
                                            <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black h-12 mt-2">
                                                View Repayment Plan
                                            </Button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            </div>
                        </TabsContent>

                        <TabsContent value="groups" className="mt-0 outline-none">
                            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {memberships.length > 0 ? (
                                    memberships.map((group) => (
                                        <motion.div key={group.id} variants={itemFadeIn}>
                                            <GlassCard className="p-6 relative group" hover={true}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-xl">
                                                        {group.name.charAt(0)}
                                                    </div>
                                                    <Badge variant="info">
                                                        {group.role}
                                                    </Badge>
                                                </div>
                                                <h4 className="text-xl font-black text-foreground truncate mb-1">{group.name}</h4>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{group.memberCount} Members</span>
                                                </div>
                                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                        Contribution
                                                    </div>
                                                    <div className="text-sm font-black text-blue-600 dark:text-banana">
                                                        {formatCurrency(group.monthlyContribution)}
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 opacity-40">
                                        <Users className="w-16 h-16 mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest">No active memberships found</p>
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0 outline-none">
                            <motion.div variants={fadeIn}>
                                <GlassCard className="p-0 overflow-hidden" hover={false}>
                                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                        <h3 className="font-black uppercase tracking-widest text-sm">Recent Ledger Events</h3>
                                        <History className="w-4 h-4 opacity-40" />
                                    </div>
                                    <div className="divide-y divide-white/10">
                                        {financials.recentContributions?.map((item, i) => (
                                            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
                                                        +
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black">Stake Deposit</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(item.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-emerald-500">+{formatCurrency(item.amount)}</p>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">COMPLETED</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    )
}

