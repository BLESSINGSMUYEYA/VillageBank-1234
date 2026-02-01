"use client";

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

export function PersonalStatsCards({ stats }: PersonalStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income */}
            <GlassCard className="p-6 rounded-[1.5rem] bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-emerald-100/60 uppercase tracking-wider">Income</span>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white tracking-tight">
                            MWK {stats.income.toLocaleString()}
                        </h3>
                        <p className="text-xs text-emerald-400/70 font-medium">
                            Total this month
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Total Expenses */}
            <GlassCard className="p-6 rounded-[1.5rem] bg-rose-500/5 border-rose-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                            <ArrowDownRight className="w-5 h-5 text-rose-400" />
                        </div>
                        <span className="text-sm font-bold text-rose-100/60 uppercase tracking-wider">Expenses</span>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white tracking-tight">
                            MWK {stats.expense.toLocaleString()}
                        </h3>
                        <p className="text-xs text-rose-400/70 font-medium">
                            Total this month
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Net Balance */}
            <GlassCard className="p-6 rounded-[1.5rem] bg-blue-500/5 border-blue-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                            <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm font-bold text-blue-100/60 uppercase tracking-wider">Net Balance</span>
                    </div>

                    <div className="space-y-1">
                        <h3 className={cn(
                            "text-2xl font-black tracking-tight",
                            stats.net >= 0 ? "text-white" : "text-rose-400"
                        )}>
                            MWK {stats.net.toLocaleString()}
                        </h3>
                        <p className="text-xs text-blue-400/70 font-medium">
                            Current status
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
