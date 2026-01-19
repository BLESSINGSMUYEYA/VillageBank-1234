'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { createReminder } from '@/lib/reminders'
import { ReminderType } from '@prisma/client'

interface CreateReminderDialogProps {
    userId: string
    trigger?: React.ReactNode
}

export function CreateReminderDialog({ userId, trigger }: CreateReminderDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'GENERAL' as ReminderType,
        description: '',
        link: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.date || !formData.time || !formData.title) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            const datetime = new Date(`${formData.date}T${formData.time}`)

            const result = await createReminder({
                title: formData.title,
                datetime,
                type: formData.type,
                description: formData.description,
                link: formData.link,
                userId
            })

            if (result.success) {
                toast.success('Reminder set successfully')
                setIsOpen(false)
                setFormData({
                    title: '',
                    date: '',
                    time: '',
                    type: 'GENERAL',
                    description: '',
                    link: ''
                })
            } else {
                toast.error('Failed to create reminder')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/20 text-white">
                        <Plus className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set New Reminder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Meeting with Group A"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: ReminderType) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEETING">Meeting</SelectItem>
                                <SelectItem value="PAYMENT">Payment</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">Link (Optional)</Label>
                        <Input
                            id="link"
                            placeholder="https://meet.google.com/..."
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">Description (Optional)</Label>
                        <Textarea
                            id="desc"
                            placeholder="Agenda items..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#1B4332] text-white hover:bg-[#1B4332]/90" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                        Set Reminder
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
