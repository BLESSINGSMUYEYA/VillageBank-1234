'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Loader2, Info } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, itemFadeIn, staggerContainer } from '@/lib/motions'

interface Group {
  id: string
  name: string
  monthlyContribution: number
  maxLoanMultiplier: number
  interestRate: number
  region: string
}

interface EligibilityInfo {
  eligible: boolean
  reason?: string
  maxAmount?: number
  contributionsCount?: number
  totalContributions?: number
}

function NewLoanPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityInfo | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [formData, setFormData] = useState({
    amountRequested: '',
    repaymentPeriodMonths: '6',
    purpose: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      await fetchGroups()

      // Pre-select group if provided in URL
      const groupId = searchParams.get('groupId')
      if (groupId) {
        await fetchGroupDetails(groupId)
        // Auto-fetch eligibility for the group
        checkEligibility(groupId)
      }
    }

    fetchData()
  }, [searchParams])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      if (response.ok) {
        setGroups(data.groups.filter((g: any) => g.members?.some((m: any) => m.status === 'ACTIVE')).map((g: any) => ({
          id: g.id,
          name: g.name,
          monthlyContribution: g.monthlyContribution,
          maxLoanMultiplier: g.maxLoanMultiplier,
          interestRate: g.interestRate,
          region: g.region
        })))
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const group = await response.json()
        setSelectedGroup({
          id: group.id,
          name: group.name,
          monthlyContribution: group.monthlyContribution,
          maxLoanMultiplier: group.maxLoanMultiplier,
          interestRate: group.interestRate,
          region: group.region
        })
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
    }
  }

  const checkEligibility = async (groupId: string) => {
    try {
      const response = await fetch(`/api/loans/check-eligibility?groupId=${groupId}`)
      const data = await response.json()
      if (response.ok) {
        setEligibility(data)
      }
    } catch (error) {
      console.error('Error checking eligibility:', error)
    }
  }

  const handleGroupChange = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    setSelectedGroup(group || null)
    setEligibility(null)
    if (group) {
      checkEligibility(groupId)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!selectedGroup) {
      setError('Please select a group')
      return false
    }

    if (!eligibility?.eligible) {
      setError('You are not eligible for a loan in this group')
      return false
    }

    const amount = parseFloat(formData.amountRequested)
    if (!amount || amount <= 0) {
      setError('Please enter a valid loan amount')
      return false
    }

    if (eligibility.maxAmount && amount > eligibility.maxAmount) {
      setError(`Maximum loan amount is ${formatCurrency(eligibility.maxAmount)}`)
      return false
    }

    const period = parseInt(formData.repaymentPeriodMonths)
    if (!period || period < 1 || period > 24) {
      setError('Repayment period must be between 1 and 24 months')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup!.id,
          amountRequested: parseFloat(formData.amountRequested),
          repaymentPeriodMonths: parseInt(formData.repaymentPeriodMonths),
          purpose: formData.purpose,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create loan application')
      } else {
        router.push('/loans?message=Loan application submitted successfully')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderGroupSelection = () => (
    <div className="space-y-6">
      <SectionHeader title="Access Point" icon={CreditCard} />
      <FormGroup label="Target Group *">
        {selectedGroup ? (
          <div className="p-5 border-2 border-blue-500/20 rounded-2xl bg-blue-500/5 backdrop-blur-sm flex justify-between items-center group animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="font-black text-foreground text-xl">{selectedGroup.name}</p>
              <div className="flex gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                <span>{selectedGroup.region}</span>
                <span className="text-blue-500">•</span>
                <span>{formatCurrency(selectedGroup.monthlyContribution)} / mo</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedGroup(null); setEligibility(null); }}
              className="text-muted-foreground hover:text-destructive font-black uppercase text-[10px] tracking-widest"
            >
              Transfer Group
            </Button>
          </div>
        ) : (
          <Select
            value={selectedGroup?.id || ''}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
              <SelectValue placeholder="Select a collective" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id} className="font-bold">
                  {group.name} ({group.region})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormGroup>
    </div>
  )

  const renderEligibilityInfo = () => {
    if (!eligibility) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "mt-8 p-6 rounded-2xl border-2 flex gap-5",
            eligibility.eligible
              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-900 dark:text-emerald-100"
              : "bg-red-500/5 border-red-500/10 text-red-900 dark:text-red-100"
          )}
        >
          <div className={cn(
            "p-4 rounded-2xl h-fit shadow-lg",
            eligibility.eligible ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
          )}>
            {eligibility.eligible ? <CheckCircle2 className="w-8 h-8 text-white" /> : <AlertCircle className="w-8 h-8 text-white" />}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight">{eligibility.eligible ? 'Node Eligible' : 'Access Restricted'}</h3>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">
                {eligibility.eligible ? 'Credit ceiling optimized' : 'Protocol requirements not met'}
              </p>
            </div>

            {eligibility.eligible ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-emerald-500/10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 text-muted-foreground">Credit Ceiling</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(eligibility.maxAmount || 0)}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 p-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70">
                    <span>History Staking</span>
                    <span className="text-foreground">{eligibility.contributionsCount} Cycles</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70">
                    <span>Ledger Total</span>
                    <span className="text-foreground">{formatCurrency(eligibility.totalContributions || 0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-red-500/10 text-sm font-bold">{eligibility.reason}</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderLoanForm = () => {
    if (!selectedGroup || !eligibility?.eligible) return null

    return (
      <div className="space-y-10 mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-6">
          <SectionHeader title="Protocol Calibration" icon={TrendingUp} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
              <span className="block text-muted-foreground text-[10px] uppercase tracking-widest font-black mb-2">Yield Interest</span>
              <span className="font-black text-blue-600 dark:text-banana text-2xl">{selectedGroup.interestRate}% <span className="text-xs opacity-50 font-bold">/ APR</span></span>
            </div>
            <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
              <span className="block text-muted-foreground text-[10px] uppercase tracking-widest font-black mb-2">Collateral Mult</span>
              <span className="font-black text-blue-600 dark:text-banana text-2xl">{selectedGroup.maxLoanMultiplier}x</span>
            </div>
            <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
              <span className="block text-muted-foreground text-[10px] uppercase tracking-widest font-black mb-2">Plan Target</span>
              <span className="font-black text-blue-600 dark:text-banana text-2xl truncate">{formatCurrency(selectedGroup.monthlyContribution)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          <FormGroup label="Nominal Loan Request (MWK) *">
            <PremiumInput
              id="amountRequested"
              name="amountRequested"
              type="number"
              prefix="MWK"
              placeholder="0.00"
              value={formData.amountRequested}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup label="Settlement Duration *">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[3, 6, 9, 12, 18, 24].map((m) => (
                <div key={m} className="relative h-20">
                  <input
                    type="radio"
                    name="repaymentPeriodMonths"
                    id={`period-${m}`}
                    value={m}
                    checked={formData.repaymentPeriodMonths === m.toString()}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <label htmlFor={`period-${m}`} className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 peer-checked:border-blue-500 peer-checked:bg-blue-600/10 cursor-pointer transition-all">
                    <span className="text-xl font-black">{m}</span>
                    <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Months</span>
                  </label>
                </div>
              ))}
            </div>
          </FormGroup>

          <FormGroup label="Investment Rationale (Purpose)">
            <Textarea
              id="purpose"
              name="purpose"
              className="bg-white/50 dark:bg-black/20 border-white/20 rounded-2xl min-h-[120px] font-bold py-4 px-6 focus:ring-blue-500"
              placeholder="Briefly describe the objective for this credit injection..."
              value={formData.purpose}
              onChange={handleChange}
            />
          </FormGroup>
        </div>

        <AnimatePresence>
          {formData.amountRequested && formData.repaymentPeriodMonths && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <GlassCard className="p-8 border-blue-500/20 shadow-2xl overflow-hidden relative" hover={false}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-6">
                  <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-black">Projection Summary</h4>
                </div>

                <div className="grid gap-6">
                  <div className="flex justify-between items-center bg-white/5 dark:bg-black/20 p-4 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Total Repayment Amount</span>
                    <span className="text-xl font-black text-foreground">
                      {formatCurrency(
                        parseFloat(formData.amountRequested) * (1 + (selectedGroup.interestRate / 100) * (parseInt(formData.repaymentPeriodMonths) / 12))
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Monthly Cycle Settlement</p>
                      <p className="text-3xl font-black text-blue-700 dark:text-banana tracking-tighter">
                        {formatCurrency(
                          (parseFloat(formData.amountRequested) * (1 + (selectedGroup.interestRate / 100) * (parseInt(formData.repaymentPeriodMonths) / 12))) /
                          parseInt(formData.repaymentPeriodMonths)
                        )}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Interest Component</p>
                      <p className="font-bold text-foreground">
                        {formatCurrency(
                          (parseFloat(formData.amountRequested) * ((selectedGroup.interestRate / 100) * (parseInt(formData.repaymentPeriodMonths) / 12)))
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-10 pb-20"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Protocol Request"
          description="Initiate a new credit cycle from your active collectives"
          action={
            <Link href="/loans">
              <Button variant="outline" className="rounded-xl font-bold border-white/20 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Archive
              </Button>
            </Link>
          }
        />
      </motion.div>

      <div className="max-w-4xl mx-auto w-full">
        <motion.div variants={itemFadeIn}>
          <GlassCard className="p-10 border-white/10 shadow-2xl" hover={false}>
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
              )}

              {renderGroupSelection()}
              {renderEligibilityInfo()}
              {renderLoanForm()}

              <div className="flex justify-end pt-10 border-t border-white/10">
                {eligibility?.eligible && (
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="banana"
                    size="xl"
                    className="px-12 shadow-blue-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        Formalize Application
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function NewLoanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-h3 animate-pulse text-muted-foreground">Loading form...</div>}>
      <NewLoanPageContent />
    </Suspense>
  )
}
