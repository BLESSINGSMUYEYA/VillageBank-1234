import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface PremiumInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    errorMessage?: string;
    success?: boolean;
    prefix?: string;
    suffix?: string;
    loading?: boolean;
    icon?: React.ReactNode;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ className, type, error, errorMessage, success, prefix, suffix, loading, icon, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                <div className="relative group">
                    {prefix && (
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black pointer-events-none transition-colors group-focus-within:text-blue-600">
                            {prefix}
                        </span>
                    )}
                    {icon && !prefix && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-blue-600">
                            {icon}
                        </div>
                    )}
                    <Input
                        type={type}
                        className={cn(
                            "bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all",
                            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-black/40",
                            (prefix || icon) && "pl-20",
                            suffix && "pr-20",
                            error && "border-red-500 focus-visible:ring-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100",
                            success && "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100",
                            loading && "opacity-50 cursor-wait",
                            className
                        )}
                        ref={ref}
                        disabled={loading || props.disabled}
                        {...props}
                    />
                    {suffix && !loading && !error && !success && (
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black pointer-events-none transition-colors group-focus-within:text-blue-600">
                            {suffix}
                        </span>
                    )}

                    {/* Status Icons */}
                    {error && (
                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 animate-in fade-in zoom-in duration-200" />
                    )}
                    {success && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 animate-in fade-in zoom-in duration-200" />
                    )}
                </div>

                {/* Inline Error Message */}
                {error && errorMessage && (
                    <p className="text-xs font-bold text-red-500 px-4 animate-in slide-in-from-top-1 fade-in duration-200 flex items-center gap-1">
                        {errorMessage}
                    </p>
                )}
            </div>
        )
    }
)
PremiumInput.displayName = "PremiumInput"

export { PremiumInput }
