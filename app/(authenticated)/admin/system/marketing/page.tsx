'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Bell, Megaphone, Trash2, Loader2, Plus, Image as ImageIcon, Pencil } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'

interface Announcement {
    id: string
    title: string
    message: string
    link?: string
    imageUrl?: string
    actionText?: string
    target?: string
    targetRegion?: string
    type: string
    isActive: boolean
    createdAt: string
    createdBy: {
        firstName: string
        lastName: string
    }
    stats?: {
        sent: number
        read: number
    }
}

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('broadcast')
    const [loading, setLoading] = useState(false)
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    // Broadcast Form
    const [broadcastTitle, setBroadcastTitle] = useState('')
    const [broadcastMessage, setBroadcastMessage] = useState('')
    const [broadcastImage, setBroadcastImage] = useState('')
    const [broadcastActionText, setBroadcastActionText] = useState('')
    const [targetAudience, setTargetAudience] = useState('ALL')
    const [targetRegion, setTargetRegion] = useState('')

    // Banner Form
    const [editingId, setEditingId] = useState<string | null>(null)
    const [bannerTitle, setBannerTitle] = useState('')
    const [bannerMessage, setBannerMessage] = useState('')
    const [bannerLink, setBannerLink] = useState('')
    const [bannerImage, setBannerImage] = useState('')
    const [bannerButtonText, setBannerButtonText] = useState('')

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    async function fetchAnnouncements() {
        try {
            const res = await fetch('/api/admin/announcements')
            if (res.ok) {
                const data = await res.json()
                setAnnouncements(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function sendBroadcast() {
        if (!broadcastTitle || !broadcastMessage) {
            toast.error('Title and message are required')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: broadcastTitle,
                    message: broadcastMessage,
                    imageUrl: broadcastImage,
                    actionText: broadcastActionText,
                    target: targetAudience,
                    region: targetRegion
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(`Sent to ${data.sent} users!`)
                setBroadcastTitle('')
                setBroadcastMessage('')
                setBroadcastImage('')
                setBroadcastActionText('')
                setTargetAudience('ALL')
                setTargetRegion('')
                fetchAnnouncements()
            } else {
                toast.error(data.error || 'Failed to send')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    function resendBroadcast(announcement: Announcement) {
        setBroadcastTitle(announcement.title)
        setBroadcastMessage(announcement.message)
        setBroadcastImage(announcement.imageUrl || '')
        setBroadcastActionText(announcement.actionText || '')
        setTargetAudience(announcement.target || 'ALL')
        setTargetRegion(announcement.targetRegion || '')

        toast.info('Broadcast form populated with past data')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function editBanner(announcement: Announcement) {
        setEditingId(announcement.id)
        setBannerTitle(announcement.title)
        setBannerMessage(announcement.message)
        setBannerLink(announcement.link || '')
        setBannerImage(announcement.imageUrl || '')
        setBannerButtonText(announcement.actionText || '')

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function cancelEdit() {
        setEditingId(null)
        setBannerTitle('')
        setBannerMessage('')
        setBannerLink('')
        setBannerImage('')
        setBannerButtonText('')
    }

    async function handleBannerSubmit() {
        if (!bannerTitle || !bannerMessage) {
            toast.error('Title and message are required')
            return
        }

        setLoading(true)
        try {
            const url = '/api/admin/announcements'
            const method = editingId ? 'PUT' : 'POST'
            const body = {
                id: editingId, // Include ID for updates
                title: bannerTitle,
                message: bannerMessage,
                link: bannerLink,
                imageUrl: bannerImage,
                actionText: bannerButtonText,
                type: 'BANNER'
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast.success(editingId ? 'Banner updated!' : 'Banner created!')
                cancelEdit()
                fetchAnnouncements()
            } else {
                toast.error('Failed to save banner')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    async function deleteAnnouncement(id: string) {
        if (!confirm('Are you sure you want to remove this item?')) return

        try {
            const res = await fetch(`/api/admin/announcements?id=${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Item removed')
                fetchAnnouncements()
            }
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Marketing Center</h1>
                <p className="text-muted-foreground">Manage push notifications and dashboard banners.</p>
            </div>

            <Tabs defaultValue="broadcast" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="broadcast">
                        <Bell className="w-4 h-4 mr-2" />
                        Push Broadcast
                    </TabsTrigger>
                    <TabsTrigger value="banners">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Banners
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="broadcast" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Push Notification</CardTitle>
                            <CardDescription>
                                This will send a notification to ALL users who have enabled push notifications on their devices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notification Title</label>
                                <Input
                                    placeholder="e.g. Monthly Meeting Reminder"
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message Body</label>
                                <Textarea
                                    placeholder="e.g. Don't forget to bring your contributions this Sunday!"
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notification Image (Optional)</label>
                                <ImageUpload
                                    value={broadcastImage}
                                    onChange={(url) => setBroadcastImage(url)}
                                    onRemove={() => setBroadcastImage('')}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Images will be displayed in the notification shade on supported Android devices.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action Button Text (Optional)</label>
                                <Input
                                    placeholder="e.g. View Details, Pay Now"
                                    value={broadcastActionText}
                                    onChange={(e) => setBroadcastActionText(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Adds a button to the push notification that opens the link.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Audience</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                    >
                                        <option value="ALL">All Users</option>
                                        <option value="REGIONAL_ADMINS">Regional Admins Only</option>
                                        <option value="UNVERIFIED_IDENTITY">Unverified Identity</option>
                                        <option value="REGION">Specific Region</option>
                                    </select>
                                </div>
                                {targetAudience === 'REGION' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Select Region</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={targetRegion}
                                            onChange={(e) => setTargetRegion(e.target.value)}
                                        >
                                            <option value="">Select a region...</option>
                                            <option value="NORTHERN">Northern</option>
                                            <option value="CENTRAL">Central</option>
                                            <option value="SOUTHERN">Southern</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <Button onClick={sendBroadcast} disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Send Broadcast
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Recent Broadcasts</h3>
                            <Button variant="ghost" size="sm" onClick={fetchAnnouncements} disabled={loading}>
                                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        {announcements.filter(a => a.type === 'BROADCAST_ONLY').length === 0 && (
                            <p className="text-muted-foreground text-sm">No recent broadcasts.</p>
                        )}
                        {announcements.filter(a => a.type === 'BROADCAST_ONLY').map((announcement) => (
                            <Card key={announcement.id} className="overflow-hidden">
                                <div className="p-4 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-bold text-sm truncate">{announcement.title}</h4>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-blue-500 hover:text-blue-600"
                                                    onClick={() => resendBroadcast(announcement)}
                                                >
                                                    <Loader2 className="w-3 h-3 mr-1" />
                                                    Resend
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                    onClick={() => deleteAnnouncement(announcement.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{announcement.message}</p>

                                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                            {announcement.target && (
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    Target: {announcement.target} {announcement.targetRegion ? `(${announcement.targetRegion})` : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats Display */}
                                        {announcement.stats && announcement.stats.sent > 0 && (
                                            <div className="mt-3 flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Reach</span>
                                                    <span className="text-xs font-black">{announcement.stats.sent}</span>
                                                </div>
                                                <div className="flex flex-col flex-1 max-w-[200px]">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Engagement</span>
                                                        <span className="text-[10px] font-bold text-emerald-600">
                                                            {Math.round((announcement.stats.read / announcement.stats.sent) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${(announcement.stats.read / announcement.stats.sent) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/60 border-t border-slate-100 dark:border-white/5 pt-2">
                                            <span>Posted by {announcement.createdBy.firstName}</span>
                                            <span>•</span>
                                            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="banners" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create/Edit Banner Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? 'Edit Banner' : 'Create New Banner'}</CardTitle>
                                <CardDescription>Banners appear at the top of the user dashboard.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        placeholder="e.g. New Feature Alert!"
                                        value={bannerTitle}
                                        onChange={(e) => setBannerTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <Textarea
                                        placeholder="Briefly explain what's new..."
                                        value={bannerMessage}
                                        onChange={(e) => setBannerMessage(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Banner Image</label>
                                    <ImageUpload
                                        value={bannerImage}
                                        onChange={(url) => setBannerImage(url)}
                                        onRemove={() => setBannerImage('')}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Link (Optional)</label>
                                        <Input
                                            placeholder="/loans"
                                            value={bannerLink}
                                            onChange={(e) => setBannerLink(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Button Label (Optional)</label>
                                        <Input
                                            placeholder="Learn More"
                                            value={bannerButtonText}
                                            onChange={(e) => setBannerButtonText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleBannerSubmit} disabled={loading} className="flex-1">
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                                        {editingId ? 'Update Banner' : 'Publish Banner'}
                                    </Button>
                                    {editingId && (
                                        <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Banners List */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Active Banners</h3>
                            {announcements.filter(a => a.type === 'BANNER').length === 0 && (
                                <p className="text-muted-foreground text-sm">No active banners.</p>
                            )}
                            {announcements.filter(a => a.type === 'BANNER').map((announcement) => (
                                <Card key={announcement.id} className="overflow-hidden">
                                    <div className="p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-sm truncate">{announcement.title}</h4>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-blue-500 hover:text-blue-600"
                                                        onClick={() => editBanner(announcement)}
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-500 hover:text-red-600"
                                                        onClick={() => deleteAnnouncement(announcement.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{announcement.message}</p>

                                            {/* Stats Display */}
                                            {announcement.stats && announcement.stats.sent > 0 && (
                                                <div className="mt-3 flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Reach</span>
                                                        <span className="text-xs font-black">{announcement.stats.sent}</span>
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <div className="flex justify-between items-end mb-1">
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Engagement</span>
                                                            <span className="text-[10px] font-bold text-emerald-600">
                                                                {Math.round((announcement.stats.read / announcement.stats.sent) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full"
                                                                style={{ width: `${(announcement.stats.read / announcement.stats.sent) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/60 border-t border-slate-100 dark:border-white/5 pt-2">
                                                <span>Posted by {announcement.createdBy.firstName}</span>
                                                <span>•</span>
                                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
