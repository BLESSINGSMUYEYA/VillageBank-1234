import { theme } from "@/components/ui/theme";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'white' | 'banana';
    className?: string;
    showText?: boolean;
}

export function Spinner({ size = 'md', variant = 'primary', className = '', showText = false }: SpinnerProps) {

    const sizeClasses = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    const variantClasses = {
        primary: 'text-blue-600 dark:text-blue-400',
        secondary: 'text-yellow-600 dark:text-yellow-400',
        white: 'text-white',
        banana: 'text-[var(--banana)]'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2
                className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
            />
            {showText && (
                <span className="text-xs font-medium text-muted-foreground animate-pulse">
                    Loading...
                </span>
            )}
        </div>
    );
}
