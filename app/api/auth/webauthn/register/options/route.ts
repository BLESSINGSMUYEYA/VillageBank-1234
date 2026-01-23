import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Use next/headers for cookies in App Router
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                passkeys: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine RP ID based on environment or request
        // In production, this should be your domain name (e.g., 'example.com')
        // In development, it can be 'localhost'
        const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

        // Ensure we have a valid environment for WebAuthn
        // You might need to configure this in your .env

        const options = await generateRegistrationOptions({
            rpName: 'Village Banking',
            rpID,
            userID: new TextEncoder().encode(user.id), // Using the user's ID directly as the handle
            userName: user.email,
            attestationType: 'none',
            // Prevent users from registering the same authenticator multiple times
            excludeCredentials: user.passkeys.map((passkey) => ({
                id: passkey.credentialID,
                transports: passkey.transports as any,
            })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform', // Enforce platform authenticators (TouchID, FaceID, Windows Hello)
            },
        });

        // Save the challenge in a httpOnly cookie for verification later
        const cookieStore = await cookies();
        cookieStore.set('reg_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5, // 5 minutes
            path: '/',
        });

        return NextResponse.json(options);
    } catch (error) {
        console.error('Error generating registration options:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
