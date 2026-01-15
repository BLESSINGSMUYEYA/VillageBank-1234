import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding admin users...')
    const password = await bcrypt.hash('Admin@123', 10)

    // Use string literals for enums to avoid import issues if enums aren't exported as expected in the generated client
    // But usually they are. I'll rely on string matching to the schema I saw.
    // Schema: UserRole { MEMBER, REGIONAL_ADMIN, SUPER_ADMIN }, Region { NORTHERN, SOUTHERN, CENTRAL }

    const admins = [
        {
            email: 'super@ubank.com',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            region: null,
            verificationToken: null,
            emailVerified: new Date()
        },
        {
            email: 'north@ubank.com',
            firstName: 'Northern',
            lastName: 'Admin',
            role: 'REGIONAL_ADMIN',
            region: 'NORTHERN',
            verificationToken: null,
            emailVerified: new Date()
        },
        {
            email: 'central@ubank.com',
            firstName: 'Central',
            lastName: 'Admin',
            role: 'REGIONAL_ADMIN',
            region: 'CENTRAL',
            verificationToken: null,
            emailVerified: new Date()
        },
        {
            email: 'south@ubank.com',
            firstName: 'Southern',
            lastName: 'Admin',
            role: 'REGIONAL_ADMIN',
            region: 'SOUTHERN',
            verificationToken: null,
            emailVerified: new Date()
        },
    ]

    for (const admin of admins) {
        // Type casting strings to any to bypass strict enum typing here if needed, 
        // but better to let Prisma validate.
        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                password,
                role: admin.role as any,
                region: admin.region as any,
                emailVerified: admin.emailVerified,
                verificationToken: null
            },
            create: {
                email: admin.email,
                password,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role as any,
                region: admin.region as any,
                emailVerified: admin.emailVerified
            },
        })
        console.log(`Upserted admin: ${user.email}`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
