"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Pause, Play, Loader2 } from "lucide-react";
import { getRecurringPayments, deleteRecurringPayment, pauseRecurringPayment, resumeRecurringPayment } from "@/lib/recurring-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RecurringPayment {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    frequency: "WEEKLY" | "MONTHLY";
    incomeDay: number | null;
    status: "ACTIVE" | "PAUSED" | "COMPLETED";
    createdAt: Date;
}

export function RecurringPaymentsList() {
    const router = useRouter();
    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const data = await getRecurringPayments();
            setPayments(data as RecurringPayment[]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setActionLoading(id);
        try {
            await deleteRecurringPayment(id);
            toast.success("Payment deleted");
            loadPayments();
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete payment");
        } finally {
            setActionLoading(null);
        }
    };

    const handleTogglePause = async (id: string, currentStatus: string, name: string) => {
        setActionLoading(id);
        try {
            if (currentStatus === "ACTIVE") {
                await pauseRecurringPayment(id);
                toast.success(`${name} paused`);
            } else {
                await resumeRecurringPayment(id);
                toast.success(`${name} resumed`);
            }
            loadPayments();
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <GlassCard className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            </GlassCard>
        );
    }

    if (payments.length === 0) {
        return (
            <GlassCard className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    No recurring payments set up yet
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Click "Manage Payments" to add your first payment
                </p>
            </GlassCard>
        );
    }

    const totalMonthly = payments
        .filter(p => p.frequency === "MONTHLY" && p.status === "ACTIVE")
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <GlassCard className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Total Monthly Commitment
                        </p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1">
                            MWK {totalMonthly.toLocaleString()}
                        </p>
                    </div>
                    <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
            </GlassCard>

            {/* Payments List */}
            <div className="space-y-3">
                {payments.map((payment) => (
                    <GlassCard
                        key={payment.id}
                        className="p-4 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {payment.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.status === "ACTIVE"
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            }`}
                                    >
                                        {payment.status}
                                    </span>
                                </div>
                                {payment.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        {payment.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        MWK {payment.amount.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {payment.frequency === "MONTHLY" ? "Monthly" : "Weekly"}
                                        {payment.incomeDay && ` • Day ${payment.incomeDay}`}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTogglePause(payment.id, payment.status, payment.name)}
                                    disabled={actionLoading === payment.id}
                                    className="gap-2"
                                >
                                    {actionLoading === payment.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : payment.status === "ACTIVE" ? (
                                        <>
                                            <Pause className="w-4 h-4" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Resume
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(payment.id, payment.name)}
                                    disabled={actionLoading === payment.id}
                                    className="gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                >
                                    {actionLoading === payment.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
