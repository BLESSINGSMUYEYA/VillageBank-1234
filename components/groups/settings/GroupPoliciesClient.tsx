'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateGroupSettings } from '@/app/actions/update-group-settings'
import { toast } from 'sonner'
import { Loader2, Save, Wallet, AlertOctagon, Landmark } from 'lucide-react'

interface GroupPoliciesClientProps {
    group: any
    onSuccess?: () => void
}

export function GroupPoliciesClient({ group, onSuccess }: GroupPoliciesClientProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateGroupSettings(null, formData)
            if (result.success) {
                toast.success(result.message)
                router.refresh()
                onSuccess?.()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="groupId" value={group.id} />

            <Tabs defaultValue="funds" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                    <TabsTrigger value="funds" className="rounded-lg gap-2 text-xs sm:text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm transition-all">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Funds & Fees</span>
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

                <TabsContent value="funds" className="space-y-6 focus-visible:outline-none focus:outline-none ring-0 outline-none">
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex justify-end pt-8 border-t border-slate-200 dark:border-white/10">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-emerald-500/20"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
