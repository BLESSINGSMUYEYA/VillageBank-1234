'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LoaderProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    text?: string
    className?: string
    showText?: boolean
    fullScreen?: boolean
    variant?: 'emerald' | 'gold'
}

// Smooth curved growth arrow path using cubic Bezier curves
const growthPath = "M 10 85 C 20 75, 25 65, 30 60 S 40 70, 45 65 S 55 50, 60 45 S 70 55, 75 48 S 85 30, 90 25"
const arrowHead = "M 85 20 L 95 28 L 88 32 Z"

export function GrowthLoader({
    size = 'lg',
    text = 'Loading...',
    className,
    showText = false,
    variant = 'emerald',
}: LoaderProps) {
    const sizeMap = {
        xs: { width: 55, height: 36 },
        sm: { width: 75, height: 50 },
        md: { width: 125, height: 84 },
        lg: { width: 180, height: 120 },
        xl: { width: 250, height: 166 }
    }

    const dimensions = sizeMap[size as keyof typeof sizeMap] || sizeMap.lg

    return (
        <motion.div
            className={cn(
                'flex flex-col items-center justify-center gap-3',
                className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Zig-zag growth arrow */}
            <div className="relative">
                {/* Glow effect behind */}
                <motion.div
                    className="absolute inset-0 blur-xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                        transform: 'scale(1.5)',
                    }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1.3, 1.6, 1.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    viewBox="0 0 100 100"
                    className="relative z-10"
                    style={{ filter: "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3))" }}
                >
                    {/* Definitions for gradients and effects */}
                    <defs>
                        <linearGradient id="growthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
                            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#34D399" />
                            <stop offset="100%" stopColor="#6EE7B7" />
                        </linearGradient>
                        <linearGradient id="goldGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#FDB931" stopOpacity="1" />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="goldArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FDB931" />
                            <stop offset="100%" stopColor="#FFD700" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="strongGlow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background shadow path for depth */}
                    <motion.path
                        d={growthPath}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.2)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{
                            pathLength: [0, 1, 1, 0],
                            opacity: [0.3, 0.4, 0.4, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.4, 0.6, 1]
                        }}
                    />

                    {/* Main animated growth line */}
                    <motion.path
                        d={growthPath}
                        fill="none"
                        stroke={variant === 'gold' ? "url(#goldGradient)" : "url(#growthGradient)"}
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0.6 }}
                        animate={{
                            pathLength: [0, 1, 1, 0],
                            opacity: [0.6, 1, 1, 0.6]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.4, 0.6, 1]
                        }}
                    />

                    {/* Arrow head at the end */}
                    <motion.path
                        d={arrowHead}
                        fill={variant === 'gold' ? "url(#goldArrowGradient)" : "url(#arrowGradient)"}
                        stroke={variant === 'gold' ? "url(#goldArrowGradient)" : "url(#arrowGradient)"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#strongGlow)"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0, 1, 1, 0],
                            scale: [0, 0, 1.2, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: [0.34, 1.56, 0.64, 1],
                            times: [0, 0.35, 0.45, 0.6, 1]
                        }}
                        style={{ transformOrigin: "90px 25px" }}
                    />

                    {/* Trailing dots for effect */}
                    {[
                        { cx: 25, cy: 60, delay: 0.1 },
                        { cx: 40, cy: 70, delay: 0.2 },
                        { cx: 55, cy: 45, delay: 0.3 },
                        { cx: 70, cy: 55, delay: 0.4 },
                    ].map((dot, i) => (
                        <motion.circle
                            key={i}
                            cx={dot.cx}
                            cy={dot.cy}
                            r="3"
                            fill={variant === 'gold' ? "url(#goldGradient)" : "url(#growthGradient)"}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                scale: [0, 1.2, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: dot.delay,
                                times: [0, 0.2, 0.6, 1]
                            }}
                        />
                    ))}
                </svg>
            </div>

            {/* Loading text with animated dots */}
            {showText && (
                <motion.div
                    className="flex items-center gap-0.5 text-gray-600 dark:text-gray-300 font-medium text-sm"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                >
                    <span>{text.replace('...', '')}</span>
                    <span className="flex">
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                                className="text-emerald-500"
                            >
                                .
                            </motion.span>
                        ))}
                    </span>
                </motion.div>
            )}
        </motion.div>
    )
}

// Replaced DotsLoader with GrowthLoader for consistent styling
export function DotsLoader(props: LoaderProps) {
    return <GrowthLoader {...props} />
}

// Legacy export - now uses GrowthLoader
export function LogoLoader(props: LoaderProps) {
    return <GrowthLoader {...props} />
}

// Full page loader variant
export function PageLoader({ text = 'Loading' }: { text?: string }) {
    return (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/20">
            <GrowthLoader size="lg" text={text} />
        </div>
    )
}

// Inline loader for buttons and smaller areas
export function InlineLogoLoader({ size = 'xs' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
    return <GrowthLoader size={size} showText={false} />
}

// Card loader
export function CardLogoLoader({ text = 'Loading content' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <GrowthLoader size="md" text={text} />
        </div>
    )
}

// Overlay loader
export function OverlayLoader({
    text = 'Processing',
    isVisible = true
}: {
    text?: string
    isVisible?: boolean
}) {
    if (!isVisible) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl"
            >
                <GrowthLoader size="lg" text={text} />
            </motion.div>
        </motion.div>
    )
}
