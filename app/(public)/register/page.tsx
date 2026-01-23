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
import { Zap, ArrowRight, ShieldCheck, Mail, Lock, User, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { UBankLogo } from '@/components/ui/Logo';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setError(null);
        setLoading(true);
        try {
            const result = await registerUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phone,
            });

            // If we get here without error, check if we need to show verification message
            // Note: registerUser in AuthProvider currently throws or returns void/undefined. 
            // We need to check if AuthProvider handles the response or if we need to update AuthProvider.
            // Assuming AuthProvider might need an update or we catch a specific message.

            // Actually, let's look at AuthProvider. It throws on error. 
            // If it succeeds, it usually redirects.
            // But now we want to STOP redirect if verification is required.

            // Since I cannot easily change AuthProvider signature without potentially breaking other things,
            // I will rely on the fact that the API now returns a message.
            // I should verify AuthProvider implementation. 
            // The AuthProvider does: const { user } = await res.json(); setUser(user); ... router.push(...)

            // This suggests I need to update AuthProvider FIRST to handle the non-login response.
            // But let's finish this file edit assuming AuthProvider will be updated to return the response or handle it.

        } catch (err: any) {
            if (err.message === 'verification_required') {
                // Show success message
                setLoading(false);
                // We can use a local state to show a success view instead of the form
                setRegistrationSuccess(true);
                return;
            }
            setError(err.message || 'Failed to register');
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
                        className="w-16 h-16 bg-[#D8F3DC] rounded-2xl flex items-center justify-center border border-[#B7E4C7] mb-6"
                    >
                        <UBankLogo className="w-10 h-10" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-black text-white tracking-tighter max-w-lg"
                    >
                        {t('auth.register_banner_title') || 'Start Your Journey.'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-300 font-medium max-w-md"
                    >
                        {t('auth.register_banner_desc') || 'Create your identity and begin managing your village bank with confidence.'}
                    </motion.p>
                </div>
            </div>

            {/* Form Side (Right) */}
            <div className="flex flex-col justify-center items-center p-6 py-12 relative bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                {/* Ambient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] right-[5%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[5%] left-[5%] w-[30%] h-[30%] bg-teal-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="w-full max-w-lg relative z-10"
                >
                    {registrationSuccess ? (
                        <motion.div variants={itemFadeIn}>
                            <GlassCard className="p-8 sm:p-10 text-center border-none overflow-hidden shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl" hover={false}>
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Check your email</h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                                    We've sent a verification link to your email address. Please click the link to activate your account.
                                </p>
                                <Button
                                    className="w-full rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Return to Login
                                </Button>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <>
                            {/* Branding (Mobile Only) */}
                            <motion.div variants={fadeIn} className="flex flex-col items-center mb-8 text-center lg:hidden">
                                <div className="w-16 h-16 bg-[#D8F3DC] dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center shadow-xl mb-4 border border-emerald-100 dark:border-emerald-500/10">
                                    <UBankLogo className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {t('register.join_ecosystem')}
                                </h1>
                            </motion.div>

                            <motion.div variants={itemFadeIn}>
                                <GlassCard className="p-0 border-none overflow-hidden shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl" hover={false}>
                                    <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
                                    <CardHeader className="p-8 sm:p-10 text-center">
                                        <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('register.create_identity')}</CardTitle>
                                        <CardDescription className="text-sm font-bold opacity-70">
                                            {t('register.register_desc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-8 sm:px-10 pb-10">
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.legal_name')}</Label>
                                                    <div className="relative">
                                                        <Input id="firstName" {...register('firstName')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" placeholder="Ex: John" />
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                    </div>
                                                    {errors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.firstName.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.surname')}</Label>
                                                    <div className="relative">
                                                        <Input id="lastName" {...register('lastName')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" placeholder="Ex: Doe" />
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                    </div>
                                                    {errors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.lastName.message}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('auth.identity_email')}</Label>
                                                <div className="relative">
                                                    <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" />
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                </div>
                                                {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.phone_protocol')}</Label>
                                                <div className="relative">
                                                    <Input id="phone" placeholder="+265..." {...register('phone')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" />
                                                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                </div>
                                                {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.phone.message}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.security_code')}</Label>
                                                    <div className="relative">
                                                        <Input id="password" type="password" {...register('password')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" />
                                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                    </div>
                                                    {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.verification')}</Label>
                                                    <div className="relative">
                                                        <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 h-12 font-bold shadow-sm focus-visible:ring-emerald-500/30 pl-10" />
                                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
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

                                            <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all group" disabled={loading}>
                                                {loading ? <InlineLogoLoader size="sm" /> : (
                                                    <>
                                                        {t('register.deploy_profile')}
                                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                    <CardFooter className="flex justify-center p-8 bg-blue-600/5 dark:bg-white/5 border-t border-white/10 dark:border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {t('register.existing_node')} <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">{t('register.return_to_access')}</Link>
                                        </p>
                                    </CardFooter>
                                </GlassCard>
                            </motion.div>
                        </>
                    )}

                    <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-2 opacity-40">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('auth.secure_badge')}</span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
