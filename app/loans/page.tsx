import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function LoansPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Please sign in to access loans.</div>
  }

  // Get user's loans
  const loans = await prisma.loan.findMany({
    where: {
      userId: userId,
    },
    include: {
      group: true,
      repayments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Get user's groups for loan eligibility
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
    include: {
      group: true,
    },
  })

  // Calculate loan stats
  const activeLoans = loans.filter(l => l.status === 'ACTIVE')
  const pendingLoans = loans.filter(l => l.status === 'PENDING')
  const completedLoans = loans.filter(l => l.status === 'COMPLETED')
  const rejectedLoans = loans.filter(l => l.status === 'REJECTED')

  const totalBorrowed = loans
    .filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
    .reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0)
  
  const totalRepaid = loans
    .filter(l => l.status === 'COMPLETED')
    .reduce((sum, l) => sum + l.repayments.reduce((repSum, rep) => repSum + Number(rep.amount), 0), 0)

  // Check loan eligibility for each group
  const eligibilityChecks = await Promise.all(
    userGroups.map(async (groupMember) => {
      const contributions = await prisma.contribution.findMany({
        where: {
          userId: userId,
          groupId: groupMember.groupId,
          status: 'COMPLETED',
        },
      })

      const totalContributions = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
      const maxLoanAmount = totalContributions * groupMember.group.maxLoanMultiplier

      const hasActiveLoan = loans.some(l => 
        l.groupId === groupMember.groupId && 
        ['PENDING', 'APPROVED', 'ACTIVE'].includes(l.status)
      )

      return {
        group: groupMember.group,
        eligible: contributions.length >= 3 && !hasActiveLoan,
        contributionsCount: contributions.length,
        totalContributions,
        maxLoanAmount,
        hasActiveLoan,
        reason: contributions.length < 3 
          ? 'Need at least 3 months of contributions' 
          : hasActiveLoan 
          ? 'Already have an active loan' 
          : 'Eligible',
      }
    })
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600">Manage your loan applications and repayments</p>
        </div>
        {eligibilityChecks.some(check => check.eligible) && (
          <Link href="/loans/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request Loan
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(activeLoans.reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground">
              {completedLoans.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRepaid)}</div>
            <p className="text-xs text-muted-foreground">
              Successfully repaid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loan Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Eligibility</CardTitle>
          <CardDescription>
            Check your eligibility for loans in each group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibilityChecks.map((check) => (
              <Card key={check.group.id} className={
                check.eligible ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    {check.eligible ? (
                      <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                    )}
                    {check.group.name}
                  </CardTitle>
                  <CardDescription>
                    {check.eligible ? 'Eligible for loan' : check.reason}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Contributions:</span>
                      <span>{check.contributionsCount} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Contributed:</span>
                      <span>{formatCurrency(check.totalContributions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Loan Amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(check.maxLoanAmount)}
                      </span>
                    </div>
                  </div>
                  {check.eligible && (
                    <Link href={`/loans/new?groupId=${check.group.id}`} className="mt-3 block">
                      <Button size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Apply for Loan
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loan History */}
      <Card>
        <CardHeader>
          <CardTitle>Loan History</CardTitle>
          <CardDescription>
            Your complete loan record
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{loan.group.name}</p>
                        <p className="text-sm text-gray-500">{loan.group.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(loan.amountApproved || loan.amountRequested))}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          loan.status === 'COMPLETED' ? 'default' :
                          loan.status === 'ACTIVE' ? 'secondary' :
                          loan.status === 'PENDING' ? 'outline' : 'destructive'
                        }
                      >
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.repaymentPeriodMonths} months</TableCell>
                    <TableCell>{formatDate(loan.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/loans/${loan.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loans Yet</h3>
              <p className="text-gray-500 mb-6">
                Apply for your first loan once you have 3 months of contributions.
              </p>
              {eligibilityChecks.some(check => check.eligible) ? (
                <Link href="/loans/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Apply for First Loan
                  </Button>
                </Link>
              ) : (
                <Link href="/contributions">
                  <Button variant="outline">
                    Make Contributions First
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
