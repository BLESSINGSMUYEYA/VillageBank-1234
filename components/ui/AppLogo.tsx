import { UBankLogo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

interface AppLogoProps {
    className?: string
    textClassName?: string
    iconClassName?: string
    showText?: boolean
    /**
     * Theme determines the text color.
     * 'dark' = white text (for dark backgrounds)
     * 'light' = dark text (for light backgrounds)
     * 'auto' = slate-900 in light mode, white in dark mode
     */
    theme?: 'dark' | 'light' | 'auto'
}

export function AppLogo({
    className,
    textClassName,
    iconClassName,
    showText = true,
    theme = 'auto'
}: AppLogoProps) {
    return (
        <div className={cn("flex items-center gap-3 group select-none", className)}>
            <div className={cn(
                "w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-emerald-900/20",
                // Adjust container background for better visibility on different backgrounds if needed, 
                // but keeping it consistent with the sidebar design as requested.
                "backdrop-blur-sm"
            )}>
                <UBankLogo className={cn("w-6 h-6", iconClassName)} />
            </div>
            {showText && (
                <span className={cn(
                    "text-xl font-black tracking-tight transition-colors",
                    theme === 'dark' && "text-white group-hover:text-emerald-400",
                    theme === 'light' && "text-slate-900 group-hover:text-emerald-600",
                    theme === 'auto' && "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
                    textClassName
                )}>
                    uBank
                </span>
            )}
        </div>
    )
}
