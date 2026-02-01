"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LendingStatus, LendingType } from "@prisma/client";

export async function getLendings(limit = 50, offset = 0) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.lending.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
            transaction: true, // Include related transaction if needed
        },
    });
}

export async function markLendingAsPaid(lendingId: string) {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    return prisma.lending.update({
        where: {
            id: lendingId,
            userId: session.userId,
        },
        data: {
            status: LendingStatus.PAID,
            updatedAt: new Date(),
        },
    });
}

export async function getLendingStats() {
    const session = await getSession();
    if (!session?.userId) throw new Error("Unauthorized");

    const lendings = await prisma.lending.findMany({
        where: {
            userId: session.userId,
            status: LendingStatus.PENDING,
        },
        select: {
            amount: true,
            type: true,
        },
    });

    const given = lendings
        .filter((l) => l.type === LendingType.GIVEN)
        .reduce((sum, l) => sum + l.amount, 0);

    const taken = lendings
        .filter((l) => l.type === LendingType.TAKEN)
        .reduce((sum, l) => sum + l.amount, 0);

    return { given, taken };
}
