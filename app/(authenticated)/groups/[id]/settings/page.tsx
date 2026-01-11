import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { GroupSettingsClient } from '@/components/groups/settings/GroupSettingsClient'
import { ShieldQuestion } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'

export default async function GroupSettingsPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      members: {
        where: { userId: session.user.id }
      },
      _count: {
        select: {
          members: true,
          contributions: true,
          loans: true
        }
      }
    }
  })

  if (!group) notFound()

  const currentUserMember = group.members[0]
  const isAdmin = currentUserMember?.role === 'ADMIN'

  // Admin Access Check
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6">
        <GlassCard className="p-12 text-center" hover={false}>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldQuestion className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground font-bold mb-8">
            Only group administrators can modify these settings.
          </p>
          <Link href={`/groups/${params.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-10">
              Return to Group
            </Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Serialize Decimal/Date types for Client Component
  const serializedGroup = {
    ...group,
    monthlyContribution: group.monthlyContribution.toString(),
    socialFundAmount: group.socialFundAmount.toString(),
    interestRate: group.interestRate.toString(),
    maxLoanMultiplier: group.maxLoanMultiplier.toString(),
    penaltyAmount: group.penaltyAmount.toString(),
    lateContributionFee: group.lateContributionFee?.toString() || '0',
    lateMeetingFine: group.lateMeetingFine.toString(),
    missedMeetingFine: group.missedMeetingFine.toString(),
    createdAt: group.createdAt.toISOString(),
    members: undefined // Don't pass full members array unless needed, to save payload
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <GroupSettingsClient group={serializedGroup} userId={session.user.id} />
    </div>
  )
}
