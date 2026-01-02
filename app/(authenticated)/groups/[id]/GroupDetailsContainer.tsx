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
        <Tabs defaultValue="members" className="space-y-6 sm:space-y-8">
            <div className="sticky top-0 z-20 pt-2 pointer-events-none">
                <TabsList className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/40 dark:border-white/10 w-full justify-start h-14 sm:h-16 shadow-xl pointer-events-auto overflow-x-auto no-scrollbar">
                    <TabsTrigger
                        value="members"
                        className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Users className="w-4 h-4" />
                        Members
                    </TabsTrigger>
                    <TabsTrigger
                        value="contributions"
                        className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Receipt className="w-4 h-4" />
                        Contributions
                    </TabsTrigger>
                    <TabsTrigger
                        value="loans"
                        className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Landmark className="w-4 h-4" />
                        Loans
                    </TabsTrigger>
                    <TabsTrigger
                        value="activities"
                        className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Activity className="w-4 h-4" />
                        Activities
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger
                            value="share"
                            className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            <motion.div variants={itemFadeIn}>
                <GlassCard className="p-0 overflow-hidden border-white/20 dark:border-white/10" hover={false}>
                    <TabsContent value="members" className="m-0 border-none outline-none focus-visible:ring-0">
                        <GroupMembersList
                            members={group.members}
                            groupId={group.id}
                            currentUserRole={currentUserMember?.role}
                            currentUserId={userId}
                        />
                    </TabsContent>

                    <TabsContent value="contributions" className="m-0 border-none outline-none focus-visible:ring-0">
                        <GroupContributions
                            contributions={group.contributions}
                            groupId={group.id}
                            currentUserRole={currentUserMember?.role}
                        />
                    </TabsContent>

                    <TabsContent value="loans" className="m-0 border-none outline-none focus-visible:ring-0">
                        <GroupLoans
                            loans={group.loans}
                            groupId={group.id}
                            currentUserRole={currentUserMember?.role}
                            key={group.id}
                        />
                    </TabsContent>

                    <TabsContent value="activities" className="m-0 border-none outline-none focus-visible:ring-0">
                        <GroupActivities
                            activities={group.activities}
                        />
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="share" className="m-0 border-none outline-none focus-visible:ring-0 p-8 sm:p-12">
                            <QRCodeShare
                                groupId={group.id}
                                groupName={group.name}
                            />
                        </TabsContent>
                    )}
                </GlassCard>
            </motion.div>
        </Tabs>
    )
}
