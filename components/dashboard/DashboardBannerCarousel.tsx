'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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

    // Use only database slides
    const banners = dbSlides;

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
                    className="relative w-full overflow-hidden rounded-[1.5rem] shadow-2xl shadow-black/20 group bg-slate-950"
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
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent" />
                            </div>
                        ) : null}

                        {/* Ambient Glows (Pulse Style) */}
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                        {/* Subtle Glass Border */}
                        <div className="absolute inset-0 rounded-[1.5rem] border border-white/5 pointer-events-none z-20" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "circOut" as const }}
                                className="relative w-full h-full flex items-center z-10"
                            >
                                <div className="w-full px-6 sm:px-8 flex flex-col items-start justify-center h-full relative z-10">
                                    {/* Content Group */}
                                    <div className="flex flex-col items-start gap-4 max-w-2xl">

                                        {/* "Featured" Badge & Text */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md",
                                                    currentSlide.accentColor === 'bg-emerald-600'
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]",
                                                        currentSlide.accentColor === 'bg-emerald-600' ? "bg-emerald-500" : "bg-blue-500"
                                                    )} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none pt-0.5">Featured</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-2 shadow-black/50 drop-shadow-md">
                                                    {currentSlide.title}
                                                </h2>
                                                <p className="text-sm text-slate-200 font-medium opacity-90 line-clamp-1 max-w-lg shadow-black/50 drop-shadow-sm">
                                                    {currentSlide.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* CTA Button - Squeezed with content */}
                                        <div className="flex items-center">
                                            <Link href={currentSlide.ctaLink}>
                                                <Button className="h-9 px-5 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors border-0">
                                                    <span className="whitespace-nowrap text-sm">{currentSlide.ctaText}</span>
                                                    <ChevronRight className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
                                                </Button>
                                            </Link>
                                        </div>
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

