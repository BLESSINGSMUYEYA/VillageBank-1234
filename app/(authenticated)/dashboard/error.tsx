'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
            <GlassCard className="max-w-md w-full p-8 text-center space-y-6" hover={false}>
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                        Something went wrong!
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        We couldn't load your dashboard data. This might be a temporary network issue.
                    </p>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>

                {error.digest && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">
                        Error ID: {error.digest}
                    </p>
                )}
            </GlassCard>
        </div>
    )
}
