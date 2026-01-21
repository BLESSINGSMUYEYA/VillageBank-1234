'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Settings,
    Share2,
    DollarSign,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { QRCodeShare } from '@/components/sharing/QRCodeShare'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { RecordCashModal } from '@/components/groups/RecordCashModal'
import { ContributionModal } from '@/components/contributions/ContributionModal'
import { GroupDetailsForm } from './settings/GroupDetailsForm'

interface GroupActionsProps {
    group: any
    isAdmin: boolean
    isTreasurer: boolean
}

export default function GroupActions({
    group,
    isAdmin,
    isTreasurer
}: GroupActionsProps) {
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <div className="flex flex-col gap-3 w-full xl:w-auto mt-2 xl:mt-0 xl:min-w-[300px]">
            {/* Settings Dialog - Now includes policies */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Group Settings</DialogTitle>
                        <DialogDescription>
                            Manage your group's profile, financial settings, and policies.
                        </DialogDescription>
                    </DialogHeader>
                    <GroupDetailsForm group={group} onSuccess={() => setIsSettingsOpen(false)} />
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-2 gap-3">
                {isAdmin && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 rounded-xl px-4 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-xs gap-2 group">
                                <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="truncate">Invite</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            overlayClassName="bg-black/10 backdrop-blur-sm"
                            className="sm:max-w-md border-none bg-transparent p-0 shadow-none max-h-[85vh] overflow-y-auto no-scrollbar"
                        >
                            <DialogTitle className="sr-only">Share Group Access Card</DialogTitle>
                            <DialogDescription className="sr-only">
                                Scan this QR code to join the group or share the invite link.
                            </DialogDescription>
                            <GlassCard className="p-8" hover={false}>
                                <QRCodeShare groupId={group.id} groupName={group.name} />
                            </GlassCard>
                        </DialogContent>
                    </Dialog>
                )}

                {isAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full h-12 rounded-xl px-4 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-xs gap-2 group"
                    >
                        <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="truncate">Settings</span>
                    </Button>
                )}

                {/* Always render RecordCashModal, but only show the trigger button conditionally */}
                {(isAdmin || isTreasurer) && (
                    <RecordCashModal groupId={group.id} members={group.members} />
                )}

                <Button
                    onClick={() => setIsContributionModalOpen(true)}
                    className={`relative h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs gap-2 overflow-hidden border-0 ${isAdmin ? "col-span-2" : ""}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                    <DollarSign className="w-4 h-4 relative z-10" />
                    <span className="truncate relative z-10">Make Contribution</span>
                </Button>
            </div>

            {/* Always render ContributionModal - control visibility with isOpen prop */}
            <ContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            />
        </div>
    )
}
