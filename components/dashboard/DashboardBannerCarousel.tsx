'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Announcement } from '@prisma/client';

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

const DEFAULT_BANNERS: BannerSlide[] = [
    {
        id: '1',
        title: 'New: uBank University',
        description: 'Master your community finances with our step-by-step guides.',
        image: '/banners/education.jpg',
        ctaText: 'Start Learning',
        ctaLink: '/help',
        theme: 'dark',
        accentColor: 'bg-blue-600'
    },
    {
        id: '2',
        title: 'Secure Your Account',
        description: 'Enable Two-Factor Authentication for better security.',
        image: '/banners/security.jpg',
        ctaText: 'Setup 2FA',
        ctaLink: '/profile',
        theme: 'dark',
        accentColor: 'bg-emerald-600'
    }
];

interface DashboardBannerCarouselProps {
    announcements?: Announcement[];
}

export function DashboardBannerCarousel({ announcements = [] }: DashboardBannerCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Transform database announcements to slides
    const dbSlides: BannerSlide[] = announcements.map((a, index) => {
        // Rotate colors based on index
        const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-blue-600', 'bg-violet-600'];
        const accentColor = colors[index % colors.length];

        return {
            id: a.id,
            title: a.title,
            description: a.message,
            image: a.imageUrl || '/banners/community.jpg', // Fallback
            ctaText: a.actionText || 'Learn More',
            ctaLink: a.link || '#',
            theme: 'light', // Default to light for custom banners or smart detect
            accentColor: accentColor
        };
    });

    // Merge default and db slides (DB slides first)
    const banners = [...dbSlides, ...DEFAULT_BANNERS];

    useEffect(() => {
        if (isHovered || !isVisible || banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [isHovered, isVisible, banners.length]);

    if (!isVisible || banners.length === 0) return null;

    const currentSlide = banners[currentIndex];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative w-full overflow-hidden rounded-[1.5rem] shadow-xl shadow-emerald-900/5 group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative min-h-[11rem] sm:min-h-[10rem] h-auto w-full bg-slate-900 overflow-hidden flex items-center py-4 sm:py-0">
                        {/* Background Image with Overlay */}
                        {currentSlide.image.startsWith('/') ? (
                            <div className="absolute inset-0">
                                <img
                                    src={currentSlide.image}
                                    alt=""
                                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                            </div>
                        ) : null}

                        {/* Subtle Background glow */}
                        <div className={cn(
                            "absolute inset-0 opacity-30 blur-3xl transition-colors duration-1000 mix-blend-color-dodge",
                            currentSlide.accentColor
                        )} />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="relative w-full h-full flex items-center z-10"
                            >
                                <div className="w-full px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    {/* Text Content */}
                                    <div className="flex flex-col gap-2 max-w-2xl relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md",
                                                currentSlide.accentColor,
                                                "bg-opacity-20 text-white"
                                            )}>
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentSlide.accentColor)}></span>
                                                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5 bg-white")}></span>
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/90">Featured</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1 shadow-black/50 drop-shadow-md">
                                                {currentSlide.title}
                                            </h2>
                                            <p className="text-sm text-slate-200 font-medium opacity-90 line-clamp-2 max-w-lg shadow-black/50 drop-shadow-sm">
                                                {currentSlide.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="flex items-center gap-4 relative z-10 shrink-0">
                                        <Link href={currentSlide.ctaLink} className="w-full sm:w-auto">
                                            <Button className="h-10 sm:h-11 px-5 sm:px-6 w-full sm:w-auto rounded-xl bg-white text-slate-900 font-bold hover:bg-emerald-50 hover:scale-105 transition-all shadow-lg active:scale-95 group/btn border-0">
                                                <span className="whitespace-nowrap">{currentSlide.ctaText}</span>
                                                <ChevronRight className="w-4 h-4 ml-1.5 text-slate-400 group-hover/btn:text-slate-900 transition-colors" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Dots */}
                        <div className="absolute bottom-4 right-1/2 translate-x-1/2 sm:right-10 sm:translate-x-0 flex gap-1.5 z-20">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300 backdrop-blur-sm",
                                        index === currentIndex
                                            ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                            : "w-1.5 bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

