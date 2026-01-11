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
import { JoinGroupQR } from '@/components/groups/JoinGroupQR'
import { GroupCard } from '@/components/groups/GroupCard'
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
            {/* Premium Hero Section */}
            <div className="zen-card overflow-hidden">
                <div className="p-6 sm:p-8 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-3xl font-black tracking-tighter mb-2">
                                        <span className="text-foreground">{t('groups.my_groups')}</span>
                                        <span className="text-blue-600 dark:text-banana">.</span>
                                    </h1>
                                </motion.div>
                                <p className="text-sm font-medium text-muted-foreground opacity-80 leading-relaxed max-w-xl">
                                    {t('groups.manage_circles_desc')} <span className="text-blue-600 dark:text-banana font-bold">{t('groups.track_growth')}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-banana" />
                                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 dark:text-banana">
                                        {userGroups.length} {userGroups.length === 1 ? 'Active Group' : 'Active Groups'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto grid grid-cols-2 md:flex items-center gap-3 mt-4 md:mt-0">
                            <JoinGroupQR />
                            <Link href="/groups/new" className="block w-full md:w-auto">
                                <Button className="w-full md:w-auto relative h-11 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl px-4 sm:px-6 font-black tracking-wide shadow-xl shadow-blue-500/20">
                                    <div className="bg-shimmer-slide" />
                                    <Plus className="w-5 h-5 mr-2" />
                                    <span className="truncate">{t('groups.create_group')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    {userGroups.map((membership) => (
                        <motion.div key={membership.id} variants={itemFadeIn}>
                            <GroupCard membership={membership} />
                        </motion.div>
                    ))}

                    {/* Add New Group Premium Card - Simplified */}
                    <motion.div variants={itemFadeIn}>
                        <Link href="/groups/new" className="block h-full group">
                            <div className="h-full min-h-[300px] rounded-[32px] border border-dashed border-blue-500/20 hover:border-blue-500/40 bg-blue-50/10 dark:bg-white/5 flex flex-col items-center justify-center text-center p-8 transition-all duration-300 hover:bg-blue-50/20 dark:hover:bg-white/10 cursor-pointer relative overflow-hidden group/card">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-banana/10 flex items-center justify-center mb-6 border border-blue-600/10 dark:border-banana/20 group-hover/card:scale-110 transition-transform">
                                    <Plus className="w-8 h-8 text-blue-600 dark:text-banana" />
                                </div>
                                <div className="relative z-10 space-y-2">
                                    <h3 className="text-stat-value text-foreground">{t('groups.create_group')}</h3>
                                    <p className="text-body-primary text-muted-foreground opacity-70 leading-relaxed max-w-[200px] mx-auto">
                                        {t('groups.create_group_desc')}
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
                        <Button variant="default" size="xl" className="shadow-2xl shadow-blue-500/20 px-10">
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
