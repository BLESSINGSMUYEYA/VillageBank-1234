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

    if (currentUserMember?.status === 'PENDING') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto pt-12 text-center space-y-6"
            >
                <div className="w-20 h-20 mx-auto bg-yellow-100 dark:bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-foreground">Awaiting Approval</h1>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Your request to join <span className="font-bold text-foreground">{group.name}</span> has been sent and is awaiting admin approval.
                    </p>
                </div>
                <GlassCard className="p-6 text-left max-w-md mx-auto mt-8">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        What happens next?
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                            Admins will review your request to ensure you meet the group's requirements.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                            You will receive a notification once your request status changes.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                            In the meantime, you can continue to explore other public features.
                        </li>
                    </ul>
                    <Link href="/dashboard">
                        <Button className="w-full mt-6" variant="outline">
                            Return to Dashboard
                        </Button>
                    </Link>
                </GlassCard>
            </motion.div>
        )
    }

    return (
        <>
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6 sm:space-y-8 pb-20"
            >
                {/* Header Section */}
                <motion.div variants={fadeIn} className="relative">
                    {/* Ambient Background Glow */}
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <Link href="/groups" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-colors duration-300 group mb-6 sm:mb-8 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center mr-3 group-hover:bg-emerald-500/10 transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
                        </div>
                        <span className="tracking-wide">Back to Hub</span>
                    </Link>

                    <div className="mb-6 sm:mb-8 md:mb-10 relative z-10">
                        <div className="flex items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-3 sm:mb-4 text-left break-words leading-tight">
                                    {group.name}
                                    <span className="text-emerald-500 dark:text-banana">.</span>
                                </h1>
                                <div className="text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                                        <Shield className="w-3 h-3" />
                                        Secure Ledger
                                    </div>
                                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span className="hidden sm:inline">Village Banking Terminal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Card */}
                <motion.div variants={itemFadeIn}>
                    <GlassCard className="p-0 overflow-hidden" hover={false}>
                        {/* Hero Identity Section */}
                        <div className="relative border-b border-white/10 dark:border-white/5 p-4 sm:p-6 md:p-8 bg-slate-50/50 dark:bg-white/5">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8">

                                {/* Group Info Wrapper */}
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-start w-full lg:w-auto">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-banana dark:to-yellow-500 flex items-center justify-center text-white dark:text-emerald-950 text-2xl sm:text-3xl md:text-4xl font-black shadow-inner ring-1 ring-white/10">
                                        {group.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-3 sm:space-y-4 pt-0 sm:pt-1 w-full">
                                        <div>
                                            <p className="text-sm sm:text-base font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed">
                                                {group.description || 'A community focused savings circle dedicated to mutual growth and financial stability.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-banana bg-emerald-500/5 dark:bg-banana/5 font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5">
                                                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                {group.region}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5">
                                                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                Cycle {new Date().getFullYear()}
                                            </Badge>
                                            <Badge variant="outline" className="rounded-lg border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-950/20 font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5">
                                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                Verified
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Toolbar */}
                                <div className="w-full lg:w-auto pt-4 lg:pt-0">
                                    <GroupActions group={group} isAdmin={isAdmin} isTreasurer={isTreasurer} />
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid - Premium Financial Style */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200/50 dark:bg-white/5">
                            <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <DollarSign className="w-16 h-16" />
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 sm:mb-3 flex items-center gap-1.5">
                                    Monthly Share
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {formatCurrency(group.monthlyContribution)}
                                </p>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingUp className="w-16 h-16 text-blue-500" />
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 sm:mb-3 flex items-center gap-1.5">
                                    Growth Rate
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                                    {group.interestRate}%
                                    <span className="text-xs sm:text-sm text-muted-foreground font-bold ml-1">p.m.</span>
                                </p>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Users className="w-16 h-16" />
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 sm:mb-3 flex items-center gap-1.5">
                                    Community
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {group._count.members}
                                </p>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 sm:mb-3 flex items-center gap-1.5">
                                    Status
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                                    </div>
                                    <p className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
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
