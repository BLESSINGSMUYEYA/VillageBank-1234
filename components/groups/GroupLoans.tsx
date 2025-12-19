'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Plus, CheckCircle, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'

interface Loan {
  id: string
  amountRequested: number
  amountApproved?: number
  interestRate: number
  repaymentPeriodMonths: number
  status: string
  createdAt: string
  approvedAt?: string
  user: {
    firstName: string
    lastName: string
  }
}

interface GroupLoansProps {
  loans: Loan[]
  groupId: string
  currentUserRole?: string
}

export default function GroupLoans({ loans, groupId, currentUserRole }: GroupLoansProps) {
  console.log('GroupLoans - groupId:', groupId); // Debug log
  const [loading, setLoading] = useState(false)

  const handleLoanApproval = async (loanId: string, approved: boolean) => {
    if (!confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this loan?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/loans/${loanId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      })

      if (!response.ok) {
        throw new Error('Failed to update loan status')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating loan:', error)
      alert('Failed to update loan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pendingLoans = loans.filter(l => l.status === 'PENDING')
  const activeLoans = loans.filter(l => l.status === 'ACTIVE')
  const completedLoans = loans.filter(l => l.status === 'COMPLETED')
  const rejectedLoans = loans.filter(l => l.status === 'REJECTED')

  const totalAmountRequested = loans.reduce((sum, l) => sum + l.amountRequested, 0)
  const totalAmountApproved = loans.reduce((sum, l) => sum + (l.amountApproved || 0), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
            <p className="text-sm text-gray-500">
              {formatCurrency(pendingLoans.reduce((sum, l) => sum + l.amountRequested, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-sm text-gray-500">
              {formatCurrency(activeLoans.reduce((sum, l) => sum + (l.amountApproved || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLoans.length}</div>
            <p className="text-sm text-gray-500">
              {formatCurrency(completedLoans.reduce((sum, l) => sum + (l.amountApproved || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmountApproved)}</div>
            <p className="text-sm text-gray-500">
              {loans.length} total loans
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
            <Link href={`/loans/new?groupId=${groupId}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Loan
              </Button>
            </Link>
            {currentUserRole === 'TREASURER' && pendingLoans.length > 0 && (
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Review Pending ({pendingLoans.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approval</CardTitle>
            <CardDescription>
              Loans waiting for treasurer approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount Requested</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Requested</TableHead>
                  {currentUserRole === 'TREASURER' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {loan.user.firstName} {loan.user.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(loan.amountRequested)}
                    </TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.repaymentPeriodMonths} months</TableCell>
                    <TableCell>
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </TableCell>
                    {currentUserRole === 'TREASURER' && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleLoanApproval(loan.id, true)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoanApproval(loan.id, false)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
          <CardDescription>
            Complete loan history for the group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {loan.user.firstName} {loan.user.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(loan.amountApproved || loan.amountRequested)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          loan.status === 'COMPLETED' ? 'default' :
                          loan.status === 'ACTIVE' ? 'secondary' :
                          loan.status === 'PENDING' ? 'outline' :
                          loan.status === 'APPROVED' ? 'secondary' : 'destructive'
                        }
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.repaymentPeriodMonths} months</TableCell>
                    <TableCell>
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No loans yet</p>
              <Link href="/loans/new" className="mt-4 inline-block">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request First Loan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
