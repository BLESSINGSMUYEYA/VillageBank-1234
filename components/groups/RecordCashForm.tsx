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
import { PremiumInput } from '@/components/ui/premium-input'
import { FormGroup } from '@/components/ui/form-group'
import { useRouter } from 'next/navigation'
import { User, Calendar, FileText, Loader2 } from 'lucide-react'

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
                        <FormGroup label="Member" error={form.formState.errors.userId?.message}>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border-dashed hover:border-solid hover:shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <SelectValue placeholder="Select a member" />
                                        </div>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl">
                                    {members.map((member) => (
                                        <SelectItem key={member.userId} value={member.userId} className="rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-500/10 cursor-pointer py-3 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-slate-100">{member.user.firstName} {member.user.lastName}</span>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60 tracking-wider">({member.user.email})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormGroup>
                    )}
                />

                {/* Amount Input */}
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormGroup label="Amount" error={form.formState.errors.amount?.message}>
                            <PremiumInput
                                type="number"
                                prefix="MWK"
                                placeholder="0.00"
                                className="h-14 text-lg font-black"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                        </FormGroup>
                    )}
                />

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                            <FormGroup label="Month" error={form.formState.errors.month?.message}>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 transition-all">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                <SelectValue placeholder="Month" />
                                            </div>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[300px] rounded-xl border-slate-200 dark:border-white/10 backdrop-blur-xl">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={String(m)} className="rounded-lg cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-500/10">
                                                {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormGroup>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormGroup label="Year" error={form.formState.errors.year?.message}>
                                <PremiumInput
                                    type="number"
                                    className="h-12 font-bold"
                                    {...field}
                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                />
                            </FormGroup>
                        )}
                    />
                </div>

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormGroup label="Notes (Optional)" error={form.formState.errors.description?.message}>
                            <PremiumInput
                                {...field}
                                icon={<FileText className="w-4 h-4" />}
                                className="h-12"
                                placeholder="Add any payment details..."
                            />
                        </FormGroup>
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
