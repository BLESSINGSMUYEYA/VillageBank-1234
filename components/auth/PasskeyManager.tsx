'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Assuming sonner is used based on package.json
import { Fingerprint, Loader2 } from 'lucide-react';

export default function PasskeyManager() {
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            // 1. Get options from server
            const resp = await fetch('/api/auth/webauthn/register/options', {
                headers: {
                    'Cache-Control': 'no-store'
                }
            });

            if (!resp.ok) {
                const error = await resp.json();
                throw new Error(error.error || 'Failed to get registration options');
            }

            const options = await resp.json();

            // 2. Start registration with browser/authenticator
            const attResp = await startRegistration(options);

            // 3. Send response to server for verification
            const verifyResp = await fetch('/api/auth/webauthn/register/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attResp),
            });

            const verifyResult = await verifyResp.json();

            if (verifyResult.verified) {
                toast.success('Passkey registered successfully!');
            } else {
                toast.error('Passkey registration failed');
                console.error('Verification failed:', verifyResult);
            }
        } catch (error: any) {
            // SimpleWebAuthn errors or fetch errors
            if (error.name === 'InvalidStateError') {
                toast.error('This authenticator is already registered.');
            } else {
                console.error('Registration error:', error);
                toast.error(error.message || 'An error occurred during registration');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-xl bg-card">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Fingerprint className="w-5 h-5" />
                        Biometric Login
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Enable login with FaceID, TouchID, or Windows Hello.
                    </p>
                </div>
                <Button
                    onClick={handleRegister}
                    disabled={loading}
                    variant="outline"
                    className="gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Registering...
                        </>
                    ) : (
                        'Register Passkey'
                    )}
                </Button>
            </div>
        </div>
    );
}
