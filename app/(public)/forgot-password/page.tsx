'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ArrowRight, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { UBankLogo } from '@/components/ui/Logo';

const forgotSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
    });

    const onSubmit = async (data: ForgotForm) => {
        setStatus('loading');
        setError(null);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            setSubmittedEmail(data.email);
            setStatus('success');
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                        {t('forgot.title')}
                    </h1>
                </motion.div>

                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 border-none overflow-hidden shadow-2xl" hover={false}>
                        <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />

                        {status === 'success' ? (
                            <CardContent className="p-10 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {t('forgot.success_title')}
                                    </CardTitle>
                                    <CardDescription className="text-sm font-bold opacity-70">
                                        {t('forgot.success_desc').replace('{email}', submittedEmail)}
                                    </CardDescription>
                                </div>
                                <Link href="/login" className="block">
                                    <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                                        {t('forgot.back_to_login')}
                                    </Button>
                                </Link>
                            </CardContent>
                        ) : (
                            <>
                                <CardHeader className="p-8 sm:p-10 text-center space-y-2">
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {t('forgot.title')}
                                    </CardTitle>
                                    <CardDescription className="text-sm font-bold opacity-70">
                                        {t('forgot.subtitle')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 sm:px-10 pb-10">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                                {t('forgot.email_label')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="name@domain.com"
                                                    {...register('email')}
                                                    className="rounded-2xl bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-emerald-500/30 pl-12"
                                                />
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                                            </div>
                                            {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                        </div>

                                        {error && (
                                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                                                <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                                                <p className="text-xs font-bold text-red-500 leading-tight">{error}</p>
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all group" disabled={status === 'loading'}>
                                            {status === 'loading' ? <InlineLogoLoader size="sm" /> : (
                                                <>
                                                    {t('forgot.send_link')}
                                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center pt-2">
                                            <Link href="/login" className="text-[10px] font-black text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                                                {t('forgot.back_to_login')}
                                            </Link>
                                        </div>
                                    </form>
                                </CardContent>
                            </>
                        )}
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    );
}
