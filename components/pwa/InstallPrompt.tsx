'use client';

import { useState, useEffect } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

export function InstallPrompt() {
    const { showInstallPrompt, promptToInstall } = useInstallPrompt();
    const [isDismissed, setIsDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user previously dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            // Check if it's been more than 7 days, if so, show again
            const dismissedDate = new Date(dismissed);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - dismissedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 7) {
                setIsDismissed(true);
            } else {
                localStorage.removeItem('pwa-install-dismissed');
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    if (!mounted || !showInstallPrompt || isDismissed) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="fixed bottom-28 lg:bottom-4 right-4 z-[60] w-full max-w-sm px-4 sm:px-0"
            >
                <GlassCard
                    className="relative overflow-hidden border-emerald-500/30 dark:border-emerald-400/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                    gradient
                >
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full blur-2xl" />

                    <div className="relative z-10 p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <div className="p-2.5 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-xl">
                                    <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-foreground leading-tight">Install App</h3>
                                    <p className="text-xs font-medium text-muted-foreground mt-1">
                                        Get the full experience with offline access and instant updates.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDismiss}
                                className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex gap-3 mt-1">
                            <Button
                                onClick={promptToInstall}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/20"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install Now
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDismiss}
                                className="flex-1 border-border/50 font-bold"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </AnimatePresence>
    );
}
