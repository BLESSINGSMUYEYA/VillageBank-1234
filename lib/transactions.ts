"use server";

import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { getSession } from "@/lib/auth";


export type CreateTransactionInput = {
    amount: number;
    type: TransactionType;
    category?: string;
    description?: string;
    date?: Date;
    lendingType?: "GIVEN" | "TAKEN"; // Optional lending type
    counterpartyName?: string; // Optional person name for lending
    counterpartyUbankId?: string; // New: Optional uBank ID for verified tagging
};

import { createNotification } from "@/lib/notifications";

// ... existing imports

export async function createTransaction(input: CreateTransactionInput) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    // If it's a lending transaction, we need to create both Transaction and Lending
    if (input.lendingType && input.counterpartyName) {
        return prisma.$transaction(async (tx) => {
            // 0. Resolve Counterparty if provided
            let counterpartyId: string | null = null;
            if (input.counterpartyUbankId) {
                const user = await tx.user.findUnique({
                    where: { ubankId: input.counterpartyUbankId }
                });
                if (user) {
                    counterpartyId = user.id;
                }
            }

            // 1. Create the Transaction
            const transaction = await tx.personalTransaction.create({
                data: {
                    userId: session.userId,
                    amount: input.amount,
                    type: input.type,
                    category: input.category || "Debt", // Default category for lending
                    description: input.description,
                    date: input.date || new Date(),
                },
            });

            // 2. Create the Lending record linked to the transaction
            const lending = await tx.lending.create({
                data: {
                    userId: session.userId,
                    transactionId: transaction.id,
                    name: input.counterpartyName!,
                    amount: input.amount,
                    type: input.lendingType === "GIVEN" ? "GIVEN" : "TAKEN",
                    status: "PENDING",
                    counterpartyId: counterpartyId,
                    verificationStatus: counterpartyId ? "PENDING" : undefined, // Only PENDING if tagged
                },
            });

            // 3. Send Notification if tagged
            if (counterpartyId) {
                const currentUser = await tx.user.findUnique({ where: { id: session.userId } });
                const direction = input.lendingType === "GIVEN" ? "lent you" : "borrowed from you";

                await createNotification(
                    counterpartyId,
                    "Loan Verification Request",
                    `${currentUser?.firstName || 'A user'} says they ${direction} MWK ${input.amount.toLocaleString()}. Is this correct?`,
                    "LOAN_REQUEST",
                    `verify-loan:${lending.id}`
                );
            }

            return transaction;
        });
    }

    // Standard transaction creation
    return prisma.personalTransaction.create({
        data: {
            userId: session.userId,
            amount: input.amount,
            type: input.type,
            category: input.category,
            description: input.description,
            date: input.date || new Date(),
        },
    });
}



export async function getTransactions(limit = 20, offset = 0) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    const transactions = await prisma.personalTransaction.findMany({
        where: { userId: session.userId },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
    });

    return transactions;
}

export async function deleteTransaction(transactionId: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.personalTransaction.delete({
        where: {
            id: transactionId,
            userId: session.userId, // Ensure user owns the transaction
        },
    });
}

export async function getTransactionStats() {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await prisma.personalTransaction.groupBy({
        by: ["type"],
        where: {
            userId: session.userId,
            date: { gte: startOfMonth },
        },
        _sum: {
            amount: true,
        },
    });

    const income = stats.find((s) => s.type === "INCOME")?._sum.amount || 0;
    const expense = stats.find((s) => s.type === "EXPENSE")?._sum.amount || 0;

    // Calculate total loans owed (TAKEN loans that are still pending)
    const lendingsTaken = await prisma.lending.findMany({
        where: {
            userId: session.userId,
            type: "TAKEN",
            status: "PENDING"
        },
        select: {
            amount: true
        }
    });

    const totalLoansOwed = lendingsTaken.reduce((sum, lending) => sum + lending.amount, 0);

    return { income, expense, net: income - expense, totalLoansOwed };
}

