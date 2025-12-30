'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Users,
    DollarSign,
    CreditCard,
    Settings,
    ArrowLeft,
    TrendingUp,
    MapPin,
    Calendar,
    Percent
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import GroupDetailsContainer from './GroupDetailsContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/stats-card'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'

interface GroupDetailsClientProps {
    group: any
    userId: string
    isAdmin: boolean
    isTreasurer: boolean
    currentUserMember: any
}

export default function GroupDetailsClient({
    group,
    userId,
    isAdmin,
    isTreasurer,
    currentUserMember
}: GroupDetailsClientProps) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            {/* Header */}
            <motion.div variants={fadeIn}>
                <PageHeader
                    title={group.name}
                    description={
                        <div className="flex flex-col gap-2">
                            <span className="flex flex-wrap items-center gap-1.5 opacity-80 font-medium">
                                {group.description || 'Village banking savings circle.'}
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="rounded-lg border-blue-500/20 text-blue-600 dark:text-banana bg-blue-500/5 dark:bg-banana/5 font-black px-3 py-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {group.region}
                                </Badge>
                                <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 font-black px-3 py-1 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Active Cycle
                                </Badge>
                            </div>
                        </div>
                    }
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Link href="/groups" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-2 border-border hover:border-blue-600 hover:text-blue-600 dark:hover:border-banana dark:hover:text-banana transition-all font-black group px-6">
                                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    Back
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href={`/groups/${group.id}/settings`} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95 group px-6">
                                        <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                        Settings
                                    </Button>
                                </Link>
                            )}
                        </div>
                    }
                />
            </motion.div>

            {/* Group Stats */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar">
                <StatsCard
                    index={1}
                    label="Total Members"
                    value={group._count.members}
                    description={`${group.members.filter((m: any) => m.status === 'ACTIVE').length} active currently`}
                    icon={Users}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={2}
                    variant="featured"
                    label="Monthly Contribution"
                    value={formatCurrency(group.monthlyContribution)}
                    description="Requirement per member"
                    icon={DollarSign}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={3}
                    variant="glass"
                    label="Interest Rate"
                    value={`${group.interestRate}%`}
                    description="Annual percentage rate"
                    icon={Percent}
                    className="shrink-0 w-[280px] sm:w-auto"
                />

                <StatsCard
                    index={4}
                    variant="gradient"
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/20"
                    label="Loan Multiplier"
                    value={`${group.maxLoanMultiplier}x`}
                    description="Max loan calculation"
                    icon={TrendingUp}
                    className="shrink-0 w-[280px] sm:w-auto"
                />
            </div>

            <motion.div variants={itemFadeIn}>
                <GroupDetailsContainer
                    group={group}
                    userId={userId}
                    isAdmin={isAdmin}
                    isTreasurer={isTreasurer}
                    currentUserMember={currentUserMember}
                />
            </motion.div>
        </motion.div>
    )
}
