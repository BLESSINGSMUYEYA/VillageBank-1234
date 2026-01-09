'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, Eye, CheckCircle2, Clock, Wallet, ArrowUpRight, User, Calendar, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { StatsCard } from '@/components/ui/stats-card'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'

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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <GlassCard className="p-6 sm:p-8 space-y-8" hover={false}>
        {/* Summary Cards - 2 inline */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <StatsCard
            index={1}
            label="Total Settled"
            value={formatCurrency(totalCompleted)}
            description={`${completedContributions.length} contributions completed`}
            icon={CheckSquare}
            variant="featured"
            className="w-full"
          />

          <StatsCard
            index={2}
            label="Awaiting Approval"
            value={formatCurrency(totalPending)}
            description={`${pendingContributions.length} pending verification`}
            icon={Clock}
            variant="glass"
            className="w-full"
          />
        </div>

        {/* Simplified Action Header */}
        {/* Actions */}
        <motion.div variants={itemFadeIn} className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/contributions/new" className="flex-1">
            <Button variant="banana" className="w-full shadow-xl shadow-yellow-500/10 group h-11 rounded-2xl px-6 font-black tracking-tight text-xs uppercase">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Entry
            </Button>
          </Link>
          {(currentUserRole === 'TREASURER' || currentUserRole === 'ADMIN') && (
            <Link href="/treasurer/approvals" className="flex-1">
              <Button variant="outline" className="w-full border-2 font-black tracking-tight text-xs uppercase rounded-2xl h-11 px-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Eye className="h-5 w-5 mr-2" />
                Review Queue
              </Button>
            </Link>
          )}
        </motion.div>

        {/* List-based Contribution History */}
        <motion.div variants={fadeIn} className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Recent Entries</h4>
          <div className="rounded-xl overflow-hidden border border-border/10">
            {contributions.length > 0 ? (
              contributions.map((contribution, index) => (
                <motion.div key={contribution.id} variants={itemFadeIn}>
                  <div className={cn(
                    "p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-white/5 transition-colors",
                    index !== contributions.length - 1 && "border-b border-border/10"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors shrink-0",
                        contribution.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                          contribution.status === 'PENDING' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                            'bg-red-500/10 border-red-500/20 text-red-600'
                      )}>
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground tracking-tight">{contribution.user.firstName} {contribution.user.lastName}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                            {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                      <div className="text-right">
                        <p className="text-base font-black text-blue-600 dark:text-banana tracking-tight">{formatCurrency(contribution.amount)}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 opacity-70">
                          {new Date(contribution.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-lg border-2",
                            contribution.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                              contribution.status === 'PENDING' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                'bg-red-500/10 text-red-600 border-red-500/20'
                          )}
                        >
                          {contribution.status}
                        </Badge>
                        {contribution.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                            onClick={() => window.open(contribution.receiptUrl, '_blank')}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-24 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-white/10 border-t-0 rounded-t-none">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Wallet className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-lg font-black text-muted-foreground mb-8">No contribution records detected.</p>
                <Link href="/contributions/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl px-10 shadow-xl shadow-blue-500/20 h-11">
                    Create First Entry
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
