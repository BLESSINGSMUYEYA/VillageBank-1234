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
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { GlassCard } from '@/components/ui/GlassCard'

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
    const { t } = useLanguage()
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            {/* Header */}
            <motion.div variants={fadeIn}>
                <Link href="/groups" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Groups
                </Link>
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
                        isAdmin && (
                            <Link href={`/groups/${group.id}/settings`} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95 group px-6">
                                    <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                    Settings
                                </Button>
                            </Link>
                        )
                    }
                />
            </motion.div>

            {/* Zen Metric Bar */}
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-1 sm:p-2 border-white/40 dark:border-white/10" hover={false}>
                    <div className="flex flex-wrap items-center justify-between gap-6 p-4 sm:p-6 bg-white/40 dark:bg-slate-900/40 rounded-[20px] backdrop-blur-3xl">
                        <div className="flex items-center gap-4 sm:gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.monthly_share') || 'Monthly Share'}</p>
                                <p className="text-xl font-black text-foreground">{formatCurrency(group.monthlyContribution)}</p>
                            </div>
                            <div className="w-px h-10 bg-border/50 hidden sm:block" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.interest_rate') || 'Rate'}</p>
                                <p className="text-xl font-black text-blue-600 dark:text-banana">{group.interestRate}%</p>
                            </div>
                            <div className="w-px h-10 bg-border/50 hidden sm:block" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('groups.members') || 'Members'}</p>
                                <p className="text-xl font-black text-foreground">{group._count.members}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {isAdmin && (
                                <Link href={`/groups/${group.id}/settings`} className="flex-1 sm:flex-initial">
                                    <Button variant="outline" className="w-full h-12 px-6 rounded-xl font-black border-2 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm transition-all group">
                                        <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                                        Manage
                                    </Button>
                                </Link>
                            )}
                            <Link href="/contributions/new" className="flex-[2] sm:flex-initial">
                                <Button variant="banana" className="w-full h-12 px-8 rounded-xl font-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-all">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    {t('dashboard.make_contribution')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

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
