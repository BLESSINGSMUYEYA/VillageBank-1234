"use client";

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";

export function PersonalFinanceTeaser() {
    return (
        <GlassCard
            className="p-3 sm:p-4 rounded-[2rem] border-white/20 shadow-xl shadow-emerald-900/5 bg-white/40 dark:bg-white/5"
            blur="md"
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Title with Icon */}
                <div className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:border-r border-slate-200/50 dark:border-white/10 sm:pr-6">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-[#1B4332] dark:text-emerald-400 uppercase tracking-[0.15em] whitespace-nowrap block">
                            Personal Finance
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 items-center justify-start sm:justify-end gap-3 px-2 sm:px-0">
                    <Link
                        href="/personal"
                        className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group min-w-[100px] sm:min-w-0"
                    >
                        <Wallet className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-bold text-[#1B4332] dark:text-emerald-50 whitespace-nowrap">
                            Open Dashboard
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                </div>
            </div>
        </GlassCard>
    );
}
