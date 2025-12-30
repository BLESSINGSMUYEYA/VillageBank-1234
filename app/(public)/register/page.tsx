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
import { Loader2, Zap, ArrowRight, ShieldCheck, Mail, Lock, User, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions';
import { GlassCard } from '@/components/ui/GlassCard';

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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
            setError(err.message || 'Failed to register');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center items-center p-6 py-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="w-full max-w-lg relative z-10"
            >
                {/* Branding */}
                <motion.div variants={fadeIn} className="flex flex-col items-center mb-8 text-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                        <Zap className="w-7 h-7 text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        JOIN THE <span className="text-blue-600">ECOSYSTEM</span>
                    </h1>
                </motion.div>

                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 border-none overflow-hidden shadow-2xl" hover={false}>
                        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
                        <CardHeader className="p-8 sm:p-10 text-center">
                            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Identity</CardTitle>
                            <CardDescription className="text-sm font-bold opacity-70">
                                Register your profile within the global village bank network.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 sm:px-10 pb-10">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Legal Name</Label>
                                        <div className="relative">
                                            <Input id="firstName" {...register('firstName')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" placeholder="Ex: John" />
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Surname</Label>
                                        <div className="relative">
                                            <Input id="lastName" {...register('lastName')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" placeholder="Ex: Doe" />
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Primary Email</Label>
                                    <div className="relative">
                                        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" />
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Phone Protocol</Label>
                                    <div className="relative">
                                        <Input id="phone" placeholder="+265..." {...register('phone')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" />
                                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.phone.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Security Code</Label>
                                        <div className="relative">
                                            <Input id="password" type="password" {...register('password')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Verification</Label>
                                        <div className="relative">
                                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="rounded-xl bg-white/40 dark:bg-slate-900/40 border-none h-12 font-bold shadow-inner focus-visible:ring-blue-500/30 pl-10" />
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

                                <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all group" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                                        <>
                                            Deploy Profile
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center p-8 bg-blue-600/5 dark:bg-white/5 border-t border-white/10 dark:border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Existing node found? <Link href="/login" className="text-blue-600 dark:text-banana hover:underline">Return to Access</Link>
                            </p>
                        </CardFooter>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-2 opacity-40">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Network Integrity Protocol Enabled</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
