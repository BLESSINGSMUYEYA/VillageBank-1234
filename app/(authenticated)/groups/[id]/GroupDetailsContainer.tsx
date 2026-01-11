'use client'

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
        <Tabs defaultValue="members" className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                <ZenTabsList>
                    <ZenTabsTrigger value="members">
                        Members
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
            </div>

            <motion.div variants={itemFadeIn}>
                <TabsContent value="members" className="mt-0 border-none outline-none focus-visible:ring-0">
                    <GlassCard className="flex flex-col p-6 overflow-hidden" hover={false}>
                        <GroupMembersList
                            members={group.members}
                            groupId={group.id}
                            currentUserRole={currentUserMember?.role}
                            currentUserId={userId}
                        />
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
                    <GroupActivities
                        activities={group.activities}
                    />
                </TabsContent>


            </motion.div>
        </Tabs>
    )
}
