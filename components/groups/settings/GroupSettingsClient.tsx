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
import { SettingsSidebar } from './SettingsSidebar'
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

    // Standard styling for inputs to match Profile Settings
    const inputClassName = "rounded-2xl bg-white/50 dark:bg-slate-950/30 border-white/20 dark:border-white/5 h-12 sm:h-14 font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 px-4 sm:px-6 transition-all hover:bg-white/60 dark:hover:bg-slate-950/50"

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 pb-20"
        >
            {/* Header */}
            <div>
                <Link href={`/groups/${group.id}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-600 dark:hover:text-banana transition-all duration-300 group mb-6">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300 relative z-10" />
                    Back to Group
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1">
                        <h1 className="hidden md:block text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-main mb-2 text-left break-words">
                            Group Settings
                            <span className="text-banana">.</span>
                        </h1>
                        <p className="hidden md:block text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl">
                            Configure {group.name}&apos;s protocols and governance rules.
                        </p>
                    </div>

                    <div className="relative group rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 p-[1px] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="relative bg-emerald-600 hover:bg-emerald-500 text-white dark:text-white border-0 rounded-2xl h-12 sm:h-14 px-8 font-black tracking-wide overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 relative z-10" />
                                    <span className="relative z-10">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform relative z-10" />
                                    <span className="relative z-10">Save Changes</span>
                                </>
                            )}
                        </Button>
                    </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-2 sticky top-24" hover={false}>
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
                            <GlassCard className="p-0 overflow-hidden" hover={false}>
                                {/* Header Section within Card */}
                                <div className="relative border-b border-white/10 dark:border-white/5 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-banana/10 dark:to-banana/20 flex items-center justify-center text-blue-600 dark:text-banana shadow-inner ring-1 ring-white/20 shrink-0">
                                            {(() => {
                                                const tab = TABS.find(t => t.id === activeTab)
                                                const Icon = tab?.icon
                                                return Icon ? <Icon className="w-5 h-5" /> : null
                                            })()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-foreground tracking-tight">
                                                {TABS.find(t => t.id === activeTab)?.label}
                                            </h2>
                                            <p className="text-xs font-bold text-muted-foreground/70">
                                                {TABS.find(t => t.id === activeTab)?.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6 sm:p-8">
                                    {activeTab === 'general' && (
                                        <div className="space-y-6 sm:space-y-8">
                                            <FormGroup label="Group Name">
                                                <PremiumInput
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className={inputClassName}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Mission Statement">
                                                <Textarea
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    className={`min-h-[140px] ${inputClassName} py-4 h-auto`}
                                                />
                                            </FormGroup>
                                            <FormGroup label="Region">
                                                <Select value={formData.region} onValueChange={(v) => handleInputChange('region', v)}>
                                                    <SelectTrigger className={inputClassName}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-1">
                                                        <SelectItem value="NORTHERN" className="font-bold cursor-pointer rounded-xl py-3 px-4">Northern Region</SelectItem>
                                                        <SelectItem value="CENTRAL" className="font-bold cursor-pointer rounded-xl py-3 px-4">Central Region</SelectItem>
                                                        <SelectItem value="SOUTHERN" className="font-bold cursor-pointer rounded-xl py-3 px-4">Southern Region</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormGroup>
                                        </div>
                                    )}

                                    {activeTab === 'economics' && (
                                        <div className="space-y-6 sm:space-y-8">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormGroup label="Monthly Share">
                                                    <PremiumInput
                                                        type="number"
                                                        prefix="MWK"
                                                        value={formData.monthlyContribution}
                                                        onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Social Fund">
                                                    <PremiumInput
                                                        type="number"
                                                        prefix="MWK"
                                                        value={formData.socialFundAmount}
                                                        onChange={(e) => handleInputChange('socialFundAmount', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Interest Rate (%)">
                                                    <PremiumInput
                                                        type="number"
                                                        suffix="%"
                                                        value={formData.interestRate}
                                                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Max Loan Multiplier">
                                                    <PremiumInput
                                                        type="number"
                                                        suffix="x"
                                                        value={formData.maxLoanMultiplier}
                                                        onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'governance' && (
                                        <div className="space-y-6 sm:space-y-8">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <FormGroup label="Late Contribution Fee">
                                                    <PremiumInput
                                                        type="number"
                                                        prefix="MWK"
                                                        value={formData.lateContributionFee}
                                                        onChange={(e) => handleInputChange('lateContributionFee', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Missed Meeting Fine">
                                                    <PremiumInput
                                                        type="number"
                                                        prefix="MWK"
                                                        value={formData.missedMeetingFine}
                                                        onChange={(e) => handleInputChange('missedMeetingFine', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Loan Grace Period (Days)">
                                                    <PremiumInput
                                                        type="number"
                                                        value={formData.loanGracePeriodDays}
                                                        onChange={(e) => handleInputChange('loanGracePeriodDays', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                                <FormGroup label="Loan Default Penalty">
                                                    <PremiumInput
                                                        type="number"
                                                        prefix="MWK"
                                                        value={formData.penaltyAmount}
                                                        onChange={(e) => handleInputChange('penaltyAmount', e.target.value)}
                                                        className={inputClassName}
                                                    />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'danger' && (
                                        <div className="space-y-6">
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 sm:p-8">
                                                <h4 className="font-black text-red-600 mb-2">Delete Group</h4>
                                                <p className="text-sm font-medium text-red-600/70 mb-6 max-w-lg">
                                                    Permanently remove this group, all member records, and financial history. This action cannot be undone and requires Treasurer confirmation.
                                                </p>
                                                <Button
                                                    variant="destructive"
                                                    className="w-full sm:w-auto font-black rounded-xl h-12 px-8"
                                                    onClick={() => setDeleteDialogOpen(true)}
                                                >
                                                    Delete Group
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
