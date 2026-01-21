
import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function sendTestNotification() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
        console.error('Missing VAPID keys in environment variables');
        process.exit(1);
    }

    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );

    try {
        // Fetch all subscriptions (or just yours if you want to be specific)
        const subscriptions = await prisma.pushSubscription.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        email: true
                    }
                }
            }
        });

        if (subscriptions.length === 0) {
            console.log('No subscriptions found. Please enable notifications in the app first.');
            return;
        }

        console.log(`Found ${subscriptions.length} subscriptions. Sending notifications...`);

        const payload = JSON.stringify({
            title: 'Test Notification from Ubank',
            message: `Hello! This is a test message sent at ${new Date().toLocaleTimeString()}`,
            url: '/dashboard'
        });

        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }, payload);
                console.log(`✅ Sent to ${sub.user.firstName || sub.user.email}`);
            } catch (error) {
                console.error(`❌ Failed to send to ${sub.user.firstName || sub.user.email}:`, error);

                // Optional: Delete invalid subscription
                if ((error as any).statusCode === 410) {
                    await prisma.pushSubscription.delete({
                        where: { id: sub.id }
                    });
                    console.log('Deleted invalid subscription');
                }
            }
        }

    } catch (error) {
        console.error('Error fetching subscriptions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

sendTestNotification();
