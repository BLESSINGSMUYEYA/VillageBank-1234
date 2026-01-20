import React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormGroupProps {
    label: React.ReactNode | string
    error?: string
    children: React.ReactNode
    className?: string
    optional?: boolean
}

export function FormGroup({
    label,
    error,
    children,
    className,
    optional
}: FormGroupProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between items-center ml-1">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                </Label>
                {optional && (
                    <span className="text-[10px] font-bold text-muted-foreground/50 italic capitalize">
                        Optional
                    </span>
                )}
            </div>

            {children}

            {error && (
                <p className="text-xs text-red-500 font-black ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    )
}
