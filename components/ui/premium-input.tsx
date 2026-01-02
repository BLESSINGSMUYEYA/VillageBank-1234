import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PremiumInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    prefix?: string;
    suffix?: string;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ className, type, error, prefix, suffix, ...props }, ref) => {
        return (
            <div className="relative group">
                {prefix && (
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black pointer-events-none transition-colors group-focus-within:text-blue-600">
                        {prefix}
                    </span>
                )}
                <Input
                    type={type}
                    className={cn(
                        "bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all",
                        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-black/40",
                        prefix && "pl-20",
                        suffix && "pr-20",
                        error && "border-red-500 focus:ring-red-500 bg-red-50/50 dark:bg-red-950/20",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {suffix && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black pointer-events-none transition-colors group-focus-within:text-blue-600">
                        {suffix}
                    </span>
                )}
            </div>
        )
    }
)
PremiumInput.displayName = "PremiumInput"

export { PremiumInput }
