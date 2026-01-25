'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, FileCheck, Image as ImageIcon } from 'lucide-react'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DocumentUploaderProps {
    label: string
    subLabel?: string
    onFileSelect: (file: File | null) => void
    previewUrl?: string | null
    error?: string
}

export function DocumentUploader({ label, subLabel, onFileSelect, previewUrl, error }: DocumentUploaderProps) {
    const [preview, setPreview] = useState<string | null>(previewUrl || null)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (previewUrl) setPreview(previewUrl)
    }, [previewUrl])

    const handleFile = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            // error handling handled by parent usually, or we can add local state
            return
        }

        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)
        onFileSelect(selectedFile)
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
        setPreview(null)
        onFileSelect(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "relative group cursor-pointer overflow-hidden",
                            "border-2 border-dashed rounded-2xl transition-all duration-300 h-48",
                            dragActive
                                ? "border-blue-500 bg-blue-500/5 scale-[1.02]"
                                : error
                                    ? "border-red-500/50 bg-red-500/5"
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

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3">
                            <div className={cn(
                                "p-3 rounded-xl transition-all duration-300",
                                dragActive ? "bg-blue-500 text-white" : "bg-muted/50 text-muted-foreground group-hover:bg-blue-500 group-hover:text-white"
                            )}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">{label}</p>
                                {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 h-48 group"
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-full font-bold"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    clearFile()
                                }}
                            >
                                <X className="w-4 h-4 mr-2" /> Remove
                            </Button>
                        </div>

                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck className="w-3 h-3 text-green-400" />
                            Ready
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {error && (
                <p className="text-xs font-bold text-red-500 mt-2 ml-1">{error}</p>
            )}
        </div>
    )
}
