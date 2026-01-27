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
import { ArrowRight, ShieldCheck, Mail, Lock, User, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { InlineLogoLoader } from '@/components/ui/LogoLoader';
import { AuthLayout } from '@/components/auth/AuthLayout';

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
            await registerUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phone,
            });
        } catch (err: any) {
            if (err.message === 'verification_required') {
                setLoading(false);
                setRegistrationSuccess(true);
                return;
            }
            setError(err.message || 'Failed to register');
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            bannerTitle={t('auth.register_banner_title') || 'Start Your Journey.'}
            bannerDescription={t('auth.register_banner_desc') || 'Create your identity and begin managing your village bank with confidence.'}
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
                                            <Input id="firstName" {...register('firstName')} className="pl-10 font-bold" placeholder="Ex: John" />
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.surname')}</Label>
                                        <div className="relative">
                                            <Input id="lastName" {...register('lastName')} className="pl-10 font-bold" placeholder="Ex: Doe" />
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('auth.identity_email')}</Label>
                                    <div className="relative">
                                        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className="pl-10 font-bold" />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.phone_protocol')}</Label>
                                    <div className="relative">
                                        <Input id="phone" placeholder="+265..." {...register('phone')} className="pl-10 font-bold" />
                                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.phone.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.security_code')}</Label>
                                        <div className="relative">
                                            <Input id="password" type="password" {...register('password')} className="pl-10 font-bold" />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{t('register.verification')}</Label>
                                        <div className="relative">
                                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="pl-10 font-bold" />
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
            )}
        </AuthLayout>
    );
}
