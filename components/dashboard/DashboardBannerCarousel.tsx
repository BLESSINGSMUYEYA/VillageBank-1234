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
                    className="relative w-full overflow-hidden rounded-3xl"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative h-[280px] sm:h-[320px] w-full bg-slate-900">
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(false);
                            }}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white backdrop-blur-md transition-all"
                            aria-label="Dismiss banner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0 w-full h-full"
                            >
                                {/* Background Layer */}
                                <div className={cn(
                                    "absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear",
                                    isHovered ? "scale-105" : "scale-100"
                                )}
                                    style={{
                                        backgroundImage: `url(${currentSlide.image})`,
                                        backgroundColor: currentSlide.id === '1'
                                            ? '#1e3a8a'
                                            : currentSlide.id === '2'
                                                ? '#064e3b'
                                                : '#312e81'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0px]" />
                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

                                    {/* Abstract Shapes for visual interest */}
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 mix-blend-overlay" />
                                    <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-black/20 rounded-full blur-[60px]" />
                                </div>

                                {/* Content Layer */}
                                <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-2xl">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 w-fit backdrop-blur-md border border-white/10",
                                            currentSlide.accentColor,
                                            "bg-opacity-20 text-white"
                                        )}
                                    >
                                        <span className="relative flex h-2 w-2">
                                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentSlide.accentColor)}></span>
                                            <span className={cn("relative inline-flex rounded-full h-2 w-2", currentSlide.accentColor)}></span>
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest pl-1">Featured Update</span>
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4 leading-tight"
                                    >
                                        {currentSlide.title}
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-lg text-slate-300 font-medium mb-8 max-w-md leading-relaxed"
                                    >
                                        {currentSlide.description}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Link href={currentSlide.ctaLink}>
                                            <Button className="h-12 px-8 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 hover:scale-105 transition-all shadow-lg shadow-white/10">
                                                {currentSlide.ctaText}
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Dots */}
                    <div className="absolute bottom-6 right-8 flex gap-2 z-10">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    index === currentIndex
                                        ? "w-8 bg-white opacity-100"
                                        : "bg-white/40 hover:bg-white/60"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
