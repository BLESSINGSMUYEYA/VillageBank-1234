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

        // Determine RP ID dynamically from the request URL
        const url = new URL(request.url);
        const rpID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        console.log('[WebAuthn Registration Options] Generating options for user:', user.email);
        console.log('[WebAuthn Registration Options] RP ID:', rpID);

        const options = await generateRegistrationOptions({
            rpName: 'Village Banking',
            rpID,
            userID: new TextEncoder().encode(user.id),
            userName: user.email,
            attestationType: 'none',
            excludeCredentials: user.passkeys.map((passkey) => ({
                id: passkey.credentialID,
                transports: passkey.transports as any,
            })),
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
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
    } catch (error: any) {
        console.error('[WebAuthn Registration Options] Critical failure:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message,
                code: error.code
            },
            { status: 500 }
        );
    }
}
