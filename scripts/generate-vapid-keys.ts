
import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Paste the following into your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@ubank.com`);
