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
    variant?: "default" | "premium";
}

export function GlassCard({
    children,
    className,
    gradient = true,
    blur = "md",
    hover = true,
    variant = "default",
    ...props
}: GlassCardProps) {
    const blurClasses = {
        sm: "backdrop-blur-[2px]",
        md: "backdrop-blur-sm",
        lg: "backdrop-blur-md",
        xl: "backdrop-blur-lg",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} // Optimize viewport check
            whileHover={hover ? { y: -2, scale: 1.005, transition: { duration: 0.2 } } : undefined} // Reduced movement
            className={cn(
                "relative overflow-hidden rounded-[32px] border border-white/20 dark:border-white/10 shadow-2xl transition-all duration-200", // Faster transition
                "bg-white/60 dark:bg-slate-900/40",
                blurClasses[blur],
                gradient && "bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent",
                hover && variant === "default" && "hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:dark:shadow-emerald-500/5 will-change-transform",
                hover && variant === "premium" && "hover:border-[var(--banana)]/40 hover:shadow-[var(--banana)]/10 dark:hover:shadow-[var(--banana)]/5 will-change-transform",
                variant === "premium" && "border-[var(--banana)]/20 shadow-[var(--banana)]/5",
                className
            )}
            {...props}
        >
            {/* Ambient Inner Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-glow-radial" />

            {/* Shimmer Effect on Hover */}
            {hover && (
                <div className="absolute inset-0 z-0 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
