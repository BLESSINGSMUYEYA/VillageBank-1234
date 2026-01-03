'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupMembersList from '@/components/groups/GroupMembersList'
import GroupContributions from '@/components/groups/GroupContributions'
import GroupLoans from '@/components/groups/GroupLoans'
import GroupActivities from '@/components/groups/GroupActivities'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'
import { itemFadeIn } from '@/lib/motions'
import { Activity, Share2, Users, Receipt, Landmark } from 'lucide-react'

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
        <Tabs defaultValue="standings" className="space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                <TabsList className="bg-transparent p-0 h-auto gap-2 sm:gap-4 shrink-0">
                    <TabsTrigger
                        value="standings"
                        className="rounded-full px-6 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all border border-border/50 data-[state=active]:border-transparent"
                    >
                        Standings
                    </TabsTrigger>
                    <TabsTrigger
                        value="ledger"
                        className="rounded-full px-6 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all border border-border/50 data-[state=active]:border-transparent"
                    >
                        Ledger
                    </TabsTrigger>
                    <TabsTrigger
                        value="activities"
                        className="rounded-full px-6 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all border border-border/50 data-[state=active]:border-transparent"
                    >
                        Activity
                    </TabsTrigger>
                </TabsList>

                {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                        <TabsList className="bg-transparent p-0 h-auto gap-2">
                            <TabsTrigger
                                value="manage"
                                className="rounded-full px-6 h-10 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all border border-border/50"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Invite
                            </TabsTrigger>
                        </TabsList>
                    </div>
                )}
            </div>

            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 overflow-hidden border-none shadow-none bg-transparent" hover={false} gradient={false}>
                    <TabsContent value="standings" className="m-0 border-none outline-none focus-visible:ring-0">
                        <div className="bg-white/40 dark:bg-slate-950/40 rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl">
                            <GroupMembersList
                                members={group.members}
                                groupId={group.id}
                                currentUserRole={currentUserMember?.role}
                                currentUserId={userId}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="ledger" className="m-0 border-none outline-none focus-visible:ring-0 space-y-8">
                        <div className="bg-white/40 dark:bg-slate-950/40 rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl p-2">
                            <Tabs defaultValue="contributions_sub" className="w-full">
                                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl mb-4 ml-4 mt-4">
                                    <TabsTrigger value="contributions_sub" className="rounded-xl px-6 font-bold text-[10px] uppercase">Contributions</TabsTrigger>
                                    <TabsTrigger value="loans_sub" className="rounded-xl px-6 font-bold text-[10px] uppercase">Loans</TabsTrigger>
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
                    </TabsContent>

                    <TabsContent value="activities" className="m-0 border-none outline-none focus-visible:ring-0">
                        <div className="bg-white/40 dark:bg-slate-950/40 rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl">
                            <GroupActivities
                                activities={group.activities}
                            />
                        </div>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="manage" className="m-0 border-none outline-none focus-visible:ring-0">
                            <div className="bg-white/40 dark:bg-slate-950/40 rounded-[32px] overflow-hidden border border-white/20 dark:border-white/10 shadow-xl p-8 sm:p-16">
                                <div className="max-w-md mx-auto">
                                    <QRCodeShare
                                        groupId={group.id}
                                        groupName={group.name}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </GlassCard>
            </motion.div>
        </Tabs>
    )
}
