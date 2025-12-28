
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log(`Resetting all user passwords to: ${defaultPassword}`);

    // Update all users who might have migrated from Clerk (or all users in general)
    const result = await prisma.user.updateMany({
        data: {
            password: hashedPassword
        }
    });

    console.log(`Successfully updated passwords for ${result.count} users.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
