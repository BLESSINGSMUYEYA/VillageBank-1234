import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: React.ReactNode
    variant?: 'default' | 'compact'
    iconColor?: string
    className?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = 'default',
    iconColor = 'text-muted-foreground',
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center ${variant === 'default' ? 'py-12 sm:py-16' : 'py-8 sm:py-12'
            } px-4 bg-muted/10 rounded-2xl sm:rounded-3xl border border-dashed border-border/60 ${className}`}>
            <div className={`${variant === 'default' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16'
                } bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
                <Icon className={`${variant === 'default' ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6 sm:w-8 sm:h-8'
                    } ${iconColor} opacity-50`} />
            </div>

            <h3 className={`${variant === 'default' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                } font-black text-foreground mb-2 text-center`}>
                {title}
            </h3>

            <p className="text-muted-foreground mb-6 sm:mb-8 text-center max-w-sm text-sm sm:text-base font-medium leading-relaxed">
                {description}
            </p>

            {action && (
                <div className="w-full sm:w-auto">
                    {action}
                </div>
            )}
        </div>
    )
}
