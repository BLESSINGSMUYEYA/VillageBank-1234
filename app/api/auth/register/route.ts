import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName, phoneNumber } = await req.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
            },
        });

        const token = await signToken({ userId: user.id, email: user.email, role: user.role });

        // Set cookie
        (await cookies()).set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
