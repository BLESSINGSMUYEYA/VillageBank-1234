'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface SecurityVerificationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onVerified: () => void
}

export function SecurityVerificationModal({
    open,
    onOpenChange,
    onVerified
}: SecurityVerificationModalProps) {
    const [passwordInput, setPasswordInput] = useState('')
    const [verificationError, setVerificationError] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    const handleVerifyPassword = async () => {
        if (!passwordInput) return

        setIsVerifying(true)
        setVerificationError('')

        try {
            const res = await fetch('/api/auth/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput }),
            })

            if (res.ok) {
                onVerified()
                onOpenChange(false)
                setPasswordInput('') // Reset password input on success
            } else {
                const data = await res.json()
                setVerificationError(data.error || 'Invalid password')
            }
        } catch (error) {
            setVerificationError('An error occurred. Please try again.')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                setPasswordInput('')
                setVerificationError('')
            }
            onOpenChange(val)
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Security Verification</DialogTitle>
                    <DialogDescription>
                        Please enter your password to view your total contributions.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleVerifyPassword()
                                }
                            }}
                            placeholder="Enter your password"
                        />
                        {verificationError && (
                            <p className="text-sm text-red-500 font-medium">
                                {verificationError}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isVerifying}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleVerifyPassword}
                        disabled={isVerifying || !passwordInput}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
