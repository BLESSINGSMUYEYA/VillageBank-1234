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
};

export async function createTransaction(input: CreateTransactionInput) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    // If it's a lending transaction, we need to create both Transaction and Lending
    if (input.lendingType && input.counterpartyName) {
        return prisma.$transaction(async (tx) => {
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
            await tx.lending.create({
                data: {
                    userId: session.userId,
                    transactionId: transaction.id,
                    name: input.counterpartyName!,
                    amount: input.amount,
                    type: input.lendingType === "GIVEN" ? "GIVEN" : "TAKEN",
                    status: "PENDING",
                    // For debts, due date is not mandatory in this simple flow, but could be added later
                },
            });

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

    return { income, expense, net: income - expense };
}
