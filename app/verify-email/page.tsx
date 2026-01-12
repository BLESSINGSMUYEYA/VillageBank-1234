'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { UBankLogo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { staggerContainer, itemFadeIn } from '@/lib/motions';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        async function verify() {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                if (res.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        }

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[20%] left-[20%] w-[20%] h-[20%] bg-indigo-600/10 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="w-full max-w-md relative z-10"
            >
                <motion.div variants={itemFadeIn} className="flex flex-col items-center mb-8">
                    <UBankLogo className="w-16 h-16 invert mb-4" />
                </motion.div>

                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-8 text-center border-none shadow-2xl bg-white/10 backdrop-blur-xl" hover={false}>
                        {status === 'verifying' && (
                            <div className="flex flex-col items-center gap-4">
                                <InlineLogoLoader size="lg" />
                                <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">Email Verified!</h2>
                                    <p className="text-slate-300">Your account has been successfully activated.</p>
                                </div>
                                <Button
                                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                    onClick={() => router.push('/login')}
                                >
                                    Login to Dashboard
                                </Button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">Verification Failed</h2>
                                    <p className="text-slate-300">The link may be invalid or expired.</p>
                                </div>
                                <Button
                                    className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10"
                                    onClick={() => router.push('/login')}
                                >
                                    Return to Login
                                </Button>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <InlineLogoLoader size="lg" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
