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
    TrendingUp,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { JoinGroupQR } from '@/components/groups/JoinGroupQR'

interface GroupsContentProps {
    userGroups: any[]
    userRole?: string
    pendingApprovalsCount?: number
}

export function GroupsContent({ userGroups, userRole, pendingApprovalsCount = 0 }: GroupsContentProps) {
    const { t } = useLanguage()
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

            {/* Groups List with Controls */}
            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 overflow-hidden bg-slate-100/80 dark:bg-black/40 border-slate-200/60 dark:border-white/5 shadow-md" hover={false}>
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
                                    className="w-full h-10 pl-9 pr-3 sm:pl-10 sm:pr-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border-none text-base sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500/50"
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
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                            filter === f
                                                ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                        )}
                                    >
                                        {f === 'ALL' ? 'All Circles' : f === 'ADMIN' ? 'Admin' : 'Member'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Create Group Button */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <JoinGroupQR />
                            <Link href="/groups/new" className="w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    variant="banana"
                                    className="w-full sm:w-auto min-h-[44px] h-11 font-bold rounded-xl shadow-lg shadow-yellow-500/20"
                                >
                                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wide">{t('groups.create_group')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Groups Grid */}
                    <div className="p-3 bg-transparent min-h-[400px]">
                        {filteredGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                {filteredGroups.map((membership) => (
                                    <GroupCardVault key={membership.id} membership={membership} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Users}
                                title={searchTerm ? 'No circles found' : t('groups.no_groups')}
                                description={searchTerm ? 'Try adjusting your search or filters.' : t('groups.no_groups_desc')}
                                action={
                                    !searchTerm ? (
                                        <Link href="/groups/new">
                                            <Button size="lg" variant="banana" className="shadow-lg shadow-yellow-500/20 font-black">
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
        <div className={cn(
            "relative group p-3 sm:p-4 border-none rounded-2xl shadow-sm ring-1 transition-all duration-300",
            membership.status === 'PENDING'
                ? "bg-slate-50/80 dark:bg-white/5 ring-slate-200 dark:ring-white/10 opacity-80"
                : "bg-white dark:bg-slate-800 ring-black/5 hover:shadow-lg hover:ring-emerald-500/50 dark:hover:ring-emerald-500/50 hover:-translate-y-1"
        )}>
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
                            <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-600 transition-colors truncate mb-1">
                                {group.name}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[8px] uppercase tracking-widest px-1.5 h-4">
                                    {membership.role}
                                </Badge>
                                <span className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" />
                                    {group._count?.members || 0}
                                </span>
                                {membership.status === 'PENDING' && (
                                    <Badge variant="banana" className="text-[8px] uppercase tracking-widest px-1.5 h-4 flex items-center gap-1">
                                        <Clock className="w-2 h-2" />
                                        Pending Approval
                                    </Badge>
                                )}
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
                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                                {t('dashboard.monthly_contribution')}
                            </p>
                            <p className="text-base sm:text-lg font-bold text-foreground">
                                {formatCurrency(group.monthlyContribution)}
                            </p>
                        </div>
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            membership.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/20 text-yellow-600 animate-pulse"
                        )}>
                            {membership.status === 'ACTIVE' ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-supporting" />
                            </div>
                            <div>
                                <p className="text-[8px] font-medium text-slate-400 uppercase tracking-wider">
                                    {t('groups.cycle_status')}
                                </p>
                                <p className="text-xs font-medium text-foreground">
                                    {membership.status === 'ACTIVE' ? 'Active' : 'Awaiting Admin'}
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
