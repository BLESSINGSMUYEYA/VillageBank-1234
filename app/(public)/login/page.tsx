'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { startAuthentication } from '@simplewebauthn/browser';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ArrowRight, ShieldCheck, Mail, Lock, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { UBankLogo } from '@/components/ui/Logo';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
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
                throw new Error(errorData.error || 'Failed to initialize biometric login');
            }

            const options = await resp.json();

            // Check if there are any credentials available
            if (options.allowCredentials && options.allowCredentials.length === 0) {
                throw new Error('NO_CREDENTIALS');
            }

            const authResp = await startAuthentication(options);

            const verifyResp = await fetch('/api/auth/webauthn/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResp),
            });

            const verification = await verifyResp.json();

            if (verification.verified) {
                router.push('/dashboard');
                router.refresh();
            } else {
                throw new Error(verification.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Passkey login error:', err);

            // Provide user-friendly error messages
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
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Banner Side (Left) */}
            <div className="hidden lg:relative lg:block bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20 z-10" />
                <img
                    src="/auth-banner.png"
                    alt="Community Savings"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 p-12 z-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-6"
                    >
                        <UBankLogo className="w-10 h-10 invert opacity-100" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-black text-white tracking-tighter max-w-lg"
                    >
                        {t('auth.banner_title') || 'Grow Together.'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-300 font-medium max-w-md"
                    >
                        {t('auth.banner_desc') || 'Join thousands of Malawians building wealth through community savings.'}
                    </motion.p>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="flex flex-col justify-center items-center p-6 relative bg-slate-50 dark:bg-slate-950">
                {/* Ambient Background (Right side only) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-teal-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-md relative z-10"
                >
                    {/* Branding (Mobile Only) */}
                    <motion.div variants={fadeIn} className="flex flex-col items-center mb-8 lg:hidden">
                        <div className="w-16 h-16 bg-slate-900 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-white/10">
                            <UBankLogo className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            uBank
                        </h1>
                    </motion.div>

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
                                                    className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-14 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-12"
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
                                                    className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-14 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-12"
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

                    {/* Secure Badge */}
                    <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-2 opacity-40">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('auth.secure_badge')}</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
