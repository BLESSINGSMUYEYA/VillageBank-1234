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
        <div className="space-y-6 sm:space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-all duration-300 group mb-6">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
                    Back to Hub
                </Link>
                <div className="hidden md:block mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-2 text-left break-words">
                        Approvals
                        <span className="text-banana">.</span>
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-banana" />
                        Financial Clearance & Audit
                    </p>
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
                <DialogContent className="max-w-[480px] w-full max-h-[90vh] p-0 overflow-hidden rounded-3xl border-white/20 bg-slate-900/95 backdrop-blur-xl flex flex-col shadow-2xl outline-none">
                    <DialogTitle className="sr-only">Contribution Review</DialogTitle>
                    <DialogDescription className="sr-only">Review details</DialogDescription>

                    {reviewItem && (
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* 1. Header & Image Section (Fixed at Top) */}
                            <div className="relative shrink-0 bg-black/40 border-b border-white/10">
                                {/* Image Container - Fixed height */}
                                <div className="h-[300px] w-full flex items-center justify-center relative overflow-hidden bg-grid-white/[0.05]">
                                    {reviewItem.receiptUrl ? (
                                        <>
                                            <motion.img
                                                src={reviewItem.receiptUrl}
                                                alt="Evidence"
                                                animate={{ scale: zoomLevel, rotate: rotation }}
                                                className="w-full h-full object-contain"
                                            />
                                            {/* Floating Controls */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}>
                                                    <ZoomOut className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setZoomLevel(1)}>
                                                    <Maximize2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}>
                                                    <ZoomIn className="w-4 h-4" />
                                                </Button>
                                                <div className="w-px h-4 bg-white/20 self-center mx-1" />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setRotation(prev => prev + 90)}>
                                                    <RotateCw className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-40">
                                            <ImageIcon className="w-12 h-12 mb-3 text-white" />
                                            <p className="font-black text-sm uppercase text-white tracking-widest">No Receipt Image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Scrollable Details Section */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* Core Info */}
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Transaction To Verify</p>
                                    <div className="text-4xl font-black text-white tracking-tighter">
                                        {formatCurrency(reviewItem.amount)}
                                    </div>
                                    <p className="text-sm font-bold text-emerald-400">
                                        from {reviewItem.user.firstName} {reviewItem.user.lastName}
                                    </p>
                                </div>

                                {/* Context Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-white/40">Timestamp</p>
                                        <div className="flex items-center gap-1.5 text-white/90">
                                            <History className="w-3.5 h-3.5 opacity-70" />
                                            <span className="text-xs font-bold">{new Date(reviewItem.paymentDate || reviewItem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-white/40">Ref ID</p>
                                        <p className="text-xs font-mono font-bold text-white/80 truncate">
                                            {reviewItem.transactionRef || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-white/40">Balance</p>
                                        <p className="text-xs font-bold text-emerald-400">
                                            {formatCurrency(reviewItem.member.balance)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                                        <p className="text-[9px] font-black uppercase text-white/40">Penalties</p>
                                        <p className={cn("text-xs font-bold", reviewItem.member.unpaidPenalties > 0 ? "text-red-400" : "text-white/50")}>
                                            {formatCurrency(reviewItem.member.unpaidPenalties)}
                                        </p>
                                    </div>
                                </div>

                                {/* Optional Rejection Note */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/40 pl-1">Review Notes (Optional)</label>
                                    <textarea
                                        className="w-full h-20 p-3 rounded-xl border border-white/10 bg-black/20 text-xs font-medium text-white placeholder:text-white/20 focus:bg-black/40 focus:border-emerald-500/50 outline-none resize-none transition-all"
                                        placeholder="Add a reason if rejecting..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 3. Action Footer (Sticky Bottom) */}
                            <div className="p-4 bg-white/5 border-t border-white/5 shrink-0 backdrop-blur-md">
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 h-12 rounded-xl font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={() => handleReviewAction('REJECTED')}
                                        disabled={isSubmitting}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20"
                                        onClick={() => handleReviewAction('COMPLETED')}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <InlineLogoLoader size="xs" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                Verify & Approve
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
