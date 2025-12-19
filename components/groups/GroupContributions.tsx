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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCompleted)}</div>
            <p className="text-sm text-gray-500">
              {completedContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-sm text-gray-500">
              {pendingContributions.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCompleted + totalPending)}</div>
            <p className="text-sm text-gray-500">
              All time contributions
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
          <div className="flex space-x-4">
            <Link href="/contributions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Make Contribution
              </Button>
            </Link>
            {currentUserRole === 'TREASURER' && (
              <Link href={`/groups/${groupId}/contributions/approve`}>
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
        <CardContent>
          {contributions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
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
                        <p className="font-medium">
                          {contribution.user.firstName} {contribution.user.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(contribution.amount)}
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
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
