import Image from 'next/image'
import { cn } from '@/lib/utils'

export function UBankLogo({ className }: { className?: string }) {
    return (
        <Image
            src="/ubank-logo.png"
            alt="uBank Logo"
            width={40}
            height={40}
            className={cn("object-contain mix-blend-multiply dark:mix-blend-screen", className)}
            style={{
                filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.3))'
            }}
            priority
        />
    )
}
