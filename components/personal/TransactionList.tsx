"use client";

import { useEffect, useState } from "react";
import { getTransactions, deleteTransaction } from "@/lib/transactions";
import { TransactionType } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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

    if (loading) return <div className="text-white/50 text-center py-8">Loading transactions...</div>;

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400">No transactions recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <div className="space-y-2">
                {transactions.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "INCOME" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                    }`}
                            >
                                {t.type === "INCOME" ? "+" : "-"}
                            </div>
                            <div>
                                <p className="font-medium text-white">{t.description || "Untitled Transaction"}</p>
                                <p className="text-xs text-gray-500">{format(new Date(t.date), "PPP")}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-semibold ${t.type === "INCOME" ? "text-emerald-400" : "text-white"}`}>
                                {t.type === "INCOME" ? "+" : "-"} MWK {t.amount.toLocaleString()}
                            </p>
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
