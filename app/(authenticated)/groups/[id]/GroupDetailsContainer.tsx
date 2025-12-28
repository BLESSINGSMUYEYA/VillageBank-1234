'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Share2 } from 'lucide-react'
import GroupMembersList from '@/components/groups/GroupMembersList'
import GroupContributions from '@/components/groups/GroupContributions'
import GroupLoans from '@/components/groups/GroupLoans'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'

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
        <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="flex w-full justify-start overflow-x-auto bg-muted p-1 rounded-xl no-scrollbar space-x-2">
                <TabsTrigger value="members" className="flex-1 min-w-[100px] rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">Members</TabsTrigger>
                <TabsTrigger value="contributions" className="flex-1 min-w-[120px] rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">Contributions</TabsTrigger>
                <TabsTrigger value="loans" className="flex-1 min-w-[100px] rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">Loans</TabsTrigger>
                {isAdmin && (
                    <TabsTrigger value="share" className="flex-1 min-w-[100px] rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center gap-1">
                        <Share2 className="h-4 w-4" />
                        Share
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="members">
                <GroupMembersList
                    members={group.members}
                    groupId={group.id}
                    currentUserRole={currentUserMember?.role}
                    currentUserId={userId}
                />
            </TabsContent>

            <TabsContent value="contributions">
                <GroupContributions
                    contributions={group.contributions}
                    groupId={group.id}
                    currentUserRole={currentUserMember?.role}
                />
            </TabsContent>

            <TabsContent value="loans">
                <GroupLoans
                    loans={group.loans}
                    groupId={group.id}
                    currentUserRole={currentUserMember?.role}
                    key={group.id}
                />
            </TabsContent>

            {isAdmin && (
                <TabsContent value="share">
                    <QRCodeShare
                        groupId={group.id}
                        groupName={group.name}
                    />
                </TabsContent>
            )}
        </Tabs>
    )
}
