"use client";

import { memo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalStatsCardsProps {
    stats: {
        income: number;
        expense: number;
        net: number;
    };
}

export const PersonalStatsCards = memo(function PersonalStatsCards({ stats }: PersonalStatsCardsProps) {
    return (
        <GlassCard
            className="rounded-[2rem] sm:rounded-[2.5rem] bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5 p-0 overflow-hidden"
            blur="xl"
            variant="premium"
        >
            {/* Top Section: Net Balance - Gradient Background */}
            <div className="p-6 pb-5 relative z-10 bg-gradient-to-br from-emerald-900/10 to-emerald-950/10 dark:from-emerald-900/20 dark:to-emerald-950/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Net Balance
                    </span>
                    <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                            Current Status
                        </p>
                    </div>
                </div>
                <h3 className={cn(
                    "text-3xl font-black tracking-tight",
                    stats.net >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
                )}>
                    MWK {stats.net.toLocaleString()}
                </h3>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-200/60 dark:bg-white/5" />

            {/* Bottom Section: Income & Expenses - Solid Backgrounds */}
            <div className="grid grid-cols-2 divide-x divide-slate-200/60 dark:divide-white/5">
                {/* Income */}
                <div className="p-5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            MWK {stats.income.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Expenses */}
                <div className="p-5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expenses</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            MWK {stats.expense.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
});
