import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ContributionsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Please sign in to access contributions.</div>
  }

  // Get user's contributions
  const contributions = await prisma.contribution.findMany({
    where: {
      userId: userId,
    },
    include: {
      group: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get user's groups for making new contributions
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
    include: {
      group: true,
    },
  })

  // Calculate stats
  const completedContributions = contributions.filter(c => c.status === 'COMPLETED')
  const pendingContributions = contributions.filter(c => c.status === 'PENDING')
  const totalContributed = completedContributions.reduce((sum, c) => sum + Number(c.amount), 0)
  
  // Check for current month contributions
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const currentMonthContributions = contributions.filter(
    c => c.month === currentMonth && c.year === currentYear
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600">Manage your monthly contributions</p>
        </div>
        {userGroups.length > 0 && (
          <Link href="/contributions/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Make Contribution
            </Button>
          </Link>
        )}
      </div>

      {/* Current Month Alert */}
      {currentMonthContributions.length === 0 && userGroups.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Monthly Contribution Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-3">
              You haven't made your contribution for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <Link href="/contributions/new">
              <Button variant="outline" size="sm">
                Make Contribution Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalContributed)}</div>
            <p className="text-xs text-muted-foreground">
              {completedContributions.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingContributions.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              Groups you belong to
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthContributions.length}</div>
            <p className="text-xs text-muted-foreground">
              Contributions made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups for Contribution */}
      {userGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
            <CardDescription>
              Groups where you can make contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups.map((groupMember) => (
                <Card key={groupMember.id} className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{groupMember.group.name}</CardTitle>
                    <CardDescription>
                      Monthly: {formatCurrency(groupMember.group.monthlyContribution)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/contributions/new?groupId=${groupMember.groupId}`}>
                      <Button size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>
            Your complete contribution record
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contribution.group.name}</p>
                        <p className="text-sm text-gray-500">{contribution.group.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(contribution.amount))}
                    </TableCell>
                    <TableCell>
                      {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {contribution.paymentMethod || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          contribution.status === 'COMPLETED' ? 'default' :
                          contribution.status === 'PENDING' ? 'secondary' : 'destructive'
                        }
                      >
                        {contribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(contribution.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contributions Yet</h3>
              <p className="text-gray-500 mb-6">
                Start contributing to your village banking groups.
              </p>
              {userGroups.length > 0 ? (
                <Link href="/contributions/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Make First Contribution
                  </Button>
                </Link>
              ) : (
                <Link href="/groups">
                  <Button variant="outline">
                    Join a Group First
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
