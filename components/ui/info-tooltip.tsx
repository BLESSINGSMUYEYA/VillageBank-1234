'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InfoTooltipProps {
    content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative inline-flex items-center ml-2">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                className="text-muted-foreground hover:text-blue-500 transition-colors focus:outline-none"
            >
                <Info className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none"
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/90" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
