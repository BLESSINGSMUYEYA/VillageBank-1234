'use client'

import { QRScannerDialog } from '@/components/shared/QRScannerDialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface JoinGroupQRProps {
    children?: React.ReactNode
}

export function JoinGroupQR({ children }: JoinGroupQRProps) {
    const router = useRouter()

    const handleScan = async (decodedText: string) => {
        try {
            const url = new URL(decodedText)
            if (url.pathname.includes('/shared/')) {
                toast.success('Group found! Redirecting...')
                router.push(url.pathname)
            } else {
                toast.error('Invalid QR code for this application')
            }
        } catch (e) {
            toast.error('Invalid QR code format')
        }
    }

    const validateQR = (decodedText: string) => {
        try {
            const url = new URL(decodedText)
            if (!url.pathname.includes('/shared/')) {
                return 'Invalid QR code. Please scan a valid group invitation QR.'
            }
            return null
        } catch (e) {
            return 'Invalid QR code format'
        }
    }

    return (
        <QRScannerDialog
            onScan={handleScan}
            title="Scan Group QR"
            description="Align the Group Invite QR Code within the frame"
            validationFn={validateQR}
        >
            {children}
        </QRScannerDialog>
    )
}

