'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
    title: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    variant?: 'default' | 'compact' | 'premium'
    className?: string
    badge?: React.ReactNode | string
    backHref?: string
    backLabel?: string
}

export function PageHeader({
    title,
    description,
    action,
    variant = 'default',
    className = '',
    badge,
    backHref,
    backLabel = 'Back'
}: PageHeaderProps) {
    return (
        <div className={`flex flex-col gap-6 ${variant === 'compact' ? 'mb-4 sm:mb-6' : 'mb-6 sm:mb-10'} ${className}`}>
            {/* Optional Back Navigation */}
            {backHref && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-2"
                >
                    <Link
                        href={backHref}
                        className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        {backLabel}
                    </Link>
                </motion.div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-white/10 dark:border-white/5 pb-6 sm:pb-8">
                <div className="flex-1 min-w-0">
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3"
                        >
                            {typeof badge === 'string' ? (
                                <Badge variant="outline" className="border-blue-500/20 text-blue-600 dark:text-banana bg-blue-500/5 uppercase tracking-widest text-[10px] h-6 px-3">
                                    {badge}
                                </Badge>
                            ) : badge}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-3 break-words tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    {description && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs sm:text-sm lg:text-base text-muted-foreground font-bold tracking-tight max-w-2xl break-words opacity-80"
                        >
                            {description}
                        </motion.div>
                    )}
                </div>
                {action && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full sm:w-auto shrink-0 pb-1"
                    >
                        {action}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
