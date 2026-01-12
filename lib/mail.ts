import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendPasswordResetEmail(email: string, token: string) {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    } else if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (!baseUrl) {
        baseUrl = 'http://localhost:3000';
    }

    const resetLink = `${baseUrl}/reset-password?token=${token}`;


    if (!resend) {
        console.warn("RESEND_API_KEY is missing. Email sending skipped.");
        return { success: false, error: "Missing RESEND_API_KEY" };
    }

    try {
        await resend.emails.send({
            from: 'Village Bank <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your password - Village Bank',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin-bottom: 16px;">VILLAGE BANK</h1>
                    <p style="font-size: 16px; color: #475569; line-height: 1.5;">You requested to reset your password for your Village Bank account.</p>
                    <div style="margin: 32px 0;">
                        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="font-size: 14px; color: #94a3b8;">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <p style="font-size: 12px; color: #94a3b8;">This link will expire in 1 hour.</p>
                </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
        baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    } else if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (!baseUrl) {
        baseUrl = 'http://localhost:3000';
    }

    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    if (!resend) {
        console.warn("RESEND_API_KEY is missing. Email sending skipped.");
        return { success: false, error: "Missing RESEND_API_KEY" };
    }

    try {
        await resend.emails.send({
            from: 'Village Bank <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email - Village Bank',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                    <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin-bottom: 16px;">VILLAGE BANK</h1>
                    <p style="font-size: 16px; color: #475569; line-height: 1.5;">Welcome to Village Bank! Please verify your email address to activate your account.</p>
                    <div style="margin: 32px 0;">
                        <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
                    </div>
                    <p style="font-size: 14px; color: #94a3b8;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { success: false, error };
    }
}
