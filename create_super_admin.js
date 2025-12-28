const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'superadmin@villagebanking.com' },
        update: {
            role: 'SUPER_ADMIN',
            password,
            firstName: 'Super',
            lastName: 'Admin'
        },
        create: {
            email: 'superadmin@villagebanking.com',
            firstName: 'Super',
            lastName: 'Admin',
            password,
            role: 'SUPER_ADMIN',
            phoneNumber: '0999999999',
            region: 'CENTRAL' // Super admin default
        }
    });

    console.log('Super Admin created/updated:');
    console.log('Email: superadmin@villagebanking.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
