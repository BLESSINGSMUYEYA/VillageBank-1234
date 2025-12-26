'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Plus, Eye } from 'lucide-react'
import Link from 'next/link'

interface Contribution {
  id: string
  amount: number
  month: number
  year: number
  status: string
  paymentMethod?: string
  transactionRef?: string
  receiptUrl?: string
  penaltyApplied: number
  isLate: boolean
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

interface GroupContributionsProps {
  contributions: Contribution[]
  groupId: string
  currentUserRole?: string
}

export default function GroupContributions({ contributions, groupId, currentUserRole }: GroupContributionsProps) {
  const completedContributions = contributions.filter(c => c.status === 'COMPLETED')
  const pendingContributions = contributions.filter(c => c.status === 'PENDING')

  const totalCompleted = completedContributions.reduce((sum, c) => sum + c.amount, 0)
  const totalPending = pendingContributions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-900 rounded-xl">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate" title={formatCurrency(totalCompleted)}>
              {formatCurrency(totalCompleted)}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">
              {completedContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-900 rounded-xl">
              <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate" title={formatCurrency(totalPending)}>
              {formatCurrency(totalPending)}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">
              {pendingContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900 rounded-xl">
              <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black text-foreground truncate" title={formatCurrency(totalCompleted + totalPending)}>
              {formatCurrency(totalCompleted + totalPending)}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/contributions/new">
              <Button className="rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-sm dark:bg-blue-700 dark:hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Make Contribution
              </Button>
            </Link>
            {(currentUserRole === 'TREASURER' || currentUserRole === 'ADMIN') && (
              <Link href="/treasurer/approvals">
                <Button variant="outline" className="rounded-xl font-bold border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  Review Pending
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributions */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black text-foreground">Recent Contributions</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Latest contributions from group members
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {contributions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Member</TableHead>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Period</TableHead>
                    <TableHead className="min-w-[120px]">Payment</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell>
                        <div className="font-black text-sm">
                          {contribution.user.firstName} {contribution.user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-black text-sm">{formatCurrency(contribution.amount)}</div>
                          {contribution.isLate && (
                            <div className="text-xs text-red-600 font-bold">
                              +{formatCurrency(contribution.penaltyApplied)} Penalty
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        {contribution.paymentMethod || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              contribution.status === 'COMPLETED' ? 'default' :
                                contribution.status === 'PENDING' ? 'secondary' : 'destructive'
                            }
                            className="w-fit font-bold uppercase tracking-wider text-xs"
                          >
                            {contribution.status}
                          </Badge>
                          {contribution.isLate && (
                            <Badge variant="outline" className="w-fit border-red-200 text-red-700 bg-red-50 text-[10px] py-0 font-bold uppercase tracking-wider">LATE</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {contribution.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(contribution.receiptUrl, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4 font-medium">No contributions yet</p>
              <Link href="/contributions/new" className="mt-4 inline-block">
                <Button size="sm" className="rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-700 dark:hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Make First Contribution
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
