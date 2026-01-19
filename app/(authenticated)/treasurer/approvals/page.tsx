'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Check, ArrowLeft, Image as ImageIcon, AlertTriangle, Wallet, History, Maximize2, ZoomIn, ZoomOut, RotateCw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useOptimistic, useTransition } from 'react'
import { motion } from 'framer-motion'
import { GrowthLoader, InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumInput } from '@/components/ui/premium-input'

export default function TreasurerApprovalsPage() {
    const [pending, setPending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [optimisticPending, addOptimisticPending] = useOptimistic(
        pending,
        (state, idToRemove: string) => state.filter(p => p.id !== idToRemove)
    )
    const [isPending, startTransition] = useTransition()

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
            setPending(data || [])
        } catch (error) {
            console.error('Error fetching pending approvals:', error)
            toast.error('Failed to load pending approvals')
        } finally {
            setLoading(false)
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

        startTransition(async () => {
            addOptimisticPending(id)

            try {
                const response = await fetch(`/api/contributions/${id}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, rejectionReason }),
                })

                if (response.ok) {
                    toast.success(`Contribution ${status.toLowerCase()} successfully`)
                    setPending(prev => prev.filter(p => p.id !== id))
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
        })
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

            {optimisticPending.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-20 text-center" hover={false}>
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                        <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">All Clear!</h3>
                    <p className="text-muted-foreground font-medium max-w-sm">No pending contributions requiring verification.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {optimisticPending.map((item) => (
                        <GlassCard key={item.id} className="p-0 overflow-hidden group" hover={true} onClick={() => setReviewItem(item)}>
                            <div className="flex flex-col sm:flex-row">
                                {/* Receipt Teaser */}
                                <div className="w-full sm:w-[140px] bg-slate-100/50 dark:bg-black/20 border-r border-white/10 h-[140px] sm:h-auto flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100/80 transition-colors cursor-pointer">
                                    {item.receiptUrl ? (
                                        <>
                                            <img src={item.receiptUrl} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                <Maximize2 className="w-6 h-6 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                                            </div>
                                            <Badge className="absolute bottom-2 right-2 text-[8px] bg-black/60 backdrop-blur-md border-0 pointer-events-none">PROOF</Badge>
                                        </>
                                    ) : (
                                        <div className="text-center p-2 opacity-40">
                                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-6 flex flex-col justify-between relative bg-white/40 dark:bg-transparent">
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-black text-foreground tracking-tight">{item.user.firstName} {item.user.lastName}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-blue-300 border-0">{item.group.name}</Badge>
                                                <span className="text-xs font-bold text-muted-foreground/70 flex items-center gap-1">
                                                    <History className="w-3 h-3" /> {new Date(item.paymentDate || item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-blue-600 dark:text-banana tracking-tight">{formatCurrency(item.amount)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50 dark:border-white/5 relative z-10">
                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Bal: <span className="text-foreground">{formatCurrency(item.member.balance)}</span></span>
                                            {item.member.unpaidPenalties > 0 && <span className="flex items-center gap-1.5 text-red-500"><AlertTriangle className="w-3.5 h-3.5" /> Penalties: {formatCurrency(item.member.unpaidPenalties)}</span>}
                                        </div>

                                        <Button
                                            size="sm"
                                            className="rounded-xl font-black px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                        >
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Side-by-Side Review Modal */}
            <Dialog open={!!reviewItem} onOpenChange={(open) => !open && setReviewItem(null)}>
                <DialogContent className="max-w-[95vw] w-[900px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-3xl border-white/20 bg-slate-900/95 backdrop-blur-xl flex flex-col md:flex-row shadow-2xl">
                    <DialogTitle className="sr-only">Contribution Review</DialogTitle>
                    <DialogDescription className="sr-only">
                        Review and verify contribution
                    </DialogDescription>
                    {reviewItem && (
                        <>
                            {/* Left Panel: Evidence (Zoomable Receipt) */}
                            <div className="h-[300px] md:h-auto md:w-1/2 shrink-0 bg-black relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                                {reviewItem.receiptUrl ? (
                                    <>
                                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10" onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}>
                                                <ZoomIn className="w-4 h-4" />
                                            </Button>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10" onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}>
                                                <ZoomOut className="w-4 h-4" />
                                            </Button>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10" onClick={() => setRotation(prev => prev + 90)}>
                                                <RotateCw className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="w-full h-full overflow-auto flex items-center justify-center p-8 bg-grid-white/[0.05]">
                                            <motion.img
                                                src={reviewItem.receiptUrl}
                                                alt="Evidence"
                                                animate={{ scale: zoomLevel, rotate: rotation }}
                                                className="w-auto h-auto max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center opacity-40">
                                        <ImageIcon className="w-16 h-16 mb-4 text-white" />
                                        <p className="font-black text-xl uppercase text-white tracking-widest">No Receipt</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel: Ledger / Action */}
                            <div className="flex-1 h-full overflow-y-auto bg-white/5 md:w-1/2 flex flex-col">
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-xl font-black text-white mb-1 tracking-tight">Verification</h2>
                                    <p className="text-sm font-medium text-white/50">Verify transfer details against the proof.</p>
                                </div>

                                <div className="p-6 space-y-8 flex-1">
                                    {/* Amount Section */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Claimed Amount</p>
                                        <div className="text-4xl sm:text-5xl font-black text-emerald-400 dark:text-banana tracking-tighter">
                                            {formatCurrency(reviewItem.amount)}
                                        </div>
                                    </div>

                                    {/* Meta Data */}
                                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="col-span-2">
                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1">Contributor</p>
                                            <p className="font-bold text-white text-lg">{reviewItem.user.firstName} {reviewItem.user.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1">Ref ID</p>
                                            <p className="font-mono text-xs font-bold text-white/80 break-all">{reviewItem.transactionRef || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-white/40 mb-1">Timestamp</p>
                                            <p className="font-bold text-white/80 text-xs">{new Date(reviewItem.paymentDate || reviewItem.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Financial Context */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                                            Member Standing
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-xs font-bold text-white/70">Unpaid Penalties</span>
                                                <span className={cn("font-black text-sm", reviewItem.member.unpaidPenalties > 0 ? "text-red-400" : "text-white/30")}>
                                                    {formatCurrency(reviewItem.member.unpaidPenalties)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-xs font-bold text-white/70">Current Balance</span>
                                                <span className="font-black text-sm text-emerald-400">
                                                    {formatCurrency(reviewItem.member.balance)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rejection Form */}
                                    <div className="pt-4 border-t border-white/10">
                                        <textarea
                                            className="w-full min-h-[80px] p-4 rounded-xl border border-white/10 bg-black/20 text-sm font-medium text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none transition-all"
                                            placeholder="Add a note if rejecting (optional)..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-white/10 bg-black/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="ghost"
                                            className="h-14 font-black rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => handleReviewAction('REJECTED')}
                                            disabled={isSubmitting}
                                        >
                                            Reject
                                        </Button>
                                        <div className="relative group rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-[1px] shadow-lg shadow-emerald-500/20 hover:shadow-blue-500/40 transition-shadow">
                                            <Button
                                                className="relative w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black overflow-hidden border-0"
                                                onClick={() => handleReviewAction('COMPLETED')}
                                                disabled={isSubmitting}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                                                {isSubmitting ? (
                                                    <InlineLogoLoader size="xs" />
                                                ) : (
                                                    <>
                                                        <Check className="w-5 h-5 mr-2" /> Approve
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
