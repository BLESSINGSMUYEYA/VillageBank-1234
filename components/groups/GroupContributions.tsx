'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, Eye, CheckCircle2, Clock, Wallet, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/stats-card'

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
    <div className="space-y-8 sm:space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          index={1}
          label="Completed"
          value={formatCurrency(totalCompleted)}
          description={`${completedContributions.length} contributions settled`}
          icon={CheckCircle2}
          variant="glass"
          className="w-full"
        />

        <StatsCard
          index={2}
          label="Pending"
          value={formatCurrency(totalPending)}
          description={`${pendingContributions.length} awaiting approval`}
          icon={Clock}
          className="w-full"
        />

        <StatsCard
          index={3}
          label="Total Volume"
          value={formatCurrency(totalCompleted + totalPending)}
          description="Life-time contribution"
          icon={Wallet}
          variant="featured"
          className="w-full"
        />
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6">
        <div>
          <h2 className="text-xl font-black text-foreground">Contribution History</h2>
          <p className="text-xs font-bold text-muted-foreground opacity-70">Records of all financial participation</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contributions/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 shadow-lg shadow-blue-500/20 group">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              New Contribution
            </Button>
          </Link>
          {(currentUserRole === 'TREASURER' || currentUserRole === 'ADMIN') && (
            <Link href="/treasurer/approvals">
              <Button variant="outline" className="border-2 font-black rounded-xl px-6 hover:bg-blue-500/5 group">
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Review Pending
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Contributions Table */}
      <div className="overflow-x-auto scrollbar-premium">
        {contributions.length > 0 ? (
          <Table>
            <TableHeader className="bg-white/30 dark:bg-slate-900/30">
              <TableRow className="hover:bg-transparent border-b border-white/20 dark:border-white/10">
                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Member</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Amount</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Period</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((contribution) => (
                <TableRow key={contribution.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="font-black text-sm text-foreground">
                      {contribution.user.firstName} {contribution.user.lastName}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground opacity-60">
                      via {contribution.paymentMethod || 'Transfer'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-black text-sm text-blue-600 dark:text-banana">
                      {formatCurrency(contribution.amount)}
                    </div>
                    {contribution.isLate && (
                      <div className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                        +{formatCurrency(contribution.penaltyApplied)} Late Fee
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground italic">
                    {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-lg",
                        contribution.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-sm' :
                          contribution.status === 'PENDING' ? 'bg-orange-500 text-white shadow-sm' :
                            'bg-red-500 text-white shadow-sm'
                      )}
                    >
                      {contribution.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-muted-foreground opacity-70">
                    {new Date(contribution.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {contribution.receiptUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                        onClick={() => window.open(contribution.receiptUrl, '_blank')}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl m-6 border-2 border-dashed border-white/10">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Plus className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-black text-muted-foreground mb-6">No contributions recorded yet.</p>
            <Link href="/contributions/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-8 shadow-lg shadow-blue-500/20">
                Submit First Record
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
