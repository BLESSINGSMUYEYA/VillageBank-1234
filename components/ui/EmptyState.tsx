"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { itemFadeIn } from "@/lib/motions";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <motion.div variants={itemFadeIn} className={cn("w-full max-w-md mx-auto", className)}>
            <GlassCard className="p-12 flex flex-col items-center text-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50" hover={false}>
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-900">
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto mb-8">
                    {description}
                </p>

                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        variant="premium"
                        size="lg"
                        className="rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                        {actionLabel}
                    </Button>
                )}
            </GlassCard>
        </motion.div>
    );
}
