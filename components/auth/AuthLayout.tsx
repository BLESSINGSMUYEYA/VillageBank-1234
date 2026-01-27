"use client";

import React from "react";
import { motion } from "framer-motion";
import { UBankLogo } from "@/components/ui/Logo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Copy, ShieldCheck } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/motions";

interface AuthLayoutProps {
    children: React.ReactNode;
    bannerTitle?: string;
    bannerDescription?: string;
    showBrandOnMobile?: boolean;
}

export function AuthLayout({
    children,
    bannerTitle,
    bannerDescription,
    showBrandOnMobile = true,
}: AuthLayoutProps) {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Banner Side (Left) - Desktop Only */}
            <div className="hidden lg:relative lg:block bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20 z-10" />
                <img
                    src="/auth-banner.png"
                    alt="Community Savings"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 p-12 z-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-[#D8F3DC] rounded-2xl flex items-center justify-center border border-[#B7E4C7] mb-6 shadow-xl"
                    >
                        <UBankLogo className="w-10 h-10" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-black text-white tracking-tighter max-w-lg"
                    >
                        {bannerTitle || t('auth.banner_title') || 'Grow Together.'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-300 font-medium max-w-md"
                    >
                        {bannerDescription || t('auth.banner_desc') || 'Join thousands of Malawians building wealth through community savings.'}
                    </motion.p>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="flex flex-col justify-center items-center p-6 py-12 relative bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                {/* Ambient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[5%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[5%] left-[5%] w-[30%] h-[30%] bg-teal-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-md relative z-10"
                >
                    {/* Branding (Mobile Only) */}
                    {showBrandOnMobile && (
                        <motion.div variants={fadeIn} className="flex flex-col items-center mb-8 text-center lg:hidden">
                            <div className="w-16 h-16 bg-[#D8F3DC] dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center shadow-xl mb-4 border border-emerald-100 dark:border-emerald-500/10">
                                <UBankLogo className="w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                uBank
                            </h1>
                        </motion.div>
                    )}

                    {children}

                    {/* Secure Badge */}
                    <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-2 opacity-40">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('auth.secure_badge') || 'BANK-GRADE SECURITY'}</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
