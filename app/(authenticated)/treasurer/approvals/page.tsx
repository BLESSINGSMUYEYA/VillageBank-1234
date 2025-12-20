'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Check, X, Eye, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export default function TreasurerApprovalsPage() {
    const [pending, setPending] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const handleReview = async (id: string, status: 'COMPLETED' | 'REJECTED') => {
        if (status === 'REJECTED' && !rejectionReason) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setIsSubmitting(true)
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
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
                    <p className="text-gray-600">Review and approve member contributions</p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                    {pending.length} Pending
                </Badge>
            </div>

            {pending.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500">There are no contributions waiting for approval.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pending.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="grid md:grid-cols-[1fr,250px] gap-0">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.user.firstName} {item.user.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{item.group.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-blue-600">
                                                {formatCurrency(item.amount)}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500 text-xs mb-1 uppercase font-semibold">Payment Method</p>
                                            <p className="font-medium">{item.paymentMethod.replace('_', ' ')}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500 text-xs mb-1 uppercase font-semibold">Reference</p>
                                            <p className="font-medium truncate">{item.transactionRef || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {showRejectForm === item.id ? (
                                        <div className="space-y-4 pt-4 border-t">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Reason for rejection</label>
                                                <textarea
                                                    className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                                                    placeholder="e.g. Reference number doesn't match receipt"
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowRejectForm(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={isSubmitting}
                                                    onClick={() => handleReview(item.id, 'REJECTED')}
                                                >
                                                    {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end space-x-3 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setShowRejectForm(item.id)}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={isSubmitting}
                                                onClick={() => handleReview(item.id, 'COMPLETED')}
                                            >
                                                {isSubmitting ? 'Approving...' : (
                                                    <><Check className="w-4 h-4 mr-2" /> Approve</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>

                                <div className="bg-gray-100 border-l relative overflow-hidden group/receipt">
                                    {item.receiptUrl ? (
                                        <div className="h-full w-full flex items-center justify-center p-4">
                                            <img
                                                src={item.receiptUrl}
                                                alt="Receipt"
                                                className="w-full h-full object-contain cursor-zoom-in transition-transform group-hover/receipt:scale-105"
                                                onClick={() => window.open(item.receiptUrl, '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/receipt:opacity-100 transition-opacity flex items-center justify-center">
                                                <Eye className="text-white w-8 h-8" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                            <p className="text-xs">No receipt uploaded</p>
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
