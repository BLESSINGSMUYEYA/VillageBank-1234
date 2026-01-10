'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupMembersList from '@/components/groups/GroupMembersList'
import GroupContributions from '@/components/groups/GroupContributions'
import GroupLoans from '@/components/groups/GroupLoans'
import GroupActivities from '@/components/groups/GroupActivities'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'
import { motion } from 'framer-motion'

import { itemFadeIn } from '@/lib/motions'
import { Share2, Users, Wallet, Activity } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ExcelImportModal } from '@/components/ExcelImportModal'

interface GroupDetailsContainerProps {
    group: any
    userId: string
    isAdmin: boolean
    isTreasurer: boolean
    currentUserMember: any
}

export default function GroupDetailsContainer({
    group,
    userId,
    isAdmin,
    isTreasurer,
    currentUserMember
}: GroupDetailsContainerProps) {
    return (
        <Tabs defaultValue="standings" className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                <TabsList className="bg-transparent p-0 h-auto gap-6 shrink-0">
                    <TabsTrigger
                        value="standings"
                        className="rounded-none px-0 pb-3 h-auto text-tab-label text-muted-foreground data-[state=active]:text-blue-600 dark:data-[state=active]:text-banana data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-banana transition-all hover:text-foreground"
                    >
                        Standings
                        <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-200 py-0.5 px-2 rounded-full text-[9px] font-black">
                            {group.members.filter((m: any) => m.status === 'ACTIVE').length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="ledger"
                        className="rounded-none px-0 pb-3 h-auto text-tab-label text-muted-foreground data-[state=active]:text-blue-600 dark:data-[state=active]:text-banana data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-banana transition-all hover:text-foreground"
                    >
                        Ledger
                    </TabsTrigger>
                    <TabsTrigger
                        value="activities"
                        className="rounded-none px-0 pb-3 h-auto text-tab-label text-muted-foreground data-[state=active]:text-blue-600 dark:data-[state=active]:text-banana data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 dark:data-[state=active]:border-banana transition-all hover:text-foreground"
                    >
                        Activity
                    </TabsTrigger>
                </TabsList>

                {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        <TabsList className="bg-transparent p-0 h-auto gap-2">
                            <TabsTrigger
                                value="manage"
                                className="rounded-none px-0 pb-3 h-auto text-tab-label text-muted-foreground data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-all hover:text-foreground"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Invite
                            </TabsTrigger>
                        </TabsList>
                    </div>
                )}
            </div>

            <motion.div variants={itemFadeIn}>
                <TabsContent value="standings" className="mt-0 border-none outline-none focus-visible:ring-0">
                    <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                        <div className="p-5 sm:p-6 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-card-title text-foreground">
                                        Member Standings
                                    </h2>
                                    <p className="text-body-secondary">
                                        Full roster and role management
                                    </p>
                                </div>
                            </div>
                            <div className="zen-label text-muted-foreground">
                                {group.members.length} Active
                            </div>
                        </div>
                        <div className="p-0">
                            <GroupMembersList
                                members={group.members}
                                groupId={group.id}
                                currentUserRole={currentUserMember?.role}
                                currentUserId={userId}
                            />
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="ledger" className="mt-0 border-none outline-none focus-visible:ring-0 space-y-8">
                    <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                        <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                    <Wallet className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-card-title text-foreground">
                                        Financial Ledger
                                    </h2>
                                    <p className="text-body-secondary">
                                        Contributions and credit records
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {(isAdmin || isTreasurer) && (
                                    <ExcelImportModal groupId={group.id} />
                                )}
                                <div className="zen-label text-muted-foreground">
                                    Synced
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <Tabs defaultValue="contributions_sub" className="w-full">
                                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl mb-4 ml-4 mt-4">
                                    <TabsTrigger value="contributions_sub" className="rounded-xl px-6 text-tab-label">Contributions</TabsTrigger>
                                    <TabsTrigger value="loans_sub" className="rounded-xl px-6 text-tab-label">Loans</TabsTrigger>
                                </TabsList>
                                <TabsContent value="contributions_sub" className="m-0">
                                    <GroupContributions
                                        contributions={group.contributions}
                                        groupId={group.id}
                                        currentUserRole={currentUserMember?.role}
                                    />
                                </TabsContent>
                                <TabsContent value="loans_sub" className="m-0">
                                    <GroupLoans
                                        loans={group.loans}
                                        groupId={group.id}
                                        currentUserRole={currentUserMember?.role}
                                        key={group.id}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </GlassCard>
                </TabsContent>

                <TabsContent value="activities" className="mt-0 border-none outline-none focus-visible:ring-0">
                    <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                        <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-xl">
                                    <Activity className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-card-title text-foreground">
                                        Group Activity
                                    </h2>
                                    <p className="text-body-secondary">
                                        Recent events and updates
                                    </p>
                                </div>
                            </div>
                            <div className="zen-label text-muted-foreground">
                                Real-time
                            </div>
                        </div>
                        <div className="p-0">
                            <GroupActivities
                                activities={group.activities}
                            />
                        </div>
                    </GlassCard>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="manage" className="mt-0 border-none outline-none focus-visible:ring-0">
                        <GlassCard className="flex flex-col p-0 overflow-hidden" hover={false}>
                            <div className="p-5 sm:p-7 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                        <Share2 className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">
                                            Manage Group
                                        </h2>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Admin controls and sharing
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Admin
                                </div>
                            </div>
                            <div className="p-8 sm:p-16">
                                <div className="max-w-md mx-auto">
                                    <QRCodeShare
                                        groupId={group.id}
                                        groupName={group.name}
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    </TabsContent>
                )}
            </motion.div>
        </Tabs>
    )
}
