
import { prisma } from '@/lib/prisma'
import { getUpcomingReminders } from '@/lib/reminders'

async function main() {
    console.log('--- Debugging Reminders ---')
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    console.log('Server Time:', now.toString())
    console.log('Start of Today (Server):', startOfToday.toString())
    console.log('Local ISO String:', now.toISOString())

    // List all users and their reminder counts
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { reminders: true }
            }
        }
    })

    console.log(`Found ${users.length} users.`)
    users.forEach(u => {
        console.log(`User: ${u.email} (${u.id}) - Reminders: ${u._count.reminders}`)
    })

    // Pick the first user with reminders, otherwise just the first user
    const user = await prisma.user.findFirst({
        where: {
            reminders: {
                some: {}
            }
        },
        include: {
            reminders: true
        }
    }) || await prisma.user.findFirst({ include: { reminders: true } })


    if (!user) {
        console.log('No users found at all.')
        return
    }

    console.log(`\nChecking user: ${user.email} (${user.id})`)

    console.log('\n--- All Reminders for User ---')
    if (user.reminders.length === 0) {
        console.log('No reminders for this user.')
    }
    user.reminders.forEach(r => {
        console.log(`ID: ${r.id}`)
        console.log(`Title: ${r.title}`)
        console.log(`Datetime: ${r.datetime}`)
        console.log(`IsDismissed: ${r.isDismissed}`)
        console.log(`LastDismissedAt: ${r.lastDismissedAt}`)
        console.log(`IsRecurring: ${r.isRecurring}`)

        // Check recurrence logic manually
        if (r.isDismissed && r.isRecurring) {
            if (!r.lastDismissedAt) {
                console.log('  -> Should show (Dismissed recurring, no lastDismissedAt)')
            } else if (r.lastDismissedAt < startOfToday) {
                console.log(`  -> Should show (Dismissed recurring, lastDismissedAt < startOfToday)`)
                console.log(`     ${r.lastDismissedAt.getTime()} < ${startOfToday.getTime()}`)
            } else {
                console.log('  -> Should NOT show (Dismissed recurring, dismissed today)')
            }
        } else if (!r.isDismissed) {
            console.log('  -> Should show (Not dismissed)')
        } else {
            console.log('  -> Should NOT show (Dismissed, not recurring)')
        }
        console.log('---------------------------')
    })

    console.log('\n--- Running getUpcomingReminders() ---')
    const upcoming = await getUpcomingReminders(user.id)
    if (upcoming.success && upcoming.data) {
        console.log(`Found ${upcoming.data.length} upcoming reminders:`)
        upcoming.data.forEach(r => console.log(` - ${r.title} (${r.datetime})`))
    } else {
        console.error('Error fetching upcoming reminders:', upcoming.error)
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
