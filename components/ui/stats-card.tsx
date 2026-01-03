'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { itemFadeIn, hoverScale } from '@/lib/motions'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    variant?: 'default' | 'featured' | 'gradient' | 'glass'
    icon?: LucideIcon
    label: string
    value: string | number
    description?: string
    gradient?: string
    trend?: {
        value: string
        icon?: LucideIcon
        positive?: boolean
    }
    className?: string
    index?: number
}

export function StatsCard({
    variant = 'default',
    icon: Icon,
    label,
    value,
    description,
    gradient,
    trend,
    className = '',
    index = 0
}: StatsCardProps) {
    // Variant styles
    const variantStyles = {
        default: 'bg-card/50 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg dark:bg-card/30',
        featured: 'bg-gradient-to-br from-banana to-yellow-500 text-white border-none shadow-xl relative overflow-hidden group',
        gradient: gradient || 'bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-none shadow-xl relative overflow-hidden group',
        glass: 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden'
    }

    const isColorVariant = variant === 'featured' || variant === 'gradient'

    return (
        <motion.div
            variants={itemFadeIn}
            initial="initial"
            animate="animate"
            whileHover={variant === 'glass' ? {} : hoverScale.whileHover}
            whileTap={hoverScale.whileTap}
            transition={{ ...itemFadeIn.animate.transition, delay: index * 0.1 }}
            className="w-full"
        >
            <Card className={cn(
                variantStyles[variant],
                "transition-all duration-300 rounded-3xl h-full border",
                className
            )}>
                {/* Background decoration for gradient variants */}
                {isColorVariant && Icon && (
                    <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon className="w-20 h-20 sm:w-24 sm:h-24" />
                    </div>
                )}

                {/* Shimmer Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Background glow for featured variant */}
                {variant === 'featured' && (
                    <div className="absolute -right-4 -bottom-4 bg-white/20 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                )}

                <CardHeader className="pb-2 p-3.5 sm:p-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <CardTitle className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            variant === 'default' || variant === 'glass'
                                ? 'text-muted-foreground'
                                : variant === 'featured'
                                    ? 'text-yellow-900/80'
                                    : 'text-blue-200/80'
                        )}>
                            {label}
                        </CardTitle>
                        {Icon && variant === 'default' && (
                            <div className="p-2 bg-muted/50 rounded-xl">
                                <Icon className="w-4 h-4 text-primary" />
                            </div>
                        )}
                        {Icon && variant === 'glass' && (
                            <div className="p-2 bg-white/20 dark:bg-slate-800/50 rounded-xl backdrop-blur-lg">
                                <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-3.5 sm:p-6 pt-0 relative z-10">
                    <div className={cn(
                        "text-2xl sm:text-3xl font-black break-words leading-none",
                        isColorVariant ? 'text-white' : 'text-foreground'
                    )}>
                        {value}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        {description && (
                            <p className={cn(
                                "text-xs font-bold",
                                variant === 'default' || variant === 'glass'
                                    ? 'text-muted-foreground/70'
                                    : variant === 'featured'
                                        ? 'text-yellow-900/60'
                                        : 'text-blue-200/60'
                            )}>
                                {description}
                            </p>
                        )}

                        {trend && (
                            <div className={cn(
                                "flex items-center text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md",
                                trend.positive
                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            )}>
                                {trend.icon && <trend.icon className="w-3 h-3 mr-1 shrink-0" />}
                                <span>{trend.value}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