export async function verifyLending(lendingId: string, status: "CONFIRMED" | "REJECTED") {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
        const lending = await tx.lending.findUnique({
            where: { id: lendingId },
            include: { user: true }
        });

        if (!lending || lending.counterpartyId !== session.userId) {
            throw new Error("Loan not found or unauthorized");
        }

        // Update status
        await tx.lending.update({
            where: { id: lendingId },
            data: { verificationStatus: status }
        });

        // If Confirmed, create the mirrored transaction and lending record for the responder
        if (status === 'CONFIRMED') {
            const responderLendingType = lending.type === 'GIVEN' ? 'TAKEN' : 'GIVEN';
            const responderTransactionType = responderLendingType === 'TAKEN' ? 'INCOME' : 'EXPENSE';
            const creatorName = lending.user.firstName ? `${lending.user.firstName} ${lending.user.lastName || ''}`.trim() : 'Counterparty';

            // 1. Create Personal Transaction for Responder
            await tx.personalTransaction.create({
                data: {
                    userId: session.userId,
                    amount: lending.amount,
                    type: responderTransactionType,
                    category: 'Debt',
                    description: responderLendingType === 'TAKEN' ? `Loan from ${creatorName}` : `Loan to ${creatorName}`,
                    date: lending.createdAt, // Match the original transaction date
                }
            });

            // 2. Create Lending Record for Responder
            await tx.lending.create({
                data: {
                    userId: session.userId,
                    transactionId: undefined, // Not strictly linked to the personal transaction ID here to avoid circular dependency issues, or could be linked if we captured the ID above. Let's keep it simple for now or link it if the schema requires it. Schema says transactionId is unique optional.
                    name: creatorName,
                    amount: lending.amount,
                    type: responderLendingType,
                    status: 'PENDING',
                    counterpartyId: lending.userId,
                    verificationStatus: 'CONFIRMED', // Auto-confirmed since they just clicked confirm
                    dueDate: lending.dueDate
                }
            });

            // 3. Create Reminder if due date exists
            if (lending.dueDate) {
                await tx.reminder.create({
                    data: {
                        userId: session.userId,
                        title: `Repayment Due: ${creatorName}`,
                        description: `Reminder to settle the loan of MWK ${lending.amount.toLocaleString()}`,
                        datetime: lending.dueDate,
                        type: 'PAYMENT',
                        isRecurring: false
                    }
                });
            }
        }

        // Notify the original creator
        const currentUser = await tx.user.findUnique({ where: { id: session.userId } });
        await createNotification(
            lending.userId,
            `Loan ${status === 'CONFIRMED' ? 'Confirmed' : 'Rejected'}`,
            `${currentUser?.firstName || 'Counterparty'} has ${status.toLowerCase()} the loan record.`,
            status === 'CONFIRMED' ? 'SUCCESS' : 'ERROR'
        );
    });
}

export async function getRecentCounterparties(limit = 10) {
    const session = await getSession();
    if (!session?.userId) return [];

    const recentLendings = await prisma.lending.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Fetch more to filter distinct names locally
        select: {
            name: true,
            counterparty: {
                select: {
                    firstName: true,
                    lastName: true,
                    ubankId: true,
                }
            },
            createdAt: true
        }
    });

    // Deduplicate by name
    const uniqueMap = new Map();
    recentLendings.forEach(l => {
        const key = l.name.trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
                name: l.name,
                ubankId: l.counterparty?.ubankId,
                displayName: l.counterparty ? `${l.counterparty.firstName} ${l.counterparty.lastName}`.trim() : l.name,
                lastTransactionDate: l.createdAt
            });
        }
    });

    return Array.from(uniqueMap.values()).slice(0, limit);
}

export async function getRecentUsersWithBalance() {
    const session = await getSession();
    if (!session?.userId) return [];

    // Fetch all lendings for the current user
    const lendings = await prisma.lending.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        include: {
            counterparty: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    ubankId: true,
                }
            }
        }
    });

    // Group by counterparty and calculate net balance
    const balanceMap = new Map<string, {
        name: string;
        displayName: string;
        ubankId?: string;
        initials: string;
        netBalance: number;
        lastTransactionDate: Date;
    }>();

    lendings.forEach(lending => {
        // Use counterparty ID if available, otherwise use name as key
        const key = lending.counterpartyId || lending.name;

        // Calculate balance: GIVEN = they owe you (positive), TAKEN = you owe them (negative)
        const balanceChange = lending.type === 'GIVEN' ? lending.amount : -lending.amount;

        if (balanceMap.has(key)) {
            const existing = balanceMap.get(key)!;
            existing.netBalance += balanceChange;
            // Keep the most recent transaction date
            if (lending.createdAt > existing.lastTransactionDate) {
                existing.lastTransactionDate = lending.createdAt;
            }
        } else {
            const displayName = lending.counterparty
                ? `${lending.counterparty.firstName} ${lending.counterparty.lastName || ''}`.trim()
                : lending.name;

            const initials = lending.counterparty
                ? `${lending.counterparty.firstName?.[0] || ''}${lending.counterparty.lastName?.[0] || ''}`.toUpperCase()
                : lending.name.substring(0, 2).toUpperCase();

            balanceMap.set(key, {
                name: lending.name,
                displayName,
                ubankId: lending.counterparty?.ubankId,
                initials,
                netBalance: balanceChange,
                lastTransactionDate: lending.createdAt
            });
        }
    });

    // Convert to array and sort by most recent transaction
    return Array.from(balanceMap.values())
        .sort((a, b) => b.lastTransactionDate.getTime() - a.lastTransactionDate.getTime());
}
