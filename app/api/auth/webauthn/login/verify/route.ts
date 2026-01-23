import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body; // Credential ID

        console.log('[WebAuthn Verify] Starting authentication verification for credential:', id);

        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('auth_challenge')?.value;

        if (!expectedChallenge) {
            console.error('[WebAuthn Verify] No challenge found in cookies');
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
            console.error('[WebAuthn Verify] Credential not found:', id);
            return NextResponse.json(
                { error: 'Credential not found' },
                { status: 400 }
            );
        }

        console.log('[WebAuthn Verify] Found passkey for user:', passkey.user.email);

        // Determine expected origin and RP ID dynamically from the request URL
        const url = new URL(request.url);
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
        const expectedRPID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        console.log('[WebAuthn Verify] Expected origin:', expectedOrigin);
        console.log('[WebAuthn Verify] Expected RP ID:', expectedRPID);

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

        console.log('[WebAuthn Verify] Verification result:', verified);

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
                role: passkey.user.role,
            });

            // Set auth cookie
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            console.log('[WebAuthn Verify] Authentication successful for user:', passkey.user.email);

            return NextResponse.json({ verified: true });
        }

        console.error('[WebAuthn Verify] Verification failed - verified:', verified);
        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('[WebAuthn Verify] Error during verification:', error);
        console.error('[WebAuthn Verify] Error stack:', (error as Error).stack);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
