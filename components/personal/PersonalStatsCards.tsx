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
        <div className="space-y-4">
            {/* Net Balance - Top & Center */}
            <GlassCard className="p-5 rounded-[1.25rem] bg-blue-500/5 border-blue-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-100/60 uppercase tracking-wider flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-blue-400" />
                            Net Balance
                        </span>
                        <h3 className={cn(
                            "text-3xl font-black tracking-tight",
                            stats.net >= 0 ? "text-white" : "text-rose-400"
                        )}>
                            MWK {stats.net.toLocaleString()}
                        </h3>
                    </div>
                    <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            Current Status
                        </p>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-4">
                {/* Total Income */}
                <GlassCard className="p-4 rounded-[1.25rem] bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-wider">Income</span>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className="text-xl font-black text-white tracking-tight">
                                MWK {stats.income.toLocaleString()}
                            </h3>
                            <p className="text-[10px] text-emerald-400/70 font-medium">
                                This month
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Total Expenses */}
                <GlassCard className="p-4 rounded-[1.25rem] bg-rose-500/5 border-rose-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-100/60 uppercase tracking-wider">Expenses</span>
                        </div>

                        <div className="space-y-0.5">
                            <h3 className="text-xl font-black text-white tracking-tight">
                                MWK {stats.expense.toLocaleString()}
                            </h3>
                            <p className="text-[10px] text-rose-400/70 font-medium">
                                This month
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
