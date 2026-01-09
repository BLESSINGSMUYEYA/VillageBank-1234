'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, CheckCircle, XCircle, Clock, Landmark, Wallet, ArrowUpRight, Calendar, Percent, User } from 'lucide-react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'

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
  const totalAmountApproved = loans.reduce((sum, l) => sum + (l.amountApproved || 0), 0)

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <GlassCard className="p-6 sm:p-8 space-y-8" hover={false}>
        {/* Stats Row */}
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 mb-6">
          <div className="space-y-1 pb-4 sm:pb-0 sm:px-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-3 h-3 text-blue-500" />
              Total Disbursed
            </p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{formatCurrency(totalAmountApproved)}</p>
            <p className="text-[10px] font-bold text-muted-foreground opacity-60">{loans.length} total loans issued</p>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0 sm:px-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-500" />
              Pending Request
            </p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{pendingLoans.length}</p>
            <p className="text-[10px] font-bold text-muted-foreground opacity-60">{formatCurrency(pendingLoans.reduce((sum, l) => sum + l.amountRequested, 0))}</p>
          </div>
        </div>

        {/* Simplified Action Header */}
        <motion.div variants={itemFadeIn} className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Loan Lifecycle</h2>
            <p className="text-sm font-bold text-muted-foreground opacity-70">Management and history of group credit</p>
          </div>
          <Link href={`/loans/new?groupId=${groupId}`} className="w-full sm:w-auto">
            <Button size="xl" variant="default" className="w-full sm:w-auto shadow-xl shadow-blue-500/10 group h-14 rounded-2xl">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Application
            </Button>
          </Link>
        </motion.div>

        {/* Treasurer Approvals - Refined Inline Look */}
        {currentUserRole === 'TREASURER' && pendingLoans.length > 0 && (
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 dark:text-banana">
                Urgent Approvals Required
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLoans.map((loan) => (
                <div key={loan.id} className="p-6 border border-orange-500/20 bg-orange-500/5 rounded-2xl">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black">{loan.user.firstName} {loan.user.lastName}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(loan.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-orange-600 dark:text-banana">{formatCurrency(loan.amountRequested)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleLoanApproval(loan.id, true)}
                        disabled={loading}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black h-12"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleLoanApproval(loan.id, false)}
                        disabled={loading}
                        className="flex-1 border-2 border-red-500/20 text-red-600 font-black h-12 rounded-xl"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Simple List-based History */}
        <motion.div variants={fadeIn} className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Historical Ledger</h4>
          <div className="rounded-xl overflow-hidden border border-border/10">
            {loans.length > 0 ? (
              loans.map((loan, index) => (
                <motion.div key={loan.id} variants={itemFadeIn}>
                  <div className={cn(
                    "p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors rounded-2xl",
                    // No border between items
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                        loan.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                          loan.status === 'ACTIVE' ? 'bg-blue-600/10 border-blue-600/20 text-blue-600' :
                            'bg-slate-500/10 border-slate-500/20 text-slate-500'
                      )}>
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground">{loan.user.firstName} {loan.user.lastName}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(loan.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> {loan.interestRate}% Interest</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                      <div className="text-right">
                        <p className="text-base font-black text-foreground">{formatCurrency(loan.amountApproved || loan.amountRequested)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{loan.repaymentPeriodMonths} Month Term</p>
                      </div>
                      <Badge
                        className={cn(
                          "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-lg border-2",
                          loan.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            loan.status === 'ACTIVE' ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' :
                              'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        )}
                      >
                        {loan.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-24 bg-white/5 dark:bg-black/10 backdrop-blur-sm border-2 border-dashed border-white/10 border-t-0 rounded-t-none">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Landmark className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-black text-muted-foreground mb-8">No group financial data yet.</p>
                <Link href={`/loans/new?groupId=${groupId}`}>
                  <Button size="xl" className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl px-10 shadow-xl shadow-blue-500/20 h-14">
                    Request Initial Loan
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}
