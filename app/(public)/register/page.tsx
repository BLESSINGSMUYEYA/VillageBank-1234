'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PremiumInput } from '@/components/ui/premium-input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ShieldCheck, Mail, Lock, User, Smartphone, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemFadeIn, fadeIn } from '@/lib/motions';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                    <div className="p-8 sm:p-10 text-center">
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
                    </div>
                </motion.div>
            ) : (
                <motion.div variants={itemFadeIn} className="w-full">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('register.create_identity')}</h1>
                        <p className="text-sm font-bold opacity-70 text-slate-600 dark:text-slate-300">
                            {t('register.register_desc')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground ml-1">{t('register.legal_name')}</Label>
                                <PremiumInput
                                    id="firstName"
                                    {...register('firstName')}
                                    icon={<User className="w-4 h-4" />}
                                    error={!!errors.firstName}
                                    errorMessage={errors.firstName?.message}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground ml-1">{t('register.surname')}</Label>
                                <PremiumInput
                                    id="lastName"
                                    {...register('lastName')}
                                    icon={<User className="w-4 h-4" />}
                                    error={!!errors.lastName}
                                    errorMessage={errors.lastName?.message}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">{t('auth.identity_email')}</Label>
                            <PremiumInput
                                id="email"
                                type="email"
                                {...register('email')}
                                icon={<Mail className="w-4 h-4" />}
                                error={!!errors.email}
                                errorMessage={errors.email?.message}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground ml-1">{t('register.phone_protocol')}</Label>
                            <PremiumInput
                                id="phone"
                                {...register('phone')}
                                prefix="+265"
                                error={!!errors.phone}
                                errorMessage={errors.phone?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground ml-1">{t('register.security_code')}</Label>
                                <PremiumInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    icon={<Lock className="w-4 h-4" />}
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
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground ml-1">{t('register.verification')}</Label>
                                <PremiumInput
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    icon={<Lock className="w-4 h-4" />}
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="hover:text-emerald-600 transition-colors focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                    error={!!errors.confirmPassword}
                                    errorMessage={errors.confirmPassword?.message}
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
                                    {t('register.deploy_profile')}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs font-medium text-slate-500">
                            {t('register.existing_node')} <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">{t('register.return_to_access')}</Link>
                        </p>
                    </div>
                </motion.div>
            )}
        </AuthLayout>
    );
}
