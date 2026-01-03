'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CreditCard, AlertCircle, Wallet, CheckCircle, Clock, ArrowRight, History, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/stats-card'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/empty-state'
import { Loan, Group, LoanRepayment } from '@prisma/client'

type LoanWithGroupAndRepayments = Loan & {
    group: Group;
    repayments: LoanRepayment[]
}

interface EligibilityCheck {
    group: Group
    eligible: boolean
    contributionsCount: number
    totalContributions: number
    maxLoanAmount: number
    hasActiveLoan: boolean
}

interface LoansClientProps {
    loans: LoanWithGroupAndRepayments[]
    eligibilityChecks: EligibilityCheck[]
}

export function LoansClient({ loans, eligibilityChecks }: LoansClientProps) {
    const { t } = useLanguage()

    // Calculate loan stats
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const pendingLoans = loans.filter(l => l.status === 'PENDING')

    const totalBorrowed = loans
        .filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
        .reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0)

    const totalRepaid = loans
        .filter(l => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.repayments.reduce((repSum, rep) => repSum + Number(rep.amount), 0), 0)

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
                    title={t('loans.title')}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            {t('loans.subtitle')}
                            <span className="text-blue-600 dark:text-banana font-bold">Access community-backed credit instantly.</span>
                        </span>
                    }
                    action={eligibilityChecks.some(check => check.eligible) && (
                        <Link href="/loans/new">
                            <Button variant="banana" size="xl" className="shadow-yellow-500/20 px-8 group">
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                {t('loans.request_loan')}
                            </Button>
                        </Link>
                    )}
                />
            </motion.div>

            {/* Stats Grid */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar">
                <StatsCard
                    index={1}
                    label={t('loans.active_loans')}
                    value={activeLoans.length}
                    description={`${formatCurrency(activeLoans.reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0))} active liability`}
                    icon={Wallet}
                    variant="gradient"
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-800 shadow-blue-500/10"
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={2}
                    label={t('loans.pending_approval')}
                    value={pendingLoans.length}
                    description="Applications under review"
                    icon={Clock}
                    trend={pendingLoans.length > 0 ? {
                        value: 'Analysis Stage',
                        positive: true,
                        icon: Clock
                    } : undefined}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={3}
                    label={t('loans.total_borrowed')}
                    value={formatCurrency(totalBorrowed)}
                    description="Lifetime credit volume"
                    icon={CreditCard}
                    variant="featured"
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={4}
                    label={t('loans.total_repaid')}
                    value={formatCurrency(totalRepaid)}
                    description="Trust score capital"
                    icon={CheckCircle}
                    className="shrink-0 w-[280px] sm:w-auto"
                />
            </div>

            {/* Eligibility Offers Section */}
            <div className="space-y-6">
                <motion.h2 variants={fadeIn} className="text-2xl font-black text-foreground px-1 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-banana animate-pulse" fill="currentColor" />
                    {t('loans.eligibility_title')}
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eligibilityChecks.map((check) => (
                        <motion.div key={check.group.id} variants={itemFadeIn}>
                            <GlassCard
                                className={cn(
                                    "p-0 border-none overflow-hidden h-full flex flex-col",
                                    check.eligible ? "ring-2 ring-banana/30" : ""
                                )}
                                hover={check.eligible}
                            >
                                {check.eligible && (
                                    <div className="bg-gradient-to-r from-banana to-yellow-500 h-1.5" />
                                )}
                                <div className="p-6 flex flex-col h-full bg-white/40 dark:bg-slate-900/40">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                            check.eligible ? "bg-banana/20 text-yellow-600 dark:text-banana" : "bg-white/50 dark:bg-slate-800/50 text-muted-foreground opacity-50"
                                        )}>
                                            {check.eligible ? <Zap className="w-6 h-6" fill="currentColor" /> : <AlertCircle className="w-6 h-6" />}
                                        </div>
                                        {check.eligible && (
                                            <Badge variant="info">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-8">
                                        <h3 className="text-xl font-black text-foreground tracking-tight leading-tight">{check.group.name}</h3>
                                        <p className="text-sm font-bold text-muted-foreground opacity-70 leading-relaxed">
                                            {check.eligible
                                                ? <span>Unlock up to <span className="text-foreground font-black">{formatCurrency(check.maxLoanAmount)}</span> leveraging your <span className="text-blue-600 dark:text-banana font-black">{check.group.maxLoanMultiplier}x</span> stake.</span>
                                                : `Reach 3 consecutive contributions to unlock credit line.`}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/20 dark:border-white/5">
                                        {check.eligible ? (
                                            <Link href={`/loans/new?groupId=${check.group.id}`} className="block">
                                                <Button className="w-full rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white dark:bg-banana dark:hover:bg-yellow-400 dark:text-blue-950 shadow-xl shadow-blue-500/10 dark:shadow-yellow-500/5 h-12 group/btn transition-all">
                                                    Deploy Capital
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-50">
                                                    <span>Staking Protocol</span>
                                                    <span>{check.contributionsCount}/3 mo</span>
                                                </div>
                                                <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden shadow-inner p-0.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((check.contributionsCount / 3) * 100, 100)}%` }}
                                                        className="bg-muted-foreground/30 h-full rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Loan History Table */}
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 border-white/20 dark:border-white/5 shadow-2xl overflow-hidden mt-8" hover={false}>
                    <div className="p-6 border-b border-white/10 dark:border-white/5 bg-blue-600/5 dark:bg-white/5">
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-600 dark:text-banana" />
                            Credit Ledger
                        </h2>
                    </div>
                    {loans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table className="relative">
                                <TableHeader className="bg-transparent">
                                    <TableRow className="hover:bg-transparent border-white/10 dark:border-white/5 h-14">
                                        <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] pl-8">Fund Origin</TableHead>
                                        <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] text-right">Approval Value</TableHead>
                                        <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] text-right px-8">Agreement Status</TableHead>
                                        <TableHead className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] text-right pr-8">Signed Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {loans.map((loan, idx) => (
                                            <motion.tr
                                                key={loan.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-blue-600/5 dark:hover:bg-white/5 transition-all border-white/10 dark:border-white/5 group h-20"
                                            >
                                                <TableCell className="pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-700/5 flex items-center justify-center text-[10px] font-black text-blue-700 dark:text-blue-300 shadow-sm border border-blue-500/10 group-hover:scale-110 transition-transform">
                                                            {loan.group.name.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <span className="font-black text-foreground tracking-tight">{loan.group.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="bg-blue-600/5 dark:bg-white/5 text-foreground px-3 py-1.5 rounded-xl font-black text-sm border border-white/20 dark:border-white/5">
                                                        {formatCurrency(Number(loan.amountApproved || loan.amountRequested))}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Badge variant={
                                                        loan.status === 'ACTIVE'
                                                            ? 'success'
                                                            : loan.status === 'COMPLETED'
                                                                ? 'info'
                                                                : 'warning'
                                                    }>
                                                        {loan.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8 text-xs font-black text-muted-foreground opacity-60 tracking-widest">
                                                    {formatDate(loan.createdAt)}
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
                                icon={CreditCard}
                                title={t('loans.no_loans')}
                                description={t('loans.no_loans_desc')}
                                action={
                                    eligibilityChecks.some(check => check.eligible) ? (
                                        <Link href="/loans/new">
                                            <Button variant="banana" size="xl" className="shadow-yellow-500/20 px-10 group h-auto py-7">
                                                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                                                {t('loans.apply_first')}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/contributions">
                                            <Button variant="outline" className="rounded-2xl font-black border-2 border-dashed border-blue-500/20 h-16 w-full hover:border-blue-500/40 hover:bg-blue-500/5 transition-all">
                                                {t('loans.make_contributions_first')}
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
        </motion.div>
    )
}
