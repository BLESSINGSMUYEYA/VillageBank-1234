'use server'

import { dismissReminder } from '@/lib/reminders'
import { revalidatePath } from 'next/cache'

export async function dismissReminderAction(reminderId: string, userId: string) {
    await dismissReminder(reminderId, userId)
    revalidatePath('/dashboard')
}
