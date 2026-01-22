"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"

interface SliderProps {
    min?: number
    max?: number
    step?: number
    value: number
    onChange: (value: number) => void
    className?: string
    formatLabel?: (value: number) => string
}

export function Slider({
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    className,
    formatLabel,
}: SliderProps) {
    const constraintsRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Motion value for the handle position (0 to 1 fraction of track)
    const x = useMotionValue(0)

    // Map x (fraction) to scaleX for the fill bar
    const fillWidth = useTransform(x, (v) => `${v}%`)

    // Update x motion value when external value prop changes
    useEffect(() => {
        if (!isDragging && trackRef.current) {
            const percentage = ((value - min) / (max - min)) * 100
            animate(x, percentage, { type: "spring", stiffness: 300, damping: 30 })
        }
    }, [value, min, max, isDragging, x])

    const handleDrag = (event: any, info: any) => {
        if (trackRef.current) {
            const trackWidth = trackRef.current.offsetWidth
            const offsetX = info.point.x - trackRef.current.getBoundingClientRect().left
            let percentage = (offsetX / trackWidth) * 100

            // Clamp percentage
            percentage = Math.max(0, Math.min(100, percentage))

            // Calculate value based on percentage
            let newValue = min + (percentage / 100) * (max - min)

            // Snap to step
            if (step) {
                newValue = Math.round(newValue / step) * step
            }

            // Clamp value
            newValue = Math.max(min, Math.min(max, newValue))

            if (newValue !== value) {
                onChange(newValue)
            }
        }
    }

    // Handle click on track to jump
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (trackRef.current) {
            const trackWidth = trackRef.current.offsetWidth
            const offsetX = e.clientX - trackRef.current.getBoundingClientRect().left
            let percentage = (offsetX / trackWidth) * 100
            percentage = Math.max(0, Math.min(100, percentage))

            let newValue = min + (percentage / 100) * (max - min)
            if (step) newValue = Math.round(newValue / step) * step
            newValue = Math.max(min, Math.min(max, newValue))

            onChange(newValue)
        }
    }

    return (
        <div className={cn("relative w-full h-8 flex items-center touch-none select-none", className)}>
            <div
                ref={trackRef}
                className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-visible cursor-pointer group"
                onClick={handleTrackClick}
            >
                {/* Track Background */}
                <div className="absolute inset-0 rounded-full opacity-50 transition-opacity group-hover:opacity-100" />

                {/* Fill Track */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-banana rounded-full"
                    style={{ width: useTransform(x, (v) => `${v}%`) }}
                />

                {/* Drag Handle */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 z-10"
                    style={{ left: `${((value - min) / (max - min)) * 100}%` }}
                >
                    <motion.div
                        drag="x"
                        dragConstraints={constraintsRef}
                        dragElastic={0}
                        dragMomentum={false}
                        onDragStart={() => setIsDragging(true)}
                        onDrag={handleDrag}
                        onDragEnd={() => setIsDragging(false)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-6 h-6 bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-banana rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
                    >
                        {/* Visual dot inside */}
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-banana" />
                    </motion.div>

                    {/* Value Label (tooltip-ish) */}
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -30 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
                        >
                            {formatLabel ? formatLabel(value) : value}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Hidden container for drag constraints - we handle math manually but this helps frame it */}
            <div ref={constraintsRef} className="absolute inset-0 pointer-events-none opacity-0" />
        </div>
    )
}
