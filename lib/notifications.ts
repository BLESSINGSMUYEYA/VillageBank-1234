import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification(userId: string, title: string, message: string, type: NotificationType = "INFO", actionUrl?: string, actionText?: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                actionUrl,
                actionText,
            },
        });
    } catch (error) {
        console.error("Failed to create notification", error);
    }
}
