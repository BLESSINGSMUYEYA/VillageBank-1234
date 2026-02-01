"use client";

import { useEffect, useState } from "react";
import { getTransactions, deleteTransaction } from "@/lib/transactions";
import { TransactionType } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Transaction = {
    id: string;
    amount: number;
    type: TransactionType;
    description: string | null;
    date: Date;
    category: string | null;
};

interface TransactionListProps {
    initialTransactions: Transaction[];
}

export default function TransactionList({ initialTransactions }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const router = useRouter();

    useEffect(() => {
        setTransactions(initialTransactions);
    }, [initialTransactions]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteTransaction(id);
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            router.refresh();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px] rounded-[2rem] sm:rounded-[2.5rem] bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-black/20 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
                    <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No transactions yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">
                    Start by scanning an SMS or manually adding your first income or expense.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px] bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
            <div className="p-6 border-b border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-black/20">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h2>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-white/5">
                {transactions.map((t) => (
                    <div
                        key={t.id}
                        className="group flex items-center justify-between p-4 hover:bg-emerald-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                t.type === "INCOME"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            )}>
                                {t.type === "INCOME" ? (
                                    <ArrowUpRight className="w-5 h-5" />
                                ) : (
                                    <ArrowDownRight className="w-5 h-5" />
                                )}
                            </div>

                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">
                                    {t.description || "Untitled Transaction"}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <p className="text-xs text-slate-500 font-medium">
                                        {format(new Date(t.date), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={cn(
                                "text-sm font-bold",
                                t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                            )}>
                                {t.type === "INCOME" ? "+" : "-"} MWK {t.amount.toLocaleString()}
                            </p>
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 px-2 py-1 rounded mt-1"
                            >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
