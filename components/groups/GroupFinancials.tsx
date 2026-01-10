'use client'

import { useState } from 'react'
import { ExcelImportModal } from '@/components/ExcelImportModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    CheckCircle,
    Clock,
    Landmark,
    Plus,
    User,
    XCircle
} from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'

// --- Types (Mirrored from original files) ---
interface Contribution {
    id: string
    amount: number
    month: number
    year: number
    status: string
    paymentMethod?: string
    paymentDate?: string | Date
    createdAt: string
    receiptUrl?: string
    user: {
        firstName: string
        lastName: string
    }
}

interface Loan {
    id: string
    amountRequested: number
    amountApproved?: number
    interestRate: number
    repaymentPeriodMonths: number
    status: string
    createdAt: string
    user: {
        firstName: string
        lastName: string
    }
}

interface GroupFinancialsProps {
    contributions: Contribution[]
    loans: Loan[]
    groupId: string
    currentUserRole?: string
    searchTerm?: string
}

type FilterType = 'ALL' | 'INCOME' | 'OUTFLOW'

export default function GroupFinancials({ contributions, loans, groupId, currentUserRole, searchTerm = '' }: GroupFinancialsProps) {
    const [filter, setFilter] = useState<FilterType>('ALL')
    // const [searchTerm, setSearchTerm] = useState('') // Removed local state

    // 1. Merge & Sort Logic
    // We map both into a unified 'FinancialItem' structure for rendering
    const financialItems = [
        ...contributions.map(c => ({
            type: 'CONTRIBUTION' as const,
            id: c.id,
            amount: c.amount,
            date: c.paymentDate ? new Date(c.paymentDate) : new Date(c.createdAt),
            status: c.status,
            user: c.user,
            original: c,
            // Helper for sorting
            timestamp: (c.paymentDate ? new Date(c.paymentDate) : new Date(c.createdAt)).getTime()
        })),
        ...loans.map(l => ({
            type: 'LOAN' as const,
            id: l.id,
            amount: l.amountApproved || l.amountRequested,
            date: new Date(l.createdAt),
            status: l.status,
            user: l.user,
            original: l,
            timestamp: new Date(l.createdAt).getTime()
        }))
    ].sort((a, b) => b.timestamp - a.timestamp) // Newest first

    // 2. Statistics Calculation
    const totalCollected = contributions
        .filter(c => c.status === 'COMPLETED')
        .reduce((sum, c) => sum + c.amount, 0)

    const totalDisbursed = loans
        .filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
        .reduce((sum, l) => sum + (l.amountApproved || 0), 0)

    const pendingContributionsCount = contributions.filter(c => c.status === 'PENDING').length
    const pendingLoansCount = loans.filter(l => l.status === 'PENDING').length

    // 3. Filter Implementation
    const filteredItems = financialItems.filter(item => {
        // Search Filter
        if (searchTerm) {
            const fullName = `${item.user.firstName} ${item.user.lastName}`.toLowerCase()
            if (!fullName.includes(searchTerm.toLowerCase())) return false
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
            className="space-y-6"
        >
            <GlassCard className="p-0 overflow-hidden" hover={false}>
                {/* Header Section: Summary Stats */}
                <div className="p-5 sm:p-6 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Money In */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Funds In</p>
                                <p className="text-2xl font-black text-foreground">{formatCurrency(totalCollected)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>

                        {/* Money Out */}
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Total Funds Out</p>
                                <p className="text-2xl font-black text-foreground">{formatCurrency(totalDisbursed)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions Alert (Admin/Treasurer) */}
                    {(currentUserRole === 'ADMIN' || currentUserRole === 'TREASURER') && (pendingContributionsCount > 0 || pendingLoansCount > 0) && (
                        <motion.div variants={itemFadeIn} className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center animate-pulse">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-orange-700 dark:text-orange-400">Action Required</p>
                                    <p className="text-[10px] font-medium text-orange-600/80 uppercase tracking-wide">
                                        {pendingContributionsCount > 0 && `${pendingContributionsCount} Contributions`}
                                        {pendingContributionsCount > 0 && pendingLoansCount > 0 && ' • '}
                                        {pendingLoansCount > 0 && `${pendingLoansCount} Loan Requests`}
                                    </p>
                                </div>
                            </div>
                            <Link href="/treasurer/approvals">
                                <Button size="sm" variant="ghost" className="h-8 bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 dark:text-orange-300 font-bold text-[10px] uppercase rounded-lg">
                                    Review Now
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Controls & Filter Bar */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
                    {/* Left: Search & Filter Chips */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">


                        {/* Filter Chips */}
                        <div className="flex items-center p-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
                            {(['ALL', 'INCOME', 'OUTFLOW'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                        filter === f
                                            ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                    )}
                                >
                                    {f === 'INCOME' ? 'Money In' : f === 'OUTFLOW' ? 'Money Out' : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {(currentUserRole === 'ADMIN' || currentUserRole === 'TREASURER') && (
                            <ExcelImportModal groupId={groupId} />
                        )}
                        <Link href="/contributions/new" className="flex-1 sm:flex-none">
                            <Button size="sm" className="w-full sm:w-auto h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-[10px] uppercase tracking-wide">Deposit</span>
                            </Button>
                        </Link>
                        <Link href={`/loans/new?groupId=${groupId}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto h-9 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold rounded-xl">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-[10px] uppercase tracking-wide">Loan</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Unified Timeline List */}
                <div className="p-3 bg-slate-50/50 dark:bg-transparent min-h-[400px]">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={filter}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        className="group p-3 sm:p-4 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon Box */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                                item.type === 'CONTRIBUTION'
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600"
                                            )}>
                                                {item.type === 'CONTRIBUTION' ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                                            </div>

                                            {/* Details */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-sm text-foreground">
                                                        {item.user.firstName} {item.user.lastName}
                                                    </p>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                                                        item.type === 'CONTRIBUTION' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                    )}>
                                                        {item.type === 'CONTRIBUTION' ? 'Deposit' : 'Loan'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    {item.status === 'PENDING' && (
                                                        <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 rounded-sm">
                                                            Pending Review
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount & Status */}
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-sm sm:text-base font-black tracking-tight",
                                                item.type === 'CONTRIBUTION' ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                            )}>
                                                {item.type === 'CONTRIBUTION' ? '+' : ''} {formatCurrency(item.amount)}
                                            </p>
                                            <div className="flex justify-end mt-0.5">
                                                {/* Logic for Status badges reused or simplified */}
                                                <Badge className={cn(
                                                    "text-[9px] px-1.5 py-0 border-0 h-4",
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
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
                                    <Filter className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No transactions found</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </GlassCard>
        </motion.div>
    )
}
