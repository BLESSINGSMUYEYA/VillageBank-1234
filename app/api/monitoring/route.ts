import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const [
      userCount,
      groupCount,
      activeLoans,
      pendingContributions,
      totalContributions,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.contribution.count({ where: { status: 'PENDING' } }),
      prisma.contribution.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          group: { select: { name: true } }
        }
      })
    ]);

    return NextResponse.json({
      metrics: {
        users: userCount,
        groups: groupCount,
        activeLoans,
        pendingContributions,
        totalContributions: totalContributions._sum.amount || 0
      },
      recentActivity
    });
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
