
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'testadmin@villagebank.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        // Update existing user
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'REGIONAL_ADMIN',
                region: 'CENTRAL'
            }
        });
        console.log('Updated existing test user:', updatedUser);
    } else {
        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'Admin',
                role: 'REGIONAL_ADMIN',
                region: 'CENTRAL'
            }
        });
        console.log('Created new test user:', newUser);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
