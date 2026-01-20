'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateGroupDetails } from '@/app/actions/update-group-details'
import { toast } from 'sonner'
import { Loader2, Save, MapPin, Calendar, Mail, Phone } from 'lucide-react'

interface GroupDetailsFormProps {
    group: any
    onSuccess?: () => void
}

export function GroupDetailsForm({ group, onSuccess }: GroupDetailsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateGroupDetails(null, formData)
            if (result.success) {
                toast.success(result.message)
                router.refresh()
                onSuccess?.()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="groupId" value={group.id} />

            {/* Name & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Group Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={group.name}
                        className="bg-white dark:bg-slate-900/50"
                        placeholder="Enter group name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="region" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Region</Label>
                    <Select name="region" defaultValue={group.region}>
                        <SelectTrigger className="bg-white dark:bg-slate-900/50">
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NORTHERN">Northern Region</SelectItem>
                            <SelectItem value="CENTRAL">Central Region</SelectItem>
                            <SelectItem value="SOUTHERN">Southern Region</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={group.description || ''}
                    className="min-h-[80px] bg-white dark:bg-slate-900/50 resize-none"
                    placeholder="Describe your group..."
                />
            </div>

            <div className="h-px bg-slate-200 dark:bg-white/10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Meeting Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        Meeting Details
                    </h3>

                    <div className="space-y-2">
                        <Label htmlFor="meetingFrequency" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</Label>
                        <Select name="meetingFrequency" defaultValue={group.meetingFrequency}>
                            <SelectTrigger className="bg-white dark:bg-slate-900/50">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meetingLocation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="meetingLocation"
                                name="meetingLocation"
                                defaultValue={group.meetingLocation || ''}
                                className="pl-9 bg-white dark:bg-slate-900/50"
                                placeholder="e.g. Community Center"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        Contact Info
                    </h3>

                    <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                defaultValue={group.contactEmail || ''}
                                className="pl-9 bg-white dark:bg-slate-900/50"
                                placeholder="group@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                defaultValue={group.contactPhone || ''}
                                className="pl-9 bg-white dark:bg-slate-900/50"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
