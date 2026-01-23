import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body; // Credential ID

        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('auth_challenge')?.value;

        if (!expectedChallenge) {
            return NextResponse.json(
                { error: 'Authentication challenge not found' },
                { status: 400 }
            );
        }

        // Find the passkey credential
        const passkey = await prisma.passkey.findUnique({
            where: { credentialID: id },
            include: { user: true },
        });

        if (!passkey) {
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 400 }
            );
        }

        // Determine expected origin and RP ID dynamically from the request URL
        const url = new URL(request.url);
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
        const expectedRPID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            credential: {
                id: passkey.credentialID,
                publicKey: new Uint8Array(passkey.publicKey),
                counter: passkey.counter,
                transports: passkey.transports as any,
            },
        });

        const { verified, authenticationInfo } = verification;

        if (verified && authenticationInfo) {
            // Update the counter
            await prisma.passkey.update({
                where: { id: passkey.id },
                data: {
                    counter: authenticationInfo.newCounter,
                    lastUsedAt: new Date(),
                },
            });

            // Clear the challenge cookie
            cookieStore.delete('auth_challenge');

            // Create session
            const token = await signToken({
                userId: passkey.user.id,
                role: passkey.user.role, // Assuming role exists on user
                // Add other session data if needed
            });

            // Set auth cookie
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('Error verifying authentication:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
