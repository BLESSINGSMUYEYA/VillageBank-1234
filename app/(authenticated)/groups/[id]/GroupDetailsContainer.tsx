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
            <div className="flex items-center justify-start gap-4 overflow-x-auto scrollbar-hide pb-4 border-b border-slate-200 dark:border-white/5 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                <ZenTabsList>
                    <ZenTabsTrigger value="members" className="snap-start">
                        Members
                        <span className="ml-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 py-0.5 px-2 rounded-full text-[10px] font-black">
                            {group.members.filter((m: any) => m.status === 'ACTIVE').length}
                        </span>
                    </ZenTabsTrigger>
                    <ZenTabsTrigger value="ledger" className="snap-start">
                        Ledger
                    </ZenTabsTrigger>
                    <ZenTabsTrigger value="activities" className="snap-start">
                        Activity
                    </ZenTabsTrigger>
                    <ZenTabsTrigger value="payment-info" className="snap-start">
                        Payment Info
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
                        paymentMethods={group.paymentMethods || []}
                        groupId={group.id}
                        currentUserRole={currentUserMember?.role}
                    />
                </TabsContent>

                <TabsContent value="activities" className="mt-0 border-none outline-none focus-visible:ring-0">
                    <GroupActivities
                        activities={group.activities}
                    />
                </TabsContent>

                <TabsContent value="payment-info" className="mt-0 border-none outline-none focus-visible:ring-0">
                    <GlassCard className="p-6" hover={false}>
                        <h3 className="text-lg font-black mb-6">Payment Accounts</h3>
                        {group.paymentMethods && group.paymentMethods.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.paymentMethods.filter((m: any) => m.isActive).map((method: any) => (
                                    <div key={method.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/5 flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                            method.type === 'AIRTEL_MONEY' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                method.type === 'MPAMBA' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                    "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                        )}>
                                            {method.type === 'BANK_CARD' ? <Activity className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                            {/* Revisit icons if needed. Using generic ones since Wallet/Landmark imports missing here, but I can add them */}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base">{method.accountName}</p>
                                            <p className="text-sm text-muted-foreground font-mono mt-1">{method.accountNumber}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                                                    {method.type === 'BANK_CARD' ? method.bankName : method.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed text-sm">
                                No payment accounts listed contact the treasurer.
                            </div>
                        )}
                    </GlassCard>
                </TabsContent>

            </motion.div>
        </Tabs>
    )
}
