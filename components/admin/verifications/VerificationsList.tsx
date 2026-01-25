'use client'

import { useState } from 'react'
import { IdentityVerification, User } from '@prisma/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { reviewVerification } from '@/app/actions/review-verification'
import { GlassCard } from '@/components/ui/GlassCard'
import { Eye, Check, X, Shield, Calendar, MapPin, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type VerificationWithUser = IdentityVerification & {
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'region' | 'role'>
}

interface VerificationsListProps {
    verifications: VerificationWithUser[]
}

export function VerificationsList({ verifications }: VerificationsListProps) {
    const [selected, setSelected] = useState<VerificationWithUser | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [processing, setProcessing] = useState(false)
    const [zoomImage, setZoomImage] = useState<string | null>(null) // For zooming into images

    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!selected) return
        if (action === 'REJECT' && !rejectReason) return toast.error("Please provide a rejection reason")

        setProcessing(true)
        try {
            const result = await reviewVerification({
                targetUserId: selected.userId,
                action,
                reason: rejectReason
            })

            if (!result.success) throw new Error(result.error)

            toast.success(result.message)
            setSelected(null)
            setRejectReason('')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setProcessing(false)
        }
    }

    if (verifications.length === 0) {
        return (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center opacity-80">
                <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-black text-foreground">All Clear!</h3>
                <p className="text-muted-foreground">No pending identity verifications at the moment.</p>
            </GlassCard>
        )
    }

    return (
        <>
            <GlassCard className="p-0 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-black uppercase tracking-wider text-[10px]">User</TableHead>
                            <TableHead className="font-black uppercase tracking-wider text-[10px]">Type</TableHead>
                            <TableHead className="font-black uppercase tracking-wider text-[10px]">Region</TableHead>
                            <TableHead className="font-black uppercase tracking-wider text-[10px]">Submitted</TableHead>
                            <TableHead className="text-right font-black uppercase tracking-wider text-[10px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {verifications.map((item) => (
                            <TableRow key={item.id} className="group hover:bg-white/5">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">{item.user.firstName} {item.user.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{item.user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-bold">
                                        {item.type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        {item.user.region || 'Unknown'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(item.submittedAt), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => setSelected(item)} className="font-bold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </GlassCard>

            {/* Review Modal */}
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-6 rounded-3xl bg-slate-900/95 border-white/10 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Shield className="w-6 h-6 text-blue-500" />
                            Review Identity Request
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Review documents for {selected?.user.firstName} {selected?.user.lastName} <span className="text-muted-foreground mx-1">•</span> {selected?.type.replace('_', ' ')} <span className="text-muted-foreground mx-1">•</span> {selected?.documentNumber}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Front */}
                            <div className="space-y-2">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Front of ID</span>
                                <div
                                    className="aspect-[4/3] rounded-2xl bg-black/40 overflow-hidden border border-white/10 cursor-zoom-in relative group"
                                    onClick={() => selected?.frontImageUrl && setZoomImage(selected.frontImageUrl)}
                                >
                                    <img src={selected?.frontImageUrl} alt="Front" className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* Back */}
                            <div className="space-y-2">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Back of ID</span>
                                <div
                                    className="aspect-[4/3] rounded-2xl bg-black/40 overflow-hidden border border-white/10 cursor-zoom-in relative group"
                                    onClick={() => selected?.backImageUrl && setZoomImage(selected.backImageUrl)}
                                >
                                    {selected?.backImageUrl ? (
                                        <img src={selected.backImageUrl} alt="Back" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-bold">N/A</div>
                                    )}
                                </div>
                            </div>

                            {/* Selfie */}
                            <div className="space-y-2">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                                    Selfie with ID
                                    <Badge variant="outline" className="text-[9px] h-4">MUST MATCH</Badge>
                                </span>
                                <div
                                    className="aspect-[3/4] rounded-2xl bg-black/40 overflow-hidden border border-white/10 cursor-zoom-in relative group"
                                    onClick={() => selected?.selfieImageUrl && setZoomImage(selected.selfieImageUrl)}
                                >
                                    <img src={selected?.selfieImageUrl} alt="Selfie" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </div>

                        {/* Rejection Input */}
                        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-black text-foreground">Decision</h4>
                                <p className="text-sm text-muted-foreground">Approve if all details match the ID and the selfie confirms ownership.</p>
                            </div>

                            <Textarea
                                placeholder="If rejecting, please enter a valid reason for the user to correct..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-black/20 border-white/10 min-h-[100px] resize-none rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 border-t border-white/10 pt-6">
                        <div className="flex items-center gap-2 w-full">
                            <Button
                                variant="destructive"
                                size="lg"
                                className="flex-1 font-black rounded-xl"
                                onClick={() => handleAction('REJECT')}
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 font-black rounded-xl"
                                onClick={() => handleAction('APPROVE')}
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Verify Identity</>}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Zoom Modal */}
            <Dialog open={!!zoomImage} onOpenChange={(open) => !open && setZoomImage(null)}>
                <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-black/95 border-none flex items-center justify-center">
                    {zoomImage && (
                        <img src={zoomImage} alt="Zoom" className="max-w-full max-h-full object-contain" />
                    )}
                    <button
                        onClick={() => setZoomImage(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </DialogContent>
            </Dialog>
        </>
    )
}
