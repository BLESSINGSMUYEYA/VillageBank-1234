import Image from 'next/image'
import { cn } from '@/lib/utils'

export function UBankLogo({ className }: { className?: string }) {
    return (
        <Image
            src="/ubank-logo.png"
            alt="uBank Logo"
            width={40}
            height={40}
            className={cn("object-contain", className)}
            priority
        />
    )
}
