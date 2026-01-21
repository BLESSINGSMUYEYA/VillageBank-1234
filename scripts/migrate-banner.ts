const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Migrating banner...')

    // Get the super admin (you can adjust this if you know the specific ID)
    const admin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (!admin) {
        console.error('No admin found to assign the banner to.')
        return
    }

    // Create the "uBank University" banner
    await prisma.announcement.create({
        data: {
            title: 'New: uBank University',
            message: 'Master your community finances with our step-by-step guides for Treasurers and Members.',
            link: '/help',
            type: 'BANNER',
            actionText: 'Start Learning',
            // Since it's a migration, let's assume no image for now or use a placeholder
            // imageUrl: '/banners/education.jpg', 
            createdById: admin.id,
            isActive: true
        }
    })

    console.log('Banner migrated successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
