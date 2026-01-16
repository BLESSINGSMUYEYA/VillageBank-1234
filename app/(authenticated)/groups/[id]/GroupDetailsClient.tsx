'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Settings,
    ArrowLeft,
    TrendingUp,
    MapPin,
    Calendar,
    Users,
    Shield,
    DollarSign,
    Share2,
    Info
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import GroupDetailsContainer from './GroupDetailsContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { GlassCard } from '@/components/ui/GlassCard'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { RecordCashModal } from '@/components/groups/RecordCashModal'
import { ContributionModal } from '@/components/contributions/ContributionModal'

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
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8 sm:space-y-10 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={fadeIn}>
                <Link href="/groups" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    {t('common.back') || 'Back'}
                </Link>
                <PageHeader
                    title={t('groups.details_title') || 'Group Details'}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-banana" />
                            Group Terminal & Ledger
                        </span>
                    }
                />
            </motion.div>

            {/* Hero Card - Group Overview */}
            <motion.div variants={itemFadeIn}>
                <div className="zen-card overflow-hidden">
                    {/* Top Identity Section */}
                    <div className="p-6 sm:p-8 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                        <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                            {/* Group Info Wrapper */}
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start min-w-0 w-full xl:w-auto">
                                {/* Avatar */}
                                <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-banana dark:to-yellow-500 flex items-center justify-center text-white dark:text-blue-950 text-3xl sm:text-4xl font-black shadow-inner">
                                    {group.name.substring(0, 2).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="space-y-4 pt-1 sm:pt-2 w-full">
                                    <div>
                                        <div className="flex items-start justify-between gap-4">
                                            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-tight mb-2">
                                                {group.name}
                                            </h2>
                                            {/* Mobile Settings Button (Admin Only) - Absolute or top right relative */}
                                            {isAdmin && (
                                                <Link href={`/groups/${group.id}/settings`} className="xl:hidden">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">
                                                        <Settings className="w-5 h-5 text-muted-foreground" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed">
                                            {group.description || 'A community focused savings circle dedicated to mutual growth and financial stability.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="rounded-lg border-blue-500/20 text-blue-600 dark:text-banana bg-blue-500/5 dark:bg-banana/5 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" />
                                            {group.region}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            Cycle {new Date().getFullYear()}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-lg border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-950/20 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                                {/* Desktop Settings (Admin Only) */}
                                {isAdmin && (
                                    <div className="hidden xl:flex justify-end mb-2">
                                        <Link href={`/groups/${group.id}/settings`}>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
                                                <Settings className="w-4 h-4 mr-2" />
                                                Settings
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 w-full xl:w-auto">
                                    {isAdmin && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="h-11 rounded-xl px-4 sm:px-6 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 font-bold text-xs gap-2">
                                                    <Share2 className="w-4 h-4" />
                                                    <span className="truncate">Invite</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent
                                                overlayClassName="bg-black/10 backdrop-blur-xs"
                                                className="sm:max-w-md border-none bg-transparent p-0 shadow-none max-h-[85vh] overflow-y-auto no-scrollbar"
                                            >
                                                <DialogTitle className="sr-only">Share Group Access Card</DialogTitle>
                                                <div className="zen-card p-8">
                                                    <QRCodeShare groupId={group.id} groupName={group.name} />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {(isAdmin || isTreasurer) && (
                                        <RecordCashModal groupId={group.id} members={group.members} />
                                    )}

                                    <div className={isAdmin || (!isTreasurer) ? "col-span-2" : ""}>
                                        <Button
                                            onClick={() => setIsContributionModalOpen(true)}
                                            variant="primary"
                                            className="w-full h-11 rounded-xl px-4 sm:px-8 font-black text-xs gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all bg-blue-600 hover:bg-blue-500 text-white"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            <span className="truncate">Contribute</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Cleaner Layout matching Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white/5 dark:bg-black/5">
                        <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3" />
                                Share
                            </p>
                            <p className="text-lg sm:text-2xl font-black text-foreground tracking-tight">{formatCurrency(group.monthlyContribution)}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" />
                                Interest
                            </p>
                            <p className="text-lg sm:text-2xl font-black text-blue-600 dark:text-banana tracking-tight">{group.interestRate}%</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                <Users className="w-3 h-3" />
                                Nodes
                            </p>
                            <p className="text-lg sm:text-2xl font-black text-foreground tracking-tight">{group._count.members}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 flex flex-col justify-between group hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-2 flex items-center gap-1.5">
                                <Shield className="w-3 h-3 text-emerald-500" />
                                Status
                            </p>
                            <p className="text-lg sm:text-2xl font-black text-emerald-500 tracking-tight">Healthy</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Areas (Tabs) */}
            <motion.div variants={itemFadeIn}>
                <GroupDetailsContainer
                    group={group}
                    userId={userId}
                    isAdmin={isAdmin}
                    isTreasurer={isTreasurer}
                    currentUserMember={currentUserMember}
                />
            </motion.div>
            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </motion.div>
    )
}
