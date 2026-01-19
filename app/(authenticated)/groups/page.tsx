import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GroupsContent } from './GroupsContent'

export default async function GroupsPage() {
  const session = await getSession()
  const userId = session?.userId

  if (!userId) {
    return <div>Please sign in to access groups.</div>
  }

  // Get user's groups
  const userGroups = await prisma.groupMember.findMany({
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
  })

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-0 sm:px-4 lg:px-8 pb-24 space-y-6">
      <GroupsContent userGroups={userGroups} />
    </div>
  )
}
