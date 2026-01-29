import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GroupsContent } from './GroupsContent'
import { getPendingApprovals } from '@/lib/dashboard-service'

export default async function GroupsPage() {
  const session = await getSession()
  const userId = session?.userId

  if (!userId) {
    return <div>Please sign in to access groups.</div>
  }

  // Fetch user, groups, and pending approvals in parallel
  const [user, userGroups, pendingApprovals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId as string },
      select: { role: true } // Only need the role
    }),
    prisma.groupMember.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
                contributions: true,
                loans: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    }),
    getPendingApprovals()
  ])

  return (
    <div className="w-full max-w-7xl mx-auto pt-0 pb-24 sm:pb-24 sm:pt-4 px-0 sm:px-4 lg:px-8 space-y-6">
      <GroupsContent
        userGroups={userGroups}
        userRole={user?.role}
        pendingApprovalsCount={pendingApprovals.contributions.length + pendingApprovals.loans.length}
      />
    </div>
  )
}
