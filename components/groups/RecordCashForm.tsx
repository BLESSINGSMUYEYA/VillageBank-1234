'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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
import { Loader2, Calendar, User, FileText } from 'lucide-react'
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

interface RecordCashFormProps {
    groupId: string
    members: Member[]
    onSuccess: () => void
    onCancel: () => void
}

export function RecordCashForm({ groupId, members, onSuccess, onCancel }: RecordCashFormProps) {
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: '',
            amount: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            description: '',
        },
    })

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
                form.reset()
                router.refresh()
                onSuccess()
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Member Selection */}
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Member</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <SelectValue placeholder="Select a member" />
                                        </div>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-white/10">
                                    {members.map((member) => (
                                        <SelectItem key={member.userId} value={member.userId} className="rounded-lg focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer py-3">
                                            <span className="font-medium">{member.user.firstName} {member.user.lastName}</span>
                                            <span className="text-xs text-muted-foreground ml-2">({member.user.email})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Amount Input */}
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Amount</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg group-hover:text-emerald-500 transition-colors">MWK</span>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={isNaN(field.value) ? '' : field.value}
                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                        className="pl-14 h-14 text-lg font-bold rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Month</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <SelectValue placeholder="Month" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[300px] rounded-xl border-slate-200 dark:border-white/10">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={String(m)} className="rounded-lg cursor-pointer">
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
                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Year</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                        className="h-12 font-medium rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Notes (Optional)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        {...field}
                                        className="pl-10 h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50"
                                        placeholder="Add any payment details..."
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="h-12 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Recording...
                            </>
                        ) : (
                            <>
                                Record Transaction
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
