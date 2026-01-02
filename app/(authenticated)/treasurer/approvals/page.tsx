'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Check, X, Eye, ArrowLeft, Loader2, Image as ImageIcon, AlertTriangle, User, History, Wallet } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

import { useOptimistic, useTransition, useActionState } from 'react'

export default function TreasurerApprovalsPage() {
    const [pending, setPending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [optimisticPending, addOptimisticPending] = useOptimistic(
        pending,
        (state, idToRemove: string) => state.filter(p => p.id !== idToRemove)
    )
    const [isPending, startTransition] = useTransition()

    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedContributions, setSelectedContributions] = useState<string[]>([])
    const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null)
    const [bulkRejectionReason, setBulkRejectionReason] = useState('')

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

    const handleBulkReview = async () => {
        if (selectedContributions.length === 0) {
            toast.error('Please select at least one contribution')
            return
        }

        if (bulkAction === 'reject' && !bulkRejectionReason) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/contributions/bulk-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributionIds: selectedContributions,
                    status: bulkAction === 'approve' ? 'COMPLETED' : 'REJECTED',
                    rejectionReason: bulkRejectionReason
                }),
            })

            if (response.ok) {
                const data = await response.json()
                toast.success(data.message)
                fetchPending()
                setSelectedContributions([])
                setBulkAction(null)
                setBulkRejectionReason('')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to process bulk action')
            }
        } catch (error) {
            toast.error('Error processing bulk action')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedContributions(pending.map(c => c.id))
        } else {
            setSelectedContributions([])
        }
    }

    const handleSelectContribution = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedContributions(prev => [...prev, id])
        } else {
            setSelectedContributions(prev => prev.filter(cId => cId !== id))
        }
    }

    const handleReview = async (id: string, status: 'COMPLETED' | 'REJECTED') => {
        if (status === 'REJECTED' && !rejectionReason) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setReviewingId(id)

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
                    setShowRejectForm(null)
                    setRejectionReason('')
                } else {
                    const data = await response.json()
                    toast.error(data.error || 'Failed to update status')
                }
            } catch (error) {
                toast.error('An error occurred during review')
            } finally {
                setReviewingId(null)
            }
        })
    }

    const handleBulkApproval = async () => {
        if (bulkAction === 'approve') {
            handleBulkReview()
        } else if (bulkAction === 'reject') {
            if (!bulkRejectionReason) {
                toast.error('Please provide a reason for rejection')
                return
            }
            handleBulkReview()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
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
                    {selectedContributions.length > 0 && (
                        <div className="flex items-center gap-2 mr-4 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{selectedContributions.length} selected</span>
                            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800" onClick={() => setBulkAction('approve')}>Approve All</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => setBulkAction('reject')}>Reject All</Button>
                        </div>
                    )}
                    <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full font-bold bg-muted/30 border-border">
                        {optimisticPending.length} Remaining
                    </Badge>
                </div>
            </div>

            {bulkAction && (
                <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                {bulkAction === 'approve' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                Bulk {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Processing {selectedContributions.length} contributions at once.</p>
                        </div>
                        {bulkAction === 'reject' && (
                            <textarea
                                className="flex-1 min-h-[40px] p-2 bg-background border rounded text-sm"
                                placeholder="Reason for bulk rejection..."
                                value={bulkRejectionReason}
                                onChange={(e) => setBulkRejectionReason(e.target.value)}
                            />
                        )}
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setBulkAction(null)}>Cancel</Button>
                            <Button
                                size="sm"
                                variant={bulkAction === 'approve' ? 'default' : 'destructive'}
                                className={bulkAction === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                onClick={handleBulkApproval}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Bulk Action'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {optimisticPending.length === 0 ? (
                <Card className="bg-card border-border shadow-sm border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2">Queue Clear!</h3>
                        <p className="text-muted-foreground text-body max-w-sm">There are no pending contributions that require your attention at the moment.</p>
                        <Button variant="outline" className="mt-8" asChild>
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {optimisticPending.map((item) => (
                        <Card key={item.id} className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-shadow group">
                            <div className="grid md:grid-cols-[auto,1fr,240px] gap-0">
                                {/* Selection Column */}
                                <div className="hidden md:flex items-center px-4 bg-muted/10 border-r border-border">
                                    <Checkbox
                                        checked={selectedContributions.includes(item.id)}
                                        onCheckedChange={(checked) => handleSelectContribution(item.id, checked as boolean)}
                                    />
                                </div>

                                {/* Main Info Column */}
                                <CardContent className="p-5 md:p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl">
                                                {item.user.firstName[0]}{item.user.lastName[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-foreground group-hover:text-blue-600 transition-colors">
                                                    {item.user.firstName} {item.user.lastName}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider h-5">
                                                        {item.group.name}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <History className="w-3 h-3" />
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none mb-1">
                                                {formatCurrency(item.amount)}
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                {item.isLate && (
                                                    <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-none flex items-center gap-1 px-2 h-5">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Late (+{formatCurrency(item.penaltyApplied)})
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold h-5 border-border">
                                                    {item.paymentMethod.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Financial Context Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Current Balance</span>
                                                <Wallet className="w-3 h-3 text-muted-foreground opacity-50" />
                                            </div>
                                            <div className={`text-sm font-black ${item.member.balance < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                                                {formatCurrency(item.member.balance)}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Unpaid Penalties</span>
                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                            </div>
                                            <div className={`text-sm font-black ${item.member.unpaidPenalties > 0 ? 'text-red-600' : 'text-foreground'}`}>
                                                {formatCurrency(item.member.unpaidPenalties)}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Reference</span>
                                                <History className="w-3 h-3 text-muted-foreground opacity-50" />
                                            </div>
                                            <div className="text-sm font-black truncate text-foreground">
                                                {item.transactionRef || 'No Reference'}
                                            </div>
                                        </div>
                                    </div>

                                    {showRejectForm === item.id ? (
                                        <div className="space-y-4 pt-4 border-t border-border mt-2 animate-in slide-in-from-top-2 duration-300">
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1 block">Reason for rejection</label>
                                                <textarea
                                                    className="w-full min-h-[80px] p-3 border border-input rounded-xl text-sm bg-background/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                    placeholder="e.g. Reference number doesn't match receipt"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowRejectForm(null)
                                                        setRejectionReason('')
                                                    }}
                                                    className="rounded-full"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={isSubmitting || isPending}
                                                    onClick={() => handleReview(item.id, 'REJECTED')}
                                                    className="rounded-full px-6"
                                                >
                                                    {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 transition-all"
                                                onClick={() => setShowRejectForm(item.id)}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-8 shadow-sm hover:shadow-blue-200 dark:hover:shadow-none transition-all"
                                                disabled={isSubmitting || isPending}
                                                onClick={() => handleReview(item.id, 'COMPLETED')}
                                            >
                                                {reviewingId === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <><Check className="w-4 h-4 mr-2" /> Approve Payment</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>

                                {/* Receipt Column */}
                                <div className="bg-muted/30 border-l border-border relative overflow-hidden group/receipt min-h-[200px] md:min-h-0">
                                    {item.receiptUrl ? (
                                        <>
                                            <div className="h-full w-full flex items-center justify-center p-2">
                                                <img
                                                    src={item.receiptUrl}
                                                    alt="Receipt Preview"
                                                    className="w-full h-full object-cover rounded-md transition-transform duration-500 group-hover/receipt:scale-110"
                                                />
                                            </div>
                                            <button
                                                onClick={() => window.open(item.receiptUrl, '_blank')}
                                                className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover/receipt:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]"
                                            >
                                                <Eye className="w-10 h-10 mb-2 scale-50 group-hover/receipt:scale-100 transition-transform duration-300" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">View Full Receipt</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-40">
                                            <ImageIcon className="w-10 h-10 mb-2" />
                                            <p className="text-[10px] uppercase font-bold tracking-wider">No Receipt Attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
