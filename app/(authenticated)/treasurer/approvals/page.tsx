'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Check, X, Eye, ArrowLeft, Image as ImageIcon, AlertTriangle, Wallet, History, Maximize2, ZoomIn, ZoomOut, RotateCw, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useOptimistic, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GrowthLoader, InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'

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

            {/* Immersive Review Modal */}
            <Dialog open={!!reviewItem} onOpenChange={(open) => !open && setReviewItem(null)}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 overflow-hidden rounded-[32px] border-none outline-none bg-black/90 shadow-2xl relative group/modal">
                    <DialogTitle className="sr-only">Contribution Review</DialogTitle>
                    <DialogDescription className="sr-only">
                        Review and verify contribution for {reviewItem?.user?.firstName} {reviewItem?.user?.lastName}
                    </DialogDescription>
                    {reviewItem && (
                        <>
                            {/* Full Screen Image Layer */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-3xl">
                                {reviewItem.receiptUrl ? (
                                    <motion.div
                                        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                                        drag
                                        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                    >
                                        <motion.img
                                            src={reviewItem.receiptUrl}
                                            alt="Evidence"
                                            animate={{ scale: zoomLevel, rotate: rotation }}
                                            className="max-w-none max-h-[90vh] object-contain shadow-2xl rounded-sm ring-1 ring-white/10"
                                            draggable={false}
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center opacity-30 text-white">
                                        <ImageIcon className="w-32 h-32 mb-6 stroke-[0.5]" />
                                        <p className="font-black text-4xl uppercase tracking-[0.5em]">No Receipt</p>
                                    </div>
                                )}

                                {/* Overlay Gradient for text readability if needed */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                            </div>

                            {/* Floating Controls */}
                            <div className="absolute top-6 left-6 z-20 flex gap-2">
                                <GlassCard className="p-1.5 flex gap-2 rounded-full border-white/10 bg-black/40 backdrop-blur-md shadow-xl" hover={false}>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/20 hover:scale-110 transition-all" onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4))}>
                                        <ZoomIn className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/20 hover:scale-110 transition-all" onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}>
                                        <ZoomOut className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/20 hover:scale-110 transition-all" onClick={() => setRotation(prev => prev + 90)}>
                                        <RotateCw className="w-5 h-5" />
                                    </Button>
                                    <div className="h-10 px-4 flex items-center justify-center border-l border-white/10 text-xs font-black text-white/90 tabular-nums">
                                        {Math.round(zoomLevel * 100)}%
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="absolute top-6 right-6 z-20 md:hidden">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur-md" onClick={() => setReviewItem(null)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>


                            {/* Floating Details Panel */}
                            <GlassCard
                                className="absolute right-0 bottom-0 md:top-4 md:bottom-4 md:right-4 w-full md:w-[420px] rounded-t-[32px] md:rounded-[32px] border-white/10 bg-black/60 dark:bg-black/80 backdrop-blur-xl shadow-2xl z-20 flex flex-col overflow-hidden max-h-[85vh] md:max-h-full transition-transform duration-500 ease-out translate-y-0"
                                hover={false}
                            >
                                {/* Header */}
                                <div className="p-6 md:p-8 pb-4 border-b border-white/10 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 border border-white/5 shadow-inner">
                                            <CheckSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Verify</h2>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Transaction Review</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                                    {/* Main Amount */}
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Amount Declared</p>
                                        <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter">
                                            {formatCurrency(reviewItem.amount)}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Contributor</span>
                                            <span className="text-sm font-black text-white">{reviewItem.user.firstName} {reviewItem.user.lastName}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Group</span>
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold">{reviewItem.group.name}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Date</span>
                                            <span className="text-sm font-bold text-white font-mono">{new Date(reviewItem.paymentDate || reviewItem.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Rejection Input */}
                                    {reviewItem.status !== 'COMPLETED' && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pl-1">Rejection Notes</label>
                                            <textarea
                                                className="w-full min-h-[80px] p-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                                                placeholder="Required if rejecting..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="p-6 md:p-8 pt-4 shrink-0 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white font-black uppercase tracking-widest text-xs transition-all"
                                            onClick={() => handleReviewAction('REJECTED')}
                                            disabled={isSubmitting}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="default"
                                            className="h-14 rounded-2xl bg-white text-black hover:bg-blue-400 hover:text-white border-none font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                                            onClick={() => handleReviewAction('COMPLETED')}
                                            disabled={isSubmitting}
                                        >
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
                            </GlassCard>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
