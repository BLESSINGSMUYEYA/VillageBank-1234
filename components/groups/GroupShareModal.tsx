'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Share2, X } from 'lucide-react'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'

interface GroupShareModalProps {
    groupId: string
    groupName: string
}

export function GroupShareModal({ groupId, groupName }: GroupShareModalProps) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const modalContent = (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8FAFC] dark:bg-[#020617] border border-white/20 shadow-2xl no-scrollbar flex flex-col z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-200 dark:border-white/10 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                                        <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Share Group
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 ml-11">Invite members to {groupName}</p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <QRCodeShare groupId={groupId} groupName={groupName} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="h-12 rounded-xl px-4 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-xs gap-2 group"
            >
                <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="truncate">Invite</span>
            </Button>
            {createPortal(modalContent, document.body)}
        </>
    )
}
