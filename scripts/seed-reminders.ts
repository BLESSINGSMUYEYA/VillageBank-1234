
import { prisma } from '@/lib/prisma'
import { ReminderType } from '@prisma/client'

async function main() {
    console.log('--- Seeding Reminders ---')

    // Find a user to seed reminders for (e.g., the first user found)
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No users found in the database. Please create a user first.')
        return
    }

    console.log(`Seeding reminders for user: ${user.email} (${user.id})`)

    // 1. Create a daily recurring reminder needed for today
    try {
        await prisma.reminder.create({
            data: {
                title: 'Check Daily Savings',
                description: 'Review your group savings progress for the day.',
                datetime: new Date(new Date().setHours(9, 0, 0, 0)), // Today at 9:00 AM
                type: 'GENERAL',
                userId: user.id,
                isRecurring: true,
                link: '/dashboard'
            }
        })
        console.log('✅ Created daily recurring reminder: Check Daily Savings')
    } catch (error) {
        console.error('❌ Failed to create daily reminder:', error)
    }

    // 2. Create a one-time reminder for slightly in the future
    try {
        await prisma.reminder.create({
            data: {
                title: 'Village Bank Meeting',
                description: 'Weekly sync with the group.',
                datetime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                type: 'MEETING',
                userId: user.id,
                isRecurring: false,
                link: '/groups'
            }
        })
        console.log('✅ Created one-time reminder: Village Bank Meeting')
    } catch (error) {
        console.error('❌ Failed to create one-time reminder:', error)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
