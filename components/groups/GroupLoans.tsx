'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, CheckCircle, XCircle, Clock, CheckCircle2, Wallet, Landmark, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/stats-card'

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

      window.location.reload()
    } catch (error) {
      console.error('Error updating loan:', error)
    } finally {
      setLoading(false)
    }
  }

  const pendingLoans = loans.filter(l => l.status === 'PENDING')
  const activeLoans = loans.filter(l => l.status === 'ACTIVE')
  const completedLoans = loans.filter(l => l.status === 'COMPLETED')

  const totalAmountApproved = loans.reduce((sum, l) => sum + (l.amountApproved || 0), 0)

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          index={1}
          label="Pending"
          value={pendingLoans.length}
          description={formatCurrency(pendingLoans.reduce((sum, l) => sum + l.amountRequested, 0))}
          icon={Clock}
          className="w-full"
        />

        <StatsCard
          index={2}
          label="Active"
          value={activeLoans.length}
          description={formatCurrency(activeLoans.reduce((sum, l) => sum + (l.amountApproved || 0), 0))}
          icon={Landmark}
          variant="glass"
          className="w-full"
        />

        <StatsCard
          index={3}
          label="Completed"
          value={completedLoans.length}
          description="Fully repaid loans"
          icon={CheckCircle2}
          className="w-full"
        />

        <StatsCard
          index={4}
          label="Total Disbursed"
          value={formatCurrency(totalAmountApproved)}
          description={`${loans.length} total loans`}
          icon={Wallet}
          variant="featured"
          className="w-full"
        />
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
        <div>
          <h2 className="text-xl font-black text-foreground">Loan History</h2>
          <p className="text-xs font-bold text-muted-foreground opacity-70">Track borrowing and repayments</p>
        </div>
        <Link href={`/loans/new?groupId=${groupId}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 shadow-lg shadow-blue-500/20 group">
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Request Loan
          </Button>
        </Link>
      </div>

      {/* Pending Repayments / Approvals for Treasurer */}
      {currentUserRole === 'TREASURER' && pendingLoans.length > 0 && (
        <div className="space-y-4">
          <div className="px-6">
            <h3 className="text-lg font-black text-orange-600 dark:text-banana flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Needs Your Approval
            </h3>
          </div>
          <div className="overflow-x-auto scrollbar-premium bg-orange-500/5 dark:bg-banana/5 rounded-3xl border border-orange-500/10 dark:border-banana/10 mx-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-orange-500/10">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Member</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Period</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLoans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-orange-500/5 border-none transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="font-black text-sm text-foreground">
                        {loan.user.firstName} {loan.user.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-sm text-orange-600 dark:text-banana">
                      {formatCurrency(loan.amountRequested)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground italic">
                      {loan.repaymentPeriodMonths} months @ {loan.interestRate}%
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoanApproval(loan.id, true)}
                          disabled={loading}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black h-8 w-8 p-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoanApproval(loan.id, false)}
                          disabled={loading}
                          className="border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-black h-8 w-8 p-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Main Loan Table */}
      <div className="overflow-x-auto scrollbar-premium">
        {loans.length > 0 ? (
          <Table>
            <TableHeader className="bg-white/30 dark:bg-slate-900/30">
              <TableRow className="hover:bg-transparent border-b border-white/20 dark:border-white/10">
                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Member</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Approved Amount</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Rate</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Term</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-sm text-foreground">
                      {loan.user.firstName} {loan.user.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-black text-sm text-blue-600 dark:text-banana">
                      {formatCurrency(loan.amountApproved || loan.amountRequested)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-lg",
                        loan.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                          loan.status === 'ACTIVE' ? 'bg-blue-600 text-white' :
                            loan.status === 'PENDING' ? 'bg-orange-500 text-white' :
                              'bg-slate-500 text-white'
                      )}
                    >
                      {loan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{loan.interestRate}%</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{loan.repaymentPeriodMonths}mo</TableCell>
                  <TableCell className="text-right pr-6 text-[11px] font-bold text-muted-foreground opacity-70">
                    {new Date(loan.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl m-6 border-2 border-dashed border-white/10">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Landmark className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-black text-muted-foreground mb-6">No loan applications yet.</p>
            <Link href={`/loans/new?groupId=${groupId}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-8 shadow-lg shadow-blue-500/20">
                Apply for First Loan
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
