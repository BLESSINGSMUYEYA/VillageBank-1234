"use client";

import { useState } from "react";
import { LendingType, LendingStatus } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { markLendingAsPaid } from "@/lib/lendings";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowUpRight, ArrowDownLeft, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Lending = {
    id: string;
    name: string;
    amount: number;
    type: LendingType;
    status: LendingStatus;
    createdAt: Date;
    transactionId: string | null;
};

export default function LendingList({ lendings }: { lendings: Lending[] }) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const handleMarkAsPaid = async (id: string) => {
        setLoadingIds((prev) => new Set(prev).add(id));
        try {
            await markLendingAsPaid(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to mark as paid", error);
            alert("Failed to update status");
        } finally {
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const loansGiven = lendings.filter((l) => l.type === "GIVEN");
    const loansTaken = lendings.filter((l) => l.type === "TAKEN");

    const LendingSection = ({ title, items, type }: { title: string, items: Lending[], type: LendingType }) => {
        const isGiven = type === "GIVEN";
        const bgClass = isGiven
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
        const textClass = isGiven ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
        const dotClass = isGiven ? "bg-emerald-500" : "bg-rose-500";
        const Icon = isGiven ? ArrowUpRight : ArrowDownLeft;

        return (
            <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[400px] bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5">
                <div className="p-6 border-b border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-black/20">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", dotClass)} />
                        {title}
                    </h2>
                </div>

                <div className="divide-y divide-slate-200/60 dark:divide-white/5">
                    {items.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-black/20 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">No active loans found.</p>
                        </div>
                    ) : (
                        items.map((lending) => (
                            <div
                                key={lending.id}
                                className="group flex items-center justify-between p-4 hover:bg-emerald-50/50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                                        bgClass
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                                            {lending.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <p className="text-xs text-slate-500 font-medium">
                                                {format(new Date(lending.createdAt), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className={cn("text-sm font-bold", textClass)}>
                                        MWK {lending.amount.toLocaleString()}
                                    </p>

                                    {lending.status === "PENDING" ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2 text-[10px] uppercase font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-500/20"
                                            onClick={() => handleMarkAsPaid(lending.id)}
                                            disabled={loadingIds.has(lending.id)}
                                        >
                                            {loadingIds.has(lending.id) ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <>Mark Paid <Check className="w-3 h-3 ml-1" /></>
                                            )}
                                        </Button>
                                    ) : (
                                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LendingSection title="Loans Given (Assets)" items={loansGiven} type="GIVEN" />
            <LendingSection title="Loans Taken (Liabilities)" items={loansTaken} type="TAKEN" />
        </div>
    );
}
