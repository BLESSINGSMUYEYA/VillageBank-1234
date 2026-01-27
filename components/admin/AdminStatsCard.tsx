import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminStatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: string
    trendLabel?: string
    trendDirection?: 'up' | 'down' | 'neutral'
    className?: string
    delay?: number
}

export function AdminStatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    trendDirection = 'neutral',
    className,
    delay = 0
}: AdminStatsCardProps) {
    return (
        <div
            className={cn(
                "zen-card relative overflow-hidden group hover:-translate-y-1 transition-all duration-500",
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Decor */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl group-hover:from-primary/20 transition-all duration-500" />

            <div className="p-4 md:p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary dark:text-blue-400" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md",
                            trendDirection === 'up' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                            trendDirection === 'down' && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                            trendDirection === 'neutral' && "bg-slate-500/10 text-slate-600 border-slate-500/20"
                        )}>
                            {trend}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider">{title}</h3>
                    <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {value}
                    </div>
                    {trendLabel && (
                        <p className="text-xs text-muted-foreground/80 font-medium">
                            {trendLabel}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Shine */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    )
}
