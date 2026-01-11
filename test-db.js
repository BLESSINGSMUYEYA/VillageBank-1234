
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Attempting to connect to database...');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Successfully connected to database!');
        console.log('Query Result:', result);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
