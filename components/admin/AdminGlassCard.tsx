import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AdminGlassCardProps {
    children: ReactNode
    className?: string
    title?: string
    description?: string
    action?: ReactNode
}

export function AdminGlassCard({
    children,
    className,
    title,
    description,
    action
}: AdminGlassCardProps) {
    return (
        <div className={cn("zen-card overflow-hidden", className)}>
            {(title || action) && (
                <div className="p-4 md:p-6 border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>}
                        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>
                    {action && <div className="w-full sm:w-auto">{action}</div>}
                </div>
            )}
            <div className="p-0">
                {children}
            </div>
        </div>
    )
}
