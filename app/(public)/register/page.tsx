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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] pt-10 pb-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Join the Village Banking community</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" {...register('firstName')} />
                                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" {...register('lastName')} />
                                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" placeholder="+265..." {...register('phone')} />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Sign in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
