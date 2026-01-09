'use client'

import { useState } from 'react'
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
    ArrowLeft,
    AtSign,
    Edit2,
    Check,
    X as XIcon,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { StatsCard } from '@/components/ui/stats-card'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
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
    ubankTag: string | null
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
    const [isEditingTag, setIsEditingTag] = useState(false)
    const [tagValue, setTagValue] = useState(profile.ubankTag || '')
    const [isSavingTag, setIsSavingTag] = useState(false)

    const handleSaveTag = async () => {
        if (!tagValue) return

        setIsSavingTag(true)
        try {
            const res = await fetch('/api/user/tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag: tagValue }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Failed to update tag')
                return
            }

            toast.success('uBank Tag updated successfully')
            setIsEditingTag(false)
            // Ideally we'd update the local profile state here or trigger a revalidate
            profile.ubankTag = data.tag
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsSavingTag(false)
        }
    }

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
                            <Button variant="default" className="px-6 group">
                                <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                {t('profile.edit_profile')}
                            </Button>
                        </Link>
                    }
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                {/* Left Column: Identity & Milestoness */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div variants={itemFadeIn}>
                        <div className="zen-card p-0 overflow-hidden border-none shadow-none">
                            {/* Banner - Zen Style */}
                            <div className="h-40 bg-gradient-to-br from-blue-900 via-slate-900 to-black relative">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent)]" />
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
                            </div>

                            <CardContent className="relative pt-0 px-8 pb-10">
                                {/* Avatar - Floating Zen */}
                                <div className="flex justify-center -mt-20 mb-8">
                                    <div className="p-2 rounded-[3rem] bg-background/80 backdrop-blur-3xl shadow-2xl border border-white/20">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 dark:from-banana dark:via-yellow-400 dark:to-yellow-600 flex items-center justify-center text-white dark:text-blue-950 text-5xl font-black shadow-inner">
                                            {(profile?.firstName?.charAt(0) || '') + (profile?.lastName?.charAt(0) || '')}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-2">
                                            {profile?.firstName}
                                        </h2>

                                        {/* uBank Tag Section */}
                                        <div className="flex items-center justify-center gap-2 mb-4 h-8">
                                            {isEditingTag ? (
                                                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                                    <div className="relative">
                                                        <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                        <Input
                                                            value={tagValue}
                                                            onChange={(e) => setTagValue(e.target.value)}
                                                            className="h-8 w-40 pl-8 text-xs font-bold bg-white/10 border-white/10"
                                                            placeholder="your.handle"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full"
                                                        onClick={handleSaveTag}
                                                        disabled={isSavingTag}
                                                    >
                                                        {isSavingTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-full hover:bg-white/10"
                                                        onClick={() => {
                                                            setIsEditingTag(false)
                                                            setTagValue(profile.ubankTag || '')
                                                        }}
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer"
                                                    onClick={() => setIsEditingTag(true)}
                                                >
                                                    <AtSign className="w-3.5 h-3.5 text-blue-500 dark:text-banana opacity-70" />
                                                    <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                                        {profile.ubankTag || 'Claim your tag'}
                                                    </span>
                                                    <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity ml-1" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <Badge variant="info" className="rounded-lg font-black text-[9px] tracking-widest uppercase px-3 py-1">
                                                {profile?.role?.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant="success" className="rounded-lg font-black text-[9px] tracking-widest uppercase px-3 py-1">
                                                Verified Node
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10 dark:border-white/5">
                                        {[
                                            { icon: Mail, label: 'Auth Token', value: profile?.email },
                                            { icon: MapPin, label: 'Home Sector', value: profile?.region || 'Central Domain' },
                                            { icon: Calendar, label: 'Origin Point', value: profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '---' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                <div className="p-3 rounded-2xl bg-blue-600/5 dark:bg-white/5 text-blue-600 dark:text-banana group-hover/item:scale-110 transition-transform">
                                                    <item.icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="zen-label lowercase opacity-40">{item.label}</p>
                                                    <p className="text-sm font-black text-foreground truncate">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </motion.div>

                    {/* Milestone Card */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 border-none bg-gradient-to-br from-blue-700/10 to-transparent" hover={true}>
                            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4 text-banana" />
                                {t('profile.investor_tier')}
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
                            variant="featured"
                            icon={Wallet}
                            label="Net Capital"
                            value={formatCurrency(financials?.totalContributions || 0)}
                            description="Real-time ledger sync"
                            className="shrink-0 w-[280px] sm:w-auto"
                        />
                        <StatsCard
                            index={2}
                            variant="glass"
                            icon={TrendingUp}
                            label="Reliability Rating"
                            value={`${financials?.eligibilityScore}%`}
                            description="Trust optimized profile"
                            className="shrink-0 w-[280px] sm:w-auto"
                        />
                    </div>

                    <Tabs defaultValue="overview" className="space-y-8">
                        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                            <TabsList className="bg-transparent p-0 h-auto gap-2 shrink-0">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white transition-all border border-border/50 shadow-sm"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="groups"
                                    className="rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white transition-all border border-border/50 shadow-sm"
                                >
                                    Nodes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white transition-all border border-border/50 shadow-sm"
                                >
                                    Ledger
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-6 mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div variants={itemFadeIn}>
                                    <div className="zen-card p-8 h-full">
                                        <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-blue-600 dark:text-banana" />
                                            Credit Matrix
                                        </h3>
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center bg-blue-600/5 dark:bg-white/5 p-6 rounded-2xl shadow-inner border border-white/10">
                                                <div>
                                                    <p className="zen-label lowercase opacity-40">Standing</p>
                                                    <p className="text-xl font-black text-emerald-500">EXCELLENT</p>
                                                </div>
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between zen-label">
                                                    <span>Protocol Compliance</span>
                                                    <span>{financials.eligibilityScore}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${financials.eligibilityScore}%` }}
                                                        className="h-full bg-blue-600 dark:bg-banana rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemFadeIn}>
                                    <div className="zen-card p-8 h-full flex flex-col">
                                        <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-3">
                                            <Zap className="w-5 h-5 text-banana" />
                                            Liabilities
                                        </h3>
                                        <div className="space-y-6 flex-1">
                                            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center shadow-inner">
                                                <div>
                                                    <p className="zen-label lowercase text-red-500 italic">Net Due</p>
                                                    <span className="text-2xl font-black text-red-500">{formatCurrency(financials.outstandingLoanBalance)}</span>
                                                </div>
                                            </div>
                                            <p className="zen-label lowercase opacity-40 leading-relaxed pt-2">
                                                {financials.recentLoans?.filter(l => l.status === 'ACTIVE').length || 0} active borrowing cycles in deployment.
                                            </p>
                                            <div className="mt-auto pt-6">
                                                <Link href="/vault" className="block">
                                                    <Button className="w-full h-14 rounded-2xl font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95">
                                                        Manage Agreements
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </TabsContent>

                        <TabsContent value="groups" className="mt-0 outline-none">
                            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {memberships.length > 0 ? (
                                    memberships.map((group) => (
                                        <motion.div key={group.id} variants={itemFadeIn}>
                                            <div className="zen-card p-8 group hover:border-blue-500/30 transition-all cursor-pointer">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/5 flex items-center justify-center text-blue-600 dark:text-banana font-black text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                                        {group.name.charAt(0)}
                                                    </div>
                                                    <Badge variant="outline" className="zen-label border-none">
                                                        {group.role}
                                                    </Badge>
                                                </div>
                                                <h4 className="text-2xl font-black text-foreground truncate mb-2">{group.name}</h4>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-8">
                                                    <Users className="w-4 h-4 opacity-40" />
                                                    <span className="zen-label lowercase">{group.memberCount} active nodes</span>
                                                </div>
                                                <div className="pt-8 border-t border-white/10 dark:border-white/5 flex justify-between items-center">
                                                    <div className="zen-label lowercase opacity-40">Monthly Stake</div>
                                                    <div className="text-lg font-black text-blue-600 dark:text-banana">
                                                        {formatCurrency(group.monthlyContribution)}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-2 p-8">
                                        <EmptyState
                                            icon={Users}
                                            title="No Active Circles"
                                            description="You haven't joined any groups yet. Start your journey by joining or creating a community circle."
                                            variant="compact"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0 outline-none">
                            <motion.div variants={fadeIn}>
                                <div className="zen-card overflow-hidden">
                                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-blue-600/5 dark:bg-white/5">
                                        <h3 className="text-lg font-black flex items-center gap-3">
                                            <History className="w-5 h-5 text-blue-600 dark:text-banana" />
                                            Ledger Events
                                        </h3>
                                        <Badge variant="outline" className="zen-label border-none uppercase">Immutable Record</Badge>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {financials.recentContributions?.map((item, i) => (
                                            <div key={i} className="p-8 flex items-center justify-between hover:bg-blue-600/5 dark:hover:bg-white/5 transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl shadow-inner">
                                                        +
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black leading-none mb-1">Capital Stake</p>
                                                        <p className="zen-label lowercase opacity-40">{new Date(item.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-emerald-500">+{formatCurrency(item.amount)}</p>
                                                    <p className="zen-label lowercase text-emerald-500/60 font-black">Success</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {(!financials.recentContributions || financials.recentContributions.length === 0) && (
                                        <div className="p-12">
                                            <EmptyState
                                                icon={History}
                                                title="Empty Ledger"
                                                description="No recent ledger entries have been recorded in the unified history."
                                                variant="compact"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    )
}

