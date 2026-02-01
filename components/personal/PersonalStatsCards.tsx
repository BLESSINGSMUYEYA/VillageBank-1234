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
        <GlassCard className="p-0 rounded-[1.5rem] bg-gradient-to-br from-white/5 to-white/0 border-white/10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Top Section: Net Balance */}
            <div className="p-6 pb-5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-400" />
                        Net Balance
                    </span>
                    <div className="bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/10">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            Current Status
                        </p>
                    </div>
                </div>
                <h3 className={cn(
                    "text-4xl font-black tracking-tight",
                    stats.net >= 0 ? "text-white" : "text-rose-400"
                )}>
                    MWK {stats.net.toLocaleString()}
                </h3>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-white/5" />

            {/* Bottom Section: Income & Expenses */}
            <div className="grid grid-cols-2 divide-x divide-white/5">
                {/* Income */}
                <div className="p-5 relative group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-wider">Income</span>
                    </div>
                    <div className="pl-8">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            MWK {stats.income.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Expenses */}
                <div className="p-5 relative group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                            <ArrowDownRight className="w-3 h-3 text-rose-400" />
                        </div>
                        <span className="text-[10px] font-bold text-rose-100/60 uppercase tracking-wider">Expenses</span>
                    </div>
                    <div className="pl-8">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            MWK {stats.expense.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
