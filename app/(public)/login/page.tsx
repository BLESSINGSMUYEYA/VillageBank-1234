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
import { PremiumInput } from '@/components/ui/premium-input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ShieldCheck, Mail, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemFadeIn } from '@/lib/motions';
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
    const [showPassword, setShowPassword] = useState(false);

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
            <motion.div variants={itemFadeIn} className="w-full">
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('auth.welcome_back')}</h1>
                    <p className="text-sm font-bold opacity-70 text-slate-600 dark:text-slate-300">
                        {t('auth.sync_ledger')}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">{t('auth.identity_email')}</Label>
                            <PremiumInput
                                id="email"
                                type="email"
                                {...register('email')}
                                icon={<Mail className="w-5 h-5" />}
                                error={!!errors.email}
                                errorMessage={errors.email?.message}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">{t('auth.encryption_key')}</Label>
                                <Link href="/forgot-password" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline opacity-80">{t('common.forgot_password')}</Link>
                            </div>
                            <PremiumInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                icon={<Lock className="w-5 h-5" />}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="hover:text-emerald-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                }
                                error={!!errors.password}
                                errorMessage={errors.password?.message}
                            />
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

                <div className="mt-8 relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-slate-50 dark:bg-[#020817] px-2 text-muted-foreground font-bold tracking-widest">Or</span>
                    </div>
                </div>

                <Button
                    onClick={handlePasskeyLogin}
                    disabled={loading}
                    variant="outline"
                    className="w-full mt-8 h-12 rounded-2xl border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 font-bold gap-2 group bg-transparent"
                >
                    <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    Biometric Login
                </Button>

                <div className="mt-10 text-center">
                    <p className="text-xs font-medium text-slate-500">
                        {t('auth.new_to_ecosystem')} <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline">{t('auth.create_id')}</Link>
                    </p>
                </div>
            </motion.div>
        </AuthLayout>
    );
}
