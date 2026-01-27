'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Mail, Lock, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemFadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { AuthLayout } from '@/components/auth/AuthLayout';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setError(null);
        setLoading(true);
        try {
            await login(data);
        } catch (err: any) {
            setError(err.message || 'Failed to login');
            setLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const email = getValues('email');
            const url = email
                ? `/api/auth/webauthn/login/options?email=${encodeURIComponent(email)}`
                : '/api/auth/webauthn/login/options';

            const resp = await fetch(url, { headers: { 'Cache-Control': 'no-store' } });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                console.error('WebAuthn Options Error:', errorData); // Log full error object
                throw new Error(errorData.message || errorData.error || 'Failed to initialize biometric login');
            }

            const options = await resp.json();

            if (options.allowCredentials && options.allowCredentials.length === 0 && email) {
                // If email provided but no credentials found for it, fail early
                throw new Error('NO_CREDENTIALS');
            }
            // If email is empty, allowCredentials will be empty array (from backend logic usually), 
            // but we want to proceed to allow browser to discover resident keys.

            const authResp = await startAuthentication(options);

            const verifyResp = await fetch('/api/auth/webauthn/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResp),
            });

            console.log('[Debug] Verify Response Status:', verifyResp.status);
            const verifyText = await verifyResp.text();
            console.log('[Debug] Verify Response Text:', verifyText);

            let verification;
            try {
                verification = JSON.parse(verifyText);
            } catch (e) {
                console.error('Failed to parse verification response:', e);
                verification = { error: 'Invalid server response' };
            }

            if (verification.verified) {
                const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');
                if (redirectUrl) {
                    router.push(decodeURIComponent(redirectUrl));
                } else {
                    router.push('/dashboard');
                }
                router.refresh();
            } else {
                console.error('WebAuthn Verify Error:', verification);
                throw new Error(verification.message || verification.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Passkey login error:', err);
            if (err.message === 'NO_CREDENTIALS') {
                setError('No biometric credentials found. Please register a passkey first or use email/password login.');
            } else if (err.name === 'NotAllowedError') {
                setError('Biometric authentication was cancelled or timed out. Please try again.');
            } else if (err.name === 'InvalidStateError') {
                setError('This authenticator is already registered. Please try a different one.');
            } else if (err.name === 'NotSupportedError') {
                setError('Biometric authentication is not supported on this device.');
            } else if (err.name === 'SecurityError') {
                setError('Security error. Please ensure you\'re using HTTPS or localhost.');
            } else if (err.name === 'AbortError') {
                setError('Authentication request was aborted. Please try again.');
            } else {
                setError(err.message || 'Biometric login failed. Please try email/password login.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 border-none overflow-hidden shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl" hover={false}>
                    <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
                    <CardHeader className="p-8 sm:p-10 text-center space-y-2">
                        <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('auth.welcome_back')}</CardTitle>
                        <CardDescription className="text-sm font-bold opacity-70">
                            {t('auth.sync_ledger')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 sm:px-10 pb-8 sm:pb-10">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('auth.identity_email')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@domain.com"
                                            {...register('email')}
                                            className="pl-12 font-bold"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('auth.encryption_key')}</Label>
                                        <Link href="/forgot-password" className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline opacity-80">{t('common.forgot_password')}</Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register('password')}
                                            className="pl-12 font-bold"
                                        />
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                                    </div>
                                    {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password.message}</p>}
                                </div>
                            </div>
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-500 leading-tight">{error}</p>
                                </div>
                            )}
                            <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all group" disabled={loading}>
                                {loading ? <InlineLogoLoader size="sm" /> : (
                                    <>
                                        {t('common.sign_in')}
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            onClick={handlePasskeyLogin}
                            disabled={loading}
                            variant="outline"
                            className="w-full mt-4 h-12 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold gap-2 group"
                        >
                            <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                            Biometric Login
                        </Button>
                    </CardContent>
                    <CardFooter className="flex justify-center p-8 bg-blue-600/5 dark:bg-white/5 border-t border-white/10 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {t('auth.new_to_ecosystem')} <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline">{t('auth.create_id')}</Link>
                        </p>
                    </CardFooter>
                </GlassCard>
            </motion.div>
        </AuthLayout>
    );
}
