'use client'


import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft,
    TrendingUp,
    MapPin,
    Calendar,
    Users,
    Shield,
    DollarSign,
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import GroupDetailsContainer from './GroupDetailsContainer'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import GroupActions from '@/components/groups/GroupActions'

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
        <>
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6 sm:space-y-8 pb-20"
            >
                {/* Header Section */}
                <motion.div variants={fadeIn}>
                    <Link href="/groups" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-all duration-300 group mb-6">
                        <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
                        Back to Hub
                    </Link>
                    <div className="hidden md:block mb-8">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-2 text-left break-words">
                                    {group.name}
                                    <span className="text-banana">.</span>
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600 dark:text-banana" />
                                    Group Terminal & Ledger
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Card */}
                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 overflow-hidden" hover={false}>
                        {/* Hero Identity Section */}
                        <div className="relative border-b border-white/10 dark:border-white/5 p-6 sm:p-8 bg-slate-50/50 dark:bg-white/5">
                            <div className="flex flex-col xl:flex-row justify-between items-start gap-8">

                                {/* Group Info Wrapper */}
                                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start w-full xl:w-auto">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-banana dark:to-yellow-500 flex items-center justify-center text-white dark:text-emerald-950 text-3xl sm:text-4xl font-black shadow-inner ring-1 ring-white/10">
                                        {group.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-4 pt-1 w-full relative">
                                        {/* Mobile Header Overlay */}
                                        <div className="md:hidden flex items-center justify-between absolute -top-1 right-0 w-full sm:w-auto sm:relative sm:top-0">
                                        </div>

                                        <div>
                                            <h2 className="md:hidden text-2xl font-black text-foreground tracking-tighter mb-2 pr-10">
                                                {group.name}
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed">
                                                {group.description || 'A community focused savings circle dedicated to mutual growth and financial stability.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-banana bg-emerald-500/5 dark:bg-banana/5 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                                <MapPin className="w-3 h-3" />
                                                {group.region}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                Cycle {new Date().getFullYear()}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-lg border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-950/20 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Toolbar */}
                                <GroupActions group={group} isAdmin={isAdmin} isTreasurer={isTreasurer} />
                            </div>
                        </div>

                        {/* Stats Grid - Pulse Style */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 lg:p-8 bg-slate-50/20 dark:bg-black/20">
                            <div className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:border-emerald-500/20 transition-colors group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                    <DollarSign className="w-3 h-3" />
                                    Monthly Share
                                </p>
                                <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:scale-105 transition-transform origin-left">
                                    {formatCurrency(group.monthlyContribution)}
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:border-emerald-500/20 transition-colors group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                    <TrendingUp className="w-3 h-3" />
                                    Interest
                                </p>
                                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-banana tracking-tight group-hover:scale-105 transition-transform origin-left">
                                    {group.interestRate}%
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:border-emerald-500/20 transition-colors group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                    <Users className="w-3 h-3" />
                                    Members
                                </p>
                                <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:scale-105 transition-transform origin-left">
                                    {group._count.members}
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:border-green-500/20 transition-colors group">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Status
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight group-hover:scale-105 transition-transform origin-left">
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Tabs Content */}
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
        </>
    )
}
