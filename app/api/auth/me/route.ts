import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
        }
    });

    return NextResponse.json({ user });
}
