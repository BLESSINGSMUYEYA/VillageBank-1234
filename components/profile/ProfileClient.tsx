'use client'

import { useState } from 'react'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
    Mail,
    MapPin,
    Calendar,
    TrendingUp,
    Award,
    Settings,
    Wallet,
    Shield,
    CheckCircle2,
    ArrowLeft,
    AtSign,
    Edit2,
    Check,
    X as XIcon,
    Loader2,
    Users,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { StatsCard } from '@/components/ui/stats-card'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/empty-state'

interface ProfileData {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    phoneNumber: string | null
    role: string
    region: string | null
    ubankId: string | null
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
            className="space-y-6 sm:space-y-8 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={fadeIn}>
                <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-2">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    {t('common.back')}
                </Link>
                <PageHeader
                    title={t('profile.title')}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-banana" />
                            {t('profile.subtitle')}
                        </span>
                    }
                    action={
                        <Link href="/settings">
                            <Button variant="outline" size="sm" className="px-4 h-9 group text-xs border-blue-200 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-white/10">
                                <Settings className="w-3.5 h-3.5 mr-2 group-hover:rotate-90 transition-transform text-muted-foreground" />
                                {t('profile.edit_profile')}
                            </Button>
                        </Link>
                    }
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Identity & Milestoness */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Identity Glass Card */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-0 overflow-hidden border-none shadow-xl shadow-blue-900/5 dark:shadow-none" hover={false}>
                            {/* Modern Neutral Banner */}
                            <div className="h-32 bg-gradient-to-b from-zinc-500/5 to-transparent dark:from-white/5 relative overflow-hidden">
                                {/* Subtle pattern or noise could go here, but keeping it clean for now */}
                            </div>

                            <CardContent className="relative pt-0 px-6 pb-8">
                                {/* Floating Avatar */}
                                <div className="flex justify-center -mt-16 mb-4 relative z-10">
                                    <div className="p-1.5 rounded-[2rem] bg-white dark:bg-slate-950 shadow-2xl">
                                        <div className="w-28 h-28 rounded-[1.6rem] bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-blue-800 flex items-center justify-center text-white text-4xl font-black shadow-inner border border-white/10">
                                            {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">
                                            {profile?.firstName} {profile?.lastName}
                                        </h2>

                                        {/* Verified uBank ID */}
                                        <div className="flex items-center justify-center h-8">
                                            <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                                                <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-0 px-1.5 py-0 h-5">
                                                    ID
                                                </Badge>
                                                <span className="text-xs font-bold text-foreground tracking-wide font-mono">
                                                    {profile.ubankId || '---'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                            <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                                                {profile?.role?.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Attributes List */}
                                    <div className="space-y-4 pt-6 border-t border-dashed border-border/40">
                                        {[
                                            { icon: Mail, label: 'Email', value: profile?.email },
                                            { icon: MapPin, label: 'Sector', value: profile?.region || 'Central Domain' },
                                            { icon: Calendar, label: 'Member Since', value: profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '---' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-muted-foreground group-hover/item:text-foreground group-hover/item:bg-slate-100 dark:group-hover/item:bg-white/10 transition-colors shrink-0">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">{item.label}</p>
                                                    <p className="text-xs font-bold text-foreground truncate">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </GlassCard>
                    </motion.div>

                    {/* Milestone / Tier Card */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden" hover={true}>
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Award className="w-24 h-24" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white/60">
                                <Award className="w-4 h-4 text-banana" />
                                {t('profile.investor_tier')}
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black tracking-tighter text-banana">Diamond</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Top 5%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '75%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-banana h-full rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                                    />
                                </div>
                                <p className="text-[10px] font-medium opacity-60 leading-relaxed max-w-[90%]">
                                    You are unlocking premium credit tiers. Maintain your streak to access lower rates.
                                </p>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Right Column: Status & Registry */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Snapshot - Linked to Vault */}
                    <motion.div variants={itemFadeIn}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/vault" className="block">
                                <StatsCard
                                    index={1}
                                    variant="featured"
                                    icon={Wallet}
                                    label="Net Capital"
                                    value={formatCurrency(financials?.totalContributions || 0)}
                                    description="Manage in Vault"
                                    className="h-full hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors"
                                />
                            </Link>
                            <Link href="/vault" className="block">
                                <StatsCard
                                    index={2}
                                    variant="glass"
                                    icon={Shield}
                                    label="Trust Score"
                                    value={`${financials?.eligibilityScore}%`}
                                    description="Credit Health: Excellent" // Mocked based on score being high
                                    className="h-full hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors"
                                />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Membership Registry List */}
                    <motion.div variants={itemFadeIn} className="flex-1">
                        <GlassCard className="p-0 overflow-hidden min-h-[400px]" hover={false}>
                            <div className="p-6 border-b border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-600 dark:text-banana" />
                                        Membership Registry
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60 mt-1">
                                        {memberships.length} Active Nodes
                                    </p>
                                </div>
                                <Link href="/groups/new">
                                    <Button size="sm" variant="ghost" className="text-[10px] uppercase font-black text-blue-600 dark:text-banana hover:bg-blue-50 dark:hover:bg-white/10">
                                        + New Group
                                    </Button>
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {memberships.length > 0 ? (
                                    memberships.map((group) => (
                                        <div key={group.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xl shadow-sm border border-blue-500/10 group-hover:scale-105 transition-transform">
                                                    {group.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-foreground mb-1">{group.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-200 dark:border-white/10 text-muted-foreground font-bold uppercase tracking-wider">
                                                            {group.role}
                                                        </Badge>
                                                        <span className="text-[9px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 rounded-sm">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="hidden sm:block text-right">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider opacity-50 mb-0.5">Monthly Stake</p>
                                                    <p className="text-sm font-black text-foreground">{formatCurrency(group.monthlyContribution)}</p>
                                                </div>
                                                <Link href={`/groups/${group.id}`}>
                                                    <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10">
                                        <EmptyState
                                            icon={Users}
                                            title="No Memberships"
                                            description="You are not part of any village banking circles yet."
                                            variant="compact"
                                            action={
                                                <Link href="/groups/new">
                                                    <Button variant="outline" className="mt-4">Find a Group</Button>
                                                </Link>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

