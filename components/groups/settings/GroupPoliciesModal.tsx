'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateGroupSettings } from '@/app/actions/update-group-settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Save, X, Settings, Wallet, AlertOctagon, Landmark } from 'lucide-react'

interface GroupSettingsModalProps {
    group: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GroupSettingsModal({ group, open, onOpenChange }: GroupSettingsModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateGroupSettings(null, formData)
            if (result.success) {
                toast.success(result.message)
                router.refresh()
                onOpenChange(false)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    // Portal the content to document.body to ensure it appears on top of everything
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8FAFC] dark:bg-[#020617] border border-white/20 shadow-2xl no-scrollbar flex flex-col z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-200 dark:border-white/10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Group Configuration</h2>
                                <p className="text-sm text-muted-foreground mt-1">Adjust settings for {group.name}</p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <form action={handleSubmit} className="space-y-6">
                                <input type="hidden" name="groupId" value={group.id} />

                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                                        <TabsTrigger value="general" className="rounded-lg gap-2 text-xs sm:text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
                                            <Settings className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">General</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="contributions" className="rounded-lg gap-2 text-xs sm:text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
                                            <Wallet className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Funds</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="penalties" className="rounded-lg gap-2 text-xs sm:text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
                                            <AlertOctagon className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Penalties</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="loans" className="rounded-lg gap-2 text-xs sm:text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
                                            <Landmark className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Loans</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-6 focus-visible:outline-none focus:outline-none ring-0 outline-none">
                                        <div className="grid gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="monthlyContribution" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Monthly Contribution</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="monthlyContribution"
                                                        name="monthlyContribution"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.monthlyContribution}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Standard amount each member contributes per cycle.</p>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="socialFundAmount" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Social Fund</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="socialFundAmount"
                                                        name="socialFundAmount"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.socialFundAmount}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Separate fund for community emergencies.</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="contributions" className="space-y-6 focus-visible:outline-none focus:outline-none ring-0 outline-none">
                                        <div className="grid gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="lateContributionFee" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Late Contribution Fee</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="lateContributionFee"
                                                        name="lateContributionFee"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.lateContributionFee}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Fee charged for missing the contribution deadline.</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="penalties" className="space-y-6 focus-visible:outline-none focus:outline-none ring-0 outline-none">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="lateMeetingFine" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Late Meeting Fine</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="lateMeetingFine"
                                                        name="lateMeetingFine"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.lateMeetingFine}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="missedMeetingFine" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Missed Meeting Fine</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="missedMeetingFine"
                                                        name="missedMeetingFine"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.missedMeetingFine}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-3 sm:col-span-2">
                                                <Label htmlFor="penaltyAmount" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">General Penalty Base</Label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                                                    <Input
                                                        id="penaltyAmount"
                                                        name="penaltyAmount"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.penaltyAmount}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">Base amount for other unspecified infractions.</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="loans" className="space-y-6 focus-visible:outline-none focus:outline-none ring-0 outline-none">
                                        <div className="grid gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="interestRate" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Interest Rate</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="interestRate"
                                                        name="interestRate"
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="100"
                                                        className="pr-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                        defaultValue={group.interestRate}
                                                        placeholder="0.0"
                                                    />
                                                    <span className="absolute right-4 top-3 text-muted-foreground font-medium">%</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Monthly interest rate applied to loans.</p>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="maxLoanMultiplier" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Max Loan Multiplier</Label>
                                                <Input
                                                    id="maxLoanMultiplier"
                                                    name="maxLoanMultiplier"
                                                    type="number"
                                                    step="1"
                                                    min="1"
                                                    className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                                    defaultValue={group.maxLoanMultiplier}
                                                    placeholder="3"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Multiplier of savings to determine max loan (e.g., 2.0x savings).
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
