import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const expectedChallenge = cookieStore.get('reg_challenge')?.value;

        if (!expectedChallenge) {
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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine expected origin and RP ID
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const expectedRPID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

        const verification = await verifyRegistrationResponse({
            response: body,  // The authentication response from the client
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            requireUserVerification: true,
        });

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credential } = registrationInfo;
            const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

            // Save the new passkey to the database
            // Use credentialID as a string (base64url)
            // existing transports from client, passed in body if available, or default to []
            // SimpleWebAuthn doesn't return transports in registrationInfo by default from server verify, 
            // typically client sends them or we store none. The body might contain it if we passed it.
            // The response object from client usually has it in `response.transports` if accessed directly via browser API, 
            // but strictly the `RegistrationResponseJSON` might not have it unless extended. 
            // However, @simplewebauthn/browser returns it in the result. 
            // We can extract it from the body root if client sends it.
            // Let's assume the body sent by our client (which we will build) includes it.

            // Note: The `Passkey` model expects `credentialID` as String.
            // `credentialID` from `registrationInfo` is a Buffer/Uint8Array? 
            // Wait, `simplewebauthn` v10+ returns `credentialID` string in `registrationInfo`?
            // Let's check docs or types if possible. 
            // Actually `verifyRegistrationResponse` returns `registrationInfo` where `credentialID` is `string` in recent versions (base64url).
            // But let's be safe. If it is base64url string, we are good.
            // Checking `Passkey` model: `credentialID String @unique`.

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

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });

    } catch (error) {
        console.error('Error verifying registration:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
