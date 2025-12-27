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

  return <GroupsContent userGroups={userGroups} />
}
