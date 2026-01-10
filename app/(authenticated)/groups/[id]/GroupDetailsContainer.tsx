import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger, ZenTabsList, ZenTabsTrigger } from '@/components/ui/tabs'
import GroupMembersList from '@/components/groups/GroupMembersList'

import GroupActivities from '@/components/groups/GroupActivities'
import GroupFinancials from '@/components/groups/GroupFinancials'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'
import { motion } from 'framer-motion'
import { itemFadeIn } from '@/lib/motions'
import { Share2, Users, Activity, Search } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

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
                <ZenTabsList>
                    <ZenTabsTrigger value="standings">
                        Standings
                        <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-200 py-0.5 px-2 rounded-full text-[9px] font-black">
                            {group.members.filter((m: any) => m.status === 'ACTIVE').length}
                        </span>
                    </ZenTabsTrigger>
                    <ZenTabsTrigger value="ledger">
                        Ledger
                    </ZenTabsTrigger>
                    <ZenTabsTrigger value="activities">
                        Activity
                    </ZenTabsTrigger>
                </ZenTabsList>

                {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Header Action: Invite / Manage */}
                        <a href={`/groups/${group.id}/settings`}>
                            <GlassCard className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/20" hover={true}>
                                <Share2 className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Manage</span>
                            </GlassCard>
                        </a>
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
                    <GroupFinancials
                        contributions={group.contributions}
                        loans={group.loans}
                        groupId={group.id}
                        currentUserRole={currentUserMember?.role}
                    />
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


            </motion.div>
        </Tabs>
    )
}
