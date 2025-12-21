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
        <Tabs defaultValue="members" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 gap-1">
                <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
                <TabsTrigger value="contributions" className="text-xs sm:text-sm">Contributions</TabsTrigger>
                <TabsTrigger value="loans" className="text-xs sm:text-sm">Loans</TabsTrigger>
                {isAdmin && (
                    <TabsTrigger value="share" className="text-xs sm:text-sm flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        Share
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="members">
                <GroupMembersList
                    members={group.members}
                    groupId={group.id}
                    currentUserRole={currentUserMember?.role}
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
