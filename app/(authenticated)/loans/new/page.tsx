'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PremiumInput } from '@/components/ui/premium-input'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Phone,
  Building2,
  Wallet,
  Plus,
  X,
  Clock
} from 'lucide-react'
import { formatCurrency, cn, formatDate } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motions'
import { differenceInMonths, endOfYear, isBefore } from 'date-fns'

// Types
interface Group {
  id: string
  name: string
  monthlyContribution: number
  maxLoanMultiplier: number
  interestRate: number
  minLoanAmount: number
  loanInterestType?: 'FLAT_RATE' | 'REDUCING_BALANCE'
  region: string
  cycleEndDate?: string // ISO Date string
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

  // State
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityInfo | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetail[]>([])
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false)

  // Clean Form State
  const [loanAmount, setLoanAmount] = useState<string>('') // String for manual input handling
  const [loanDuration, setLoanDuration] = useState<string>('3')
  const [purpose, setPurpose] = useState('')
  const [selectedBankId, setSelectedBankId] = useState<string>('')

  // New Account Form
  const [newAccountForm, setNewAccountForm] = useState({
    method: 'AIRTEL_MONEY' as 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD',
    accountName: '',
    accountNumber: '',
    bankName: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      await fetchGroups()
      await fetchSavedBankDetails()

      const groupId = searchParams.get('groupId')
      if (groupId) {
        await fetchGroupDetails(groupId)
        checkEligibility(groupId)
      }
    }
    fetchData()
  }, [searchParams])

  // Auto-select primary bank details
  useEffect(() => {
    if (!selectedBankId && savedBankDetails.length > 0) {
      const primary = savedBankDetails.find(b => b.isPrimary)
      if (primary) setSelectedBankId(primary.id)
    }
  }, [savedBankDetails, selectedBankId])


  // Cycle Logic
  const cycleInfo = useMemo(() => {
    if (!selectedGroup) return null

    const today = new Date()
    // Use group's cycle end date or default to Dec 31st of current year
    const endDate = selectedGroup.cycleEndDate
      ? new Date(selectedGroup.cycleEndDate)
      : endOfYear(today)

    // Calculate remaining months (minimum 1)
    let monthsRemaining = differenceInMonths(endDate, today)
    if (monthsRemaining < 1) monthsRemaining = 0

    // Cap at 24 months globally
    if (monthsRemaining > 24) monthsRemaining = 24

    return {
      endDate,
      monthsRemaining,
      isExpired: isBefore(endDate, today) || monthsRemaining === 0
    }
  }, [selectedGroup])

  // Calculations
  const calculations = useMemo(() => {
    if (!selectedGroup) return null

    const P = parseFloat(loanAmount) || 0
    if (P <= 0) return null

    const r = selectedGroup.interestRate / 100
    const n = parseInt(loanDuration) || 1

    const isReducing = selectedGroup.loanInterestType === 'REDUCING_BALANCE'

    let monthlyPayment = 0
    let totalRepayment = 0

    if (isReducing) {
      const numerator = P * r * Math.pow(1 + r, n)
      const denominator = Math.pow(1 + r, n) - 1
      monthlyPayment = numerator / denominator
      totalRepayment = monthlyPayment * n
    } else {
      const totalInterest = P * r * n
      totalRepayment = P + totalInterest
      monthlyPayment = totalRepayment / n
    }

    return { monthlyPayment, totalRepayment, principal: P }
  }, [loanAmount, loanDuration, selectedGroup])

  // Helpers
  const fetchJson = async (url: string) => {
    const res = await fetch(url)
    const text = await res.text()
    try {
      if (!res.ok) throw new Error(text || res.statusText)
      return JSON.parse(text)
    } catch (e) {
      console.error('Fetch Error:', url, text.substring(0, 500))
      throw new Error('Network response was not ok')
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await fetchJson('/api/groups')
      if (data) {
        const activeGroups = data.groups.filter((g: any) =>
          g.members?.some((m: any) => m.status === 'ACTIVE')
        ).map((g: any) => ({
          id: g.id,
          name: g.name,
          monthlyContribution: g.monthlyContribution,
          maxLoanMultiplier: g.maxLoanMultiplier,
          interestRate: g.interestRate,
          minLoanAmount: g.minLoanAmount,
          loanInterestType: g.loanInterestType,
          region: g.region,
          cycleEndDate: g.cycleEndDate
        }))
        setGroups(activeGroups)

        if (activeGroups.length === 1 && !selectedGroup) {
          const group = activeGroups[0]
          setSelectedGroup(group)
          checkEligibility(group.id)
        }
      }
    } catch (err) { console.error(err) }
  }

  const fetchSavedBankDetails = async () => {
    try {
      const data = await fetchJson('/api/member/bank-details')
      if (data) {
        setSavedBankDetails(data.bankDetails)
        const primary = data.bankDetails.find((d: BankDetail) => d.isPrimary)
        if (primary && !selectedBankId) {
          setSelectedBankId(primary.id)
        }
      }
    } catch (err) { console.error(err) }
  }

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const group = await fetchJson(`/api/groups/${groupId}`)
      if (group) {
        setSelectedGroup(group)
      }
    } catch (err) { console.error(err) }
  }

  const checkEligibility = async (groupId: string) => {
    try {
      const data = await fetchJson(`/api/loans/check-eligibility?groupId=${groupId}`)
      if (data) {
        setEligibility(data)
      }
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    const amount = parseFloat(loanAmount)
    if (isNaN(amount) || amount <= 0) return setError('Please enter a valid amount')
    if (!selectedGroup) return setError('Please select a group')
    if (!eligibility?.eligible) return setError('Not eligible')
    if (selectedGroup.minLoanAmount && amount < selectedGroup.minLoanAmount) return setError(`Amount must be at least ${formatCurrency(selectedGroup.minLoanAmount)}`)
    if (eligibility.maxAmount && amount > eligibility.maxAmount) return setError(`Amount exceeds limit of ${formatCurrency(eligibility.maxAmount)}`)

    // Cycle Check
    if (cycleInfo?.isExpired) return setError('Banking cycle has ended.')

    // Disbursement Check
    const primaryBank = savedBankDetails.find(b => b.isPrimary)
    const activeBank = savedBankDetails.find(b => b.id === selectedBankId) || primaryBank

    // Determine if we are effectively adding a new account (either explicitly or implicitly because no active bank exists)
    const effectiveIsAdding = isAddingNewAccount || !activeBank

    if (effectiveIsAdding) {
      if (newAccountForm.accountName.length < 2) return setError('Invalid account name')
      if (newAccountForm.accountNumber.length < 5) return setError('Invalid account number')
      if (newAccountForm.method === 'BANK_CARD' && !newAccountForm.bankName) return setError('Bank name required')
    } else {
      if (!activeBank) return setError('Select disbursement account')
    }

    setLoading(true)

    try {
      let disbursementData
      if (effectiveIsAdding) {
        disbursementData = {
          disbursementMethod: newAccountForm.method,
          disbursementAccountName: newAccountForm.accountName,
          disbursementAccountNumber: newAccountForm.accountNumber,
          disbursementBankName: newAccountForm.bankName || undefined
        }
      } else {
        // use activeBank
        if (activeBank) {
          disbursementData = {
            disbursementMethod: activeBank.type,
            disbursementAccountName: activeBank.accountName,
            disbursementAccountNumber: activeBank.accountNumber,
            disbursementBankName: activeBank.bankName
          }
        }
      }

      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          amountRequested: amount,
          repaymentPeriodMonths: parseInt(loanDuration),
          purpose,
          ...disbursementData
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')

      router.push('/vault?message=Loan Request Submitted')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Render ---

  const renderGroupSelector = () => (
    <div className="space-y-4">
      <SectionHeader title="Select Group" icon={TrendingUp} />
      {groups.length === 0 ? (
        <p className="text-muted-foreground">No active groups found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => {
                setSelectedGroup(group)
                setEligibility(null)
                // Ensure duration is reset to a safe value or within range
                setLoanDuration('1')
                checkEligibility(group.id)
              }}
              className={cn(
                "cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden",
                selectedGroup?.id === group.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10"
                  : "border-transparent bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
              )}
            >
              <div className="relative z-10">
                <h3 className={cn("font-black text-lg", selectedGroup?.id === group.id ? "text-blue-700 dark:text-blue-300" : "text-foreground")}>
                  {group.name}
                </h3>
                <div className="flex gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                  <span>{group.region}</span>
                </div>
              </div>
              {selectedGroup?.id === group.id && (
                <div className="absolute top-4 right-4 text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSimpleForm = () => {
    if (!selectedGroup || !eligibility?.eligible) return null
    if (!cycleInfo) return null

    if (cycleInfo.isExpired) {
      return (
        <div className="p-6 rounded-3xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 text-orange-800 dark:text-orange-200">
          <AlertCircle className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-lg mb-1">Banking Cycle Ended</h3>
          <p>The banking cycle for this group ended on {formatDate(cycleInfo.endDate)}. Loans are currently closed until the new cycle begins.</p>
        </div>
      )
    }

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Left: Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Loan Amount (MWK)</label>
              <PremiumInput
                placeholder="0.00"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="text-2xl font-black h-14"
                type="number"
              />
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Min: {formatCurrency(selectedGroup.minLoanAmount || 0)}</span>
                <span>Limit: {formatCurrency(eligibility.maxAmount || 0)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Repayment Period</label>
              <Select value={loanDuration} onValueChange={setLoanDuration}>
                <SelectTrigger className="h-14 text-lg font-bold rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1)
                    .filter(m => m <= cycleInfo.monthsRemaining)
                    .map(month => (
                      <SelectItem key={month} value={month.toString()}>{month} Month{month > 1 ? 's' : ''}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg">
                <Clock className="w-3 h-3" />
                <span>Max {cycleInfo.monthsRemaining} months (Cycle ends {formatDate(cycleInfo.endDate)})</span>
              </div>
            </div>

            <FormGroup label="Purpose">
              <Textarea
                placeholder="Briefly describe the purpose..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="h-24 rounded-xl resize-none bg-slate-50 dark:bg-white/5 border-transparent"
              />
            </FormGroup>
          </div>

          {/* Right: Summary Card (Simplified) */}
          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 space-y-6">
            <h4 className="text-label-caps text-muted-foreground">Repayment Summary</h4>

            <div>
              <p className="text-sm font-bold text-muted-foreground mb-1">Monthly Payment</p>
              <p className="text-3xl font-black text-foreground">
                {calculations ? formatCurrency(calculations.monthlyPayment) : '---'}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-bold">{calculations ? formatCurrency(calculations.principal) : '---'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest ({selectedGroup.interestRate}% / mo)</span>
                <span className="font-bold text-banana">
                  {calculations ? formatCurrency(calculations.totalRepayment - calculations.principal) : '---'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black pt-2">
                <span>Total Repayment</span>
                <span>{calculations ? formatCurrency(calculations.totalRepayment) : '---'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderWallet = () => {
    if (!selectedGroup || !eligibility?.eligible || cycleInfo?.isExpired) return null

    const primaryBank = savedBankDetails.find(b => b.isPrimary)
    const selectedBank = savedBankDetails.find(b => b.id === selectedBankId) || primaryBank


    // Default to primary is handled at top level now



    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-muted-foreground" />
            Disbursement Account
          </h4>
          {/* In a fuller version, this button would trigger a modal to select/add other accounts. 
                     For simplicity, we imply it selects the primary or allows adding if none. */}
          {savedBankDetails.length > 0 && (
            <Button variant="ghost" size="sm" className="text-blue-500 font-bold" onClick={() => setIsAddingNewAccount(true)}>Change</Button>
          )}
        </div>

        {/* Simple Active Card View */}
        {!isAddingNewAccount && selectedBank ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <div className={cn("p-3 rounded-xl",
              selectedBank.type === 'AIRTEL_MONEY' ? "bg-red-100 text-red-600" :
                selectedBank.type === 'MPAMBA' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
            )}>
              {selectedBank.type === 'BANK_CARD' ? <Building2 className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-foreground">{selectedBank.accountName}</p>
              <p className="text-sm font-mono text-muted-foreground">{selectedBank.accountNumber}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>
        ) : (
          // Compact Add/Edit Form
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Enter Account Details</span>
              {savedBankDetails.length > 0 && <Button variant="ghost" size="sm" onClick={() => setIsAddingNewAccount(false)}>Cancel</Button>}
            </div>
            <div className="grid gap-3">
              <Select
                value={newAccountForm.method}
                onValueChange={(v: any) => setNewAccountForm(prev => ({ ...prev, method: v }))}
              >
                <SelectTrigger className="h-12 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
                  <SelectItem value="MPAMBA">Mpamba</SelectItem>
                  <SelectItem value="BANK_CARD">Bank Account</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Account Name"
                  value={newAccountForm.accountName}
                  onChange={e => setNewAccountForm(prev => ({ ...prev, accountName: e.target.value }))}
                  className="bg-white dark:bg-transparent"
                />
                <Input
                  placeholder="Account Number"
                  value={newAccountForm.accountNumber}
                  onChange={e => setNewAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="bg-white dark:bg-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto pb-24 space-y-6"
    >
      <motion.div variants={fadeIn}>
        <Link
          href="/vault"
          className="inline-flex items-center text-label-caps text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Vault
        </Link>
        <PageHeader title="Request Loan" description="Simple, transparent lending from your group." />
      </motion.div>

      <GlassCard className="p-6 sm:p-8 space-y-8" hover={false}>
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-bold">{error}</AlertDescription>
            <button onClick={() => setError('')} className="absolute top-2 right-2"><X className="w-4 h-4 opacity-50" /></button>
          </Alert>
        )}

        {renderGroupSelector()}

        {selectedGroup && eligibility && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            {!eligibility.eligible ? (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-200 flex gap-4 items-center">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-bold">Not Eligible</p>
                  <p className="text-sm opacity-80">{eligibility.reason}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm">Eligible for up to {formatCurrency(eligibility.maxAmount || 0)}</span>
              </div>
            )}
          </motion.div>
        )}

        {renderSimpleForm()}

        {renderWallet()}

        {selectedGroup && eligibility?.eligible && !cycleInfo?.isExpired && (
          <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold">Cancel</Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl px-8 shadow-xl shadow-blue-500/20 font-black tracking-wide"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

export default function NewLoanPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
      <NewLoanPageContent />
    </Suspense>
  )
}
