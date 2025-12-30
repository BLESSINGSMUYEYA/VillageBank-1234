import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
    title: string
    icon: LucideIcon
    iconColor?: string
    iconBg?: string
    className?: string
    description?: string
}

export function SectionHeader({
    title,
    icon: Icon,
    iconColor = "text-blue-600",
    iconBg = "bg-blue-500/10",
    className,
    description
}: SectionHeaderProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className={cn("p-2 rounded-lg", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-foreground">{title}</h3>
                    {description && (
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
