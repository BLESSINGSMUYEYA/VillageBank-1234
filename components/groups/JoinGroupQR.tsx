'use client'

import { useEffect, useRef, useState } from 'react'
import type { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScanLine, Camera, XCircle } from 'lucide-react'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface JoinGroupQRProps {
    children?: React.ReactNode
}

export function JoinGroupQR({ children }: JoinGroupQRProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [isTimeout, setIsTimeout] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const scannerId = 'qr-reader'
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const TIMEOUT_DURATION = 60000 // 60 seconds

    const cleanupScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop()
                }
            } catch (e) {
                console.error('Error stopping scanner cleanup:', e)
            }
            scannerRef.current = null
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    useEffect(() => {
        if (isOpen) {
            const startScanner = async () => {
                try {
                    const { Html5Qrcode } = await import('html5-qrcode')

                    // Cleanup any existing instance just in case
                    if (scannerRef.current) {
                        try { await scannerRef.current.stop(); } catch (e) { }
                    }

                    const scanner = new Html5Qrcode(scannerId)
                    scannerRef.current = scanner

                    const devices = await Html5Qrcode.getCameras()

                    if (devices && devices.length > 0) {
                        await scanner.start(
                            { facingMode: 'environment' },
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                            },
                            (decodedText) => {
                                try {
                                    const url = new URL(decodedText)
                                    if (url.pathname.includes('/shared/')) {
                                        toast.success('Group found! Redirecting...')
                                        if (timeoutRef.current) clearTimeout(timeoutRef.current)
                                        scanner.stop().then(() => {
                                            router.push(url.pathname)
                                            setIsOpen(false)
                                        })
                                    } else {
                                        toast.error('Invalid QR code for this application')
                                    }
                                } catch (e) {
                                    toast.error('Invalid QR code format')
                                }
                            },
                            () => { } // Silent retry
                        )
                        setIsCameraReady(true)
                        setIsScanning(true)

                        // Set timeout
                        timeoutRef.current = setTimeout(async () => {
                            await cleanupScanner()
                            setIsScanning(false)
                            setIsTimeout(true)
                            setIsCameraReady(false)
                        }, TIMEOUT_DURATION)
                    } else {
                        setError('No camera found on this device')
                    }
                } catch (err) {
                    console.error('Scanner error:', err)
                    setError('Failed to access camera. Please ensure you have given permission.')
                }
            }

            const timeoutId = setTimeout(startScanner, 400)
            return () => {
                clearTimeout(timeoutId)
                cleanupScanner()
            }
        }
    }, [isOpen, router, isTimeout])

    const handleClose = () => {
        setIsOpen(false)
        setIsCameraReady(false)
        setIsScanning(false)
        setIsTimeout(false)
        setError(null)
        cleanupScanner()
    }

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Clear timeout if uploading file
            if (timeoutRef.current) clearTimeout(timeoutRef.current)

            // Stop camera if running
            if (scannerRef.current && isScanning) {
                try {
                    await scannerRef.current.stop()
                    setIsScanning(false)
                    setIsCameraReady(false)
                } catch (err) {
                    console.error('Error stopping camera:', err)
                }
            }

            try {
                const { Html5Qrcode } = await import('html5-qrcode')
                const scanner = new Html5Qrcode(scannerId)
                const decodedText = await scanner.scanFile(file, true)
                const url = new URL(decodedText)
                if (url.pathname.includes('/shared/')) {
                    toast.success('Group found! Redirecting...')
                    router.push(url.pathname)
                    setIsOpen(false)
                } else {
                    toast.error('Invalid QR code for this application')
                }
            } catch (err) {
                console.error('File scan error:', err)
                toast.error('Could not read QR code from image')
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogTrigger asChild>
                {children ? (
                    <div onClick={() => setIsOpen(true)}>{children}</div>
                ) : (
                    <Button
                        variant="outline"
                        className="shadow-emerald-500/20 group px-6 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        onClick={() => setIsOpen(true)}
                    >
                        <ScanLine className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Scan QR to Join
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none shadow-2xl p-0 overflow-hidden">
                {/* Target injected video styling without conflict */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    #${scannerId} video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        border-radius: 1rem;
                    }
                    #${scannerId} {
                        border: none !important;
                    }
                ` }} />
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            Scan Group QR
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 pb-8 px-6">
                    {error ? (
                        <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-200 dark:border-red-900/30 w-full">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error}</p>
                            <Button variant="outline" className="rounded-xl px-8" onClick={handleClose}>
                                Close Scanner
                            </Button>
                        </div>
                    ) : isTimeout ? (
                        <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] w-full">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <ScanLine className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-black text-foreground mb-2">Scanner Paused</h3>
                            <p className="text-sm text-muted-foreground mb-6">The camera was stopped to save battery.</p>
                            <Button size="lg" variant="banana" className="rounded-xl px-8 w-full font-bold shadow-lg shadow-yellow-500/20" onClick={() => setIsTimeout(false)}>
                                Resume Scanning
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full max-w-[320px] aspect-square">
                                {/* Scanner Frame Decorator */}
                                <div className="absolute -inset-2 border-2 border-emerald-600/20 dark:border-emerald-400/20 rounded-[30px] pointer-events-none" />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-600 dark:border-emerald-400 rounded-tl-2xl z-10" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-600 dark:border-emerald-400 rounded-tr-2xl z-10" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-600 dark:border-emerald-400 rounded-bl-2xl z-10" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-600 dark:border-emerald-400 rounded-br-2xl z-10" />

                                {/* ROOT CONTAINER FOR HTML5QRCODE (SHOULD BE EMPTY FOR REACT) */}
                                <div
                                    id={scannerId}
                                    className="w-full h-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 shadow-2xl"
                                />

                                {/* LOADER / INITIALIZING UI (MANAGED BY REACT SEPARATELY) */}
                                {!isCameraReady && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl z-30">
                                        <InlineLogoLoader size="md" />
                                        <p className="text-sm font-black text-muted-foreground mt-4 uppercase tracking-widest opacity-60">Initializing...</p>
                                    </div>
                                )}

                                {isScanning && (
                                    <motion.div
                                        initial={{ top: '10%' }}
                                        animate={{ top: '90%' }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20"
                                    />
                                )}
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-base font-black text-foreground">
                                    Align QR Code within the frame
                                </p>
                                <p className="text-xs font-bold text-muted-foreground">
                                    OR
                                </p>
                                <div className="flex justify-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-[10px] uppercase tracking-widest font-black"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload QR Image
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-center">
                    <Button variant="ghost" onClick={handleClose} className="font-black text-muted-foreground hover:text-foreground uppercase tracking-widest text-[10px]">
                        Cancel Scanning
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}
