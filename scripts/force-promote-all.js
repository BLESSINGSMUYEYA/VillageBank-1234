
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const groupId = 'cmklnqgo50001ezhc478qaut5';

    console.log(`Promoting all members of group ${groupId} to ADMIN...`);

    try {
        const result = await prisma.groupMember.updateMany({
            where: { groupId: groupId },
            data: { role: 'ADMIN' }
        });

        console.log(`Updated ${result.count} members to ADMIN.`);

    } catch (e) {
        console.error("Error updating roles:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
