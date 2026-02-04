"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { getRecurringPayments } from "@/lib/recurring-payments";

interface RecurringPayment {
    id: string;
    amount: number;
    frequency: "WEEKLY" | "MONTHLY";
    status: "ACTIVE" | "PAUSED" | "COMPLETED";
}

export function MonthlyCommitmentCard() {
    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const data = await getRecurringPayments();
            setPayments(data as RecurringPayment[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalMonthly = payments
        .filter(p => p.frequency === "MONTHLY" && p.status === "ACTIVE")
        .reduce((sum, p) => sum + p.amount, 0);

    // Don't show anything if there are no payments
    if (!loading && payments.length === 0) {
        return null;
    }

    if (loading) {
        return (
            <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5 p-6">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xl shadow-emerald-900/5 backdrop-blur-sm">
            <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                Monthly Commitment
                            </p>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-300">
                            MWK {totalMonthly.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1 font-medium">
                            {payments.filter(p => p.status === "ACTIVE").length} active payment{payments.filter(p => p.status === "ACTIVE").length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30">
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
