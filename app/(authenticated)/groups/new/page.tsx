'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Landmark, Globe, Banknote, TrendingUp, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
import { cn } from '@/lib/utils'

export default function CreateGroupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    meetingFrequency: 'MONTHLY',
    monthlyContribution: '',
    socialFundAmount: '0',
    maxLoanMultiplier: '3',
    interestRate: '10',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case 'name':
        if (value && value.length < 3) {
          errors.name = 'Group name must be at least 3 characters long'
        } else if (value && value.length > 50) {
          errors.name = 'Group name must be less than 50 characters'
        }
        break
      case 'monthlyContribution':
        const contribution = parseFloat(value)
        if (value && (isNaN(contribution) || contribution <= 0)) {
          errors.monthlyContribution = 'Monthly contribution must be a positive number'
        }
        break
      case 'maxLoanMultiplier':
        const multiplier = parseInt(value)
        if (value && (isNaN(multiplier) || multiplier < 1 || multiplier > 10)) {
          errors.maxLoanMultiplier = 'Loan multiplier must be between 1 and 10'
        }
        break
      case 'interestRate':
        const interest = parseFloat(value)
        if (value && (isNaN(interest) || interest < 0 || interest > 100)) {
          errors.interestRate = 'Interest rate must be between 0 and 100'
        }
        break
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.region || !formData.monthlyContribution) {
      setError('Essential fields are missing. Please complete the architecture.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          region: formData.region,
          meetingFrequency: formData.meetingFrequency,
          monthlyContribution: parseFloat(formData.monthlyContribution),
          socialFundAmount: parseFloat(formData.socialFundAmount) || 0,
          maxLoanMultiplier: parseInt(formData.maxLoanMultiplier),
          interestRate: parseFloat(formData.interestRate),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'The system could not initialize the group.')
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
        router.push(`/groups/${data.groupId}`)
      }
    } catch (error) {
      setError('A secure connection could not be established. Retrying might help.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-10 pb-20"
    >
      <motion.div variants={fadeIn}>
        <Link href="/groups" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Registry
        </Link>
        <PageHeader
          title="Establish Local Bank"
          description="Design the foundation of your community financial collective"
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-10" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-10">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl py-4">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="space-y-8">
                  <SectionHeader
                    title="Core Identity"
                    icon={Landmark}
                  />

                  <div className="grid gap-6">
                    <FormGroup label="Group Name" error={fieldErrors.name}>
                      <PremiumInput
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Village Wealth Collective"
                        error={!!fieldErrors.name}
                      />
                    </FormGroup>

                    <FormGroup label="Mission Statement">
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Our purpose is to empower members through..."
                        className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl font-bold p-6 focus:ring-2 focus:ring-blue-500 min-h-[140px]"
                      />
                    </FormGroup>

                    <FormGroup label="Regional Anchor">
                      <Select value={formData.region} onValueChange={(v) => handleInputChange('region', v)}>
                        <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                          <SelectValue placeholder="Identify your region" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                          <SelectItem value="NORTHERN" className="font-bold">Northern Highlands</SelectItem>
                          <SelectItem value="CENTRAL" className="font-bold">Central Plains</SelectItem>
                          <SelectItem value="SOUTHERN" className="font-bold">Southern Valley</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>

                    <FormGroup label="Meeting Frequency">
                      <Select value={formData.meetingFrequency} onValueChange={(v) => handleInputChange('meetingFrequency', v)}>
                        <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                          <SelectItem value="WEEKLY" className="font-bold">Weekly Meetings</SelectItem>
                          <SelectItem value="BIWEEKLY" className="font-bold">Bi-Weekly Meetings</SelectItem>
                          <SelectItem value="MONTHLY" className="font-bold">Monthly Meetings</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>
                  </div>
                </div>

                <div className="space-y-8 pt-6">
                  <SectionHeader
                    title="Financial Governance"
                    icon={Banknote}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-500/10"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-1">
                      <FormGroup label="Target Monthly Contribution (MWK)" error={fieldErrors.monthlyContribution}>
                        <PremiumInput
                          type="number"
                          prefix="MWK"
                          value={formData.monthlyContribution}
                          onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                          placeholder="10000"
                          error={!!fieldErrors.monthlyContribution}
                        />
                      </FormGroup>
                    </div>

                    <div className="md:col-span-1">
                      <FormGroup label="Social/Emergency Fund (MWK)">
                        <PremiumInput
                          type="number"
                          prefix="MWK"
                          value={formData.socialFundAmount}
                          onChange={(e) => handleInputChange('socialFundAmount', e.target.value)}
                          placeholder="500"
                        />
                      </FormGroup>
                    </div>

                    <FormGroup label="Loan Multiplier">
                      <PremiumInput
                        type="number"
                        value={formData.maxLoanMultiplier}
                        onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="Interest Rate (%)">
                      <PremiumInput
                        type="number"
                        value={formData.interestRate}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="flex justify-end pt-10">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="banana"
                    size="xl"
                    className="px-12 shadow-blue-500/40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        Initializing Registry...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-3" />
                        Formalize Group
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>

        <div className="space-y-10">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-8 space-y-6" hover={false}>
              <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-4">Onboarding Insights</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-sm">Regional Anchoring</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">Selecting a region helps in identifying the local community and aligning with local banking standards.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg h-fit">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-sm">Growth Multipliers</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">The loan multiplier determines the maximum borrowing power of a member relative to their contributions.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg h-fit">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-sm">Secure Initialization</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">All parameters can later be fine-tuned by administrators through the secure settings portal.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
