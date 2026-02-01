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

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchTransactions = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

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

    if (loading) return (
        <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400 text-sm font-medium">Loading history...</p>
        </GlassCard>
    );

    if (transactions.length === 0) {
        return (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No transactions yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">
                    Start by scanning an SMS or manually adding your first income or expense.
                </p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
            </div>

            <div className="divide-y divide-white/5">
                {transactions.map((t) => (
                    <div
                        key={t.id}
                        className="group flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                t.type === "INCOME"
                                    ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/10 text-rose-400"
                            )}>
                                {t.type === "INCOME" ? (
                                    <ArrowUpRight className="w-5 h-5" />
                                ) : (
                                    <ArrowDownRight className="w-5 h-5" />
                                )}
                            </div>

                            <div>
                                <p className="font-bold text-white text-sm">
                                    {t.description || "Untitled Transaction"}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    <p className="text-xs text-slate-500 font-medium">
                                        {format(new Date(t.date), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={cn(
                                "text-sm font-bold",
                                t.type === "INCOME" ? "text-emerald-400" : "text-white"
                            )}>
                                {t.type === "INCOME" ? "+" : "-"} MWK {t.amount.toLocaleString()}
                            </p>
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="text-[10px] font-bold text-rose-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 px-2 py-1 rounded mt-1"
                            >
                                <Trash2 className="w-3 h-3 inline mr-1" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
