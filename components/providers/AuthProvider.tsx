'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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

        if (user.role === 'REGIONAL_ADMIN') {
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
            // Throw a special error or return a specific value to signal the component
            // to show the verification message. 
            // Since this function returns Promise<void>, throwing is a clean way to stop execution
            // and let the caller handle the specific case.
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
