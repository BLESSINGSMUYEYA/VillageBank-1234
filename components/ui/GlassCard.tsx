"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
    blur?: "sm" | "md" | "lg" | "xl";
    hover?: boolean;
}

export function GlassCard({
    children,
    className,
    gradient = true,
    blur = "md",
    hover = true,
    ...props
}: GlassCardProps) {
    const blurClasses = {
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300",
                "bg-white/70 dark:bg-slate-900/40",
                blurClasses[blur],
                gradient && "bg-gradient-to-br from-white/80 to-white/30 dark:from-slate-800/50 dark:to-slate-900/20",
                hover && "hover:border-banana/30 hover:shadow-banana/5 hover:dark:shadow-banana/10",
                className
            )}
            {...props}
        >
            {/* Ambient Inner Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />

            {/* Shimmer Effect on Hover */}
            {hover && (
                <div className="absolute inset-0 z-0 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
