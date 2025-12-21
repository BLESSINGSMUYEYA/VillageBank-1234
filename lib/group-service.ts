import { prisma } from './prisma'

export async function getGroupDetails(groupId: string, userId: string) {
    const group = await prisma.group.findFirst({
        where: {
            id: groupId,
            members: {
                some: {
                    userId: userId,
                    status: 'ACTIVE',
                },
            },
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                },
                orderBy: {
                    joinedAt: 'asc',
                },
            },
            contributions: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            },
            loans: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            },
            _count: {
                select: {
                    members: true,
                    contributions: true,
                    loans: true,
                },
            },
        },
    })

    return group
}
