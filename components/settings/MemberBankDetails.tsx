'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    CreditCard,
    Phone,
    Building2,
    Plus,
    Trash2,
    Star,
    StarOff,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'

interface BankDetail {
    id: string
    type: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD'
    bankName?: string
    accountNumber: string
    accountName: string
    isPrimary: boolean
    createdAt: string
}

const paymentMethodConfig = {
    AIRTEL_MONEY: {
        icon: Phone,
        label: 'Airtel Money',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
    },
    MPAMBA: {
        icon: Phone,
        label: 'Mpamba',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
    },
    BANK_CARD: {
        icon: Building2,
        label: 'Bank Account',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
    },
}

export function MemberBankDetails() {
    const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        type: 'AIRTEL_MONEY' as 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD',
        accountNumber: '',
        accountName: '',
        bankName: '',
    })

    const fetchBankDetails = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/member/bank-details')
            if (res.ok) {
                const data = await res.json()
                setBankDetails(data.bankDetails)
            }
        } catch {
            console.error('Failed to fetch bank details')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBankDetails()
    }, [])

    const handleAddBankDetail = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const res = await fetch('/api/member/bank-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to add payment method')
                return
            }

            setSuccess('Payment method added successfully!')
            setIsAddDialogOpen(false)
            setFormData({
                type: 'AIRTEL_MONEY',
                accountNumber: '',
                accountName: '',
                bankName: '',
            })
            fetchBankDetails()
            setTimeout(() => setSuccess(null), 3000)
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSetPrimary = async (id: string) => {
        try {
            const res = await fetch(`/api/member/bank-details/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPrimary: true }),
            })

            if (res.ok) {
                fetchBankDetails()
            }
        } catch {
            console.error('Failed to set primary')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/member/bank-details/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setSuccess('Payment method deleted successfully!')
                fetchBankDetails()
                setTimeout(() => setSuccess(null), 3000)
            }
        } catch {
            console.error('Failed to delete')
        } finally {
            setDeleteConfirmId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <InlineLogoLoader size="md" />
            </div>
        )
    }

    return (
        <motion.div variants={itemFadeIn} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your payment methods for receiving loan disbursements
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    size="sm"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Method
                </Button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">{success}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bank Details List */}
            {bankDetails.length === 0 ? (
                <GlassCard className="p-8 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No payment methods added yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Add a payment method to receive loan disbursements
                    </p>
                </GlassCard>
            ) : (
                <div className="grid gap-3">
                    {bankDetails.map((detail) => {
                        const config = paymentMethodConfig[detail.type]
                        const Icon = config.icon

                        return (
                            <GlassCard
                                key={detail.id}
                                className={cn(
                                    'p-4 transition-all duration-200',
                                    detail.isPrimary && 'ring-2 ring-primary/50'
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                            <Icon className={cn('h-5 w-5', config.color)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{config.label}</span>
                                                {detail.isPrimary && (
                                                    <Badge variant="secondary" className="text-xs gap-1">
                                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{detail.accountName}</p>
                                            <p className="text-sm font-mono">{detail.accountNumber}</p>
                                            {detail.bankName && (
                                                <p className="text-xs text-muted-foreground mt-1">{detail.bankName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!detail.isPrimary && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleSetPrimary(detail.id)}
                                                title="Set as primary"
                                            >
                                                <StarOff className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteConfirmId(detail.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            )}

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Add a new payment method for receiving loan disbursements
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddBankDetail} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Payment Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD') =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AIRTEL_MONEY">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-red-500" />
                                            Airtel Money
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MPAMBA">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-yellow-500" />
                                            Mpamba
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="BANK_CARD">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            Bank Account
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Account Name</Label>
                            <Input
                                placeholder="John Banda"
                                value={formData.accountName}
                                onChange={(e) =>
                                    setFormData({ ...formData, accountName: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                {formData.type === 'BANK_CARD' ? 'Account Number' : 'Phone Number'}
                            </Label>
                            <Input
                                placeholder={formData.type === 'BANK_CARD' ? '1234567890' : '0999123456'}
                                value={formData.accountNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, accountNumber: e.target.value })
                                }
                                required
                            />
                        </div>

                        {formData.type === 'BANK_CARD' && (
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input
                                    placeholder="National Bank of Malawi"
                                    value={formData.bankName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bankName: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <div className="mr-2"><InlineLogoLoader size="xs" /></div>}
                                Add Payment Method
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this payment method? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
