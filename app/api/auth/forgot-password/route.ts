import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Even if user doesn't exist, we return success to prevent email enumeration
        // but in dev, we can be more explicit or just log to console.
        if (!user) {
            console.log(`[Forgot Password] User not found for email: ${email}`);
            return NextResponse.json({ success: true });
        }

        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Send real email via Resend
        await sendPasswordResetEmail(email, token);

        console.log('--------------------------------------------');
        console.log('📧 [PASSWORD RESET EMAIL SENT CONTENT]');
        console.log(`To: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('--------------------------------------------');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
