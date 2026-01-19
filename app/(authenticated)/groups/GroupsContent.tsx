'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/ui/stats-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '@/lib/motions'
import {
    Users,
    Shield,
    Plus,
    Settings,
    Activity,
    ChevronRight,
    Search,
    X,
    Link as LinkIcon,
    DollarSign,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GroupsContentProps {
    userGroups: any[]
}

export function GroupsContent({ userGroups }: GroupsContentProps) {
    const { t } = useLanguage()
    const [showStats, setShowStats] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL')

    // Calculate stats
    const totalCommitment = userGroups.reduce((sum, m) => sum + Number(m.group.monthlyContribution || 0), 0)
    const totalMembers = userGroups.reduce((sum, m) => sum + (m.group._count?.members || 0), 0)
    const adminGroups = userGroups.filter(m => m.role === 'ADMIN').length

    // Filter groups
    const filteredGroups = userGroups.filter(membership => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            if (!membership.group.name.toLowerCase().includes(searchLower)) return false
        }

        // Role filter
        if (filter === 'ALL') return true
        if (filter === 'ADMIN') return membership.role === 'ADMIN'
        if (filter === 'MEMBER') return membership.role !== 'ADMIN'
        return true
    })

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4 sm:space-y-6 animate-fade-in"
        >
            {/* Collapsible Header */}
            <motion.div variants={itemFadeIn}>
                <AnimatePresence mode="wait">
                    {showStats ? (
                        <motion.div
                            key="stats-visible"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="zen-card overflow-hidden"
                        >
                            <div className="relative p-3 sm:p-4 md:p-6 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <button
                                        onClick={() => setShowStats(false)}
                                        className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-1 sm:mb-2 text-left break-words">
                                            {t('groups.my_groups')}
                                            <span className="text-supporting">.</span>
                                        </h1>
                                        <p className="text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl break-words">
                                            {t('groups.manage_circles_desc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
                                    <StatsCard
                                        variant="glass"
                                        label={t('groups.total_groups') || 'Total Groups'}
                                        value={userGroups.length.toString()}
                                        icon={Users}
                                        className="bg-white/40 dark:bg-slate-900/40"
                                    />
                                    <StatsCard
                                        variant="glass"
                                        label={t('groups.monthly_commitment') || 'Monthly Commitment'}
                                        value={formatCurrency(totalCommitment)}
                                        icon={DollarSign}
                                        className="bg-white/40 dark:bg-slate-900/40"
                                    />
                                    <StatsCard
                                        variant="glass"
                                        label={t('groups.community_size') || 'Community Size'}
                                        value={totalMembers.toString()}
                                        icon={TrendingUp}
                                        className="bg-white/40 dark:bg-slate-900/40"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-3xl border border-white/20 backdrop-blur-md"
                        >
                            <div>
                                <h1 className="text-lg sm:text-xl font-black text-main tracking-tighter">
                                    {t('groups.my_groups')}
                                    <span className="text-supporting">.</span>
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowStats(true)}
                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-emerald-600 dark:text-supporting hover:scale-110 transition-all"
                            >
                                <LinkIcon className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Groups List with Controls */}
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 overflow-hidden" hover={false}>
                    {/* Search & Filter Bar */}
                    <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-56">
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-9 pr-3 sm:pl-10 sm:pr-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border-none text-base sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500/50"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Search className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex items-center p-1 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
                                {(['ALL', 'ADMIN', 'MEMBER'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                            filter === f
                                                ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                        )}
                                    >
                                        {f === 'ALL' ? 'All Groups' : f === 'ADMIN' ? 'Admin' : 'Member'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Create Group Button */}
                        <Link href="/groups/new" className="w-full sm:w-auto">
                            <Button
                                size="sm"
                                variant="supporting"
                                className="w-full sm:w-auto min-h-[44px] h-11 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-wide">{t('groups.create_group')}</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Groups Grid */}
                    <div className="p-3 bg-slate-50/50 dark:bg-transparent min-h-[400px]">
                        {filteredGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                {filteredGroups.map((membership) => (
                                    <GroupCardVault key={membership.id} membership={membership} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Users}
                                title={searchTerm ? 'No groups found' : t('groups.no_groups')}
                                description={searchTerm ? 'Try adjusting your search or filters.' : t('groups.no_groups_desc')}
                                action={
                                    !searchTerm ? (
                                        <Link href="/groups/new">
                                            <Button size="lg" className="bg-supporting text-supporting-foreground hover:brightness-110 font-black">
                                                <Plus className="w-6 h-6 mr-2" />
                                                {t('groups.create_group')}
                                            </Button>
                                        </Link>
                                    ) : undefined
                                }
                            />
                        )}
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    )
}

// Vault-styled Group Card
function GroupCardVault({ membership }: { membership: any }) {
    const { t } = useLanguage()
    const { group } = membership

    return (
        <div className="relative group p-3 sm:p-4 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-2xl hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
            {/* Overlay Link for Main Card Action */}
            <Link
                href={`/groups/${membership.groupId}`}
                className="absolute inset-0 z-0"
            >
                <span className="sr-only">View {group.name}</span>
            </Link>

            {/* Content Container - pointer-events-none allows clicks to pass through to the overlay link, 
                except for interactive children which must be pointer-events-auto */}
            <div className="relative z-10 pointer-events-none">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/10">
                            <span className="font-black text-emerald-600 dark:text-supporting text-base sm:text-lg">
                                {group.name.substring(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-sm sm:text-base text-foreground group-hover:text-emerald-600 transition-colors truncate mb-1">
                                {group.name}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[8px] uppercase tracking-widest px-1.5 h-4">
                                    {membership.role}
                                </Badge>
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" />
                                    {group._count?.members || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {membership.role === 'ADMIN' && (
                        <div className="pointer-events-auto">
                            <Link
                                href={`/groups/${membership.groupId}/settings`}
                                className="shrink-0 relative z-10"
                            >
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all">
                                    <Settings className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {t('dashboard.monthly_contribution')}
                            </p>
                            <p className="text-base sm:text-lg font-black text-foreground">
                                {formatCurrency(group.monthlyContribution)}
                            </p>
                        </div>
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            membership.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/10 text-yellow-600"
                        )}>
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-supporting" />
                            </div>
                            <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('groups.cycle_status')}
                                </p>
                                <p className="text-xs font-black text-foreground">
                                    Active
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-supporting transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    )
}
