'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency } from '@/lib/utils'
import {
    Users,
    DollarSign,
    Plus,
    ArrowRight,
    Settings,
    Shield,
    Wallet,
    Calendar,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

interface GroupsContentProps {
    userGroups: any[]
}

export function GroupsContent({ userGroups }: GroupsContentProps) {
    const { t } = useLanguage()

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            <PageHeader
                title={t('groups.my_groups')}
                description={
                    <span className="flex flex-wrap items-center gap-1.5 opacity-80">
                        Manage your savings circles.
                        <span className="text-blue-600 dark:text-banana font-bold">
                            Track contributions, loans, and financial growth.
                        </span>
                    </span>
                }
                action={
                    <Link href="/groups/new">
                        <Button variant="banana" className="shadow-yellow-500/20 group px-6">
                            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                            {t('groups.create_group')}
                        </Button>
                    </Link>
                }
            />

            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    {userGroups.map((membership, i) => (
                        <motion.div key={membership.id} variants={itemFadeIn}>
                            <GlassCard className="flex flex-col h-full overflow-hidden group border-white/20 dark:border-white/10" hover={true}>
                                {/* Header / Identity Section */}
                                <div className="p-6 pb-0 space-y-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                <span className="font-black text-white text-xl">
                                                    {membership.group.name.substring(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-xl text-foreground leading-tight group-hover:text-blue-600 dark:group-hover:text-banana transition-colors truncate">
                                                    {membership.group.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Badge variant={membership.status === 'ACTIVE' ? 'success' : 'warning'}>
                                                        {membership.status}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-60">
                                                        <Shield className="w-3 h-3" />
                                                        {membership.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {membership.role === 'ADMIN' && (
                                            <Link href={`/groups/${membership.groupId}/settings`}>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Stats Bento */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/40 dark:bg-slate-900/40 rounded-2xl p-4 border border-white/50 dark:border-white/5">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1.5 opacity-70">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Members</span>
                                            </div>
                                            <p className="font-black text-2xl text-foreground">
                                                {membership.group._count?.members || 0}
                                            </p>
                                        </div>
                                        <div className="bg-white/40 dark:bg-slate-900/40 rounded-2xl p-4 border border-white/50 dark:border-white/5">
                                            <div className="flex items-center gap-2 text-muted-foreground mb-1.5 opacity-70">
                                                <Wallet className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Target</span>
                                            </div>
                                            <p className="font-black text-2xl text-foreground truncate">
                                                {formatCurrency(membership.group.monthlyContribution)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional Context */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-muted-foreground/80 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" /> Cycle Duration
                                            </span>
                                            <span className="text-xs font-black text-foreground">Next 30 Days</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-muted-foreground/80 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" /> Max Loan Cap
                                            </span>
                                            <span className="text-xs font-black text-foreground">{membership.group.maxLoanMultiplier}x Multiplier</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="p-6 mt-auto">
                                    <Link href={`/groups/${membership.groupId}`} className="block">
                                        <Button variant="outline" className="w-full h-12 rounded-2xl font-black shadow-lg shadow-blue-500/10 group-hover:scale-[1.02] active:scale-[0.98] transition-all border-none">
                                            {t('groups.view_dashboard')}
                                            <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}

                    {/* Add New Group Premium Card */}
                    <motion.div variants={itemFadeIn}>
                        <Link href="/groups/new" className="block h-full group">
                            <div className="h-full min-h-[350px] rounded-[32px] border-2 border-dashed border-blue-500/20 hover:border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/5 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 flex flex-col items-center justify-center text-center p-8 transition-all hover:scale-[1.01] cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform border border-white/20 dark:border-white/5">
                                    <Plus className="w-10 h-10 text-blue-600 dark:text-banana" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-foreground">{t('groups.create_group')}</h3>
                                    <p className="text-sm text-muted-foreground font-bold mt-2 max-w-[200px] mx-auto opacity-70">
                                        Start a new savings circle and empower your community today.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    variants={fadeIn}
                    className="flex flex-col items-center justify-center py-24 px-4 text-center"
                >
                    <div className="relative mb-10">
                        <div className="w-32 h-32 bg-blue-600/10 dark:bg-banana/10 rounded-full flex items-center justify-center animate-pulse-slow">
                            <Users className="w-16 h-16 text-blue-600 dark:text-banana" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 p-2 rounded-2xl shadow-xl rotate-12">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>

                    <h3 className="text-3xl font-black text-foreground mb-3">{t('groups.no_groups')}</h3>
                    <p className="text-muted-foreground mb-10 max-w-sm font-bold opacity-80 leading-relaxed">
                        {t('groups.no_groups_desc')}
                    </p>

                    <Link href="/groups/new">
                        <Button variant="banana" size="xl" className="shadow-2xl shadow-yellow-500/20 px-10">
                            <Plus className="w-6 h-6 mr-2" />
                            {t('groups.create_group')}
                        </Button>
                    </Link>
                </motion.div>
            )}
        </motion.div>
    )
}

function Zap(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
