'use client'

import { useState } from 'react'
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(totalCompleted)}>
              {formatCurrency(totalCompleted)}
            </div>
            <p className="text-xs text-gray-500">
              {completedContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(totalPending)}>
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-gray-500">
              {pendingContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(totalCompleted + totalPending)}>
              {formatCurrency(totalCompleted + totalPending)}
            </div>
            <p className="text-xs text-gray-500">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/contributions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Make Contribution
              </Button>
            </Link>
            {(currentUserRole === 'TREASURER' || currentUserRole === 'ADMIN') && (
              <Link href="/treasurer/approvals">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Review Pending
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
          <CardDescription>
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
                        <div className="font-medium">
                          {contribution.user.firstName} {contribution.user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(contribution.amount)}</div>
                          {contribution.isLate && (
                            <div className="text-xs text-red-600">
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
                            className="w-fit"
                          >
                            {contribution.status}
                          </Badge>
                          {contribution.isLate && (
                            <Badge variant="outline" className="w-fit border-red-200 text-red-700 bg-red-50 text-[10px] py-0">
                              LATE
                            </Badge>
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
              <p className="text-gray-500">No contributions yet</p>
              <Link href="/contributions/new" className="mt-4 inline-block">
                <Button size="sm">
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
