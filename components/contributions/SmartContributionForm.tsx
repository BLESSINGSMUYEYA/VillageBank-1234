'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReceiptUploader from './ReceiptUploader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/ui/section-header'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, itemFadeIn } from '@/lib/motions'
import { Loader2, DollarSign, Calculator, ArrowRight, Shield, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface Group {
    id: string
    name: string
    region: string
    monthlyContribution: number
    penaltyAmount: number
    contributionDueDay: number
}

interface UserContribution {
    amount: number
    month: number
    year: number
    status: string
}

export default function SmartContributionForm() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)
    const [groups, setGroups] = useState<Group[]>([])

    // Form State
    const [selectedGroupId, setSelectedGroupId] = useState<string>('')
    const [amount, setAmount] = useState<number>(0)
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 16))
    const [transactionRef, setTransactionRef] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<string>('')

    // Member State (Mocked or Fetched)
    const [memberBalance, setMemberBalance] = useState<number>(0)
    const [unpaidPenalties, setUnpaidPenalties] = useState<number>(0)

    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)

    // Fetch Groups on Mount
    useEffect(() => {
        async function fetchGroups() {
            try {
                const res = await fetch('/api/groups')
                if (res.ok) {
                    const data = await res.json()
                    // Filter groups where user is active
                    setGroups(data.groups.filter((g: any) =>
                        g.members.some((m: any) => m.status === 'ACTIVE')
                    ))
                }
            } catch (e) {
                console.error("Failed to fetch groups", e)
            }
        }
        fetchGroups()
    }, [])

    // When Group is selected, fetch member specifics (mock logic for now or fetched)
    useEffect(() => {
        if (selectedGroupId) {
            const group = groups.find(g => g.id === selectedGroupId)
            if (group) {
                // In a real app, we'd fetch specific member debts here.
                // For demonstration, let's assume random simulate or just 0 if clean.
                // We'll stick to 0 for now unless we have an endpoint for user-group-status.
                // If the user has access to `memberDetails` from previous context, use that.
                // For now, we will simulate or just use the passed logic.
            }
        }
    }, [selectedGroupId, groups])

    const handleScanComplete = (data: any) => {
        if (data.amount) setAmount(parseFloat(data.amount))
        if (data.transactionRef) setTransactionRef(data.transactionRef)
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod)
        if (data.date) {
            // Try to keep time if today, else just date at noon
            setPaymentDate(new Date(data.date).toISOString().slice(0, 16))
        }

        // Auto-advance if we have amount
        if (data.amount) {
            toast.success('Receipt details extracted successfully!')
        }
    }

    const selectedGroup = groups.find(g => g.id === selectedGroupId)

    // Smart Calculation Logic
    const calculateBreakdown = () => {
        if (!selectedGroup) return null

        let remaining = amount
        let appliedPenalty = 0
        let appliedFee = 0

        // 1. Deduct Penalties
        if (unpaidPenalties > 0 && remaining > 0) {
            appliedPenalty = Math.min(remaining, unpaidPenalties)
            remaining -= appliedPenalty
        }

        // 2. Deduct Monthly Fee (Logic: Check if paid this month? 
        // For simplicity in this form, assuming not paid or just showing potential allocation)
        // We will assume the goal is to pay the fee.
        const monthlyFee = selectedGroup.monthlyContribution
        if (remaining > 0) {
            // Simple logic: If remaining covers fee, allocate it. 
            // Real logic handles partials, but let's show "To Monthly Fee".
            appliedFee = remaining >= monthlyFee ? monthlyFee : remaining
            remaining -= appliedFee
        }

        const toBalance = remaining

        return {
            appliedPenalty,
            appliedFee,
            toBalance,
            isPartial: appliedFee < monthlyFee && appliedPenalty === 0 // Basic check
        }
    }

    const breakdown = calculateBreakdown()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroupId || amount <= 0) {
            toast.error("Please select a group and ensure amount is valid.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/contributions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: selectedGroupId,
                    amount,
                    paymentMethod: paymentMethod || 'OTHER',
                    transactionRef,
                    paymentDate: new Date(paymentDate).toISOString(),
                    // receiptUrl passed if we saved it in uploader (todo: pass url back from uploader)
                })
            })

            if (!res.ok) throw new Error("Submission failed")

            const data = await res.json()
            toast.success("Contribution recorded successfully!")
            router.push('/contributions')
        } catch (error) {
            toast.error("Failed to submit contribution.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Receipts Section */}
            <motion.div variants={itemFadeIn}>
                <SectionHeader title="Receipt Artifact" icon={Calculator} />
                <div className="mt-4">
                    <ReceiptUploader
                        onScanComplete={handleScanComplete}
                        onScanStart={() => setScanning(true)}
                        onError={(msg) => toast.error(msg)}
                    />
                </div>
            </motion.div>

            {/* Details Section */}
            <motion.div variants={itemFadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Input Form */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <div className="space-y-6">
                            <FormGroup label="Target Group *">
                                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                                    <SelectTrigger className="h-12 bg-muted/20 border-white/10">
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => (
                                            <SelectItem key={g.id} value={g.id}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormGroup>

                            <div className="grid grid-cols-2 gap-4">
                                <FormGroup label="Amount (MWK) *">
                                    <PremiumInput
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                        type="number"
                                        prefix="MWK"
                                    />
                                </FormGroup>
                                <FormGroup label="Date">
                                    <PremiumInput
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        type="datetime-local"
                                    />
                                </FormGroup>
                            </div>

                            <FormGroup label="Transaction Ref">
                                <PremiumInput
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder="e.g. CI240..."
                                />
                            </FormGroup>
                        </div>
                    </GlassCard>
                </div>

                {/* Right: Smart Breakdown */}
                <div className="space-y-6">
                    {selectedGroup ? (
                        <GlassCard className="p-6 h-full flex flex-col justify-between border-blue-500/20 bg-blue-500/5">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                    <Calculator className="w-4 h-4" /> Smart Allocation
                                </h3>

                                <div className="space-y-4">
                                    {/* Total Input */}
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                        <span className="text-sm font-bold text-foreground">Total Input</span>
                                        <span className="text-lg font-black text-blue-500">{formatCurrency(amount)}</span>
                                    </div>

                                    {/* Waterfall Breakdown */}
                                    <div className="space-y-2 pl-4 border-l-2 border-dashed border-white/10 ml-2">

                                        {/* Penalty */}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                Penalty Coverage
                                            </span>
                                            <span className="font-bold text-red-400">
                                                - {formatCurrency(breakdown?.appliedPenalty || 0)}
                                            </span>
                                        </div>

                                        {/* Fee */}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                Monthly Fee
                                            </span>
                                            <span className="font-bold text-orange-400">
                                                - {formatCurrency(breakdown?.appliedFee || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Final Balance */}
                                    <div className="pt-4 mt-4 border-t border-white/10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-wider text-muted-foreground">Net to Balance</span>
                                            <span className="text-xl font-black text-emerald-500">
                                                + {formatCurrency(breakdown?.toBalance || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="xl"
                                variant="banana"
                                className="w-full mt-6 shadow-xl shadow-yellow-500/10"
                                onClick={handleSubmit}
                                disabled={loading || amount <= 0}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Confirm & Submit"}
                            </Button>

                        </GlassCard>
                    ) : (
                        <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-3xl text-muted-foreground text-sm font-bold opacity-50">
                            Select a group to see financial breakdown
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    )
}
