export const theme = {
    colors: {
        // Primary Brand - "Zen Blue" gradient source
        primary: {
            DEFAULT: '#2563eb', // blue-600
            dark: '#1e40af',    // blue-800
            light: '#60a5fa',   // blue-400
            foreground: '#ffffff',
        },
        // Secondary Brand - "Golden Hour" accents
        secondary: {
            DEFAULT: '#ca8a04', // yellow-600
            dark: '#854d0e',    // yellow-800
            light: '#facc15',   // yellow-400
            foreground: '#ffffff',
        },
        // Success - Trust signals (verified, secure)
        success: {
            DEFAULT: '#10b981', // emerald-500
            bg: '#ecfdf5',      // emerald-50
        },
        // Error - Alerts, validation
        error: {
            DEFAULT: '#ef4444', // red-500
            bg: '#fef2f2',      // red-50
        },
        // Glassmorphism backgrounds
        glass: {
            light: 'rgba(255, 255, 255, 0.4)',
            dark: 'rgba(0, 0, 0, 0.4)',
            border: 'rgba(255, 255, 255, 0.2)',
        }
    },
    spacing: {
        // Standard spacing units map
        section: '2rem',
        card: '1.5rem',
        element: '0.75rem',
    },
    borderRadius: {
        card: '1rem', // xl
        button: '0.5rem', // lg
        input: '0.5rem', // lg
    }
} as const;
