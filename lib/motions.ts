/**
 * Standardized motion variants for Village Banking Premium
 * Uses framer-motion for high-fidelity animations
 */

export const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
} as const;

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
} as const;

export const itemFadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
} as const;

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        }
    }
} as const;

export const slideInRight = {
    initial: { x: 20, opacity: 0 },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
} as const;

export const hoverScale = {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
} as const;

export const glassReflection = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
        backgroundPosition: '200% 0',
        transition: {
            repeat: Infinity,
            duration: 3,
            ease: "linear"
        }
    }
} as const;

export const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
} as const;

// ==========================================
// MOBILE-OPTIMIZED VARIANTS
// Use these on mobile for better performance
// ==========================================

/**
 * Simplified fade-in for mobile - uses tween instead of spring
 * Less computational overhead on low-end devices
 */
export const mobileItemFadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "tween",
            duration: 0.2,
            ease: "easeOut"
        }
    }
} as const;

/**
 * Fast stagger for mobile - shorter delays
 */
export const mobileStaggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.03
        }
    }
} as const;

/**
 * Simple scale for mobile - no spring physics
 */
export const mobileScaleIn = {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "tween",
            duration: 0.15,
            ease: "easeOut"
        }
    }
} as const;

/**
 * No-hover variant for touch devices
 */
export const touchScale = {
    whileTap: { scale: 0.97 },
    transition: { type: "tween", duration: 0.1 }
} as const;

/**
 * Helper: Check if user prefers reduced motion
 * Use this to conditionally apply simpler animations
 */
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Helper: Get appropriate variants based on device/preference
 */
export const getResponsiveVariants = (isMobile: boolean) => ({
    itemFadeIn: isMobile ? mobileItemFadeIn : itemFadeIn,
    staggerContainer: isMobile ? mobileStaggerContainer : staggerContainer,
    scaleIn: isMobile ? mobileScaleIn : scaleIn,
    hoverScale: isMobile ? touchScale : hoverScale,
});

