'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, Search, Filter, Wallet, AlertCircle, ArrowRight, History, Zap, CreditCard, CheckCircle, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/empty-state'
import { Contribution, Group, Loan, LoanRepayment, GroupMember } from '@prisma/client'

type ContributionWithGroup = Contribution & { group: Group }
type LoanWithGroupAndRepayments = Loan & { group: Group, repayments: LoanRepayment[] }

interface EligibilityCheck {
    group: Group
    eligible: boolean
    contributionsCount: number
    totalContributions: number
    maxLoanAmount: number
    hasActiveLoan: boolean
    unpaidPenalties: number
}

interface VaultClientProps {
    contributions: ContributionWithGroup[]
    loans: LoanWithGroupAndRepayments[]
    userGroups: any[]
    eligibilityChecks: EligibilityCheck[]
    params: any
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

export function VaultClient({
    contributions,
    loans,
    userGroups,
    eligibilityChecks,
    params,
    pagination
}: VaultClientProps) {
    const langContext = useLanguage()
    const t = langContext.t
    const [activeTab, setActiveTab] = useState('savings')

    // Unified Stats calculation
    const totalSaved = contributions
        .filter(c => c.status === 'COMPLETED')
        .reduce((sum, c) => sum + Number(c.amount), 0)

    const activeDebt = loans
        .filter(l => l.status === 'ACTIVE')
        .reduce((sum, l) => {
            const approved = Number(l.amountApproved || l.amountRequested)
            const repaid = l.repayments.reduce((rSum, r) => rSum + Number(r.amount), 0)
            return sum + (approved - repaid)
        }, 0)

    const pendingReview = contributions.filter(c => c.status === 'PENDING').length +
        loans.filter(l => l.status === 'PENDING').length

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 pb-20"
        >
            {/* Hero Card - Vault Command Center */}
            <motion.div variants={itemFadeIn}>
                <div className="zen-card overflow-hidden">
                    {/* Top Identity Section */}
                    <div className="relative p-5 sm:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-tight mb-2">
                                        {t('common.vault')}
                                    </h1>
                                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed flex flex-wrap items-center gap-1.5 opacity-80">
                                        {t('vault.unified_community_hub')}
                                        <span className="text-blue-600 dark:text-banana font-bold">{t('vault.zen_edition_lifecycle')}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <Link href="/contributions/new">
                                    <Button variant="outline" className="rounded-xl font-black border-2 h-12">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('common.contributions')}
                                    </Button>
                                </Link>
                                {eligibilityChecks.some(c => c.eligible) && (
                                    <Link href="/loans/new">
                                        <Button variant="default" className="rounded-xl font-black shadow-lg shadow-blue-500/20 h-12">
                                            <Zap className="w-4 h-4 mr-2" />
                                            {t('common.loans')}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Divider */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-t border-white/10 bg-white/5 dark:bg-black/20">
                        <div className="p-5 sm:p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Wallet className="w-3 h-3" />
                                {t('vault.net_savings')}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-foreground">{formatCurrency(totalSaved)}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('vault.stakes', { count: contributions.filter(c => c.status === 'COMPLETED').length })}</p>
                        </div>
                        <div className="p-5 sm:p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <CreditCard className="w-3 h-3" />
                                {t('vault.active_liability')}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-banana">{formatCurrency(activeDebt)}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('vault.agreements', { count: loans.filter(l => l.status === 'ACTIVE').length })}</p>
                        </div>
                        <div className="p-5 sm:p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {t('vault.pending_review')}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-foreground">{pendingReview}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('vault.ledger_sync')}</p>
                        </div>
                        <div className="p-5 sm:p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" />
                                {t('vault.credit_strength')}
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-emerald-500">
                                {eligibilityChecks.filter(c => c.eligible).length > 0 ? t('vault.optimal') : t('vault.building')}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('vault.portfolio_health')}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <Tabs defaultValue="savings" onValueChange={setActiveTab} className="space-y-8">
                <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                    <TabsList className="bg-transparent p-0 h-auto gap-2 shrink-0">
                        <TabsTrigger
                            value="savings"
                            className="rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all border border-border/50 shadow-sm"
                        >
                            {t('vault.savings_ledger')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="credit"
                            className="rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all border border-border/50 shadow-sm"
                        >
                            {t('vault.credit_hub')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="savings" className="m-0 focus-visible:ring-0">
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-0 overflow-hidden border-none shadow-none bg-transparent" hover={false}>
                            {/* Reusing table logic from ContributionsClient but refined */}
                            <div className="zen-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-blue-600/5 dark:bg-white/5">
                                        <TableRow className="border-white/10 dark:border-white/5 h-16">
                                            <TableHead className="zen-label pl-8">Origin</TableHead>
                                            <TableHead className="zen-label text-right">Stake</TableHead>
                                            <TableHead className="zen-label text-center hidden md:table-cell">Period</TableHead>
                                            <TableHead className="zen-label text-right pr-8">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contributions.map((c, idx) => (
                                            <TableRow key={c.id} className="h-20 border-white/10 dark:border-white/5 hover:bg-blue-600/5 dark:hover:bg-white/5 transition-all">
                                                <TableCell className="pl-8 font-black text-foreground">{c.group.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-lg">{formatCurrency(Number(c.amount))}</span>
                                                        <span className="zen-label lowercase opacity-40">Contribution</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center hidden md:table-cell">
                                                    <span className="bg-blue-500/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-white/20 dark:border-white/5 font-black text-[10px] uppercase tracking-[0.2em] opacity-60">
                                                        {new Date(c.year, c.month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Badge variant={c.status === 'COMPLETED' ? 'success' : c.status === 'PENDING' ? 'warning' : 'error'}>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {pagination.totalPages > 1 && (
                                    <div className="p-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} records)
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.currentPage <= 1}
                                                className="rounded-xl h-10 px-4 font-bold border-white/10"
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(window.location.search)
                                                    newParams.set('page', (pagination.currentPage - 1).toString())
                                                    window.location.search = newParams.toString()
                                                }}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={pagination.currentPage >= pagination.totalPages}
                                                className="rounded-xl h-10 px-4 font-bold border-white/10"
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(window.location.search)
                                                    newParams.set('page', (pagination.currentPage + 1).toString())
                                                    window.location.search = newParams.toString()
                                                }}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </TabsContent>

                <TabsContent value="credit" className="m-0 focus-visible:ring-0 space-y-12">
                    {/* Eligibility Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eligibilityChecks.map((check) => (
                            <motion.div key={check.group.id} variants={itemFadeIn}>
                                <div className={cn("zen-card p-8 group h-full flex flex-col", check.eligible ? "border-banana/30 ring-4 ring-banana/5" : "opacity-60")}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner", check.eligible ? "bg-banana/20 text-yellow-600 dark:text-banana" : "bg-muted/20 text-muted-foreground")}>
                                            <Zap className="w-7 h-7" fill={check.eligible ? "currentColor" : "none"} />
                                        </div>
                                        <Badge variant={check.eligible ? 'success' : 'outline'} className="rounded-lg font-black text-[9px] tracking-widest uppercase">
                                            {check.eligible ? t('vault.verified') : t('vault.building')}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 mb-8">
                                        <h3 className="text-xl font-black tracking-tight">{check.group.name}</h3>
                                        <div className="zen-label lowercase opacity-60">
                                            {check.eligible ? t('vault.credit_line_active') : t('vault.protocol_requirement_pending')}
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-white/10 dark:border-white/5 mt-auto">
                                        {check.eligible ? (
                                            <Link href={`/loans/new?groupId=${check.group.id}`}>
                                                <Button className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white shadow-xl shadow-blue-500/10 transition-all hover:-translate-y-1">
                                                    {t('vault.deploy_capital')}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex justify-between zen-label">
                                                    <span>{t('vault.staking_protocol')}</span>
                                                    <span>{check.contributionsCount}/3 mo</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-muted-foreground/30 rounded-full" style={{ width: `${(check.contributionsCount / 3) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Loan History */}
                    <motion.div variants={itemFadeIn}>
                        <div className="zen-card overflow-hidden">
                            <div className="p-8 border-b border-white/10 dark:border-white/5 bg-blue-600/5 dark:bg-white/5 flex items-center justify-between">
                                <h2 className="text-lg font-black flex items-center gap-3">
                                    <History className="w-5 h-5 text-blue-600 dark:text-banana" />
                                    {t('vault.credit_ledger')}
                                </h2>
                                <Badge variant="outline" className="zen-label border-none">{t('vault.unified_history')}</Badge>
                            </div>
                            <Table>
                                <TableHeader className="bg-transparent">
                                    <TableRow className="border-white/10 dark:border-white/5 h-16">
                                        <TableHead className="zen-label pl-8">Fund</TableHead>
                                        <TableHead className="zen-label text-right">Value</TableHead>
                                        <TableHead className="zen-label text-right pr-8">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.map((l) => (
                                        <TableRow key={l.id} className="h-20 border-white/10 dark:border-white/5 hover:bg-blue-600/5 dark:hover:bg-white/5 transition-all">
                                            <TableCell className="pl-8 font-black text-foreground">{l.group.name}</TableCell>
                                            <TableCell className="text-right font-black text-lg">
                                                {formatCurrency(Number(l.amountApproved || l.amountRequested))}
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Badge variant={l.status === 'ACTIVE' ? 'success' : l.status === 'COMPLETED' ? 'info' : 'warning'}>
                                                    {l.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {loans.length === 0 && (
                                <div className="p-8">
                                    <EmptyState
                                        icon={History}
                                        title={t('vault.no_active_credit')}
                                        description={t('loans.no_loans_desc')}
                                        variant="compact"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
