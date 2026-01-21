'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if we're on a mobile/touch device
 * Uses multiple signals for reliable detection
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            // Check viewport width
            const isSmallScreen = window.innerWidth < 768

            // Check for touch capability
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

            // Check for coarse pointer (finger vs mouse)
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches

            setIsMobile(isSmallScreen || (hasTouch && hasCoarsePointer))
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches)
        }

        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    return prefersReducedMotion
}

/**
 * Combined hook for performance-aware animation decisions
 * Returns simplified animation settings for mobile or reduced-motion users
 */
export function useAnimationPreference() {
    const isMobile = useIsMobile()
    const prefersReducedMotion = usePrefersReducedMotion()

    return {
        isMobile,
        prefersReducedMotion,
        shouldSimplifyAnimations: isMobile || prefersReducedMotion,
        // Animation durations (shorter on mobile)
        duration: {
            fast: isMobile ? 0.1 : 0.15,
            normal: isMobile ? 0.15 : 0.3,
            slow: isMobile ? 0.2 : 0.5,
        },
        // Disable heavy effects on low-end
        enableBackdropBlur: !isMobile,
        enableSpringPhysics: !isMobile && !prefersReducedMotion,
    }
}
