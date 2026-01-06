'use client'

import { useState, useEffect, useCallback } from 'react'
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
    Phone,
    Building2,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Copy,
    CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { itemFadeIn } from '@/lib/motions'

interface PaymentMethod {
    id: string
    type: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD'
    accountNumber: string
    accountName: string
    isActive: boolean
    createdAt: string
}

interface GroupPaymentMethodsProps {
    groupId: string
    isAdmin?: boolean
    isTreasurer?: boolean
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

export function GroupPaymentMethods({
    groupId,
    isAdmin = false,
    isTreasurer = false
}: GroupPaymentMethodsProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const canManage = isAdmin || isTreasurer

    // Form state
    const [formData, setFormData] = useState({
        type: 'AIRTEL_MONEY' as 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD',
        accountNumber: '',
        accountName: '',
    })

    const fetchPaymentMethods = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/groups/${groupId}/payment-methods`)
            if (res.ok) {
                const data = await res.json()
                setPaymentMethods(data.paymentMethods)
            }
        } catch {
            console.error('Failed to fetch payment methods')
        } finally {
            setLoading(false)
        }
    }, [groupId])

    useEffect(() => {
        fetchPaymentMethods()
    }, [fetchPaymentMethods])

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const res = await fetch(`/api/groups/${groupId}/payment-methods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to add payment method')
                return
            }

            setSuccess('Payment account added successfully!')
            setIsAddDialogOpen(false)
            setFormData({
                type: 'AIRTEL_MONEY',
                accountNumber: '',
                accountName: '',
            })
            fetchPaymentMethods()
            setTimeout(() => setSuccess(null), 3000)
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (methodId: string) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/payment-methods/${methodId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setSuccess('Payment account removed successfully!')
                fetchPaymentMethods()
                setTimeout(() => setSuccess(null), 3000)
            }
        } catch {
            console.error('Failed to delete')
        } finally {
            setDeleteConfirmId(null)
        }
    }

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div variants={itemFadeIn} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payment Accounts
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {canManage
                            ? 'Manage group payment accounts for contributions'
                            : 'Available accounts for making contributions'}
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        size="sm"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Account
                    </Button>
                )}
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

            {/* Payment Methods List */}
            {paymentMethods.length === 0 ? (
                <GlassCard className="p-8 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No payment accounts set up yet</p>
                    {canManage && (
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            Add payment accounts so members know where to send contributions
                        </p>
                    )}
                </GlassCard>
            ) : (
                <div className="grid gap-3">
                    {paymentMethods.map((method) => {
                        const config = paymentMethodConfig[method.type]
                        const Icon = config.icon
                        const isCopied = copiedId === method.id

                        return (
                            <GlassCard
                                key={method.id}
                                className="p-4 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                            <Icon className={cn('h-5 w-5', config.color)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{config.label}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    Group Account
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{method.accountName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-sm font-mono">{method.accountNumber}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleCopy(method.accountNumber, method.id)}
                                                    title="Copy account number"
                                                >
                                                    {isCopied ? (
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteConfirmId(method.id)}
                                            title="Remove account"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
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
                        <DialogTitle>Add Payment Account</DialogTitle>
                        <DialogDescription>
                            Add a group payment account for members to send contributions
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddPaymentMethod} className="space-y-4">
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
                                placeholder="Group Treasurer"
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

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Account
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Payment Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this payment account? Members will no longer see it as an option.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
