'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Loader2, Phone, Building2, Wallet } from 'lucide-react'
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
  loanInterestType?: 'FLAT_RATE' | 'REDUCING_BALANCE'
  region: string
}

interface EligibilityInfo {
  eligible: boolean
  reason?: string
  maxAmount?: number
  contributionsCount?: number
  totalContributions?: number
}

interface BankDetail {
  id: string
  type: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD'
  bankName?: string
  accountNumber: string
  accountName: string
  isPrimary: boolean
}

function NewLoanPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityInfo | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetail[]>([])
  const [useNewAccount, setUseNewAccount] = useState(false)
  const [formData, setFormData] = useState({
    amountRequested: '',
    repaymentPeriodMonths: '6',
    purpose: '',
    // Disbursement account details
    selectedBankDetailId: '',
    disbursementMethod: 'AIRTEL_MONEY' as 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD',
    disbursementAccountName: '',
    disbursementAccountNumber: '',
    disbursementBankName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      await fetchGroups()
      await fetchSavedBankDetails()

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

  const fetchSavedBankDetails = async () => {
    try {
      const response = await fetch('/api/member/bank-details')
      if (response.ok) {
        const data = await response.json()
        setSavedBankDetails(data.bankDetails)
        // Auto-select primary account if available
        const primary = data.bankDetails.find((d: BankDetail) => d.isPrimary)
        if (primary) {
          setFormData(prev => ({ ...prev, selectedBankDetailId: primary.id }))
        }
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
    }
  }

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
          loanInterestType: g.loanInterestType,
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
          loanInterestType: group.loanInterestType,
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

    // Validate disbursement account
    if (!useNewAccount && !formData.selectedBankDetailId) {
      setError('Please select a disbursement account or add a new one')
      return false
    }

    if (useNewAccount) {
      if (!formData.disbursementAccountName || formData.disbursementAccountName.length < 2) {
        setError('Account name must be at least 2 characters')
        return false
      }
      if (!formData.disbursementAccountNumber || formData.disbursementAccountNumber.length < 8) {
        setError('Account number must be at least 8 characters')
        return false
      }
      if (formData.disbursementMethod === 'BANK_CARD' && !formData.disbursementBankName) {
        setError('Bank name is required for bank accounts')
        return false
      }
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
      // Prepare disbursement data
      let disbursementData;
      if (useNewAccount) {
        disbursementData = {
          disbursementMethod: formData.disbursementMethod,
          disbursementAccountName: formData.disbursementAccountName,
          disbursementAccountNumber: formData.disbursementAccountNumber,
          disbursementBankName: formData.disbursementBankName || undefined,
        }
      } else {
        const selectedDetail = savedBankDetails.find(d => d.id === formData.selectedBankDetailId)
        if (selectedDetail) {
          disbursementData = {
            disbursementMethod: selectedDetail.type,
            disbursementAccountName: selectedDetail.accountName,
            disbursementAccountNumber: selectedDetail.accountNumber,
            disbursementBankName: selectedDetail.bankName || undefined,
          }
        }
      }

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
          ...disbursementData,
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
            <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black/40">
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
              className="bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-2xl min-h-[120px] font-bold py-4 px-6 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black/40"
              placeholder="Briefly describe the objective for this credit injection..."
              value={formData.purpose}
              onChange={handleChange}
            />
          </FormGroup>

          {/* Disbursement Account Section */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <SectionHeader title="Disbursement Account" icon={Wallet} />
            <p className="text-sm text-muted-foreground -mt-4">
              Select where you want to receive the loan funds
            </p>

            {savedBankDetails.length > 0 && !useNewAccount ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {savedBankDetails.map((detail) => (
                    <div
                      key={detail.id}
                      onClick={() => setFormData(prev => ({ ...prev, selectedBankDetailId: detail.id }))}
                      className={cn(
                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                        formData.selectedBankDetailId === detail.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl",
                        detail.type === 'AIRTEL_MONEY' ? "bg-red-500/10 text-red-500" :
                          detail.type === 'MPAMBA' ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-blue-500/10 text-blue-500"
                      )}>
                        {detail.type === 'BANK_CARD' ? <Building2 className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{detail.accountName}</p>
                        <p className="text-sm text-muted-foreground font-mono">{detail.accountNumber}</p>
                      </div>
                      {detail.isPrimary && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">Primary</span>
                      )}
                      {formData.selectedBankDetailId === detail.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUseNewAccount(true)}
                  className="w-full rounded-xl"
                >
                  + Use Different Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedBankDetails.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setUseNewAccount(false)}
                    className="text-sm text-muted-foreground"
                  >
                    ← Select from saved accounts
                  </Button>
                )}

                <FormGroup label="Payment Method *">
                  <Select
                    value={formData.disbursementMethod}
                    onValueChange={(value: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD') =>
                      setFormData(prev => ({ ...prev, disbursementMethod: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                      <SelectItem value="AIRTEL_MONEY" className="font-bold">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-red-500" />
                          Airtel Money
                        </div>
                      </SelectItem>
                      <SelectItem value="MPAMBA" className="font-bold">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-yellow-500" />
                          Mpamba
                        </div>
                      </SelectItem>
                      <SelectItem value="BANK_CARD" className="font-bold">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          Bank Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Account Name *">
                  <Input
                    placeholder="John Banda"
                    value={formData.disbursementAccountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, disbursementAccountName: e.target.value }))}
                    className="bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black/40"
                  />
                </FormGroup>

                <FormGroup label={formData.disbursementMethod === 'BANK_CARD' ? 'Account Number *' : 'Phone Number *'}>
                  <Input
                    placeholder={formData.disbursementMethod === 'BANK_CARD' ? '1234567890' : '0999123456'}
                    value={formData.disbursementAccountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, disbursementAccountNumber: e.target.value }))}
                    className="bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black/40"
                  />
                </FormGroup>

                {formData.disbursementMethod === 'BANK_CARD' && (
                  <FormGroup label="Bank Name *">
                    <Input
                      placeholder="National Bank of Malawi"
                      value={formData.disbursementBankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, disbursementBankName: e.target.value }))}
                      className="bg-white/50 dark:bg-black/20 border-white/20 dark:border-white/10 rounded-xl h-14 font-bold px-6 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black/40"
                    />
                  </FormGroup>
                )}
              </div>
            )}
          </div>
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
                        (() => {
                          const P = parseFloat(formData.amountRequested);
                          const r = selectedGroup.interestRate / 100;
                          const n = parseInt(formData.repaymentPeriodMonths);

                          // @ts-ignore - interestType is not yet in the frontend type definition but exists in API response
                          if (selectedGroup.loanInterestType === 'REDUCING_BALANCE') {
                            // Amortization Formula for Monthly Payment: PMT = P * (i / (1 - (1 + i)^-n))
                            // where i is monthly interest rate
                            const i = r; // Assuming interestRate is monthly in the system context, or convert if annual? 
                            // NOTE: Usually in village banking, interest rate is MONTHLY.
                            // Formular: PMT = P * i * (1 + i)^n / ((1 + i)^n - 1)
                            const monthlyRate = r;
                            const monthlyPayment = (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
                            return monthlyPayment * n;
                          } else {
                            // Flat Rate: Interest is calculated on the original principal
                            return P * (1 + r * n);
                          }
                        })()
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Monthly Cycle Settlement</p>
                      <p className="text-3xl font-black text-blue-700 dark:text-banana tracking-tighter">
                        {formatCurrency(
                          (() => {
                            const P = parseFloat(formData.amountRequested);
                            const r = selectedGroup.interestRate / 100;
                            const n = parseInt(formData.repaymentPeriodMonths);

                            // @ts-ignore
                            if (selectedGroup.loanInterestType === 'REDUCING_BALANCE') {
                              const monthlyRate = r;
                              return (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
                            } else {
                              return (P * (1 + r * n)) / n;
                            }
                          })()
                        )}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Interest Component</p>
                      <p className="font-bold text-foreground">
                        {formatCurrency(
                          (() => {
                            const P = parseFloat(formData.amountRequested);
                            const r = selectedGroup.interestRate / 100;
                            const n = parseInt(formData.repaymentPeriodMonths);

                            // @ts-ignore
                            if (selectedGroup.loanInterestType === 'REDUCING_BALANCE') {
                              const monthlyRate = r;
                              const totalRepayment = ((P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)) * n;
                              return totalRepayment - P;
                            } else {
                              return P * r * n;
                            }
                          })()
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
        <Link href="/loans" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Archive
        </Link>
        <PageHeader
          title="Protocol Request"
          description="Initiate a new credit cycle from your active collectives"
        />
      </motion.div>

      <div className="max-w-4xl mx-auto w-full">
        <motion.div variants={itemFadeIn}>
          <GlassCard className="p-5 sm:p-8 md:p-10 border-white/10 shadow-2xl" hover={false}>
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
                    variant="default"
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
