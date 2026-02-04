"use client";

import { useState, useEffect } from "react";
import { Calendar, Trash2, Pause, Play, Loader2, Receipt, TrendingDown } from "lucide-react";
import { getRecurringPayments, deleteRecurringPayment, pauseRecurringPayment, resumeRecurringPayment } from "@/lib/recurring-payments";
import { getTransactions } from "@/lib/transactions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { RecurringPaymentsModal } from "./RecurringPaymentsModal";

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

interface Transaction {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string | null;
    description: string | null;
    date: Date;
}

export function EnhancedPaymentsList() {
    const router = useRouter();
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsData, transactionsData] = await Promise.all([
                getRecurringPayments(),
                getTransactions(100, 0) // Get more transactions to filter by month
            ]);

            setRecurringPayments(paymentsData as RecurringPayment[]);

            // Filter transactions for current month and expenses only
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const filtered = (transactionsData as Transaction[]).filter(t => {
                const txDate = new Date(t.date);
                return txDate.getMonth() === currentMonth &&
                    txDate.getFullYear() === currentYear &&
                    t.type === "EXPENSE";
            });

            setMonthlyTransactions(filtered);
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
            loadData();
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
            loadData();
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
            <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5 p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            </div>
        );
    }

    const totalMonthly = recurringPayments
        .filter(p => p.frequency === "MONTHLY" && p.status === "ACTIVE")
        .reduce((sum, p) => sum + p.amount, 0);

    const totalMonthlyExpenses = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            {/* Unified Summary Card */}
            <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xl backdrop-blur-sm p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    {/* Add Payment Action */}
                    <div className="w-full md:w-auto flex-shrink-0">
                        <RecurringPaymentsModal>
                            <Button className="w-full md:w-auto h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <span className="mr-2">+</span> Add Payment
                            </Button>
                        </RecurringPaymentsModal>
                    </div>

                    {/* Stats Grid */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-8 sm:gap-12 md:gap-16">
                        {/* Monthly Commitment */}
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Monthly Commitment
                            </p>
                            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                MWK {totalMonthly.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {recurringPayments.filter(p => p.status === "ACTIVE").length} active payments
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px bg-slate-200 dark:bg-white/10 self-stretch" />

                        {/* This Month's Expenses */}
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                This Month's Expenses
                            </p>
                            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                MWK {totalMonthlyExpenses.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {monthlyTransactions.length} transaction{monthlyTransactions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Automatic Monthly Payments Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Automatic Monthly Payments</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Recurring payment reminders</p>
                    </div>
                </div>

                {recurringPayments.length === 0 ? (
                    <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xl p-8 text-center">
                        <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                            No recurring payments set up yet
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                            Click "Add Payment" to create your first automatic payment reminder
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {recurringPayments.map((payment) => (
                            <PaymentCard
                                key={payment.id}
                                payment={payment}
                                actionLoading={actionLoading}
                                onTogglePause={handleTogglePause}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Additional Payments This Month Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                        <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Additional Payments This Month</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(), 'MMMM yyyy')}</p>
                    </div>
                </div>

                {monthlyTransactions.length === 0 ? (
                    <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xl p-8 text-center">
                        <TrendingDown className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                            No additional expenses this month
                        </p>
                    </div>
                ) : (
                    <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xl">
                        <div className="divide-y divide-slate-200/60 dark:divide-white/5">
                            {monthlyTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {transaction.category || "Expense"}
                                                </p>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {format(new Date(transaction.date), 'MMM d')}
                                                </span>
                                            </div>
                                            {transaction.description && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {transaction.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                MWK {transaction.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Payment Card Component with Details Dialog and Edit Mode
function PaymentCard({
    payment,
    actionLoading,
    onTogglePause,
    onDelete
}: {
    payment: RecurringPayment;
    actionLoading: string | null;
    onTogglePause: (id: string, status: string, name: string) => void;
    onDelete: (id: string, name: string) => void;
}) {
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState(payment.name);
    const [editDescription, setEditDescription] = useState(payment.description || "");
    const [editAmount, setEditAmount] = useState(payment.amount.toString());
    const [editFrequency, setEditFrequency] = useState(payment.frequency);
    const [editIncomeDay, setEditIncomeDay] = useState(payment.incomeDay?.toString() || "1");

    const handleSave = async () => {
        if (!editName.trim() || !editAmount) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const { updateRecurringPayment } = await import("@/lib/recurring-payments");
            await updateRecurringPayment(payment.id, {
                name: editName.trim(),
                description: editDescription.trim() || undefined,
                amount: parseFloat(editAmount),
                frequency: editFrequency,
                incomeDay: parseInt(editIncomeDay),
                startDate: payment.createdAt
            });

            toast.success("Payment updated successfully");
            setIsEditing(false);
            setShowDetails(false);
            router.refresh();
            window.location.reload(); // Refresh to show updated data
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all p-4 cursor-pointer"
                onClick={() => setShowDetails(true)}
            >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {payment.name}
                            </h3>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${payment.status === "ACTIVE"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}
                            >
                                {payment.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="font-medium text-slate-900 dark:text-white">
                                MWK {payment.amount.toLocaleString()}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                                {payment.frequency === "MONTHLY" ? "Monthly" : "Weekly"}
                                {payment.incomeDay && ` • Day ${payment.incomeDay}`}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onTogglePause(payment.id, payment.status, payment.name)}
                            disabled={actionLoading === payment.id}
                            className="gap-2 flex-1 sm:flex-none"
                        >
                            {actionLoading === payment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : payment.status === "ACTIVE" ? (
                                <>
                                    <Pause className="w-4 h-4" />
                                    <span className="hidden sm:inline">Pause</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    <span className="hidden sm:inline">Resume</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(payment.id, payment.name)}
                            disabled={actionLoading === payment.id}
                            className="gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex-1 sm:flex-none"
                        >
                            {actionLoading === payment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Details/Edit Dialog */}
            {showDetails && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => {
                        setShowDetails(false);
                        setIsEditing(false);
                    }}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {isEditing ? "Edit Payment" : "Payment Details"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowDetails(false);
                                    setIsEditing(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {isEditing ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                                        Description
                                    </label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                                        Amount (MWK) *
                                    </label>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                                            Frequency
                                        </label>
                                        <select
                                            value={editFrequency}
                                            onChange={(e) => setEditFrequency(e.target.value as "WEEKLY" | "MONTHLY")}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="WEEKLY">Weekly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                                            Income Day
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={editIncomeDay}
                                            onChange={(e) => setEditIncomeDay(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        disabled={saving}
                                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name</p>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white">{payment.name}</p>
                                    </div>

                                    {payment.description && (
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{payment.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                                        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">MWK {payment.amount.toLocaleString()}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Frequency</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {payment.frequency === "MONTHLY" ? "Monthly" : "Weekly"}
                                            </p>
                                        </div>

                                        {payment.incomeDay && (
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Income Day</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Day {payment.incomeDay}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${payment.status === "ACTIVE"
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {format(new Date(payment.createdAt), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        Edit Payment
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetails(false);
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
