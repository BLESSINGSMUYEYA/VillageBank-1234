const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['info', 'warn', 'error'],
});

async function main() {
    console.log('Testing database connection...');
    console.log('URL provided:', process.env.DATABASE_URL ? 'Yes (hidden)' : 'No');

    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        const userCount = await prisma.user.count();
        console.log(`Connection verified. User count: ${userCount}`);

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
