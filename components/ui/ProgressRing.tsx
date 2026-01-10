import { cn } from "@/lib/utils"

interface ProgressRingProps {
    radius?: number
    stroke?: number
    progress: number
    className?: string
    trackClassName?: string
    indicatorClassName?: string
}

export function ProgressRing({
    radius = 16,
    stroke = 3,
    progress,
    className,
    trackClassName,
    indicatorClassName
}: ProgressRingProps) {
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: radius * 2, height: radius * 2 }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg]"
            >
                {/* Track */}
                <circle
                    className={cn("stroke-slate-100 dark:stroke-slate-800", trackClassName)}
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Indicator */}
                <circle
                    className={cn("stroke-blue-600 transition-all duration-500 ease-out", indicatorClassName)}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
        </div>
    )
}
