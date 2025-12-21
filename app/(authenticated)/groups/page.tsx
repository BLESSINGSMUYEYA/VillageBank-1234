import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GroupsContent } from './GroupsContent'

export default async function GroupsPage() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to access groups.</div>
  }

  // Get user's groups
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
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
