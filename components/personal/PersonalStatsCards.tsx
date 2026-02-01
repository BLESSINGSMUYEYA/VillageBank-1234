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
        <div className="rounded-[1.5rem] bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Top Section: Net Balance - Gradient Background */}
            <div className="p-6 pb-5 relative z-10 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-400" />
                        Net Balance
                    </span>
                    <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
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
            <div className="h-px w-full bg-slate-800" />

            {/* Bottom Section: Income & Expenses - Solid Backgrounds */}
            <div className="grid grid-cols-2 divide-x divide-slate-800">
                {/* Income */}
                <div className="p-5 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            MWK {stats.income.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Expenses */}
                <div className="p-5 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <ArrowDownRight className="w-4 h-4 text-rose-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expenses</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            MWK {stats.expense.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
