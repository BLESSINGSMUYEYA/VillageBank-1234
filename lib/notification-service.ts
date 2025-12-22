import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

export class NotificationService {
    static async send({
        userId,
        title,
        message,
        type = 'INFO',
        actionUrl,
        actionText
    }: {
        userId: string
        title: string
        message: string
        type?: NotificationType
        actionUrl?: string
        actionText?: string
    }) {
        try {
            return await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    actionUrl,
                    actionText,
                }
            })
        } catch (error) {
            console.error('Error sending notification:', error)
            return null
        }
    }

    static async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        })
    }

    static async getUserNotifications(userId: string) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    }
}
