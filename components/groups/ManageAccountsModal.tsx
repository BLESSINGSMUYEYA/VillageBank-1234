'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Wallet, Landmark, Loader2 } from 'lucide-react'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PaymentMethod {
    id: string
    type: string
    accountNumber: string
    accountName: string
    bankName?: string
}

interface ManageAccountsModalProps {
    isOpen: boolean
    onClose: () => void
    groupId: string
    paymentMethods: PaymentMethod[]
}

export function ManageAccountsModal({ isOpen, onClose, groupId, paymentMethods: initialMethods }: ManageAccountsModalProps) {
    const router = useRouter()
    const [view, setView] = useState<'LIST' | 'ADD'>('LIST')
    const [loading, setLoading] = useState(false)

    // Form State
    const [type, setType] = useState<string>('AIRTEL_MONEY')
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [bankName, setBankName] = useState('')

    const handleAdd = async () => {
        if (!accountName || !accountNumber) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/groups/${groupId}/payment-methods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    accountName,
                    accountNumber,
                    bankName: type === 'BANK_CARD' ? bankName : undefined
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to add account")

            toast.success("Account added successfully!")
            setView('LIST')
            resetForm()
            // Refresh data
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this account?")) return

        try {
            const res = await fetch(`/api/groups/${groupId}/payment-methods?methodId=${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error("Failed to delete account")

            toast.success("Account removed")
            router.refresh()
        } catch (error) {
            toast.error("Failed to remove account")
        }
    }

    const resetForm = () => {
        setAccountName('')
        setAccountNumber('')
        setBankName('')
        setType('AIRTEL_MONEY')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{view === 'LIST' ? 'Manage Accounts' : 'Add New Account'}</DialogTitle>
                    <DialogDescription>
                        {view === 'LIST'
                            ? 'Manage the payment destinations for this group.'
                            : 'Enter the details for the new payment account.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {view === 'LIST' ? (
                        <div className="space-y-4">
                            {initialMethods.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                    <p className="text-sm">No accounts added yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {initialMethods.map(method => (
                                        <div key={method.id} className="flex items-center justify-between p-3 border rounded-xl bg-card">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.type === 'AIRTEL_MONEY' ? 'bg-red-100 text-red-600' :
                                                        method.type === 'MPAMBA' ? 'bg-green-100 text-green-600' :
                                                            'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {method.type === 'BANK_CARD' ? <Landmark className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{method.accountName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {method.type === 'BANK_CARD' ? method.bankName : method.type.replace('_', ' ')} • {method.accountNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDelete(method.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button onClick={() => setView('ADD')} className="w-full font-bold">
                                <Plus className="w-4 h-4 mr-2" /> Add New Account
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <FormGroup label="Account Type">
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                                        <SelectItem value="MPAMBA">Mpamba (TNM)</SelectItem>
                                        <SelectItem value="BANK_CARD">Bank Account</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormGroup>

                            {type === 'BANK_CARD' && (
                                <FormGroup label="Bank Name">
                                    <PremiumInput
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="e.g. National Bank"
                                    />
                                </FormGroup>
                            )}

                            <FormGroup label="Account Name">
                                <PremiumInput
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="e.g. Village Savings Group"
                                />
                            </FormGroup>

                            <FormGroup label={type === 'BANK_CARD' ? "Account Number" : "Phone Number"}>
                                <PremiumInput
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder={type === 'BANK_CARD' ? "100xxxxxxx" : "099xxxxxxx"}
                                />
                            </FormGroup>

                            <div className="flex gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setView('LIST')} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleAdd} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Account"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
