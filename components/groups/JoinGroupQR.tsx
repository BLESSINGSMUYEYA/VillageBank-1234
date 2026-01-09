'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
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

export function JoinGroupQR() {
    const [isOpen, setIsOpen] = useState(false)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const scannerId = 'qr-reader'
    const scannerRef = useRef<Html5Qrcode | null>(null)

    useEffect(() => {
        if (isOpen) {
            const startScanner = async () => {
                try {
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
                if (scannerRef.current) {
                    const s = scannerRef.current
                    if (s.isScanning) {
                        s.stop().catch(err => console.error('Error stopping scanner during cleanup:', err))
                    }
                    scannerRef.current = null
                }
            }
        }
    }, [isOpen, router])

    const handleClose = () => {
        setIsOpen(false)
        setIsCameraReady(false)
        setIsScanning(false)
        setError(null)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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

            <DialogTrigger asChild>
                <Button
                    variant="default"
                    className="shadow-yellow-500/20 group px-6 border-none"
                    onClick={() => setIsOpen(true)}
                >
                    <ScanLine className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Scan QR to Join
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none shadow-2xl p-0 overflow-hidden">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-banana/10 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-blue-600 dark:text-banana" />
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
                    ) : (
                        <>
                            <div className="relative w-full max-w-[320px] aspect-square">
                                {/* Scanner Frame Decorator */}
                                <div className="absolute -inset-2 border-2 border-blue-600/20 dark:border-banana/20 rounded-[30px] pointer-events-none" />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600 dark:border-banana rounded-tl-2xl z-10" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600 dark:border-banana rounded-tr-2xl z-10" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600 dark:border-banana rounded-bl-2xl z-10" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600 dark:border-banana rounded-br-2xl z-10" />

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
                                        className="absolute left-0 right-0 h-1 bg-blue-600 dark:bg-banana shadow-[0_0_15px_rgba(37,99,235,0.8)] dark:shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20"
                                    />
                                )}
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-base font-black text-foreground">
                                    Align QR Code within the frame
                                </p>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground opacity-60">
                                    Automatic detection enabled
                                </p>
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
        </Dialog>
    )
}
