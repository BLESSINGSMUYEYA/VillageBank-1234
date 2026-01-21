import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding banners...')

    // Find a super admin to assign as creator
    const admin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (!admin) {
        console.error('No SUPER_ADMIN found to create banner. Please seed admins first.')
        return
    }

    const banner = await prisma.announcement.create({
        data: {
            title: 'Invite your friends',
            message: 'Grow your community! Invite friends to join your village bank groups.',
            type: 'BANNER',
            actionText: 'Invite Now',
            link: '/groups',
            imageUrl: '/assets/banners/invite-friends.png',
            createdById: admin.id,
            isActive: true
        }
    })

    console.log(`Upserted banner: ${banner.title}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
