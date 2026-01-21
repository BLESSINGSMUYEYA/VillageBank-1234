'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/GlassCard'
import { Users, Calendar, DollarSign, UserPlus, Shield, Clock, LogIn, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '@/lib/motions'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface SharedGroupData {
    share: {
        sharedBy: {
            firstName: string
            lastName: string
        }
        permissions: string
        expiresAt?: string
        currentUses: number
    }
    group: {
        id: string
        name: string
        description?: string
        _count: {
            members: number
            contributions: number
        }
        monthlyContribution?: number
        members?: Array<{
            user: {
                firstName?: string
                lastName?: string
            }
        }>
    }
}

export default function PublicSharedGroupPage() {
    const params = useParams()
    const router = useRouter()
    const [groupData, setGroupData] = useState<SharedGroupData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [joining, setJoining] = useState(false)
    const [hasRequested, setHasRequested] = useState(false)

    useEffect(() => {
        const fetchSharedGroup = async () => {
            try {
                const response = await fetch(`/api/shared/${params.token}`)
                const data = await response.json()

                if (response.ok) {
                    setGroupData(data)
                } else {
                    setError(data.error || 'Failed to load shared group')
                }
            } catch (err) {
                console.error('Failed to load shared group:', err)
                setError('Failed to load shared group')
            } finally {
                setLoading(false)
            }
        }

        // Check if user is authenticated
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/session')
                const data = await res.json()
                setIsAuthenticated(!!data?.userId)
            } catch {
                setIsAuthenticated(false)
            }
        }

        if (params.token) {
            fetchSharedGroup()
            checkAuth()
        }
    }, [params.token])

    const requestToJoin = async () => {
        if (!groupData || joining || hasRequested) return

        setJoining(true)
        try {
            const response = await fetch('/api/groups/request-join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: groupData.group.id,
                    shareToken: params.token,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send join request')
            }

            toast.success('Join request sent successfully!')
            setHasRequested(true)
        } catch (err) {
            console.error('Error requesting to join:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to send join request')
        } finally {
            setJoining(false)
        }
    }

    const handleJoinClick = () => {
        if (isAuthenticated) {
            requestToJoin()
        } else {
            // Store the current URL to redirect back after login
            const returnUrl = encodeURIComponent(`/shared/${params.token}`)
            router.push(`/login?redirect=${returnUrl}`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground font-medium">Loading group info...</p>
                </div>
            </div>
        )
    }

    if (error || !groupData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                <GlassCard className="max-w-md w-full p-8 text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-foreground mb-2">Link Unavailable</h1>
                    <p className="text-muted-foreground mb-6">{error || 'This share link is invalid or has expired.'}</p>
                    <Link href="/">
                        <Button variant="primary" className="w-full">Go to Homepage</Button>
                    </Link>
                </GlassCard>
            </div>
        )
    }

    const { share, group } = groupData
    const canRequestJoin = share.permissions !== 'VIEW_ONLY'

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Simple Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/ubank-logo.png" alt="uBank" className="w-8 h-8" />
                        <span className="font-black text-lg">uBank</span>
                    </Link>
                    {!isAuthenticated && (
                        <Link href="/login">
                            <Button variant="outline" size="sm" className="font-bold">
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="max-w-3xl mx-auto space-y-6"
                >
                    {/* Group Header */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">{group.name}</h1>
                                    {group.description && (
                                        <p className="text-muted-foreground mt-2">{group.description}</p>
                                    )}
                                </div>
                                <Badge variant="secondary" className="self-start shrink-0 text-xs font-bold">
                                    Shared by {share.sharedBy.firstName} {share.sharedBy.lastName}
                                </Badge>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Stats */}
                    <motion.div variants={itemFadeIn} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <GlassCard className="p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">{group._count.members}</p>
                                    <p className="text-xs text-muted-foreground">Members</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    {group.monthlyContribution ? (
                                        <>
                                            <p className="text-2xl font-black text-foreground">{formatCurrency(group.monthlyContribution)}</p>
                                            <p className="text-xs text-muted-foreground">Monthly</p>
                                        </>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Info hidden</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-6 col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-xl">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">{group._count.contributions}</p>
                                    <p className="text-xs text-muted-foreground">Contributions</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Share Info & Action */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-bold">Access Level</span>
                                        <Badge variant="outline" className="text-xs">
                                            {share.permissions === 'VIEW_ONLY' && 'View Only'}
                                            {share.permissions === 'REQUEST_JOIN' && 'Can Request Join'}
                                            {share.permissions === 'LIMITED_ACCESS' && 'Limited Access'}
                                            {share.permissions === 'FULL_PREVIEW' && 'Full Preview'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {share.expiresAt
                                            ? `Expires ${new Date(share.expiresAt).toLocaleDateString()}`
                                            : 'Never expires'}
                                    </div>
                                </div>

                                {canRequestJoin && !hasRequested && (
                                    <Button
                                        onClick={handleJoinClick}
                                        disabled={joining}
                                        size="lg"
                                        className="w-full sm:w-auto font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg"
                                    >
                                        {joining ? (
                                            <>
                                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                Sending Request...
                                            </>
                                        ) : isAuthenticated ? (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Request to Join
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Sign In to Join
                                            </>
                                        )}
                                    </Button>
                                )}

                                {hasRequested && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                        <CheckCircle className="w-5 h-5" />
                                        Request Sent Successfully
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Members Preview */}
                    {group.members && group.members.length > 0 && (
                        <motion.div variants={itemFadeIn}>
                            <GlassCard className="p-6 sm:p-8">
                                <h3 className="font-black text-lg mb-4">Members ({group._count.members})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {group.members.map((member, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                                                {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{member.user.firstName} {member.user.lastName}</p>
                                                <p className="text-xs text-muted-foreground">Member</p>
                                            </div>
                                        </div>
                                    ))}
                                    {group._count.members > group.members.length && (
                                        <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                            <p className="text-sm text-muted-foreground">
                                                +{group._count.members - group.members.length} more
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Permission Info */}
                    <motion.div variants={itemFadeIn}>
                        <GlassCard className="p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {share.permissions === 'VIEW_ONLY' && 'This link allows you to view basic group information only.'}
                                {share.permissions === 'REQUEST_JOIN' && 'This link allows you to view group info and request to join.'}
                                {share.permissions === 'LIMITED_ACCESS' && 'This link provides limited access to group features.'}
                                {share.permissions === 'FULL_PREVIEW' && 'This link provides a full preview of the group.'}
                            </p>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
