'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
import { DollarSign, Loader2, X, ChevronDown, Calendar, User, FileText } from 'lucide-react'
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
    showTrigger?: boolean
}

export function RecordCashModal({ groupId, members, showTrigger = true }: RecordCashModalProps) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

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

    if (!mounted) return null

    const modalContent = (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8FAFC] dark:bg-[#020617] border border-white/20 shadow-2xl no-scrollbar flex flex-col z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-200 dark:border-white/10 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl">
                                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Record Cash
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 ml-11">Manually record a member payment.</p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
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
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg group-hover:text-emerald-500 transition-colors">$</span>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            value={isNaN(field.value) ? '' : field.value}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                            className="pl-10 h-14 text-lg font-bold rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
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
                                            onClick={() => setOpen(false)}
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
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            {showTrigger && (
                <Button
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="h-12 rounded-xl px-4 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-xs gap-2 group"
                >
                    <DollarSign className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">Record Cash</span>
                </Button>
            )}
            {createPortal(modalContent, document.body)}
        </>
    )
}
