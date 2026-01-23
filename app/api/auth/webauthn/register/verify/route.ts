import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';

export async function POST(request: Request) {
    try {
        console.log('[WebAuthn Register] Starting registration verification');

        const session = await getSession();

        if (!session || !session.userId) {
            console.error('[WebAuthn Register] Unauthorized - no session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[WebAuthn Register] User session found:', session.userId);

        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('reg_challenge')?.value;

        if (!expectedChallenge) {
            console.error('[WebAuthn Register] No challenge found in cookies');
            return NextResponse.json(
                { error: 'Registration challenge not found' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { response } = body;

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            console.error('[WebAuthn Register] User not found:', session.userId);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('[WebAuthn Register] Verifying registration for user:', user.email);

        // Determine expected origin and RP ID dynamically from the request URL
        const url = new URL(request.url);
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
        const expectedRPID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        console.log('[WebAuthn Register] Expected origin:', expectedOrigin);
        console.log('[WebAuthn Register] Expected RP ID:', expectedRPID);

        const verification = await verifyRegistrationResponse({
            response: body,  // The authentication response from the client
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            requireUserVerification: true,
        });

        const { verified, registrationInfo } = verification;

        console.log('[WebAuthn Register] Verification result:', verified);

        if (verified && registrationInfo) {
            const { credential } = registrationInfo;
            const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

            await prisma.passkey.create({
                data: {
                    credentialID: credentialID,
                    userId: user.id,
                    publicKey: Buffer.from(credentialPublicKey), // Convert Uint8Array to Buffer
                    counter: counter,
                    transports: body.transports || [], // Expecting client to send this
                },
            });

            // Clear the challenge cookie
            cookieStore.delete('reg_challenge');

            console.log('[WebAuthn Register] Registration successful for user:', user.email);

            return NextResponse.json({ verified: true });
        }

        console.error('[WebAuthn Register] Verification failed - verified:', verified);
        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('[WebAuthn Register] Error during registration:', error);
        console.error('[WebAuthn Register] Error stack:', (error as Error).stack);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
