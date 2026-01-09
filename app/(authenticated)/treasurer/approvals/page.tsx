'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Check, X, Eye, ArrowLeft, Image as ImageIcon, AlertTriangle, Wallet, History, Maximize2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useOptimistic, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GrowthLoader, InlineLogoLoader } from '@/components/ui/LogoLoader'

export default function TreasurerApprovalsPage() {
    const [pending, setPending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [optimisticPending, addOptimisticPending] = useOptimistic(
        pending,
        (state, idToRemove: string) => state.filter(p => p.id !== idToRemove)
    )
    const [isPending, startTransition] = useTransition()

    // Selection & Bulk
    const [selectedContributions, setSelectedContributions] = useState<string[]>([])

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

    const handleSelectContribution = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedContributions(prev => [...prev, id])
        } else {
            setSelectedContributions(prev => prev.filter(cId => cId !== id))
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
                    <p className="text-muted-foreground animate-pulse">Loading pending approvals...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
            <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group mb-4">
                <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-display font-black text-foreground">Contribution Approvals</h1>
                    <p className="text-muted-foreground text-body max-w-lg">Review pending member contributions and verify payments before updating group balances.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full font-bold bg-muted/30 border-border">
                        {optimisticPending.length} Remaining
                    </Badge>
                </div>
            </div>

            {optimisticPending.length === 0 ? (
                <Card className="bg-card border-border shadow-sm border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2">Queue Clear!</h3>
                        <p className="text-muted-foreground text-body max-w-sm">No pending contributions. Great job keeping up!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {optimisticPending.map((item) => (
                        <Card key={item.id} className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Receipt Teaser */}
                                    <div className="w-full sm:w-[120px] bg-muted/30 border-r border-border h-[120px] sm:h-auto flex items-center justify-center relative overflow-hidden group-hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setReviewItem(item)}>
                                        {item.receiptUrl ? (
                                            <>
                                                <img src={item.receiptUrl} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                    <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                                                </div>
                                                <Badge className="absolute bottom-2 right-2 text-[8px] bg-black/60 pointer-events-none">PROOF</Badge>
                                            </>
                                        ) : (
                                            <div className="text-center p-2 opacity-50">
                                                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                                                <span className="text-[9px] font-bold uppercase text-muted-foreground">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-foreground">{item.user.firstName} {item.user.lastName}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{item.group.name}</Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <History className="w-3 h-3" /> {new Date(item.paymentDate || item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(item.amount)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Bal: {formatCurrency(item.member.balance)}</span>
                                                {item.member.unpaidPenalties > 0 && <span className="flex items-center gap-1.5 text-red-500"><AlertTriangle className="w-3.5 h-3.5" /> Penalties: {formatCurrency(item.member.unpaidPenalties)}</span>}
                                            </div>

                                            <Button
                                                size="sm"
                                                className="rounded-full font-bold px-6 bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => setReviewItem(item)}
                                            >
                                                Start Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Side-by-Side Review Modal - Zen Refactor */}
            <Dialog open={!!reviewItem} onOpenChange={(open) => !open && setReviewItem(null)}>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 gap-0 overflow-hidden rounded-[32px] border-none outline-none bg-black/40 backdrop-blur-xl flex flex-col md:flex-row shadow-2xl">
                    <DialogTitle className="sr-only">Contribution Review</DialogTitle>
                    <DialogDescription className="sr-only">
                        Review and verify contribution for {reviewItem?.user?.firstName} {reviewItem?.user?.lastName}
                    </DialogDescription>
                    {reviewItem && (
                        <>
                            {/* Left Panel: Evidence (Zoomable Receipt) */}
                            <div className="flex-1 bg-black/80 relative flex items-center justify-center overflow-hidden">
                                {reviewItem.receiptUrl ? (
                                    <>
                                        <div className="absolute top-6 left-6 z-10 flex gap-2">
                                            <GlassCard className="p-1.5 flex gap-2 rounded-full border-white/10 bg-black/40 backdrop-blur-md" hover={false}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}>
                                                    <ZoomIn className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}>
                                                    <ZoomOut className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20" onClick={() => setRotation(prev => prev + 90)}>
                                                    <RotateCw className="w-4 h-4" />
                                                </Button>
                                                <div className="h-8 px-3 flex items-center justify-center border-l border-white/10 text-[10px] font-black text-white/80">
                                                    {Math.round(zoomLevel * 100)}%
                                                </div>
                                            </GlassCard>
                                        </div>

                                        <div className="w-full h-full overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing">
                                            <motion.img
                                                src={reviewItem.receiptUrl}
                                                alt="Evidence"
                                                animate={{ scale: zoomLevel, rotate: rotation }}
                                                className="max-w-none shadow-2xl rounded-sm ring-1 ring-white/10"
                                                style={{ maxHeight: '80vh' }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center opacity-40 text-white/50">
                                        <ImageIcon className="w-20 h-20 mb-6 stroke-1" />
                                        <p className="font-black text-2xl uppercase tracking-widest">No Receipt Attached</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel: Ledger / Action */}
                            <div className="w-[400px] md:w-[480px] bg-white dark:bg-slate-950 flex flex-col h-full border-l border-white/10 z-20 shadow-2xl">
                                <div className="p-8 border-b border-border bg-muted/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <CheckSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-foreground tracking-tight">Verification</h2>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Review Transaction Details</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                    {/* Amount Section */}
                                    <div className="space-y-2 text-center py-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl border border-blue-500/10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Claimed Amount</p>
                                        <div className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter shimmer">
                                            {formatCurrency(reviewItem.amount)}
                                        </div>
                                    </div>

                                    {/* Meta Data */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-3 mb-2">Transaction Data</p>
                                        <div className="grid grid-cols-1 divide-y divide-border/40 border border-border/40 rounded-2xl overflow-hidden bg-muted/20">
                                            <div className="p-4 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                                <span className="text-xs font-bold text-muted-foreground">Contributor</span>
                                                <span className="font-black text-sm text-foreground">{reviewItem.user.firstName} {reviewItem.user.lastName}</span>
                                            </div>
                                            <div className="p-4 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                                <span className="text-xs font-bold text-muted-foreground">Group</span>
                                                <Badge variant="outline" className="font-bold border-blue-500/20 text-blue-600 bg-blue-500/5">{reviewItem.group.name}</Badge>
                                            </div>
                                            <div className="p-4 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                                <span className="text-xs font-bold text-muted-foreground">Reference</span>
                                                <span className="font-mono text-xs font-bold text-foreground bg-muted/50 px-2 py-1 rounded">{reviewItem.transactionRef || 'N/A'}</span>
                                            </div>
                                            <div className="p-4 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                                <span className="text-xs font-bold text-muted-foreground">Date</span>
                                                <span className="font-black text-sm text-foreground">{new Date(reviewItem.paymentDate || reviewItem.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Context */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-3 flex items-center gap-2">
                                            Wallet Context
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <GlassCard className="p-4 border-red-500/20 bg-red-500/5" hover={false}>
                                                <p className="text-[9px] font-black uppercase text-red-600/60 mb-1">Penalties</p>
                                                <p className={cn("text-lg font-black", reviewItem.member.unpaidPenalties > 0 ? "text-red-600" : "text-muted-foreground")}>
                                                    {formatCurrency(reviewItem.member.unpaidPenalties)}
                                                </p>
                                            </GlassCard>
                                            <GlassCard className="p-4 border-green-500/20 bg-green-500/5" hover={false}>
                                                <p className="text-[9px] font-black uppercase text-green-600/60 mb-1">Balance</p>
                                                <p className="text-lg font-black text-green-600">
                                                    {formatCurrency(reviewItem.member.balance)}
                                                </p>
                                            </GlassCard>
                                        </div>
                                    </div>

                                    {/* Rejection Form */}
                                    <div className="pt-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 pl-1">Rejection Reason</p>
                                        <textarea
                                            className="w-full min-h-[100px] p-4 rounded-2xl border-2 border-border/50 bg-muted/20 text-sm font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-black/20 outline-none resize-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="Required only if rejecting..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-border bg-muted/5 backdrop-blur-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="destructive"
                                            className="h-14 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            onClick={() => handleReviewAction('REJECTED')}
                                            disabled={isSubmitting}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="h-14 font-black text-xs uppercase tracking-widest rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            onClick={() => handleReviewAction('COMPLETED')}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <InlineLogoLoader size="xs" color="white" />
                                            ) : (
                                                <>
                                                    <Check className="w-5 h-5 mr-2" /> Approve
                                                </>
                                            )}
                                        </Button>
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
