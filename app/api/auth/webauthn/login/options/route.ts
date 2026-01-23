import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { type AuthenticatorTransportFuture } from '@simplewebauthn/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        let allowCredentials: {
            id: string;
            transports?: AuthenticatorTransportFuture[];
        }[] = [];

        if (email) {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { passkeys: true },
            });

            if (user) {
                allowCredentials = user.passkeys.map((passkey) => ({
                    id: passkey.credentialID,
                    transports: passkey.transports as AuthenticatorTransportFuture[],
                }));

                console.log(`[WebAuthn Login] Found ${allowCredentials.length} passkey(s) for user: ${email}`);
            } else {
                console.log(`[WebAuthn Login] No user found with email: ${email}`);
            }
        } else {
            console.log('[WebAuthn Login] No email provided, allowing any registered passkey');
        }

        // Determine RP ID dynamically from the request URL
        const url = new URL(request.url);
        const rpID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        console.log(`[WebAuthn Login Options] Generating options for email: ${email || 'None'}`);
        console.log(`[WebAuthn Login Options] RP ID: ${rpID}`);

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: 'preferred',
        });

        console.log('[WebAuthn Login Options] Generated options:', JSON.stringify(options, null, 2));

        const cookieStore = await cookies();
        cookieStore.set('auth_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5, // 5 minutes
            path: '/',
        });

        return NextResponse.json(options);
    } catch (error: any) {
        console.error('[WebAuthn Login Options] Critical failure:', error);
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
