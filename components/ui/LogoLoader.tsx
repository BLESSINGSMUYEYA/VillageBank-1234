'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'

interface LogoLoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    text?: string
    className?: string
    showText?: boolean
    fullScreen?: boolean
}

export function LogoLoader({
    size = 'lg',
    text = 'Loading...',
    className,
    showText = true,
    fullScreen = false
}: LogoLoaderProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    const logoSizes = {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 96
    }

    const content = (
        <motion.div
            className={cn(
                'flex flex-col items-center justify-center gap-4',
                className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Logo container with animations */}
            <div className="relative">
                {/* Outer glow effect */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/40 via-amber-500/40 to-orange-400/40 blur-xl",
                        sizeClasses[size]
                    )}
                    style={{ margin: '-25%', width: '150%', height: '150%' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: [0, 0.6, 0],
                        scale: [0.8, 1.4, 0.8],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                />

                {/* Rotating ring */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full border-2 border-transparent",
                        sizeClasses[size]
                    )}
                    style={{
                        margin: '-10%',
                        width: '120%',
                        height: '120%',
                        background: 'linear-gradient(transparent, transparent) padding-box, linear-gradient(135deg, #FBBF24, #F59E0B, #D97706, transparent) border-box'
                    }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Second rotating ring (opposite direction) */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full border-2 border-transparent",
                        sizeClasses[size]
                    )}
                    style={{
                        margin: '-15%',
                        width: '130%',
                        height: '130%',
                        background: 'linear-gradient(transparent, transparent) padding-box, linear-gradient(-135deg, transparent, #FBBF24, #F59E0B, transparent) border-box'
                    }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Main logo with pulse effect */}
                <motion.div
                    className={cn("relative z-10", sizeClasses[size])}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                        scale: [0.8, 1.1, 0.8],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="/ubank-logo.png"
                        alt="uBank Logo"
                        width={logoSizes[size]}
                        height={logoSizes[size]}
                        className="object-contain drop-shadow-lg"
                        priority
                    />
                </motion.div>
            </div>

            {/* Loading text with animated dots */}
            {showText && (
                <motion.div
                    className="flex items-center gap-0.5 text-gray-600 dark:text-gray-300 font-medium"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
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
                                className="text-amber-500"
                            >
                                .
                            </motion.span>
                        ))}
                    </span>
                </motion.div>
            )}
        </motion.div>
    )

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20">
                {content}
            </div>
        )
    }

    return content
}

// Full page loader variant
export function PageLoader({ text = 'Loading' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20">
            <LogoLoader size="xl" text={text} />
        </div>
    )
}

// Inline loader for buttons and smaller areas
export function InlineLogoLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
    return <LogoLoader size={size} showText={false} />
}

// Card loader with logo
export function CardLogoLoader({ text = 'Loading content' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <LogoLoader size="md" text={text} />
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
                <LogoLoader size="lg" text={text} />
            </motion.div>
        </motion.div>
    )
}
