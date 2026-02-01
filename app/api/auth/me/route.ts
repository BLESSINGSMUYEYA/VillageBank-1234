import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { generateUniqueUbankId } from '@/lib/id-generator';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ user: null });
    }

    let user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            ubankId: true, // Fetch uBank ID
        }
    });

    if (user && !user.ubankId) {
        // Auto-generate ID if missing (System Self-Healing)
        console.log(`[Auth] Auto-generating uBank ID for user ${user.id}`);
        const newUbankId = await generateUniqueUbankId(user.firstName || 'user', user.lastName || '', 'USER');

        user = await prisma.user.update({
            where: { id: user.id },
            data: { ubankId: newUbankId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phoneNumber: true,
                ubankId: true,
            }
        });
    }

    return NextResponse.json({ user });
}
