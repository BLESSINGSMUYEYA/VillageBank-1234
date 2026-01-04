'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ScanLine, FileCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScannedData {
    amount: number | null
    transactionRef: string | null
    date: string | null
    paymentMethod: string | null
    sender: string | null
}

interface ReceiptUploaderProps {
    onScanComplete: (data: ScannedData) => void
    onScanStart?: () => void
    onError?: (error: string) => void
}

export default function ReceiptUploader({ onScanComplete, onScanStart, onError }: ReceiptUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            onError?.('Please upload an image file (PNG, JPG)')
            return
        }

        setFile(selectedFile)
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)

        // Auto-scan on upload
        await scanReceipt(selectedFile)
    }

    const scanReceipt = async (imageFile: File) => {
        setIsScanning(true)
        onScanStart?.()

        try {
            const formData = new FormData()
            formData.append('file', imageFile)

            const response = await fetch('/api/contributions/scan', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to scan receipt')
            }

            onScanComplete(data)
        } catch (err: any) {
            onError?.(err.message || 'Scanning failed')
            setFile(null)
            setPreview(null)
        } finally {
            setIsScanning(false)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const clearFile = () => {
        setFile(null)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "relative group cursor-pointer",
                            "border-2 border-dashed rounded-3xl transition-all duration-300",
                            dragActive
                                ? "border-blue-500 bg-blue-500/5 scale-[1.02]"
                                : "border-muted-foreground/20 hover:border-blue-500/50 hover:bg-muted/5"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />

                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                            <div className={cn(
                                "p-4 rounded-2xl transition-all duration-300",
                                dragActive ? "bg-blue-500 text-white shadow-xl shadow-blue-500/30" : "bg-muted text-muted-foreground group-hover:bg-blue-500 group-hover:text-white"
                            )}>
                                <Upload className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-foreground">
                                    {dragActive ? "Drop Receipt Artifact" : "Upload Payment Proof"}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Support for PNG, JPG / Mobile Money Screenshots
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl"
                    >
                        <div className="relative aspect-video bg-black/5 dark:bg-black/40 flex items-center justify-center">
                            <img
                                src={preview}
                                alt="Receipt Preview"
                                className="max-h-full max-w-full object-contain"
                            />

                            {isScanning && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-4">
                                    <ScanLine className="w-10 h-10 animate-pulse text-blue-400" />
                                    <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Analyzing Artifact...</p>
                                </div>
                            )}

                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    clearFile()
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {!isScanning && (
                            <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider">
                                <FileCheck className="w-4 h-4" />
                                Scan Complete
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
