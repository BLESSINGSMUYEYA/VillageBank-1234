'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings, Sliders, Gavel, AlertTriangle,
    Save, ArrowLeft, Loader2, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { SettingsSidebar } from './SettingsSidebar'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { staggerContainer, fadeIn, itemFadeIn } from '@/lib/motions'

interface GroupSettingsClientProps {
    group: any
    userId: string
}

const TABS = [
    { id: 'general', label: 'General', icon: Settings, description: 'Identity & Details' },
    { id: 'economics', label: 'Economics', icon: Sliders, description: 'Financial Rules' },
    { id: 'governance', label: 'Governance', icon: Gavel, description: 'Penalties & Fees' },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, description: 'Delete Group' },
]

export function GroupSettingsClient({ group, userId }: GroupSettingsClientProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('general')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const [formData, setFormData] = useState({
        name: group.name,
        description: group.description || '',
        region: group.region,
        meetingFrequency: group.meetingFrequency,
        monthlyContribution: group.monthlyContribution.toString(),
        socialFundAmount: group.socialFundAmount.toString(),
        maxLoanMultiplier: group.maxLoanMultiplier.toString(),
        interestRate: group.interestRate.toString(),
        loanInterestType: group.loanInterestType,
        penaltyAmount: group.penaltyAmount.toString(),
        lateContributionFee: (group.lateContributionFee || 0).toString(),
        lateMeetingFine: group.lateMeetingFine.toString(),
        missedMeetingFine: group.missedMeetingFine.toString(),
        contributionDueDay: group.contributionDueDay.toString(),
        contributionDeadlineType: group.contributionDeadlineType || 'MONTHLY',
        loanGracePeriodDays: group.loanGracePeriodDays.toString(),
        isActive: group.isActive
    })

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError('')
            setSuccess(false)

            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    region: formData.region,
                    meetingFrequency: formData.meetingFrequency,
                    monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
                    socialFundAmount: parseFloat(formData.socialFundAmount) || 0,
                    maxLoanMultiplier: parseFloat(formData.maxLoanMultiplier) || 1,
                    interestRate: parseFloat(formData.interestRate) || 0,
                    loanInterestType: formData.loanInterestType,
                    penaltyAmount: parseFloat(formData.penaltyAmount) || 0,
                    lateContributionFee: parseFloat(formData.lateContributionFee) || 0,
                    lateMeetingFine: parseFloat(formData.lateMeetingFine) || 0,
                    missedMeetingFine: parseFloat(formData.missedMeetingFine) || 0,
                    contributionDueDay: parseInt(formData.contributionDueDay) || 5,
                    contributionDeadlineType: formData.contributionDeadlineType,
                    loanGracePeriodDays: parseInt(formData.loanGracePeriodDays) || 0,
                    isActive: formData.isActive
                }),
            })

            if (!response.ok) throw new Error('Failed to update settings')

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const res = await fetch(`/api/groups/${group.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete group')
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed')
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 pb-20"
        >
            {/* Header */}
            <div>
                <Link href={`/groups/${group.id}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Group
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <PageHeader
                        title="Group Settings"
                        description={`Configure ${group.name}'s protocols`}
                    />
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl flex items-center gap-3 py-4">
                        <CheckCircle2 className="h-5 w-5" />
                        <AlertDescription>Settings saved successfully.</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {error && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-600 font-bold rounded-2xl flex items-center gap-3 py-4">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-2" hover={false}>
                        <SettingsSidebar
                            items={TABS}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </GlassCard>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GlassCard className="p-6 sm:p-8" hover={false}>
                                {activeTab === 'general' && (
                                    <div className="space-y-8">
                                        <SectionHeader title="Group Identity" icon={Settings} />
                                        <FormGroup label="Group Name">
                                            <PremiumInput
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Mission Statement">
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                className="bg-white/50 dark:bg-black/20 border-white/20 rounded-2xl font-bold p-6 focus:ring-blue-500 min-h-[140px]"
                                            />
                                        </FormGroup>
                                        <FormGroup label="Region">
                                            <Select value={formData.region} onValueChange={(v) => handleInputChange('region', v)}>
                                                <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                                                    <SelectItem value="NORTHERN">Northern</SelectItem>
                                                    <SelectItem value="CENTRAL">Central</SelectItem>
                                                    <SelectItem value="SOUTHERN">Southern</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormGroup>
                                    </div>
                                )}

                                {activeTab === 'economics' && (
                                    <div className="space-y-8">
                                        <SectionHeader title="Financial Architecture" icon={Sliders} />
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormGroup label="Monthly Share">
                                                <PremiumInput
                                                    type="number"
                                                    prefix="MWK"
                                                    value={formData.monthlyContribution}
                                                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Social Fund">
                                                <PremiumInput
                                                    type="number"
                                                    prefix="MWK"
                                                    value={formData.socialFundAmount}
                                                    onChange={(e) => handleInputChange('socialFundAmount', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Interest Rate (%)">
                                                <PremiumInput
                                                    type="number"
                                                    suffix="%"
                                                    value={formData.interestRate}
                                                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Max Loan Multiplier">
                                                <PremiumInput
                                                    type="number"
                                                    suffix="x"
                                                    value={formData.maxLoanMultiplier}
                                                    onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'governance' && (
                                    <div className="space-y-8">
                                        <SectionHeader title="Rules & Penalties" icon={Gavel} />
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FormGroup label="Late Contribution Fee">
                                                <PremiumInput
                                                    type="number"
                                                    prefix="MWK"
                                                    value={formData.lateContributionFee}
                                                    onChange={(e) => handleInputChange('lateContributionFee', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Missed Meeting Fine">
                                                <PremiumInput
                                                    type="number"
                                                    prefix="MWK"
                                                    value={formData.missedMeetingFine}
                                                    onChange={(e) => handleInputChange('missedMeetingFine', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Loan Grace Period (Days)">
                                                <PremiumInput
                                                    type="number"
                                                    value={formData.loanGracePeriodDays}
                                                    onChange={(e) => handleInputChange('loanGracePeriodDays', e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Loan Default Penalty">
                                                <PremiumInput
                                                    type="number"
                                                    prefix="MWK"
                                                    value={formData.penaltyAmount}
                                                    onChange={(e) => handleInputChange('penaltyAmount', e.target.value)}
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'danger' && (
                                    <div className="space-y-8">
                                        <SectionHeader title="Danger Zone" icon={AlertTriangle} className="text-red-500" />
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                                            <h4 className="font-bold text-red-600 mb-2">Delete Group</h4>
                                            <p className="text-sm text-red-600/70 mb-6">
                                                Permanently remove this group and all its data. This action cannot be undone.
                                            </p>
                                            <Button
                                                variant="destructive"
                                                className="w-full sm:w-auto"
                                                onClick={() => setDeleteDialogOpen(true)}
                                            >
                                                Delete Group
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-white/20 rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the group <strong>{group.name}</strong> and remove all data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDelete(); }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Group'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
