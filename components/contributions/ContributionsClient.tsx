'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, Search, Filter, Wallet, AlertCircle, ArrowRight, History } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/stats-card'
import { Contribution, Group, GroupMember } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/empty-state'

type ContributionWithGroup = Contribution & { group: Group }
type GroupMemberWithGroup = GroupMember & { group: Group }

interface ContributionsClientProps {
    contributions: ContributionWithGroup[]
    userGroups: GroupMemberWithGroup[]
    params: {
        status?: string
        groupId?: string
        month?: string
        year?: string
        search?: string
    }
}

export function ContributionsClient({ contributions, userGroups, params }: ContributionsClientProps) {
    const { t } = useLanguage()

    // Calculate stats
    const completedContributions = contributions.filter(c => c.status === 'COMPLETED')
    const pendingContributions = contributions.filter(c => c.status === 'PENDING')
    const totalContributed = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0)

    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentMonthContributions = contributions.filter(
        c => c.month === currentMonth && c.year === currentYear
    )

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8 sm:space-y-12 pb-20"
        >
            {/* Header */}
            <motion.div variants={fadeIn}>
                <PageHeader
                    title={t('contributions.title')}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            {t('contributions.subtitle')}
                            <span className="text-blue-600 dark:text-banana font-bold">Secure ledger of all your community savings.</span>
                        </span>
                    }
                    action={
                        userGroups.length > 0 && (
                            <Link href="/contributions/new">
                                <Button variant="default" size="xl" className="shadow-blue-500/20 px-8 group">
                                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                    {t('contributions.make_contribution')}
                                </Button>
                            </Link>
                        )
                    }
                />
            </motion.div>

            {/* Penalty & Contribution Alerts */}
            <div className="space-y-4">
                {userGroups.some(g => g.unpaidPenalties > 0) && (
                    <motion.div variants={fadeIn} className="space-y-4">
                        {userGroups.filter(g => g.unpaidPenalties > 0).map((membership) => (
                            <GlassCard key={membership.groupId} className="border-red-500/20 bg-red-500/5 p-6" hover={false}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-red-600 uppercase tracking-widest text-xs mb-1">Outstanding Penalty</h4>
                                        <p className="font-bold text-foreground">
                                            You have an unpaid penalty of <span className="text-red-600">{formatCurrency(membership.unpaidPenalties)}</span> in <span className="font-black">{membership.group.name}</span>.
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium mt-1">Please settle this along with your next contribution to maintain a healthy stakeholder standing.</p>
                                    </div>
                                    <Link href={`/contributions/new?groupId=${membership.groupId}`} className="w-full sm:w-auto">
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold border-red-500/20 hover:bg-red-500/10 text-red-600">
                                            Settle Now
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        ))}
                    </motion.div>
                )}

                {userGroups.length > 0 && currentMonthContributions.length === 0 && (
                    <motion.div variants={fadeIn}>
                        <GlassCard className="border-blue-500/20 bg-blue-500/5 p-6" hover={false}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs mb-1">Contribution Reminder</h4>
                                    <p className="font-bold text-foreground">
                                        You haven&apos;t recorded a contribution for <span className="text-blue-600">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>.
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Keep your streak alive and help your community grow by making your contribution today.</p>
                                </div>
                                <Link href="/contributions/new" className="w-full sm:w-auto">
                                    <Button variant="banana" size="sm" className="w-full sm:w-auto rounded-xl font-bold">
                                        Record Stake
                                    </Button>
                                </Link>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar">
                <StatsCard
                    index={1}
                    label={t('contributions.total_contributed')}
                    value={formatCurrency(totalContributed)}
                    description={`${completedContributions.length} verified proof of stakes`}
                    icon={Wallet}
                    variant="featured"
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={2}
                    label={t('contributions.pending')}
                    value={pendingContributions.length}
                    description={t('contributions.awaiting_approval')}
                    icon={AlertCircle}
                    trend={pendingContributions.length > 0 ? {
                        value: 'Awaiting Admin Action',
                        positive: false,
                        icon: AlertCircle
                    } : undefined}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={3}
                    label={t('contributions.this_month')}
                    value={currentMonthContributions.length > 0 ? 'Active' : 'Pending'}
                    description={currentYear.toString()}
                    icon={Calendar}
                    variant="gradient"
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-800 shadow-blue-500/10"
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                {/* Performance Card */}
                <StatsCard
                    index={4}
                    label="Active Group Share"
                    value={userGroups.length}
                    description="Portfolio diversity"
                    icon={History}
                    className="shrink-0 w-[280px] sm:w-auto"
                />
            </div>

            {/* Filters & Content */}
            <div className="space-y-8">
                {/* Filters Bar */}
                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-1 px-1 border-white/20 dark:border-white/5 shadow-2xl overflow-visible" hover={false}>
                        <div className="flex flex-col lg:flex-row gap-2 p-2 relative z-50">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 opacity-50" />
                                <Input
                                    placeholder={t('contributions.search_placeholder')}
                                    className="pl-12 rounded-2xl bg-white/40 dark:bg-slate-900/40 border-none focus-visible:ring-blue-500/30 h-14 font-bold placeholder:font-medium placeholder:opacity-50 shadow-inner"
                                    defaultValue={params.search || ''}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full lg:w-auto lg:flex lg:flex-row">
                                <Select defaultValue={params.status || 'all'}>
                                    <SelectTrigger className="rounded-[1.2rem] w-full lg:w-[160px] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-black text-xs uppercase tracking-widest shadow-inner px-5">
                                        <SelectValue placeholder={t('contributions.all_statuses')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/10 dark:bg-slate-950/90 backdrop-blur-xl">
                                        <SelectItem value="all" className="font-bold">{t('contributions.all_statuses')}</SelectItem>
                                        <SelectItem value="PENDING" className="font-bold">Pending</SelectItem>
                                        <SelectItem value="COMPLETED" className="font-bold">Completed</SelectItem>
                                        <SelectItem value="REJECTED" className="font-bold text-red-500">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select defaultValue={params.groupId || 'all'}>
                                    <SelectTrigger className="rounded-[1.2rem] w-full lg:w-[200px] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-black text-xs uppercase tracking-widest shadow-inner px-5">
                                        <SelectValue placeholder={t('contributions.all_groups')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-white/10 dark:bg-slate-950/90 backdrop-blur-xl">
                                        <SelectItem value="all" className="font-bold">{t('contributions.all_groups')}</SelectItem>
                                        {userGroups.map((groupMember) => (
                                            <SelectItem key={groupMember.groupId} value={groupMember.groupId} className="font-bold">
                                                {groupMember.group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" size="icon" className="rounded-[1.2rem] shrink-0 h-14 w-full lg:w-14 bg-white/40 dark:bg-slate-900/40 border-none shadow-inner hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white group transition-all" title="Clear Filters">
                                    <Filter className="w-5 h-5 text-muted-foreground group-hover:rotate-180 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Table Section */}
                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden" hover={false}>
                        {contributions.length > 0 ? (
                            <div className="overflow-x-auto overflow-y-visible">
                                <Table className="relative pb-24">
                                    <TableHeader className="bg-blue-600/5 dark:bg-white/5">
                                        <TableRow className="hover:bg-transparent border-white/10 dark:border-white/5 h-16">
                                            <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] pl-8">Transaction Origin</TableHead>
                                            <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] text-right">Settled Amount</TableHead>
                                            <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] hidden md:table-cell px-8 text-center">Date & Time</TableHead>
                                            <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] hidden sm:table-cell px-8 text-center">Protocol Period</TableHead>
                                            <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] text-right pr-8">Ledger Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {contributions.map((contribution, idx) => (
                                                <motion.tr
                                                    key={contribution.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-blue-600/5 dark:hover:bg-white/5 transition-all border-white/10 dark:border-white/5 group h-20"
                                                >
                                                    <TableCell className="pl-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-700/5 flex items-center justify-center text-xs font-black text-blue-700 dark:text-blue-300 shadow-sm border border-blue-500/10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                                                {contribution.group.name.substring(0, 1).toUpperCase()}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="font-black text-base text-foreground tracking-tight">{contribution.group.name}</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest sm:hidden">
                                                                    {new Date(contribution.year, contribution.month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="inline-flex flex-col items-end">
                                                            <span className="font-black text-lg text-foreground tracking-tight">
                                                                {formatCurrency(Number(contribution.amount))}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                {contribution.isLate && (
                                                                    <Badge variant="error" className="text-[8px] h-4 px-1.2 py-0 font-black uppercase tracking-tighter animate-pulse flex items-center justify-center">LATE</Badge>
                                                                )}
                                                                <span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-tighter">Verified Stake</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-center px-8">
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="text-sm font-black text-foreground">
                                                                {new Date((contribution as any).paymentDate || (contribution as any).createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                                                                {new Date((contribution as any).paymentDate || (contribution as any).createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell text-center px-8">
                                                        <span className="text-sm font-black text-foreground bg-blue-500/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-white/20 dark:border-white/5">
                                                            {new Date(contribution.year, contribution.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Badge variant={
                                                            contribution.status === 'COMPLETED'
                                                                ? 'success'
                                                                : contribution.status === 'PENDING'
                                                                    ? 'warning'
                                                                    : 'error'
                                                        }>
                                                            {contribution.status}
                                                        </Badge>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-12">
                                <EmptyState
                                    icon={History}
                                    title={t('contributions.no_contributions')}
                                    description={t('contributions.no_contributions_desc')}
                                    action={
                                        userGroups.length > 0 ? (
                                            <Link href="/contributions/new">
                                                <Button variant="default" size="xl" className="px-12 group h-auto py-7">
                                                    <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
                                                    {t('contributions.first_contribution')}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/groups/new">
                                                <Button variant="outline" className="rounded-2xl font-black border-2 border-dashed border-blue-500/20 h-16 w-full hover:border-blue-500/40 hover:bg-blue-500/5 transition-all">
                                                    {t('contributions.join_first')}
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </Link>
                                        )
                                    }
                                />
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    )
}
