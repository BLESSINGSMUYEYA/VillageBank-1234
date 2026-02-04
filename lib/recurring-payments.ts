"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { RecurringPaymentFrequency, RecurringPaymentStatus } from "@prisma/client";
import { createTransaction } from "@/lib/transactions";
import { createNotification } from "@/lib/notifications";

export type CreateRecurringPaymentInput = {
    name: string;
    description?: string;
    amount: number;
    frequency: RecurringPaymentFrequency;
    incomeDay?: number;
    startDate: Date;
};

export async function createRecurringPayment(input: CreateRecurringPaymentInput) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.create({
        data: {
            userId: session.userId,
            name: input.name,
            description: input.description,
            amount: input.amount,
            frequency: input.frequency,
            incomeDay: input.incomeDay,
            startDate: input.startDate,
            status: "ACTIVE"
        }
    });
}

export async function createMultipleRecurringPayments(
    payments: CreateRecurringPaymentInput[]
) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.$transaction(
        payments.map(payment =>
            prisma.recurringPayment.create({
                data: {
                    userId: session.userId,
                    name: payment.name,
                    description: payment.description,
                    amount: payment.amount,
                    frequency: payment.frequency,
                    incomeDay: payment.incomeDay,
                    startDate: payment.startDate,
                    status: "ACTIVE"
                }
            })
        )
    );
}

export async function getRecurringPayments() {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.findMany({
        where: {
            userId: session.userId,
            status: "ACTIVE"
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function updateRecurringPayment(
    id: string,
    data: Partial<CreateRecurringPaymentInput>
) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.update({
        where: {
            id,
            userId: session.userId
        },
        data
    });
}

export async function deleteRecurringPayment(id: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.delete({
        where: {
            id,
            userId: session.userId
        }
    });
}

export async function pauseRecurringPayment(id: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.update({
        where: {
            id,
            userId: session.userId
        },
        data: {
            status: "PAUSED"
        }
    });
}

export async function resumeRecurringPayment(id: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.recurringPayment.update({
        where: {
            id,
            userId: session.userId
        },
        data: {
            status: "ACTIVE"
        }
    });
}

export async function confirmRecurringPayment(confirmationId: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.$transaction(async (tx) => {
        // Get the confirmation record
        const confirmation = await tx.recurringPaymentConfirmation.findUnique({
            where: { id: confirmationId },
            include: {
                recurringPayment: true
            }
        });

        if (!confirmation || confirmation.userId !== session.userId) {
            throw new Error("Confirmation not found or unauthorized");
        }

        if (confirmation.confirmed) {
            throw new Error("Payment already confirmed");
        }

        // Create the transaction
        const transaction = await tx.personalTransaction.create({
            data: {
                userId: session.userId,
                amount: confirmation.recurringPayment.amount,
                type: "EXPENSE",
                category: "Recurring Payment",
                description: confirmation.recurringPayment.description || confirmation.recurringPayment.name,
                date: new Date()
            }
        });

        // Update the confirmation
        await tx.recurringPaymentConfirmation.update({
            where: { id: confirmationId },
            data: {
                confirmed: true,
                confirmedAt: new Date(),
                transactionId: transaction.id
            }
        });

        // Create success notification
        await createNotification(
            session.userId,
            "Payment Confirmed",
            `${confirmation.recurringPayment.name} payment of MWK ${confirmation.recurringPayment.amount.toLocaleString()} has been recorded.`,
            "PAYMENT_CONFIRMED"
        );

        return transaction;
    });
}

export async function getPendingPaymentConfirmations() {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return prisma.recurringPaymentConfirmation.findMany({
        where: {
            userId: session.userId,
            confirmed: false,
            month: currentMonth,
            year: currentYear
        },
        include: {
            recurringPayment: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

// Helper function to generate payment confirmations for the current period
export async function generatePaymentConfirmations() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Get all active recurring payments
    const payments = await prisma.recurringPayment.findMany({
        where: {
            status: "ACTIVE"
        }
    });

    for (const payment of payments) {
        // Check if it's time to generate a confirmation
        let shouldGenerate = false;

        if (payment.frequency === "MONTHLY" && payment.incomeDay) {
            // Generate on or after the income day
            shouldGenerate = currentDay >= payment.incomeDay;
        } else if (payment.frequency === "WEEKLY") {
            // For weekly, generate every 7 days (simplified logic)
            shouldGenerate = true;
        }

        if (shouldGenerate) {
            // Check if confirmation already exists for this period
            const existing = await prisma.recurringPaymentConfirmation.findUnique({
                where: {
                    recurringPaymentId_month_year: {
                        recurringPaymentId: payment.id,
                        month: currentMonth,
                        year: currentYear
                    }
                }
            });

            if (!existing) {
                // Create confirmation record
                await prisma.recurringPaymentConfirmation.create({
                    data: {
                        recurringPaymentId: payment.id,
                        userId: payment.userId,
                        month: currentMonth,
                        year: currentYear,
                        confirmed: false
                    }
                });

                // Create notification
                await createNotification(
                    payment.userId,
                    `Payment Reminder: ${payment.name}`,
                    `Have you paid ${payment.name} (MWK ${payment.amount.toLocaleString()})? Click to confirm.`,
                    "PAYMENT_REMINDER",
                    `confirm-payment:${payment.id}`
                );
            }
        }
    }
}
