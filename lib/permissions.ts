import { prisma } from './prisma'

export async function checkPermission(
  userId: string,
  groupId: string,
  requiredRole: 'ADMIN' | 'TREASURER' | 'SECRETARY'
): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  })

  if (!member || member.status !== 'ACTIVE') {
    return false
  }

  const roleHierarchy = {
    ADMIN: 4,
    TREASURER: 3,
    SECRETARY: 2,
    MEMBER: 1,
  }

  return roleHierarchy[member.role] >= roleHierarchy[requiredRole]
}

export async function checkLoanEligibility(
  userId: string,
  groupId: string
): Promise<{ eligible: boolean; reason?: string; maxAmount?: number }> {
  // Check if user has active loan
  const activeLoan = await prisma.loan.findFirst({
    where: {
      userId,
      groupId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
    },
  })

  if (activeLoan) {
    return {
      eligible: false,
      reason: 'You already have an active loan',
    }
  }

  // Calculate total contributions
  const contributions = await prisma.contribution.findMany({
    where: {
      userId,
      groupId,
      status: 'COMPLETED',
    },
  })

  if (contributions.length < 3) {
    return {
      eligible: false,
      reason: 'You must contribute for at least 3 months',
    }
  }

  const totalContributions = contributions.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  )

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    return { eligible: false, reason: 'Group not found' }
  }

  const maxLoanAmount = totalContributions * group.maxLoanMultiplier

  return {
    eligible: true,
    maxAmount: maxLoanAmount,
  }
}

export async function canAccessRegion(
  userRegion: string | null,
  targetRegion: string,
  userRole: string
): Promise<boolean> {
  // Super admins can access all regions
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  // Regional admins can only access their own region
  if (userRole === 'REGIONAL_ADMIN') {
    return userRegion === targetRegion
  }

  // Members cannot access regional admin features
  return false
}
