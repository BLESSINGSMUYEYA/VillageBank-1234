'use client'

import { Suspense } from 'react' // [NEW] Import Suspense

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
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8FAFC] dark:bg-[#020617] border border-white/20 shadow-2xl no-scrollbar"
                    >
                        {/* Close Button */}
                        <div className="absolute top-4 right-4 z-50">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="p-6 sm:p-10">
                            <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
                                <SmartContributionForm isModal={true} onClose={onClose} />
                            </Suspense>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
