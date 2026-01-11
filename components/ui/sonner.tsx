"use client"

import { Toaster as Sonner } from "sonner"
import { useTheme } from "next-themes"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            richColors
            position="top-center"
            closeButton
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-900 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    success: "group-[.toaster]:!bg-emerald-50 dark:group-[.toaster]:!bg-emerald-950 group-[.toaster]:!border-emerald-200 dark:group-[.toaster]:!border-emerald-800 group-[.toaster]:!text-emerald-800 dark:group-[.toaster]:!text-emerald-100",
                    error: "group-[.toaster]:!bg-red-50 dark:group-[.toaster]:!bg-red-950 group-[.toaster]:!border-red-200 dark:group-[.toaster]:!border-red-800 group-[.toaster]:!text-red-800 dark:group-[.toaster]:!text-red-100",
                },
            }}
            {...props}
        />
    )
}
