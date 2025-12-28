import { getSession } from '@/lib/auth'
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-3">
          <Link href="/groups">
            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl border-border hover:border-blue-700 hover:text-blue-700 transition-colors font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">{group.name}</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium">{group.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Badge variant="outline" className="w-full sm:w-auto justify-center rounded-lg border-blue-200 text-blue-700 bg-blue-50 font-bold px-4 py-1.5">{group.region}</Badge>
          {isAdmin && (
            <Link href={`/groups/${group.id}/settings`}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl border-border hover:border-blue-700 hover:text-blue-700 transition-colors font-bold">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate">{group._count.members}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {group.members.filter(m => m.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest">Monthly Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate" title={formatCurrency(group.monthlyContribution)}>
              {formatCurrency(group.monthlyContribution)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Per member
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest">Interest Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate">{group.interestRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Annual rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest">Loan Multiplier</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate">{group.maxLoanMultiplier}x</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
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
