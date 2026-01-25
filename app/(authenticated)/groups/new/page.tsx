'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft, Plus, Landmark, Globe, Banknote, TrendingUp, ShieldCheck,
  Loader2, AlertCircle, Check, ChevronRight, ChevronLeft
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
import { cn } from '@/lib/utils'

export default function CreateGroupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Identity & Contact
    name: '',
    description: '',
    region: '',
    meetingFrequency: 'MONTHLY',
    meetingLocation: '',
    contactEmail: '',
    contactPhone: '',

    // Step 2: Financials & Penalties
    monthlyContribution: '',
    socialFundAmount: '0',
    maxLoanMultiplier: '3',
    minLoanAmount: '0',
    interestRate: '10',
    loanInterestType: 'FLAT_RATE',
    loanGracePeriodDays: '0',
    contributionDueDay: '5',
    minContributionMonths: '0',
    lateContributionFee: '0',
    lateMeetingFine: '0',
    missedMeetingFine: '0',
    penaltyAmount: '0',
    cycleEndDate: '',
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
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep1 = () => {
    const errors: Record<string, string> = {}
    if (!formData.name || formData.name.length < 3) errors.name = 'Name must be at least 3 characters'
    if (!formData.region) errors.region = 'Please select a region'
    if (!formData.meetingFrequency) errors.meetingFrequency = 'Please select meeting frequency'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors: Record<string, string> = {}
    if (!formData.monthlyContribution || parseFloat(formData.monthlyContribution) <= 0) {
      errors.monthlyContribution = 'Please enter a valid contribution amount'
    }
    const interest = parseFloat(formData.interestRate)
    if (isNaN(interest) || interest < 0 || interest > 100) {
      errors.interestRate = 'Interest rate must be between 0 and 100'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    setError('')
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
      window.scrollTo(0, 0)
    } else if (currentStep === 1 || currentStep === 2) {
      setError('Please fix the errors before proceeding.')
    }
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyContribution: parseFloat(formData.monthlyContribution),
          socialFundAmount: parseFloat(formData.socialFundAmount) || 0,
          maxLoanMultiplier: parseInt(formData.maxLoanMultiplier),
          interestRate: parseFloat(formData.interestRate),
          penaltyAmount: parseFloat(formData.penaltyAmount) || 0,
          lateMeetingFine: parseFloat(formData.lateMeetingFine) || 0,
          missedMeetingFine: parseFloat(formData.missedMeetingFine) || 0,
          lateContributionFee: parseFloat(formData.lateContributionFee) || 0,
          contributionDueDay: parseInt(formData.contributionDueDay),
          minContributionMonths: parseInt(formData.minContributionMonths),
          loanGracePeriodDays: parseInt(formData.loanGracePeriodDays),
          minLoanAmount: parseFloat(formData.minLoanAmount) || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create group')
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
        router.push(`/groups/${data.groupId}`)
      }
    } catch (error) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Identity & Access' },
    { number: 2, title: 'Financial Rules' },
    { number: 3, title: 'Review & Launch' },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-20 max-w-5xl mx-auto"
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

      {/* Step Indicator */}
      <motion.div variants={fadeIn} className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4",
                  currentStep >= step.number
                    ? "bg-white text-blue-900 border-blue-500 shadow-lg shadow-blue-500/25"
                    : "bg-slate-900/50 text-slate-500 border-white/5"
                )}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                currentStep >= step.number ? "text-blue-400" : "text-slate-600"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-8 md:p-10 relative overflow-hidden" hover={false}>
              {/* Background accent */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl py-4">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <SectionHeader title="Core Identity" icon={Landmark} />

                      <div className="space-y-6">
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
                            className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl font-bold p-6 focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                          />
                        </FormGroup>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormGroup label="Region" error={fieldErrors.region}>
                            <Select value={formData.region} onValueChange={(v) => handleInputChange('region', v)}>
                              <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NORTHERN">Northern Highlands</SelectItem>
                                <SelectItem value="CENTRAL">Central Plains</SelectItem>
                                <SelectItem value="SOUTHERN">Southern Valley</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormGroup>

                          <FormGroup label="Meeting Frequency" error={fieldErrors.meetingFrequency}>
                            <Select value={formData.meetingFrequency} onValueChange={(v) => handleInputChange('meetingFrequency', v)}>
                              <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                                <SelectValue placeholder="Frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormGroup>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <SectionHeader title="Contact & Location" icon={Globe} iconColor="text-blue-500" iconBg="bg-blue-500/10" className="mb-6" />
                          <div className="grid md:grid-cols-2 gap-6">
                            <FormGroup label="Meeting Location">
                              <PremiumInput value={formData.meetingLocation} onChange={(e) => handleInputChange('meetingLocation', e.target.value)} placeholder="e.g. Community Hall" />
                            </FormGroup>
                            <FormGroup label="Contact Phone">
                              <PremiumInput value={formData.contactPhone} onChange={(e) => handleInputChange('contactPhone', e.target.value)} placeholder="+265..." />
                            </FormGroup>
                            <div className="md:col-span-2">
                              <FormGroup label="Contact Email (Optional)">
                                <PremiumInput value={formData.contactEmail} onChange={(e) => handleInputChange('contactEmail', e.target.value)} placeholder="group@example.com" />
                              </FormGroup>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <SectionHeader title="Financial Governance" icon={Banknote} iconColor="text-emerald-600" iconBg="bg-emerald-500/10" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormGroup label="Monthly Contribution (MWK)" error={fieldErrors.monthlyContribution}>
                          <PremiumInput
                            type="number"
                            prefix="MWK"
                            value={formData.monthlyContribution}
                            onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                            placeholder="10000"
                            error={!!fieldErrors.monthlyContribution}
                          />
                        </FormGroup>

                        <FormGroup label="Social Fund (MWK)">
                          <PremiumInput
                            type="number"
                            prefix="MWK"
                            value={formData.socialFundAmount}
                            onChange={(e) => handleInputChange('socialFundAmount', e.target.value)}
                            placeholder="500"
                          />
                        </FormGroup>

                        <FormGroup label="Interest Rate (%)" error={fieldErrors.interestRate}>
                          <PremiumInput
                            type="number"
                            value={formData.interestRate}
                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup label="Loan Multiplier">
                          <PremiumInput
                            type="number"
                            value={formData.maxLoanMultiplier}
                            onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                          />
                        </FormGroup>

                        <FormGroup label="Interest Type">
                          <Select value={formData.loanInterestType} onValueChange={(v) => handleInputChange('loanInterestType', v)}>
                            <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FLAT_RATE">Flat Rate</SelectItem>
                              <SelectItem value="REDUCING_BALANCE">Reducing Balance</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormGroup>

                        <FormGroup label="Grace Period (Days)">
                          <PremiumInput
                            type="number"
                            value={formData.loanGracePeriodDays}
                            onChange={(e) => handleInputChange('loanGracePeriodDays', e.target.value)}
                          />
                        </FormGroup>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <SectionHeader title="Penalties" icon={AlertCircle} iconColor="text-red-500" iconBg="bg-red-500/10" className="mb-6" />
                        <div className="grid grid-cols-2 gap-4">
                          <FormGroup label="Late Contribution">
                            <PremiumInput type="number" prefix="MWK" value={formData.lateContributionFee} onChange={(e) => handleInputChange('lateContributionFee', e.target.value)} />
                          </FormGroup>
                          <FormGroup label="Late Meeting">
                            <PremiumInput type="number" prefix="MWK" value={formData.lateMeetingFine} onChange={(e) => handleInputChange('lateMeetingFine', e.target.value)} />
                          </FormGroup>
                          <FormGroup label="Missed Meeting">
                            <PremiumInput type="number" prefix="MWK" value={formData.missedMeetingFine} onChange={(e) => handleInputChange('missedMeetingFine', e.target.value)} />
                          </FormGroup>
                          <FormGroup label="General Penalty">
                            <PremiumInput type="number" prefix="MWK" value={formData.penaltyAmount} onChange={(e) => handleInputChange('penaltyAmount', e.target.value)} />
                          </FormGroup>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <SectionHeader title="Review Details" icon={ShieldCheck} iconColor="text-amber-500" iconBg="bg-amber-500/10" />

                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identity</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Name</p>
                              <p className="font-bold">{formData.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Region</p>
                              <p className="font-bold capitalize">{formData.region.toLowerCase()}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground">Mission</p>
                              <p className="text-sm">{formData.description || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Key Financials</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly Contribution</p>
                              <p className="font-bold text-emerald-500">MWK {formData.monthlyContribution}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Interest Rate</p>
                              <p className="font-bold">{formData.interestRate}% ({formData.loanInterestType === 'FLAT_RATE' ? 'Flat' : 'Red.'})</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Max Loan</p>
                              <p className="font-bold">{formData.maxLoanMultiplier}x Savings</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Social Fund</p>
                              <p className="font-bold">MWK {formData.socialFundAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  {currentStep > 1 ? (
                    <Button type="button" variant="ghost" onClick={handleBack} disabled={loading} className="gap-2">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                  ) : (
                    <div /> /* Spacer */
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 shadow-lg shadow-blue-600/20"
                    >
                      Next Step <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      variant="default"
                      size="xl"
                      className="px-8 shadow-blue-500/40 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-3" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Group <Check className="w-5 h-5 ml-3" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-10 hidden xl:block">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-8 space-y-6" hover={false}>
              <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-4">
                {currentStep === 1 ? 'Step 1 Guide' : currentStep === 2 ? 'Financial Guide' : 'Final Review'}
              </h4>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {currentStep === 1 && (
                    <>
                      <div className="flex gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg h-fit"><Globe className="w-4 h-4 text-blue-600" /></div>
                        <div className="space-y-1">
                          <p className="font-black text-sm">Identity Matters</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">A clear name and mission help potential members understand your group's goals.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg h-fit"><Landmark className="w-4 h-4 text-purple-600" /></div>
                        <div className="space-y-1">
                          <p className="font-black text-sm">Location</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Choose a physical meeting spot that is central and safe for all members.</p>
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <div className="flex gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg h-fit"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                        <div className="space-y-1">
                          <p className="font-black text-sm">Contributions</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Set a realistic monthly amount that members can consistently afford.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg h-fit"><ShieldCheck className="w-4 h-4 text-amber-600" /></div>
                        <div className="space-y-1">
                          <p className="font-black text-sm">Safeguards</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Penalties encourage discipline but shouldn't be punitive. Keep them reasonable.</p>
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 3 && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-lg mb-2">Ready to Launch!</p>
                      <p className="text-xs text-muted-foreground">Review your details carefully. You can adjust settings later in the Admin Portal.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
