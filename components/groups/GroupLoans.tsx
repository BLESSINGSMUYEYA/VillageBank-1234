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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
              <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate">{pendingLoans.length}</div>
            <p className="text-[10px] text-gray-500 truncate">
              {formatCurrency(pendingLoans.reduce((sum, l) => sum + l.amountRequested, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate">{activeLoans.length}</div>
            <p className="text-[10px] text-gray-500 truncate">
              {formatCurrency(activeLoans.reduce((sum, l) => sum + (l.amountApproved || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed</CardTitle>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate">{completedLoans.length}</div>
            <p className="text-[10px] text-gray-500 truncate">
              {formatCurrency(completedLoans.reduce((sum, l) => sum + (l.amountApproved || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Disbursed</CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-black truncate" title={formatCurrency(totalAmountApproved)}>
              {formatCurrency(totalAmountApproved)}
            </div>
            <p className="text-[10px] text-gray-500 truncate">
              {loans.length} total loans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href={`/loans/new?groupId=${groupId}`}>
              <Button className="rounded-2xl font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Request Loan
              </Button>
            </Link>
            {currentUserRole === 'TREASURER' && pendingLoans.length > 0 && (
              <Button variant="outline" className="rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                <Eye className="w-4 h-4 mr-2" />
                Review Pending ({pendingLoans.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-black">Pending Approval</CardTitle>
            <CardDescription className="text-sm">
              Loans waiting for treasurer approval
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[9.375rem]">Member</TableHead>
                    <TableHead className="min-w-[7.5rem]">Requested</TableHead>
                    <TableHead className="min-w-[6.25rem]">Interest</TableHead>
                    <TableHead className="min-w-[6.25rem]">Period</TableHead>
                    <TableHead className="min-w-[6.25rem]">Date</TableHead>
                    {currentUserRole === 'TREASURER' && <TableHead className="min-w-[7.5rem]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-black text-sm">
                          {loan.user.firstName} {loan.user.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="font-black">
                        {formatCurrency(loan.amountRequested)}
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell className="whitespace-nowrap">{loan.repaymentPeriodMonths} months</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </TableCell>
                      {currentUserRole === 'TREASURER' && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleLoanApproval(loan.id, true)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-2xl font-bold transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoanApproval(loan.id, false)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl font-bold border-red-200 transition-colors"
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Loans Table */}
      <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black">All Loans</CardTitle>
          <CardDescription className="text-sm">
            Complete loan history for the group
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {loans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Member</TableHead>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Interest</TableHead>
                    <TableHead className="min-w-[100px]">Period</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-black text-sm">
                          {loan.user.firstName} {loan.user.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="font-black">
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
                          className="font-bold uppercase tracking-wider text-xs"
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell className="whitespace-nowrap">{loan.repaymentPeriodMonths} months</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No loans yet</p>
              <Link href="/loans/new" className="mt-4 inline-block">
                <Button size="sm" className="rounded-2xl font-bold">
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
