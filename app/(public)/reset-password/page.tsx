'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ArrowRight, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { UBankLogo } from '@/components/ui/Logo';

const resetSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
    });

    useEffect(() => {
        if (!token) {
            setError(t('reset.error_invalid_token'));
            setStatus('error');
        }
    }, [token, t]);

    const onSubmit = async (data: ResetForm) => {
        if (!token) return;

        setStatus('loading');
        setError(null);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: data.password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            setStatus('success');
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <CardContent className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {t('reset.success_title')}
                    </CardTitle>
                    <CardDescription className="text-sm font-bold opacity-70">
                        {t('reset.success_desc')}
                    </CardDescription>
                </div>
                <Link href="/login" className="block">
                    <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20">
                        {t('common.sign_in')}
                    </Button>
                </Link>
            </CardContent>
        );
    }

    return (
        <>
            <CardHeader className="p-8 sm:p-10 text-center space-y-2">
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('reset.title')}
                </CardTitle>
                <CardDescription className="text-sm font-bold opacity-70">
                    {t('reset.subtitle')}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 sm:px-10 pb-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                {t('reset.new_password')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className="rounded-2xl bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-emerald-500/30 pl-12"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                            </div>
                            {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                {t('reset.confirm_password')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register('confirmPassword')}
                                    className="rounded-2xl bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-emerald-500/30 pl-12"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-xs font-bold text-red-500 leading-tight">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
                        disabled={status === 'loading' || !token}
                    >
                        {status === 'loading' ? <InlineLogoLoader size="sm" /> : (
                            <>
                                {t('reset.update_password')}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center items-center p-6 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="w-full max-w-md relative z-10"
            >
                <motion.div variants={fadeIn} className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-[#D8F3DC] dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-emerald-100 dark:border-emerald-500/10">
                        <UBankLogo className="w-10 h-10" />
                    </div>
                </motion.div>

                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 border-none overflow-hidden shadow-2xl" hover={false}>
                        <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
                        <Suspense fallback={
                            <div className="p-20 flex justify-center">
                                <InlineLogoLoader size="md" />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    );
}
