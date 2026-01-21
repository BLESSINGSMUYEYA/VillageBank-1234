'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReceiptUploader from './ReceiptUploader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, itemFadeIn, staggerContainer } from '@/lib/motions'
import { DollarSign, Calculator, ArrowRight, Shield, TrendingUp, CheckCircle, AlertTriangle, Sparkles, Receipt, ArrowLeft, Send } from 'lucide-react'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { saveContribution, getSharedFile } from '@/lib/idb'
import { uploadReceipt } from '@/lib/upload'

interface Group {
    id: string
    name: string
    region: string
    monthlyContribution: number
    penaltyAmount: number
    contributionDueDay: number
}

interface SmartContributionFormProps {
    isModal?: boolean
    onClose?: () => void
}

export default function SmartContributionForm({ isModal, onClose }: SmartContributionFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    // [MODIFIED] Added step 3 to type
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [groups, setGroups] = useState<Group[]>([])

    // Form State
    const [selectedGroupId, setSelectedGroupId] = useState<string>('')
    const [amount, setAmount] = useState<number>(0)
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 16))
    const [transactionRef, setTransactionRef] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<string>('')

    // Receipt File State
    const [receiptFile, setReceiptFile] = useState<File | null>(null)

    // Member State (Mocked or Fetched)
    const [unpaidPenalties, setUnpaidPenalties] = useState<number>(0)

    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)

    // Check for shared file or URL
    useEffect(() => {
        const checkShared = async () => {
            const isShared = searchParams?.get('shared') === 'true'
            const receiptUrl = searchParams?.get('receiptUrl')

            if (receiptUrl) {
                try {
                    toast.loading("Loading shared receipt...")
                    const res = await fetch(receiptUrl)
                    const blob = await res.blob()
                    // Extract filename from URL or default
                    const filename = receiptUrl.split('/').pop() || 'shared-receipt.jpg'
                    const file = new File([blob], filename, { type: blob.type })
                    setReceiptFile(file)
                    toast.success('Shared receipt ready!')
                } catch (e) {
                    console.error("Failed to load receipt from URL", e)
                    toast.error("Failed to load shared receipt")
                } finally {
                    toast.dismiss()
                    router.replace(window.location.pathname)
                }
            } else if (isShared) {
                try {
                    const file = await getSharedFile()
                    if (file) {
                        setReceiptFile(file)
                        toast.success('Receipt loaded from share!')
                    }
                } catch (e) {
                    console.error("Failed to load shared file", e)
                }
                router.replace(window.location.pathname)
            }
        }
        checkShared()
    }, [searchParams, router])

    // Fetch Groups on Mount
    useEffect(() => {
        async function fetchGroups() {
            try {
                const res = await fetch('/api/groups')
                if (res.ok) {
                    const data = await res.json()
                    const activeGroups = data.groups.filter((g: any) =>
                        g.members.some((m: any) => m.status === 'ACTIVE')
                    ).map((g: any) => ({
                        ...g,
                        currentUserMember: g.members[0] // user's membership is filtered in API
                    }))
                    setGroups(activeGroups)

                    // UX Improvement: Auto-select if only 1 group
                    if (activeGroups.length === 1) {
                        setSelectedGroupId(activeGroups[0].id)
                    }
                }
            } catch (e) {
                console.error("Failed to fetch groups", e)
            }
        }
        fetchGroups()
    }, [])

    // Update unpaid penalties when group changes
    useEffect(() => {
        if (selectedGroupId) {
            const group = groups.find(g => g.id === selectedGroupId) as any
            if (group && group.currentUserMember) {
                setUnpaidPenalties(group.currentUserMember.unpaidPenalties || 0)
            }
        }
    }, [selectedGroupId, groups])

    const handleScanComplete = (data: any) => {
        setScanning(false)
        if (data.amount) setAmount(parseFloat(data.amount))
        if (data.transactionRef) setTransactionRef(data.transactionRef)
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod)
        if (data.date) {
            setPaymentDate(new Date(data.date).toISOString().slice(0, 16))
        }

        toast.success('Magic Scan Complete!')

        // Auto-advance removed - manual entry required
        // setTimeout(() => setStep(2), 800)
    }

    const selectedGroup = groups.find(g => g.id === selectedGroupId)

    // Smart Calculation Logic
    const breakdown = useMemo(() => {
        if (!selectedGroup || amount <= 0) return null

        let remaining = amount
        let appliedPenalty = 0
        let appliedFee = 0

        // 1. Deduct Penalties
        if (unpaidPenalties > 0 && remaining > 0) {
            appliedPenalty = Math.min(remaining, unpaidPenalties)
            remaining -= appliedPenalty
        }

        // 2. Deduct Monthly Fee
        const monthlyFee = selectedGroup.monthlyContribution
        if (remaining > 0) {
            appliedFee = Math.min(remaining, monthlyFee)
            remaining -= appliedFee
        }

        const toBalance = remaining

        return {
            appliedPenalty,
            appliedFee,
            toBalance,
            isPartial: appliedFee < monthlyFee && appliedPenalty === 0
        }
    }, [selectedGroup, amount, unpaidPenalties])


    const handleSubmit = async () => {
        // [DEBUG] Explicit alert for debugging
        if (!selectedGroupId || amount <= 0) {
            console.log("Validation failed", { selectedGroupId, amount })
            toast.error("Please ensure group and amount are valid.")
            // alert("Validation Failed: Check Group and Amount")
            return
        }

        console.log("Submitting contribution...")
        setLoading(true)

        // Prepare payload for both online and offline use
        const payload = {
            groupId: selectedGroupId,
            amount,
            paymentMethod: paymentMethod || 'OTHER',
            transactionRef,
            paymentDate: new Date(paymentDate).toISOString(),
            penaltyPaid: breakdown?.appliedPenalty || 0,
        }

        try {
            if (navigator.onLine) {
                let receiptUrl = ''
                if (receiptFile) {
                    toast.loading("Uploading secure proof...")
                    receiptUrl = await uploadReceipt(receiptFile)
                    toast.dismiss()
                }

                const res = await fetch('/api/contributions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...payload,
                        receiptUrl: receiptUrl || undefined,
                    })
                })

                if (!res.ok) throw new Error("Submission failed")

                // [MODIFIED] Success Handler: Set step 3 and delay redirect
                setStep(3)
                setTimeout(() => {
                    if (isModal && onClose) {
                        onClose()
                    }
                    router.push('/contributions')
                }, 2500)

            } else {
                throw new Error("Offline")
            }
        } catch (error: any) {
            // Handle Offline / Network Errors
            if (!navigator.onLine || error.message === 'Offline' || error.message.includes('fetch')) {
                toast.dismiss()
                toast.loading("Saving offline...")
                try {
                    await saveContribution({
                        payload,
                        file: receiptFile
                    })

                    // Register Background Sync if available
                    if ('serviceWorker' in navigator && 'SyncManager' in window) {
                        const registration = await navigator.serviceWorker.ready
                        // @ts-ignore
                        await registration.sync.register('sync-contributions')
                    }

                    toast.dismiss()
                    toast.success("Contribution saved offline!", {
                        description: "Will sync automatically when you're back online."
                    })

                    // [MODIFIED] Offline Success also shows success screen
                    setStep(3)
                    setTimeout(() => {
                        if (isModal && onClose) {
                            onClose()
                        }
                        router.push('/contributions')
                    }, 2500)

                } catch (saveErr) {
                    console.error(saveErr)
                    toast.dismiss()
                    toast.error("Failed to save offline. Please try again.")
                }
            } else {
                toast.dismiss()
                toast.error(error.message || "Failed to submit contribution.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("mx-auto px-4", isModal ? "max-w-full" : "max-w-4xl")}>
            {/* Step Indicator - Hidden on Success Step for cleaner look */}
            {step < 3 && (
                <div className="flex items-center justify-center mb-12 gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500",
                        step === 1 ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20" : "bg-emerald-500 text-white"
                    )}>
                        {step > 1 ? <CheckCircle className="w-6 h-6" /> : "1"}
                    </div>
                    <div className={cn("h-1 w-16 rounded-full transition-colors duration-500", step === 2 ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted")} />
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500",
                        step === 2 ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20" : "bg-muted text-muted-foreground"
                    )}>
                        2
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-foreground">Upload Receipt</h2>
                            <p className="text-muted-foreground font-medium">Upload your proof of payment for treasurer verification.</p>

                            {/* Skip Toggle */}
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="link"
                                    onClick={() => setStep(2)}
                                    className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400"
                                >
                                    Don&apos;t have a receipt? Skip to manual entry
                                </Button>
                            </div>

                            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-bold hidden">Note: Auto-scan temporarily unavailable. Please enter details manually in Step 2.</p>
                        </div>

                        <GlassCard className="p-2 overflow-hidden border-white/20 shadow-2xl" hover={false}>
                            <ReceiptUploader
                                onScanComplete={handleScanComplete}
                                onScanStart={() => setScanning(true)}
                                onError={(msg) => toast.error(msg)}
                                onFileSelect={setReceiptFile}
                                initialFile={receiptFile}
                            />
                        </GlassCard>

                        <div className="flex justify-center">
                            <Button
                                variant="ghost"
                                className="text-muted-foreground font-bold hover:text-foreground"
                                onClick={() => setStep(2)}
                            >
                                Continue to manual entry <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ) : step === 2 ? (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Review & Allocate</h2>
                            <p className="text-muted-foreground font-medium">Verify your details and see how your funds are distributed.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr,340px] gap-8">
                            {/* Left: Refined Form */}
                            <div className="space-y-6">
                                <GlassCard className="p-6 border-white/10" hover={false}>
                                    <div className="space-y-6">
                                        <FormGroup label="Target Group *">
                                            <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={scanning}>
                                                <SelectTrigger className="h-12 bg-muted/20 border-white/10 rounded-xl">
                                                    <SelectValue placeholder="Select Group" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {groups.map(g => (
                                                        <SelectItem key={g.id} value={g.id} className="font-bold">
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
                                                    disabled={scanning}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Payment Date">
                                                <PremiumInput
                                                    value={paymentDate}
                                                    onChange={(e) => setPaymentDate(e.target.value)}
                                                    type="datetime-local"
                                                    disabled={scanning}
                                                />
                                            </FormGroup>
                                        </div>

                                        <FormGroup label="Transaction Reference">
                                            <PremiumInput
                                                value={transactionRef}
                                                onChange={(e) => setTransactionRef(e.target.value)}
                                                placeholder="e.g. CI2409822..."
                                                disabled={scanning}
                                            />
                                        </FormGroup>
                                    </div>
                                </GlassCard>

                                <div className="flex justify-between items-center">
                                    <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground" onClick={() => setStep(1)}>
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Scanner
                                    </Button>
                                    <div className="flex gap-2">
                                        {receiptFile && <Badge variant="secondary" className="h-8 rounded-full border-blue-500/20 px-3 flex items-center gap-1.5 font-bold">
                                            <Receipt className="w-3.5 h-3.5 text-blue-500" /> Receipt Attached
                                        </Badge>}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Premium Breakdown Summary */}
                            <div className="space-y-6">
                                <GlassCard className="p-6 h-full flex flex-col justify-between border-blue-500/20 bg-blue-500/5 relative overflow-hidden" hover={false}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <Sparkles className="w-20 h-20 text-blue-500" />
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60 mb-6 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Intelligent Ledgering
                                        </h3>

                                        {breakdown ? (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Proof</p>
                                                    <p className="text-3xl font-black text-foreground">{formatCurrency(amount)}</p>
                                                </div>

                                                <div className="space-y-4 border-l-2 border-muted pl-4 py-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground font-bold flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                            Penalties
                                                        </span>
                                                        <span className="font-black text-red-500">-{formatCurrency(breakdown.appliedPenalty)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground font-bold flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                                                            Monthly Fee
                                                        </span>
                                                        <span className="font-black text-orange-400">-{formatCurrency(breakdown.appliedFee)}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-muted">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Net Stake</p>
                                                            <p className="text-2xl font-black text-emerald-500 leading-none">+{formatCurrency(breakdown.toBalance)}</p>
                                                        </div>
                                                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 space-y-4">
                                                <Calculator className="w-8 h-8 mx-auto text-muted-foreground opacity-20" />
                                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">Select a group to see how your funds will be intelligently allocated.</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        size="xl"
                                        variant="default"
                                        className="w-full mt-8 shadow-xl shadow-yellow-500/20 font-black h-16 rounded-2xl group"
                                        onClick={handleSubmit}
                                        disabled={loading || amount <= 0 || !selectedGroupId}
                                    >
                                        {loading ? <InlineLogoLoader size="sm" /> : (
                                            <>
                                                Secure Confirm
                                                <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </GlassCard>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // [MODIFIED] Step 3: Success Screen
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 space-y-6"
                    >
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-foreground">Success!</h2>
                            <p className="text-muted-foreground font-medium">Your contribution has been securely sent.</p>
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">Redirecting you to contributions...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
