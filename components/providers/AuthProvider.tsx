'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    region?: string | null;
    phoneNumber?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

import { Suspense } from 'react';

// Inner component that uses searchParams
function AuthContent({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load user', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [pathname]);

    const login = async (data: any) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Login failed');
        }

        const { user } = await res.json();
        setUser(user);

        // Check for redirect URL
        const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');
        if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl));
        } else if (user.role === 'REGIONAL_ADMIN') {
            router.push('/admin/regional');
        } else if (user.role === 'SUPER_ADMIN') {
            router.push('/admin/system');
        } else {
            router.push('/dashboard');
        }
        router.refresh();
    };

    const register = async (data: any) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const responseData = await res.json();

        if (!res.ok) {
            throw new Error(responseData.error || 'Registration failed');
        }

        if (responseData.message === 'verification_required') {
            throw new Error('verification_required');
        }

        const { user } = responseData;
        setUser(user);

        if (user.role === 'REGIONAL_ADMIN') {
            router.push('/admin/regional');
        } else if (user.role === 'SUPER_ADMIN') {
            router.push('/admin/system');
        } else {
            router.push('/dashboard');
        }
        router.refresh();
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/login');
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <AuthContent>{children}</AuthContent>
        </Suspense>
    );
}
