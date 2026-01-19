'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, Search, Filter, Wallet, AlertCircle, ArrowRight, History, Zap, CreditCard, CheckCircle, TrendingUp, Clock, ChevronLeft, ChevronRight, X, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatsCard } from '@/components/ui/stats-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Contribution, Group, Loan, LoanRepayment, GroupMember } from '@prisma/client'
import { ContributionModal } from '@/components/contributions/ContributionModal'

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
    const [activeTab, setActiveTab] = useState('savings') // Keeping for safety, though unused in new layout? No, remove it.
    const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'OUTFLOW'>('ALL')
    const [searchTerm, setSearchTerm] = useState('')
    const [showStats, setShowStats] = useState(false)
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)

    // Check for shared receipt to auto-open modal
    useEffect(() => {
        if (params?.receiptUrl) {
            setIsContributionModalOpen(true)
        }
    }, [params])

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

    // Merge & Sort Logic
    const financialItems = [
        ...contributions.map(c => ({
            type: 'CONTRIBUTION' as const,
            id: c.id,
            amount: Number(c.amount),
            date: c.paymentDate ? new Date(c.paymentDate) : new Date(c.createdAt),
            status: c.status,
            groupName: c.group.name,
            original: c,
            timestamp: (c.paymentDate ? new Date(c.paymentDate) : new Date(c.createdAt)).getTime()
        })),
        ...loans.map(l => ({
            type: 'LOAN' as const,
            id: l.id,
            amount: Number(l.amountApproved || l.amountRequested),
            date: new Date(l.createdAt),
            status: l.status,
            groupName: l.group.name,
            original: l,
            timestamp: new Date(l.createdAt).getTime()
        }))
    ].sort((a, b) => b.timestamp - a.timestamp)

    const filteredItems = financialItems.filter(item => {
        // Search Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            if (!item.groupName.toLowerCase().includes(searchLower)) return false
        }

        // Type Filter
        if (filter === 'ALL') return true
        if (filter === 'INCOME') return item.type === 'CONTRIBUTION'
        if (filter === 'OUTFLOW') return item.type === 'LOAN'
        return true
    })

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4 sm:space-y-6 animate-fade-in"
        >
            {/* 1. Simplified Hero Section */}
            <motion.div variants={itemFadeIn}>
                <AnimatePresence mode="wait">
                    {showStats ? (
                        <motion.div
                            key="stats-visible"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="zen-card overflow-hidden"
                        >
                            <div className="relative p-3 sm:p-4 md:p-6 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">

                                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <button
                                        onClick={() => setShowStats(false)}
                                        className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-1 sm:mb-2 text-left break-words">
                                            {t('common.vault')}
                                            <span className="text-banana">.</span>
                                        </h1>
                                        <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl break-words">
                                            {t('vault.unified_community_hub')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                    {/* Net Savings */}
                                    <StatsCard
                                        variant="glass"
                                        label={t('vault.net_savings')}
                                        value={formatCurrency(totalSaved)}
                                        icon={Wallet}
                                        className="bg-white/40 dark:bg-slate-900/40"
                                    />

                                    {/* Active Debt */}
                                    <StatsCard
                                        variant="glass"
                                        label={t('vault.active_liability')}
                                        value={formatCurrency(activeDebt)}
                                        icon={CreditCard}
                                        className="bg-white/40 dark:bg-slate-900/40"
                                    // Override icon color logic inside component if needed or rely on default
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-3xl border border-white/20 backdrop-blur-md"
                        >
                            <div>
                                <h1 className="text-lg sm:text-xl font-black text-main tracking-tighter">
                                    {t('common.vault')}
                                    <span className="text-banana">.</span>
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowStats(true)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-emerald-600 dark:text-banana hover:scale-110 transition-all"
                            >
                                <LinkIcon className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 2. Unified Timeline & Controls */}
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 overflow-hidden" hover={false}>
                    {/* Controls Bar */}
                    <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5">
                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 sm:flex-initial min-w-0">
                            <div className="relative w-full sm:w-56">
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    // Mobile: text-base (16px) prevents iOS zoom. Tablet+: text-sm.
                                    className="w-full h-10 pl-9 pr-3 sm:pl-10 sm:pr-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border-none text-base sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500/50"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Search className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex items-center p-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                                {(['ALL', 'INCOME', 'OUTFLOW'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap snap-start",
                                            filter === f
                                                ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                        )}
                                    >
                                        {f === 'INCOME' ? t('common.contributions') : f === 'OUTFLOW' ? t('common.loans') : 'All History'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <div className="flex-1 sm:flex-none">
                                <Button
                                    onClick={() => setIsContributionModalOpen(true)}
                                    size="sm"
                                    variant="banana"
                                    className="w-full sm:w-auto min-h-[44px] h-11 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                                >
                                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wide">{t('common.contributions')}</span>
                                </Button>
                            </div>
                            <Link href="/loans/new" className="flex-1 sm:flex-none">
                                <Button size="sm" variant="outline" className="w-full sm:w-auto min-h-[44px] h-11 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold rounded-xl">
                                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wide">{t('common.loans')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="p-3 bg-slate-50/50 dark:bg-transparent min-h-[400px]">
                        <AnimatePresence mode='wait'>
                            {filteredItems.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredItems.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="group p-2.5 sm:p-3 md:p-4 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between gap-2 sm:gap-3 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 cursor-default"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                                                <div className={cn(
                                                    "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                                                    item.type === 'CONTRIBUTION'
                                                        ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                        : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-white/5 dark:border-white/10"
                                                )}>
                                                    {item.type === 'CONTRIBUTION' ? <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-0">
                                                        <p className="font-black text-[11px] sm:text-xs md:text-sm text-foreground truncate">
                                                            {item.groupName}
                                                        </p>
                                                        <span className={cn(
                                                            "hidden sm:inline-flex text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                                                            item.type === 'CONTRIBUTION' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                        )}>
                                                            {item.type === 'CONTRIBUTION' ? 'Deposit' : 'Loan'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shrink-0">
                                                            <Calendar className="w-3 h-3" />
                                                            {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        {item.status === 'PENDING' && (
                                                            <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 rounded-sm shrink-0">
                                                                Pending
                                                            </span>
                                                        )}
                                                        {/* Mobile Type Badge (Only shown on small screens) */}
                                                        <span className={cn(
                                                            "sm:hidden text-[9px] font-black px-1.5 py-0 rounded-full uppercase tracking-wider shrink-0",
                                                            item.type === 'CONTRIBUTION' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                        )}>
                                                            {item.type === 'CONTRIBUTION' ? 'Dep' : 'Loan'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className={cn(
                                                    "text-xs sm:text-sm md:text-lg font-black tracking-tight",
                                                    item.type === 'CONTRIBUTION' ? "text-main" : "text-slate-500"
                                                )}>
                                                    {item.type === 'CONTRIBUTION' ? '+' : ''} {formatCurrency(item.amount)}
                                                </p>
                                                <Badge className={cn(
                                                    "text-[8px] sm:text-[9px] px-1 sm:px-1.5 md:px-2 py-0 border-0 mt-0.5 sm:mt-1",
                                                    item.status === 'COMPLETED' || item.status === 'ACTIVE'
                                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                        : item.status === 'PENDING'
                                                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                                                            : "bg-red-100 dark:bg-red-900/30 text-red-600"
                                                )}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={History}
                                    title={t('vault.no_records')}
                                    description={t('vault.no_records_desc') || "No contributions or loans found matching your criteria."}
                                    variant="default"
                                />
                            )}
                        </AnimatePresence>
                    </div>


                    {/* Pagination (Kept from existing) */}
                    {pagination.totalPages > 1 && (
                        <div className="p-3 sm:p-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-1.5 sm:gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.currentPage <= 1}
                                    className="rounded-xl h-9 px-3 sm:px-4 font-bold border-white/10 text-xs"
                                    onClick={() => {
                                        const newParams = new URLSearchParams(window.location.search)
                                        newParams.set('page', (pagination.currentPage - 1).toString())
                                        window.location.search = newParams.toString()
                                    }}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">Prev</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    className="rounded-xl h-9 px-3 sm:px-4 font-bold border-white/10 text-xs"
                                    onClick={() => {
                                        const newParams = new URLSearchParams(window.location.search)
                                        newParams.set('page', (pagination.currentPage + 1).toString())
                                        window.location.search = newParams.toString()
                                    }}
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="sm:hidden">Nxt</span>
                                    <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </motion.div >
    )
}
