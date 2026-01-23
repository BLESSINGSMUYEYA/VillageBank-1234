'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Check, ArrowLeft, Image as ImageIcon, AlertTriangle, Wallet, History, Maximize2, ZoomIn, ZoomOut, RotateCw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { GrowthLoader, InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumInput } from '@/components/ui/premium-input'

export default function TreasurerApprovalsPage() {
    const [pendingContributions, setPendingContributions] = useState<any[]>([])
    const [pendingLoans, setPendingLoans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Helper to refresh optimistic state logic if needed (simplified for now)
    // We will separate the lists in the UI implementation
    // Simplified state management for clarity during refactor
    const [activeTab, setActiveTab] = useState<'contributions' | 'loans'>('contributions')

    // Detailed Review Modal State
    const [reviewItem, setReviewItem] = useState<any | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Zoom State
    const [zoomLevel, setZoomLevel] = useState(1)
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        fetchPending()
    }, [])

    useEffect(() => {
        if (reviewItem) {
            setZoomLevel(1)
            setRotation(0)
        }
    }, [reviewItem])

    const fetchPending = async () => {
        try {
            const response = await fetch('/api/treasurer/pending')
            const data = await response.json()
            if (data.contributions) setPendingContributions(data.contributions)
            if (data.loans) setPendingLoans(data.loans)
        } catch (error) {
            console.error('Error fetching pending approvals:', error)
            toast.error('Failed to load pending approvals')
        } finally {
            setLoading(false)
        }
    }

    const handleLoanAction = async (loan: any, approved: boolean) => {
        if (!confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this loan?`)) return

        try {
            const response = await fetch(`/api/loans/${loan.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved }),
            })

            if (response.ok) {
                toast.success(`Loan ${approved ? 'approved' : 'rejected'} successfully`)
                setPendingLoans(prev => prev.filter(l => l.id !== loan.id))
            } else {
                toast.error('Failed to update loan status')
            }
        } catch (error) {
            console.error('Error handling loan:', error)
            toast.error('An error occurred')
        }
    }

    const handleReviewAction = async (status: 'COMPLETED' | 'REJECTED') => {
        if (!reviewItem) return

        if (status === 'REJECTED' && !rejectionReason) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setIsSubmitting(true)
        const id = reviewItem.id

        try {
            const response = await fetch(`/api/contributions/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason }),
            })

            if (response.ok) {
                toast.success(`Contribution ${status.toLowerCase()} successfully`)
                setPendingContributions(prev => prev.filter(p => p.id !== id))
                setReviewItem(null)
                setRejectionReason('')
                setZoomLevel(1)
                setRotation(0)
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update status')
            }
        } catch (error) {
            toast.error('An error occurred during review')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <GrowthLoader size="sm" className="mb-4" showText={false} />
                    <p className="text-muted-foreground animate-pulse font-medium">Synced with Vault...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-20 max-w-6xl mx-auto relative">
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10">
                <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-all duration-300 group mb-6">
                    <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center mr-3 group-hover:bg-emerald-500/10 transition-colors">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
                    </div>
                    Back to Hub
                </Link>
                <div className="hidden md:block mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-2">
                        Approvals
                        <span className="text-emerald-500 dark:text-banana">.</span>
                    </h1>
                    <div className="text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Financial Clearance & Audit
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="italic">Secure Ledger Terminal</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Button
                    variant={activeTab === 'contributions' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('contributions')}
                    className="rounded-full font-bold"
                >
                    Contributions
                    {pendingContributions.length > 0 && <Badge className="ml-2 bg-white text-black">{pendingContributions.length}</Badge>}
                </Button>
                <Button
                    variant={activeTab === 'loans' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('loans')}
                    className="rounded-full font-bold"
                >
                    Loans
                    {pendingLoans.length > 0 && <Badge className="ml-2 bg-white text-black">{pendingLoans.length}</Badge>}
                </Button>
            </div>

            {activeTab === 'contributions' && (
                pendingContributions.length === 0 ? (
                    <GlassCard className="flex flex-col items-center justify-center py-20 text-center" hover={false}>
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">All Clear!</h3>
                        <p className="text-muted-foreground font-medium max-w-sm">No pending contributions requiring verification.</p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingContributions.map((item) => (
                            <GlassCard key={item.id} className="p-0 overflow-hidden group" hover={true} onClick={() => setReviewItem(item)}>
                                {/* Reuse existing contribution card logic */}
                                <div className="flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-[140px] bg-slate-100/50 dark:bg-black/20 border-r border-white/10 h-[140px] sm:h-auto flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100/80 transition-colors cursor-pointer">
                                        {item.receiptUrl ? (
                                            <img src={item.receiptUrl} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-muted-foreground opacity-40" />
                                        )}
                                    </div>
                                    <div className="flex-1 p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-black">{item.user.firstName} {item.user.lastName}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px]">{item.group.name}</Badge>
                                                    <span className="text-xs text-muted-foreground">{new Date(item.paymentDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <span className="text-xl font-black text-blue-600">{formatCurrency(item.amount)}</span>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Review</Button>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'loans' && (
                pendingLoans.length === 0 ? (
                    <GlassCard className="flex flex-col items-center justify-center py-20 text-center" hover={false}>
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
                            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">No Loan Requests</h3>
                        <p className="text-muted-foreground font-medium max-w-sm">There are no pending loan applications at this time.</p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingLoans.map((loan) => (
                            <GlassCard key={loan.id} className="p-6 space-y-4" hover={true}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">{loan.user.firstName} {loan.user.lastName}</h3>
                                            <p className="text-xs text-muted-foreground font-bold uppercase">{loan.group.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Pending</Badge>
                                </div>

                                <div className="py-4 border-y border-dashed border-slate-200 dark:border-white/10 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Amount Requested</span>
                                        <span className="font-black text-lg">{formatCurrency(loan.amountRequested)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Repayment Period</span>
                                        <span className="font-bold">{loan.repaymentPeriodMonths} Months</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Interest Rate</span>
                                        <span className="font-bold text-emerald-600">{loan.group.interestRate}%</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                                        onClick={() => handleLoanAction(loan, true)}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl"
                                        onClick={() => handleLoanAction(loan, false)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )
            )}

            {/* Refined Vertical Review Modal */}
            <Dialog open={!!reviewItem} onOpenChange={(open) => !open && setReviewItem(null)}>
                <DialogContent className="max-w-[480px] w-full max-h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-white/20 dark:border-white/5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex flex-col shadow-2xl outline-none">
                    <DialogTitle className="sr-only">Contribution Review</DialogTitle>
                    <DialogDescription className="sr-only">Review details</DialogDescription>

                    {reviewItem && (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* 1. Header & Image Section (Fixed at Top) */}
                            <div className="relative shrink-0 bg-slate-100/50 dark:bg-black/40 border-b border-slate-200 dark:border-white/10">
                                {/* Ambient Glow in modal */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                                {/* Image Container - Fixed height */}
                                <div className="h-[300px] w-full flex items-center justify-center relative overflow-hidden bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02]">
                                    {reviewItem.receiptUrl ? (
                                        <>
                                            <motion.img
                                                src={reviewItem.receiptUrl}
                                                alt="Evidence"
                                                animate={{ scale: zoomLevel, rotate: rotation }}
                                                className="w-full h-full object-contain relative z-10"
                                            />
                                            {/* Floating Controls */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-1.5 rounded-full bg-slate-900/80 dark:bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 0.25, 0.5)) }}>
                                                    <ZoomOut className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setZoomLevel(1) }}>
                                                    <Maximize2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 0.25, 3)) }}>
                                                    <ZoomIn className="w-4 h-4" />
                                                </Button>
                                                <div className="w-px h-4 bg-white/20 self-center mx-1" />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setRotation(prev => prev + 90) }}>
                                                    <RotateCw className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-30">
                                            <ImageIcon className="w-16 h-16 mb-4 text-slate-400 dark:text-slate-600" />
                                            <p className="font-black text-xs uppercase tracking-[0.2em]">No Receipt Image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Scrollable Details Section */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide">
                                {/* Core Info */}
                                <div className="text-center space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verification Required
                                    </div>
                                    <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {formatCurrency(reviewItem.amount)}
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        Deposit by <span className="text-slate-900 dark:text-white">{reviewItem.user.firstName} {reviewItem.user.lastName}</span>
                                    </p>
                                </div>

                                {/* Context Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl space-y-1 group hover:border-emerald-500/20 transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Timestamp</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white/90">
                                            <History className="w-4 h-4 opacity-50 text-blue-500" />
                                            <span className="text-xs font-bold">{new Date(reviewItem.paymentDate || reviewItem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl space-y-1 group hover:border-emerald-500/20 transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Network ID</p>
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white/80">
                                            <Wallet className="w-4 h-4 opacity-50 text-purple-500" />
                                            <p className="text-xs font-mono font-bold truncate">
                                                {reviewItem.transactionRef || 'OFF-LEDGER'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl space-y-1 group hover:border-emerald-500/20 transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Portfolio Balance</p>
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(reviewItem.member.balance)}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl space-y-1 group hover:border-emerald-500/20 transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Compliance Risk</p>
                                        <p className={cn("text-sm font-black", reviewItem.member.unpaidPenalties > 0 ? "text-red-500" : "text-slate-400 dark:text-white/30")}>
                                            {formatCurrency(reviewItem.member.unpaidPenalties)}
                                        </p>
                                    </div>
                                </div>

                                {/* Rejection Note Area */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 pl-1">Reviewers Comments</label>
                                    <textarea
                                        className="w-full h-24 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:bg-white dark:focus:bg-black/40 focus:border-emerald-500/50 dark:focus:border-banana/50 outline-none resize-none transition-all shadow-inner"
                                        placeholder="Reason for audit failure (required if rejecting)..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 3. Action Footer (Sticky Bottom) */}
                            <div className="p-6 bg-slate-50/80 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 shrink-0 backdrop-blur-md">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                        onClick={() => handleReviewAction('REJECTED')}
                                        disabled={isSubmitting}
                                    >
                                        Reject Transaction
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-banana dark:hover:bg-banana/90 text-white dark:text-emerald-950 font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/20 dark:shadow-banana/10 transition-all hover:scale-[1.02] active:scale-95 group"
                                        onClick={() => handleReviewAction('COMPLETED')}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <InlineLogoLoader size="xs" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Approve To Ledger
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
