'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BannerSlide {
    id: string;
    title: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    theme: 'dark' | 'light';
    accentColor: string;
}

const banners: BannerSlide[] = [
    {
        id: '1',
        title: 'New: uBank University',
        description: 'Master your community finances with our step-by-step guides for Treasurers and Members.',
        image: '/banners/education.jpg',
        ctaText: 'Start Learning',
        ctaLink: '/help',
        theme: 'dark',
        accentColor: 'bg-blue-600'
    },
    {
        id: '2',
        title: 'Secure Your Account',
        description: 'Enable Two-Factor Authentication to add an extra layer of security to your village bank.',
        image: '/banners/security.jpg',
        ctaText: 'Setup 2FA',
        ctaLink: '/profile',
        theme: 'dark',
        accentColor: 'bg-emerald-600'
    },
    {
        id: '3',
        title: 'Invite Your Community',
        description: 'Grow your capital by inviting trusted members to join your village bank circle.',
        image: '/banners/community.jpg',
        ctaText: 'Invite Members',
        ctaLink: '/groups',
        theme: 'light',
        accentColor: 'bg-indigo-600'
    }
];

export function DashboardBannerCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isHovered || !isVisible) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 8000); // 8 seconds per slide

        return () => clearInterval(timer);
    }, [isHovered, isVisible]);

    const currentSlide = banners[currentIndex];

    // If dismissed, render nothing (or animate out)
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative w-full overflow-hidden rounded-[1.5rem] shadow-xl shadow-emerald-900/5"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative h-28 sm:h-36 w-full bg-slate-900 overflow-hidden">
                        {/* Subtle Background glow based on slide */}
                        <div className={cn(
                            "absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000",
                            currentSlide.accentColor
                        )} />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="absolute inset-0 w-full h-full flex items-center"
                            >
                                <div className="w-full px-4 sm:px-12 flex items-center justify-between gap-4 sm:gap-8">
                                    {/* Left: Tag + Title + Desc Row */}
                                    <div className="flex items-center gap-4 sm:gap-8 min-w-0">
                                        <div className={cn(
                                            "hidden xl:flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/20 whitespace-nowrap",
                                            currentSlide.accentColor,
                                            "bg-opacity-20 text-white"
                                        )}>
                                            <span className="relative flex h-2 w-2">
                                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentSlide.accentColor)}></span>
                                                <span className={cn("relative inline-flex rounded-full h-2 w-2", currentSlide.accentColor)}></span>
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Featured</span>
                                        </div>

                                        <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                                            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tighter leading-tight line-clamp-1 sm:line-clamp-none">
                                                {currentSlide.title}
                                            </h2>
                                            <p className="text-xs sm:text-base text-slate-400 font-medium truncate opacity-60 max-w-[150px] xs:max-w-xs sm:max-w-xl">
                                                {currentSlide.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: CTA + Navigation Shortcut */}
                                    <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                                        <Link href={currentSlide.ctaLink}>
                                            <Button className="h-9 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl bg-white text-slate-900 font-black text-[11px] sm:text-sm hover:bg-emerald-50 hover:scale-105 transition-all shadow-xl group/btn">
                                                <span className="whitespace-nowrap">{currentSlide.ctaText}</span>
                                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>

                                        {/* Simplified Dots for the Strip */}
                                        <div className="hidden md:flex gap-1.5 ml-2">
                                            {banners.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentIndex(index)}
                                                    className={cn(
                                                        "h-1 rounded-full transition-all duration-500",
                                                        index === currentIndex
                                                            ? "w-4 bg-white"
                                                            : "w-1 bg-white/20 hover:bg-white/40"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        {/* Dismiss Cross */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsVisible(false);
                                            }}
                                            className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6 6 18" />
                                                <path d="m6 6 12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
