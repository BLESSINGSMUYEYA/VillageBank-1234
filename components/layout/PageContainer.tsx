import React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    size?: 'default' | 'wide' | 'narrow'
    variant?: 'default' | 'scrollable'
}

/**
 * Standardized Page Container
 * Enforces consistent margins, max-width, and padding across the application.
 */
export function PageContainer({
    children,
    className,
    size = 'default',
    variant = 'default',
    ...props
}: PageContainerProps) {
    const maxWidths = {
        default: 'max-w-5xl',
        wide: 'max-w-7xl',
        narrow: 'max-w-3xl'
    }

    return (
        <div
            className={cn(
                "w-full px-0 py-8 sm:py-12 pb-20 sm:pb-24 animate-fade-in",
                // maxWidths[size], // Removed to allow full-width alignment with header
                variant === 'scrollable' && "h-full overflow-y-auto",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
