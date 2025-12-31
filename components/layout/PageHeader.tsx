'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motions'

interface PageHeaderProps {
    title: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    variant?: 'default' | 'compact'
    className?: string
}

export function PageHeader({
    title,
    description,
    action,
    variant = 'default',
    className = ''
}: PageHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 ${variant === 'default' ? 'mb-8 sm:mb-10' : 'mb-4 sm:mb-6'} border-b border-white/10 dark:border-white/5 pb-8 ${className}`}>
            <div className="flex-1 min-w-0">
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
                    className="w-full sm:w-auto shrink-0"
                >
                    {action}
                </motion.div>
            )}
        </div>
    )
}
