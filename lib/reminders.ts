'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { Reminder, ReminderType, Prisma } from '@prisma/client'

export const getUpcomingReminders = async (userId: string) => {
    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const reminders = await prisma.reminder.findMany({
            where: {
                userId,
                OR: [
                    // Not dismissed at all
                    { isDismissed: false },
                    // Dismissed but from a previous day (for recurring reminders)
                    {
                        AND: [
                            { isDismissed: true },
                            { isRecurring: true },
                            {
                                OR: [
                                    { lastDismissedAt: null },
                                    { lastDismissedAt: { lt: startOfToday } }
                                ]
                            }
                        ]
                    }
                ]
            },
            orderBy: {
                datetime: 'asc',
            },
            take: 5,
        })
        return { success: true, data: reminders }
    } catch (error) {
        console.error('Error fetching reminders:', error)
        return { success: false, error: 'Failed to fetch reminders' }
    }
}

export const createReminder = async (data: {
    title: string
    datetime: Date
    type: ReminderType
    description?: string
    link?: string
    userId: string
    groupId?: string
    isRecurring?: boolean
}) => {
    try {
        const reminder = await prisma.reminder.create({
            data: {
                ...data,
                datetime: new Date(data.datetime),
                isRecurring: data.isRecurring ?? true // Default to recurring
            },
        })
        revalidatePath('/dashboard')
        return { success: true, data: reminder }
    } catch (error) {
        console.error('Error creating reminder:', error)
        return { success: false, error: 'Failed to create reminder' }
    }
}

export const dismissReminder = async (id: string, userId: string) => {
    try {
        await prisma.reminder.update({
            where: {
                id,
                userId, // Ensure ownership
            },
            data: {
                isDismissed: true,
                lastDismissedAt: new Date()
            }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error dismissing reminder:', error)
        return { success: false, error: 'Failed to dismiss reminder' }
    }
}

export const deleteReminder = async (id: string, userId: string) => {
    try {
        await prisma.reminder.delete({
            where: {
                id,
                userId, // Ensure ownership
            },
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Error deleting reminder:', error)
        return { success: false, error: 'Failed to delete reminder' }
    }
}

export const getDueReminders = async () => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: {
                datetime: {
                    lte: new Date(),
                },
                notificationSent: false,
            },
            include: {
                user: {
                    include: {
                        pushSubscriptions: true,
                    },
                },
            },
        })
        return { success: true, data: reminders }
    } catch (error) {
        console.error('Error fetching due reminders:', error)
        return { success: false, error: 'Failed to fetch due reminders' }
    }
}

export const markReminderAsNotified = async (id: string) => {
    try {
        await prisma.reminder.update({
            where: { id },
            data: { notificationSent: true },
        })
        return { success: true }
    } catch (error) {
        console.error('Error marking reminder as notified:', error)
        return { success: false }
    }
}
