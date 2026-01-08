'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Save, Landmark, ShieldQuestion, Loader2, CheckCircle2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
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

interface Group {
  id: string
  name: string
  description?: string
  region: string
  meetingFrequency: string
  monthlyContribution: number
  socialFundAmount: number
  maxLoanMultiplier: number
  interestRate: number
  loanInterestType: string
  penaltyAmount: number
  lateContributionFee: number
  lateMeetingFine: number
  missedMeetingFine: number
  contributionDueDay: number
  contributionDeadlineType: string
  loanGracePeriodDays: number
  isActive: boolean
  createdAt: string
  members: Array<{
    id: string
    userId: string
    role: string
    status: string
    joinedAt: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phoneNumber: string
    }
  }>
  _count: {
    members: number
    contributions: number
    loans: number
  }
}

export default function GroupSettingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const userId = user?.id
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    meetingFrequency: 'MONTHLY',
    monthlyContribution: '',
    socialFundAmount: '',
    maxLoanMultiplier: '',
    interestRate: '',
    loanInterestType: 'FLAT_RATE',
    penaltyAmount: '',
    lateContributionFee: '',
    lateMeetingFine: '',
    missedMeetingFine: '',
    contributionDueDay: '',
    contributionDeadlineType: 'MONTHLY',
    loanGracePeriodDays: '',
    isActive: true
  })

  useEffect(() => {
    if (!userId) return

    const fetchGroupData = async () => {
      try {
        const response = await fetch(`/api/groups/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/groups')
            return
          }
          throw new Error('Failed to fetch group data')
        }

        const data = await response.json()
        setGroup(data)

        setFormData({
          name: data.name,
          description: data.description || '',
          region: data.region,
          meetingFrequency: data.meetingFrequency,
          monthlyContribution: data.monthlyContribution.toString(),
          socialFundAmount: data.socialFundAmount.toString(),
          maxLoanMultiplier: data.maxLoanMultiplier.toString(),
          interestRate: data.interestRate.toString(),
          loanInterestType: data.loanInterestType,
          penaltyAmount: data.penaltyAmount.toString(),
          lateContributionFee: (data.lateContributionFee || 0).toString(),
          lateMeetingFine: data.lateMeetingFine.toString(),
          missedMeetingFine: data.missedMeetingFine.toString(),
          contributionDueDay: data.contributionDueDay.toString(),
          contributionDeadlineType: data.contributionDeadlineType || 'MONTHLY',
          loanGracePeriodDays: data.loanGracePeriodDays.toString(),
          isActive: data.isActive
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupData()
  }, [userId, params.id, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!group) return

    try {
      setSaving(true)
      setError('')
      setSuccess(false)

      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update group settings')
      }

      const updatedGroup = await response.json()
      setGroup(updatedGroup)
      setSuccess(true)

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!group) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete group')
      }

      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete group')
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  const currentUserMember = group?.members?.find(member => member.userId === userId)
  const isAdmin = currentUserMember?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6">
        <GlassCard className="p-12 text-center" hover={false}>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldQuestion className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-4">{t('groups.access_restricted')}</h2>
          <p className="text-muted-foreground font-bold mb-8">
            {t('groups.admin_only_desc')}
          </p>
          <Link href={`/groups/${params.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-10">
              {t('groups.return_to_group')}
            </Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-10"
    >
      <motion.div variants={fadeIn}>
        <Link href={`/groups/${group?.id}`} className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('common.back')}
        </Link>
        <PageHeader
          title={t('groups.configuration')}
          description={t('groups.fine_tune', { name: group?.name || '' })}
        />
      </motion.div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl flex items-center gap-3 py-4 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 className="h-5 w-5" />
            <AlertDescription>{t('groups.config_updated')}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Identity & Presence Section */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10 space-y-10" hover={false}>
              <SectionHeader title={t('groups.identity_presence')} icon={Landmark} />

              <div className="space-y-8">
                <FormGroup label={t('groups.name_label')}>
                  <PremiumInput
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Grand Savannas Collective"
                  />
                </FormGroup>

                <FormGroup label={t('groups.mission_desc')}>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/50 dark:bg-black/20 border-white/20 rounded-2xl font-bold p-6 focus:ring-blue-500 min-h-[140px]"
                    placeholder="Define the group's investment philosophy..."
                  />
                </FormGroup>

                <FormGroup label={t('groups.geo_region')}>
                  <Select value={formData.region} onValueChange={(v) => handleInputChange('region', v)}>
                    <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                      <SelectItem value="NORTHERN" className="font-bold">Northern</SelectItem>
                      <SelectItem value="CENTRAL" className="font-bold">Central</SelectItem>
                      <SelectItem value="SOUTHERN" className="font-bold">Southern</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contributions & Penalty Policies Section */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10 space-y-10" hover={false}>
              <SectionHeader title={t('groups.meeting_protocol')} icon={CheckCircle2} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label={t('groups.monthly_share')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.social_fund')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.socialFundAmount}
                    onChange={(e) => handleInputChange('socialFundAmount', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.settlement_deadline')}>
                  <div className="flex gap-4">
                    <Select value={formData.contributionDeadlineType} onValueChange={(v) => handleInputChange('contributionDeadlineType', v)}>
                      <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6 w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                        <SelectItem value="WEEKLY" className="font-bold">Weekly</SelectItem>
                        <SelectItem value="MONTHLY" className="font-bold">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <PremiumInput
                      type="number"
                      value={formData.contributionDueDay}
                      onChange={(e) => handleInputChange('contributionDueDay', e.target.value)}
                      className="flex-1"
                      placeholder="Day (1-31)"
                    />
                  </div>
                </FormGroup>

                <FormGroup label={t('groups.late_contribution_fee')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.lateContributionFee}
                    onChange={(e) => handleInputChange('lateContributionFee', e.target.value)}
                  />
                </FormGroup>
              </div>
            </GlassCard>
          </motion.div>

          {/* Lending & Penalty Policies Section */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10 space-y-10" hover={false}>
              <SectionHeader title={t('groups.financial_arch')} icon={ShieldQuestion} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label={t('groups.interest_method')}>
                  <Select value={formData.loanInterestType} onValueChange={(v) => handleInputChange('loanInterestType', v)}>
                    <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                      <SelectItem value="FLAT_RATE" className="font-bold">Flat Rate</SelectItem>
                      <SelectItem value="REDUCING_BALANCE" className="font-bold">Reducing Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label={t('groups.asset_interest')}>
                  <PremiumInput
                    type="number"
                    suffix="%"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.limit_multiplier')}>
                  <PremiumInput
                    type="number"
                    suffix="x"
                    value={formData.maxLoanMultiplier}
                    onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.grace_period')}>
                  <PremiumInput
                    type="number"
                    suffix="Days"
                    value={formData.loanGracePeriodDays}
                    onChange={(e) => handleInputChange('loanGracePeriodDays', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.default_penalty')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.penaltyAmount}
                    onChange={(e) => handleInputChange('penaltyAmount', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.meeting_frequency')}>
                  <Select value={formData.meetingFrequency} onValueChange={(v) => handleInputChange('meetingFrequency', v)}>
                    <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                      <SelectItem value="WEEKLY" className="font-bold">Weekly</SelectItem>
                      <SelectItem value="BIWEEKLY" className="font-bold">Bi-Weekly</SelectItem>
                      <SelectItem value="MONTHLY" className="font-bold">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label={t('groups.late_fine')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.lateMeetingFine}
                    onChange={(e) => handleInputChange('lateMeetingFine', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label={t('groups.missed_fine')}>
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.missedMeetingFine}
                    onChange={(e) => handleInputChange('missedMeetingFine', e.target.value)}
                  />
                </FormGroup>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-6 space-y-4" hover={false}>
              <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{t('groups.publication_status')}</h4>
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                <div className="space-y-0.5">
                  <p className="text-sm font-black">{t('groups.accepting_activity')}</p>
                  <p className="text-[10px] text-muted-foreground font-bold italic">{t('groups.enables_desc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-10 h-6 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-blue-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-4"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="banana"
                  size="xl"
                  className="w-full shadow-blue-500/20"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  {t('groups.sync_protocol')}
                </Button>

                <Link href={`/groups/${group?.id}`} className="block">
                  <Button variant="ghost" className="w-full font-bold text-muted-foreground hover:text-red-600 hover:bg-red-500/5 rounded-xl">
                    {t('groups.discard_changes')}
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>

          {/* Maintenance Section */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-6" hover={false}>
              <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4">{t('groups.maintenance')}</h4>
              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                  Trigger a manual audit to check for late contributions and apply penalties according to group protocol.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 text-orange-600 font-bold rounded-xl h-12"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/groups/${group?.id}/penalties`, { method: 'POST' })
                      if (res.ok) {
                        const data = await res.json()
                        alert(`Maintenance check: Applied ${data.penaltiesApplied} pending penalties.`)
                      }
                    } catch (e) {
                      alert('Check failed.')
                    }
                  }}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t('groups.audit_penalty')}
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-6 border-red-500/20 bg-red-500/5" hover={false}>
              <h4 className="font-black text-xs uppercase tracking-widest text-red-600 mb-4">{t('groups.danger_zone')}</h4>
              <div className="space-y-4">
                <p className="text-[10px] text-red-600/80 font-bold leading-relaxed">
                  {t('groups.delete_warning_desc')}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-red-500/20 hover:border-red-600 hover:bg-red-600 hover:text-white text-red-600 font-bold rounded-xl h-12 transition-all duration-300"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('groups.delete_group')}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-white/20 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl">{t('groups.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              {t('groups.delete_confirm_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold border-0 bg-secondary/50 hover:bg-secondary">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {t('common.confirm_delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
