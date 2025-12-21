import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, CreditCard, Settings, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { getGroupDetails } from '@/lib/group-service'
import GroupDetailsContainer from './GroupDetailsContainer'

export default async function GroupDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  const { id: groupId } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const group = await getGroupDetails(groupId, userId)

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-3">
          <Link href="/groups">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 text-sm sm:text-base">{group.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Badge variant="outline" className="w-full sm:w-auto justify-center">{group.region}</Badge>
          {isAdmin && (
            <Link href={`/groups/${group.id}/settings`}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate">{group._count.members}</div>
            <p className="text-xs text-muted-foreground">
              {group.members.filter(m => m.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Monthly Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(group.monthlyContribution)}>
              {formatCurrency(group.monthlyContribution)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per member
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Interest Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate">{group.interestRate}%</div>
            <p className="text-xs text-muted-foreground">
              Annual rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Loan Multiplier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate">{group.maxLoanMultiplier}x</div>
            <p className="text-xs text-muted-foreground">
              Max loan calculation
            </p>
          </CardContent>
        </Card>
      </div>

      <GroupDetailsContainer
        group={group}
        userId={userId}
        isAdmin={isAdmin}
        isTreasurer={isTreasurer}
        currentUserMember={currentUserMember}
      />
    </div>
  )
}
