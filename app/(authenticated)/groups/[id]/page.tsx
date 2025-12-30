import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { getGroupDetails } from '@/lib/group-service'
import GroupDetailsClient from './GroupDetailsClient'

export default async function GroupDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  const sessionUserId = session?.userId
  const { id: groupId } = await params

  if (!sessionUserId) {
    redirect('/login')
  }

  const userId = sessionUserId as string

  const group = await getGroupDetails(groupId, userId as string)

  if (!group) {
    notFound()
  }

  // Find current user's role in this group
  const currentUserMember = group.members.find(
    member => member.userId === userId
  )

  const isAdmin = currentUserMember?.role === 'ADMIN'
  const isTreasurer = currentUserMember?.role === 'TREASURER'

  return (
    <GroupDetailsClient
      group={group}
      userId={userId}
      isAdmin={isAdmin}
      isTreasurer={isTreasurer}
      currentUserMember={currentUserMember}
    />
  )
}
