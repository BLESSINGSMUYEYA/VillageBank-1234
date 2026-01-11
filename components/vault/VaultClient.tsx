'use client'

import { useState } from 'react'
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
    const [activeTab, setActiveTab] = useState('savings') // Keeping for safety, though unused in new layout? No, remove it.
    const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'OUTFLOW'>('ALL')
    const [searchTerm, setSearchTerm] = useState('')
    const [showStats, setShowStats] = useState(true)

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
            className="space-y-6 sm:space-y-8 pb-20"
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
                            <div className="relative p-4 sm:p-6 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                                {/* Hide Button */}
                                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                                    <button
                                        onClick={() => setShowStats(false)}
                                        className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="mb-4 sm:mb-6 pl-8 sm:pl-10">
                                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter mb-1 sm:mb-2">
                                        {t('common.vault')}
                                    </h1>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground opacity-80 max-w-xl">
                                        {t('vault.unified_community_hub')}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {/* Net Savings */}
                                    <div className="p-3.5 sm:p-5 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-70">
                                                {t('vault.net_savings')}
                                            </p>
                                            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSaved)}</p>
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                                        </div>
                                    </div>

                                    {/* Active Debt */}
                                    <div className="p-3.5 sm:p-5 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-70">
                                                {t('vault.active_liability')}
                                            </p>
                                            <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-banana">{formatCurrency(activeDebt)}</p>
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-banana" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <button
                                onClick={() => setShowStats(true)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-blue-600 dark:text-banana hover:scale-110 transition-all"
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
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-56">
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border-none text-xs font-bold focus:ring-2 focus:ring-blue-500/50"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Search className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex items-center p-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
                                {(['ALL', 'INCOME', 'OUTFLOW'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
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
                            <Link href="/contributions/new" className="flex-1 sm:flex-none">
                                <Button size="sm" className="w-full sm:w-auto h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="text-[10px] uppercase tracking-wide">{t('common.contributions')}</span>
                                </Button>
                            </Link>
                            <Link href="/loans/new" className="flex-1 sm:flex-none">
                                <Button size="sm" variant="outline" className="w-full sm:w-auto h-10 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold rounded-xl">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="text-[10px] uppercase tracking-wide">{t('common.loans')}</span>
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
                                            className="group p-3 sm:p-4 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between gap-3 hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-default"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 overflow-hidden">
                                                <div className={cn(
                                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                                    item.type === 'CONTRIBUTION'
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                                        : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-banana"
                                                )}>
                                                    {item.type === 'CONTRIBUTION' ? <Wallet className="w-5 h-5 sm:w-6 sm:h-6" /> : <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />}
                                                </div>

                                                <div className="min-w-0 truncate">
                                                    <div className="flex items-center gap-2 mb-0.5 sm:mb-0">
                                                        <p className="font-black text-xs sm:text-sm text-foreground truncate">
                                                            {item.groupName}
                                                        </p>
                                                        <span className={cn(
                                                            "hidden sm:inline-flex text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                                                            item.type === 'CONTRIBUTION' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        )}>
                                                            {item.type === 'CONTRIBUTION' ? 'Deposit' : 'Loan'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0">
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
                                                            item.type === 'CONTRIBUTION' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        )}>
                                                            {item.type === 'CONTRIBUTION' ? 'Dep' : 'Loan'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className={cn(
                                                    "text-sm sm:text-lg font-black tracking-tight",
                                                    item.type === 'CONTRIBUTION' ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                                )}>
                                                    {item.type === 'CONTRIBUTION' ? '+' : ''} {formatCurrency(item.amount)}
                                                </p>
                                                <Badge className={cn(
                                                    "text-[9px] px-1.5 sm:px-2 py-0 sm:py-0.5 border-0 mt-0.5 sm:mt-1",
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
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
                                    <History className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">{t('vault.no_records')}</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination (Kept from existing) */}
                    {pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.currentPage <= 1}
                                    className="rounded-xl h-9 px-4 font-bold border-white/10"
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
                                    className="rounded-xl h-9 px-4 font-bold border-white/10"
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
                </GlassCard>
            </motion.div>
        </motion.div>
    )
}
