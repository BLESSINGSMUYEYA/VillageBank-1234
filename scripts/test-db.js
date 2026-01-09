
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('--- Database Connection Test ---');
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('❌ DATABASE_URL is undefined');
        process.exit(1);
    }

    console.log(`URL detected: ${url.replace(/:[^:]*@/, ':****@')}`); // log masked URL

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        },
        log: ['query', 'info', 'warn', 'error']
    });

    try {
        console.log('⏳ Attempting to connect...');
        await prisma.$connect();
        console.log('✅ Connected successfully!');

        console.log('⏳ Running simple query...');
        const count = await prisma.user.count();
        console.log(`✅ Query successful! User count: ${count}`);
    } catch (e) {
        console.error('❌ Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
