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
