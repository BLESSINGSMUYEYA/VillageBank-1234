import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { generateUniqueUbankId } from '@/lib/id-generator';
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
        const ubankId = await generateUniqueUbankId(`${firstName}.${lastName}`, 'USER');

        // Generate verification token
        const verificationToken = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                ubankId,
                verificationToken,
                // emailVerified is null by default now
            },
        });

        // Send verification email
        // We import dynamically to avoid circular deps if any, or just standard import
        const { sendVerificationEmail } = await import('@/lib/mail');
        await sendVerificationEmail(email, verificationToken);

        // DO NOT log the user in automatically

        return NextResponse.json({
            message: 'verification_required',
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
