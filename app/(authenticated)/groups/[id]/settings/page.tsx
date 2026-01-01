'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Save, Landmark, ShieldQuestion, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'

interface Group {
  id: string
  name: string
  description?: string
  region: string
  monthlyContribution: number
  maxLoanMultiplier: number
  interestRate: number
  penaltyAmount: number
  contributionDueDay: number
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
  const userId = user?.id
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    monthlyContribution: '',
    maxLoanMultiplier: '',
    interestRate: '',
    penaltyAmount: '',
    contributionDueDay: '',
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
          monthlyContribution: data.monthlyContribution.toString(),
          maxLoanMultiplier: data.maxLoanMultiplier.toString(),
          interestRate: data.interestRate.toString(),
          penaltyAmount: data.penaltyAmount.toString(),
          contributionDueDay: data.contributionDueDay.toString(),
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
          monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
          maxLoanMultiplier: parseFloat(formData.maxLoanMultiplier) || 1,
          interestRate: parseFloat(formData.interestRate) || 0,
          penaltyAmount: parseFloat(formData.penaltyAmount) || 0,
          contributionDueDay: parseInt(formData.contributionDueDay) || 5,
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
          <h2 className="text-2xl font-black text-foreground mb-4">Access Restricted</h2>
          <p className="text-muted-foreground font-bold mb-8">
            Only administrators are authorized to modify group parameters and settings.
          </p>
          <Link href={`/groups/${params.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-10">
              Return to Group
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
          Back to Dashboard
        </Link>
        <PageHeader
          title="Group Configuration"
          description={`Fine-tune parameters for ${group?.name}`}
        />
      </motion.div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl flex items-center gap-3 py-4 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 className="h-5 w-5" />
            <AlertDescription>Configuration updated successfully.</AlertDescription>
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
          {/* Identity Section */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10 space-y-10" hover={false}>
              <SectionHeader title="Identity & Presence" icon={Landmark} />

              <div className="space-y-8">
                <FormGroup label="Group Name *">
                  <PremiumInput
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Grand Savannas Collective"
                  />
                </FormGroup>

                <FormGroup label="Mission / Description">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/50 dark:bg-black/20 border-white/20 rounded-2xl font-bold p-6 focus:ring-blue-500 min-h-[140px]"
                    placeholder="Define the group's investment philosophy..."
                  />
                </FormGroup>

                <FormGroup label="Geographical Region">
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

          {/* Financial Architecture */}
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10 space-y-10" hover={false}>
              <SectionHeader title="Financial Architecture" icon={Save} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label="Nominal Monthly Share">
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Asset Interest Rate (%)">
                  <PremiumInput
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Credit Limit Multiplier">
                  <PremiumInput
                    type="number"
                    value={formData.maxLoanMultiplier}
                    onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 px-1 mt-2">Maximum liquidity: Share × Multiplier</p>
                </FormGroup>

                <FormGroup label="Default Penalty Fine">
                  <PremiumInput
                    type="number"
                    prefix="MWK"
                    value={formData.penaltyAmount}
                    onChange={(e) => handleInputChange('penaltyAmount', e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Cycle Settlement Deadline (Day)">
                  <PremiumInput
                    type="number"
                    value={formData.contributionDueDay}
                    onChange={(e) => handleInputChange('contributionDueDay', e.target.value)}
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
              <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Publication Status</h4>
              <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                <div className="space-y-0.5">
                  <p className="text-sm font-black">Accepting Activity</p>
                  <p className="text-[10px] text-muted-foreground font-bold italic">Enables contributions & loans</p>
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
                  Synchronize Protocol
                </Button>

                <Link href={`/groups/${group?.id}`} className="block">
                  <Button variant="ghost" className="w-full font-bold text-muted-foreground hover:text-red-600 hover:bg-red-500/5 rounded-xl">
                    Discard Changes
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-6" hover={false}>
              <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4">Maintenance</h4>
              <Button
                variant="outline"
                className="w-full border-2 border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 text-orange-600 font-bold rounded-xl"
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
                Audit Penalty Sync
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
