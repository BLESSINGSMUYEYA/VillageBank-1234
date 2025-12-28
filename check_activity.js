const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking Activity table...');
        const count = await prisma.activity.count();
        console.log('Activity count:', count);

        if (count > 0) {
            const first = await prisma.activity.findFirst({
                include: { user: true }
            });
            console.log('First activity:', first);
        } else {
            console.log('No activities found.');
        }
    } catch (error) {
        console.error('Error querying Activity table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
