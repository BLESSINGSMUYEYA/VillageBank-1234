'use client'

import { useState, useEffect, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeIn, staggerContainer } from '@/lib/motions'
import SmartContributionForm from './SmartContributionForm'

interface ContributionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ContributionModal({ isOpen, onClose }: ContributionModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null
    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full sm:max-w-5xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#F8FAFC] dark:bg-[#020617] border border-white/20 shadow-2xl no-scrollbar z-50"
                    >
                        {/* Close Button */}
                        {/* Mobile drag handle indicator */}
                        <div className="sticky top-0 pt-2 pb-1 sm:hidden flex justify-center bg-inherit z-50">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="absolute top-2 sm:top-4 right-3 sm:right-4 z-50">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Button>
                        </div>

                        <div className="p-4 sm:p-6 md:p-10">
                            <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                <SmartContributionForm isModal={true} onClose={onClose} />
                            </Suspense>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
