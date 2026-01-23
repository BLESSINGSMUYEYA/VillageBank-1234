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
            }
        }

        // Determine RP ID dynamically from the request URL
        const url = new URL(request.url);
        const rpID = process.env.NEXT_PUBLIC_RP_ID || url.hostname;

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: 'preferred',
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_challenge', options.challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5, // 5 minutes
            path: '/',
        });

        return NextResponse.json(options);
    } catch (error) {
        console.error('Error generating authentication options:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
