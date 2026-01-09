'use client'

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
    DialogTrigger,
} from "@/components/ui/dialog"

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
            className="space-y-8 sm:space-y-10 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={fadeIn}>
                <Link href="/groups" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    {t('common.back') || 'Back'}
                </Link>
                <PageHeader
                    title={t('groups.details_title') || 'Command Center'}
                    description={
                        <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                            <Shield className="w-4 h-4 text-blue-600 dark:text-banana" />
                            Group Terminal & Ledger
                        </span>
                    }
                />
            </motion.div>

            {/* Hero Card - The Command Center */}
            <motion.div variants={itemFadeIn}>
                <div className="zen-card overflow-hidden">
                    {/* Top Identity Section */}
                    {/* Top Identity Section */}
                    <div className="relative p-6 sm:p-10">
                        <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                            {/* Group Info Wrapper */}
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start min-w-0">
                                {/* Avatar */}
                                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-banana dark:to-yellow-500 flex items-center justify-center text-white dark:text-blue-950 text-4xl sm:text-5xl font-black shadow-inner">
                                    {group.name.substring(0, 2).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter leading-tight mb-2">
                                            {group.name}
                                        </h2>
                                        <p className="text-sm font-medium text-muted-foreground line-clamp-2 max-w-xl leading-relaxed">
                                            {group.description || 'A community focused savings circle dedicated to mutual growth and financial stability.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="rounded-lg border-blue-500/20 text-blue-600 dark:text-banana bg-blue-500/5 dark:bg-banana/5 font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" />
                                            {group.region}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/20 font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            Cycle {new Date().getFullYear()}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-lg border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-950/20 font-black text-[10px] uppercase tracking-wider px-3 py-1 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 shrink-0 w-full xl:w-auto mt-4 xl:mt-0">
                                {isAdmin && (
                                    <Link href={`/groups/${group.id}/settings`}>
                                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-white/20 hover:bg-white/10">
                                            <Settings className="w-5 h-5 text-muted-foreground" />
                                        </Button>
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="hidden sm:flex h-11 rounded-xl px-5 border-white/20 hover:bg-white/10 font-bold text-xs gap-2">
                                                <Share2 className="w-4 h-4" />
                                                Invite
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md border-none bg-transparent p-0 shadow-none">
                                            <div className="zen-card p-8">
                                                <QRCodeShare groupId={group.id} groupName={group.name} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Link href="/contributions/new" className="flex-1 xl:flex-none">
                                    <Button variant="default" className="w-full xl:w-auto h-11 rounded-xl px-8 font-black text-xs gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                        <DollarSign className="w-4 h-4" />
                                        Contribute
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Divider */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 border-t border-white/10 bg-white/5 dark:bg-black/20">
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <DollarSign className="w-3 h-3" />
                                Share
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-foreground">{formatCurrency(group.monthlyContribution)}</p>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" />
                                Interest
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-banana">{group.interestRate}%</p>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Nodes
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-foreground">{group._count.members}</p>
                        </div>
                        <div className="p-6 space-y-1">
                            <p className="zen-label opacity-50 flex items-center gap-2">
                                <Info className="w-3 h-3 text-emerald-500" />
                                Status
                            </p>
                            <p className="text-xl sm:text-2xl font-black text-emerald-500">Healthy</p>
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
        </motion.div>
    )
}
