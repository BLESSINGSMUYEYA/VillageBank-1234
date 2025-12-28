
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updatedUser = await prisma.user.update({
        where: { email: 'blessingsmuyeya@gmail.com' },
        data: { role: 'REGIONAL_ADMIN' }
    });
    console.log('User updated:', updatedUser);
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
