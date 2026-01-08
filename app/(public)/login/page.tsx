'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
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

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center items-center p-6 relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="w-full max-w-md relative z-10"
            >
                {/* Branding */}
                <motion.div variants={fadeIn} className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-4 hover:scale-110 transition-transform">
                        <Zap className="w-8 h-8 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        VILLAGE<span className="text-blue-600">BANK</span>
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50">{t('auth.authorized_access')}</p>
                </motion.div>

                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 border-none overflow-hidden shadow-2xl" hover={false}>
                        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
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
                                                className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-12"
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                                        </div>
                                        {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('auth.encryption_key')}</Label>
                                            <Link href="/forgot-password" className="text-[10px] font-black text-blue-600 dark:text-banana uppercase tracking-widest hover:underline opacity-80">{t('common.forgot_password')}</Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                {...register('password')}
                                                className="rounded-[1.2rem] bg-white/40 dark:bg-slate-900/40 border-none h-14 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-12"
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
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all group" disabled={loading}>
                                    {loading ? <InlineLogoLoader size="sm" /> : (
                                        <>
                                            {t('common.sign_in')}
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center p-8 bg-blue-600/5 dark:bg-white/5 border-t border-white/10 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {t('auth.new_to_ecosystem')} <Link href="/register" className="text-blue-600 dark:text-banana hover:underline">{t('auth.create_id')}</Link>
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
    );
}
