'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import { Plus, Eye, Wallet, ArrowUpRight, Calendar, Clock, CheckSquare } from 'lucide-react'
import Link from 'next/link'
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
  paymentDate?: string | Date // Add paymentDate
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
      <GlassCard className="p-5 sm:p-6 space-y-6" hover={false}>
        {/* Stats Row - Loans Style (Responsive) */}
        {/* Stats Row - Loans Style (Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 mb-4">
          <div className="space-y-1 pb-3 sm:pb-0 sm:px-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-3 h-3 text-emerald-500" />
              Total Settled
            </p>
            <p className="text-2xl font-black text-foreground tracking-tighter">{formatCurrency(totalCompleted)}</p>
            <p className="text-[10px] font-bold text-muted-foreground opacity-60">{completedContributions.length} contributions completed</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:px-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-500" />
              Awaiting Approval
            </p>
            <p className="text-2xl font-black text-foreground tracking-tighter">{formatCurrency(totalPending)}</p>
            <p className="text-[9px] font-bold text-muted-foreground opacity-60">{pendingContributions.length} pending verification</p>
          </div>
        </div>


        {/* Simplified Action Header */}
        {/* Actions */}
        <motion.div variants={itemFadeIn} className="flex flex-col sm:flex-row gap-2 w-full">
          <Link href="/contributions/new" className="flex-1">
            <Button variant="default" className="w-full shadow-xl shadow-blue-500/10 group h-9 rounded-xl px-4 font-black tracking-tight text-[10px] uppercase">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              New Entry
            </Button>
          </Link>
          {(currentUserRole === 'TREASURER' || currentUserRole === 'ADMIN') && (
            <Link href="/treasurer/approvals" className="flex-1">
              <Button variant="outline" className="w-full border font-black tracking-tight text-[10px] uppercase rounded-xl h-9 px-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Eye className="h-4 w-4 mr-2" />
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
                    "p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/5 transition-colors rounded-xl",
                    // Removed border logic
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors shrink-0",
                        contribution.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                          contribution.status === 'PENDING' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                            'bg-red-500/10 border-red-500/20 text-red-600'
                      )}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-body-primary font-black text-foreground tracking-tight">{contribution.user.firstName} {contribution.user.lastName}</h4>
                        <div className="flex items-center gap-2 text-micro font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                            {new Date(contribution.year, contribution.month - 1).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-14 sm:pl-0">
                      <div className="text-right">
                        <p className="text-body-primary font-black text-blue-600 dark:text-banana tracking-tight">{formatCurrency(contribution.amount)}</p>
                        <p className="text-micro font-bold text-muted-foreground uppercase tracking-wider mt-0 opacity-70">
                          {contribution.paymentDate
                            ? new Date(contribution.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : new Date(contribution.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "text-tab-label px-2 py-0.5 rounded-lg border",
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
                            className="h-7 w-7 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                            onClick={() => window.open(contribution.receiptUrl, '_blank')}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
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
                <p className="text-section-title text-muted-foreground mb-8">No contribution records detected.</p>
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
