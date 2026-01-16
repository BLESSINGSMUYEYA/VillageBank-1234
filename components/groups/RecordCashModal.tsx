'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { recordCashTransaction } from '@/app/actions/cash-transaction'
import { DollarSign, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    userId: z.string().min(1, 'Member is required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    month: z.number().min(1).max(12),
    year: z.number().min(2023),
    description: z.string().optional(),
})

interface Member {
    userId: string
    user: {
        firstName: string | null
        lastName: string | null
        email: string
    }
}

interface RecordCashModalProps {
    groupId: string
    members: Member[]
}

export function RecordCashModal({ groupId, members }: RecordCashModalProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    // [UX Improvement] Breakdown Calculation State
    const [groupDetails, setGroupDetails] = useState<{ monthlyContribution: number; penaltyAmount: number } | null>(null)
    const [selectedMemberUnpaidPenalties, setSelectedMemberUnpaidPenalties] = useState<number>(0)

    // Fetch group details on mount (lightweight)
    // Fetch group details on mount (lightweight)
    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                // In a real app we might pass this as a prop, but fetching is safe here
                const res = await fetch(`/api/groups/${groupId}`)
                if (res.ok) {
                    const data = await res.json()
                    setGroupDetails({
                        monthlyContribution: data.monthlyContribution,
                        penaltyAmount: data.penaltyAmount
                    })
                }
            } catch (e) {
                console.error("Failed to fetch group details for calculator", e)
            }
        }
        if (open) fetchGroupDetails()
    }, [open, groupId])

    // Calculate Breakdown
    const formValues = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: '',
            amount: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            description: '',
        },
    })
    const form = formValues // Alias for compatibility with existing code

    const watchedAmount = form.watch('amount')
    const watchedUserId = form.watch('userId')

    // Simplify: Just simulate the breakdown visually if we have the data
    const breakdown = groupDetails && watchedAmount > 0 ? (() => {
        const monthlyFee = groupDetails.monthlyContribution
        let remaining = watchedAmount

        // Mock penalty logic since we don't have exact user penalty state easily without another fetch
        // For UX, we'll just show the fee deduction primarily
        const appliedFee = Math.min(remaining, monthlyFee)
        const toBalance = remaining - appliedFee // Simplified: assumes no penalties for this quick view

        return { appliedFee, toBalance }
    })() : null

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await recordCashTransaction({
                groupId,
                userId: values.userId,
                amount: values.amount,
                month: values.month,
                year: values.year,
                description: values.description,
            })

            if (result.success) {
                toast.success('Transaction Recorded', {
                    description: 'Cash contribution has been successfully recorded.',
                })
                setOpen(false)
                form.reset()
                router.refresh()
            } else {
                toast.error('Failed to Record', {
                    description: result.error || 'An unexpected error occurred.',
                })
            }
        } catch (error) {
            toast.error('System Error', {
                description: 'A network or system error occurred. Please try again.',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl px-4 sm:px-6 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 font-bold text-xs gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="truncate">Record Cash</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Cash Transaction</DialogTitle>
                    <DialogDescription>
                        Manually record a cash contribution for a member.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Member</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {members.map((member) => (
                                                <SelectItem key={member.userId} value={member.userId}>
                                                    {member.user.firstName} {member.user.lastName} ({member.user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={isNaN(field.value) ? '' : field.value}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Month</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                                    <SelectItem key={m} value={String(m)}>
                                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Transaction
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
