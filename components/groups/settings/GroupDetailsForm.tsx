'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateGroupDetails } from '@/app/actions/update-group-details'
import { updateGroupSettings } from '@/app/actions/update-group-settings'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Save, MapPin, Calendar, Mail, Phone, Wallet, AlertOctagon, Landmark, Shield, Trash2, AlertTriangle } from 'lucide-react'

interface GroupDetailsFormProps {
    group: any
    onSuccess?: () => void
}

export function GroupDetailsForm({ group, onSuccess }: GroupDetailsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete group')
            }

            toast.success('Group deleted successfully')
            router.push('/groups')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred')
            setIsDeleting(false)
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            // Execute both updates
            const [detailsResult, settingsResult] = await Promise.all([
                updateGroupDetails(null, formData),
                updateGroupSettings(null, formData)
            ])

            if (detailsResult.success && settingsResult.success) {
                toast.success('Group settings updated successfully')
                router.refresh()
                onSuccess?.()
            } else {
                // Determine which one failed or show generic error
                const error = detailsResult.error || settingsResult.error || 'Failed to update some settings'
                toast.error(error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <input type="hidden" name="groupId" value={group.id} />

            {/* SECTION 1: GENERAL INFORMATION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    <h3 className="font-bold text-lg">General Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Group Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={group?.name || ''}
                            className="bg-white dark:bg-slate-900/50"
                            placeholder="Enter group name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="region" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Region</Label>
                        <Select name="region" defaultValue={group?.region || 'NORTHERN'}>
                            <SelectTrigger className="bg-white dark:bg-slate-900/50">
                                <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NORTHERN">Northern Region</SelectItem>
                                <SelectItem value="CENTRAL">Central Region</SelectItem>
                                <SelectItem value="SOUTHERN">Southern Region</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={group?.description || ''}
                        className="min-h-[80px] bg-white dark:bg-slate-900/50 resize-none"
                        placeholder="Describe your group..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            Meeting Details
                        </h4>
                        <div className="space-y-2">
                            <Label htmlFor="meetingFrequency" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</Label>
                            <Select name="meetingFrequency" defaultValue={group?.meetingFrequency || 'MONTHLY'}>
                                <SelectTrigger className="bg-white dark:bg-slate-900/50">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                    <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meetingLocation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="meetingLocation"
                                    name="meetingLocation"
                                    defaultValue={group?.meetingLocation || ''}
                                    className="pl-9 bg-white dark:bg-slate-900/50"
                                    placeholder="e.g. Community Center"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            Contact Info
                        </h4>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="contactEmail"
                                    name="contactEmail"
                                    type="email"
                                    defaultValue={group?.contactEmail || ''}
                                    className="pl-9 bg-white dark:bg-slate-900/50"
                                    placeholder="group@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="contactPhone"
                                    name="contactPhone"
                                    defaultValue={group?.contactPhone || ''}
                                    className="pl-9 bg-white dark:bg-slate-900/50"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 1.5: BANK CONFIGURATION */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                    <h3 className="font-bold text-lg">Bank Cycle</h3>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 space-y-4">
                    <div className="grid gap-3">
                        <Label htmlFor="cycleEndDate" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cycle End Date (Share Out)</Label>
                        <Input
                            id="cycleEndDate"
                            name="cycleEndDate"
                            type="date"
                            className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 h-12 rounded-xl"
                            defaultValue={group?.cycleEndDate ? new Date(group.cycleEndDate).toISOString().split('T')[0] : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            The date when the current banking cycle ends and funds are distributed (Share Out).
                            Loans cannot be issued past this date.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: FUNDS & FEES */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    <h3 className="font-bold text-lg">Funds & Fees</h3>
                </div>

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
                                defaultValue={group?.monthlyContribution || 0}
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
                                defaultValue={group?.socialFundAmount || 0}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Separate fund for community emergencies.</p>
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
                                defaultValue={group?.lateContributionFee || 0}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Fee charged for missing the contribution deadline.</p>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="contributionDueDay" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Contribution Due Day</Label>
                        <Input
                            id="contributionDueDay"
                            name="contributionDueDay"
                            type="number"
                            min="1"
                            max="31"
                            step="1"
                            className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                            defaultValue={group?.contributionDueDay || 5}
                            placeholder="Day (1-31)"
                        />
                        <p className="text-xs text-muted-foreground">Day of the month when contributions are expected.</p>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="minContributionMonths" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Min. Contribution Months</Label>
                        <Input
                            id="minContributionMonths"
                            name="minContributionMonths"
                            type="number"
                            min="0"
                            step="1"
                            className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                            defaultValue={group?.minContributionMonths || 0}
                            placeholder="3"
                        />
                        <p className="text-xs text-muted-foreground">Months of contributions required before loan eligibility.</p>
                    </div>
                </div>
            </div>

            {/* SECTION 3: PENALTIES */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <h3 className="font-bold text-lg">Penalties</h3>
                </div>

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
                                defaultValue={group?.lateMeetingFine || 0}
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
                                defaultValue={group?.missedMeetingFine || 0}
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
                                defaultValue={group?.penaltyAmount || 0}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Base amount for other unspecified infractions.</p>
                    </div>
                </div>
            </div>

            {/* SECTION 4: LOANS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
                    <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                    <h3 className="font-bold text-lg">Loans</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                defaultValue={group?.interestRate || 10}
                                placeholder="0.0"
                            />
                            <span className="absolute right-4 top-3 text-muted-foreground font-medium">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Monthly interest rate applied to loans.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="grid gap-3">
                        <Label htmlFor="minLoanAmount" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Min Loan Amount (MWK)</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                            <Input
                                id="minLoanAmount"
                                name="minLoanAmount"
                                type="number"
                                min="0"
                                step="1"
                                className="pl-8 h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                                defaultValue={group?.minLoanAmount || 0}
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum amount a member can request.</p>
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
                            defaultValue={group?.maxLoanMultiplier || 3}
                            placeholder="3"
                        />
                        <p className="text-xs text-muted-foreground">
                            Multiplier of savings to determine max loan (e.g., 3x savings).
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="loanInterestType" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Interest Type</Label>
                        <Select name="loanInterestType" defaultValue={group?.loanInterestType || 'FLAT_RATE'}>
                            <SelectTrigger className="bg-white dark:bg-slate-900/50">
                                <SelectValue placeholder="Select interest type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FLAT_RATE">Flat Rate</SelectItem>
                                <SelectItem value="REDUCING_BALANCE">Reducing Balance</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Method used to calculate loan interest.</p>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="loanGracePeriodDays" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Grace Period (Days)</Label>
                        <Input
                            id="loanGracePeriodDays"
                            name="loanGracePeriodDays"
                            type="number"
                            min="0"
                            step="1"
                            className="h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 rounded-xl"
                            defaultValue={group?.loanGracePeriodDays || 0}
                            placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">Days before penalties or interest apply.</p>
                    </div>
                </div>
            </div>

            {/* SECTION 5: DANGER ZONE */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-900/30">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <h3 className="font-bold text-lg text-red-600 dark:text-red-500">Danger Zone</h3>
                </div>

                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-red-900 dark:text-red-200">Delete this group</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Once you delete a group, there is no going back. Please be certain.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold shrink-0">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Group
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the group
                                    <span className="font-bold text-foreground"> {group.name} </span>
                                    and remove all associated data including members, contributions, and loans.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white font-bold"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Group'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-end pt-8 border-t border-slate-200 dark:border-white/10 sticky bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
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
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
