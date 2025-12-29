'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

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
    <div className="space-y-4">
      <div>
        <Label htmlFor="group" className="text-sm font-bold text-foreground">Select Group</Label>
        {selectedGroup ? (
          <div className="mt-2 p-4 border rounded-2xl bg-muted/30 border-banana/20 hover:border-banana/40 transition-colors flex justify-between items-center group">
            <div>
              <p className="font-bold text-foreground text-lg">{selectedGroup.name}</p>
              <div className="flex gap-3 mt-1 text-xs font-medium text-muted-foreground">
                <span>{selectedGroup.region}</span>
                <span>•</span>
                <span>{formatCurrency(selectedGroup.monthlyContribution)} / mo</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(null); setEligibility(null); }} className="text-muted-foreground hover:text-destructive">Change</Button>
          </div>
        ) : (
          <select
            id="group"
            name="group"
            className="mt-2 block w-full rounded-xl border-input bg-background text-foreground shadow-sm focus:border-banana focus:ring-banana px-4 py-3 text-base transition-all"
            value={(selectedGroup as Group | null)?.id || ''}
            onChange={(e) => handleGroupChange(e.target.value)}
          >
            <option value="" className="bg-background text-foreground">Select a group...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id} className="bg-background text-foreground">
                {group.name} ({group.region})
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )

  const renderEligibilityInfo = () => {
    if (!eligibility) return null;

    return (
      <Card className={`mt-6 border shadow-sm overflow-hidden ${eligibility.eligible ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200'}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${eligibility.eligible ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700'}`}>
              {eligibility.eligible ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-black mb-1 ${eligibility.eligible ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                {eligibility.eligible ? 'You are Eligible!' : 'Not Eligible Yet'}
              </h3>

              {eligibility.eligible ? (
                <div className="space-y-3 mt-3">
                  <div className="p-3 bg-white/60 dark:bg-black/20 rounded-xl border border-green-100 dark:border-green-900/50">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Maximum Loan Limit</p>
                    <p className="text-2xl font-black text-green-700 dark:text-green-400">{formatCurrency(eligibility.maxAmount || 0)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Contributions: <span className="text-foreground font-bold">{eligibility.contributionsCount} months</span></span>
                    <span>Total Saved: <span className="text-foreground font-bold">{formatCurrency(eligibility.totalContributions || 0)}</span></span>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mt-1">{eligibility.reason || 'You are not eligible for a loan at this time.'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoanForm = () => {
    if (!selectedGroup || !eligibility?.eligible) return null

    return (
      <div className="space-y-6 mt-8 animate-fade-in">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Group Terms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl">
              <span className="block text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Interest</span>
              <span className="font-black text-blue-700 dark:text-blue-300 text-lg">{selectedGroup.interestRate}% <span className="text-xs font-medium text-muted-foreground">/ yr</span></span>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl">
              <span className="block text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Multiplier</span>
              <span className="font-black text-blue-700 dark:text-blue-300 text-lg">{selectedGroup.maxLoanMultiplier}x</span>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl">
              <span className="block text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Monthly</span>
              <span className="font-black text-blue-700 dark:text-blue-300 text-lg">{formatCurrency(selectedGroup.monthlyContribution)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amountRequested" className="text-base font-bold">Loan Amount (MWK) <span className="text-red-500">*</span></Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">MWK</div>
              <Input
                id="amountRequested"
                name="amountRequested"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amountRequested}
                onChange={handleChange}
                required
                className="pl-14 h-14 text-lg font-bold rounded-xl border-border bg-background focus:ring-banana focus:border-banana shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="repaymentPeriodMonths" className="text-base font-bold">Repayment Period <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[3, 6, 9, 12, 18, 24].map((m) => (
                <div key={m} className="relative">
                  <input
                    type="radio"
                    name="repaymentPeriodMonths"
                    id={`period-${m}`}
                    value={m}
                    checked={formData.repaymentPeriodMonths === m.toString()}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <label htmlFor={`period-${m}`} className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-muted bg-card hover:bg-muted/50 peer-checked:border-banana peer-checked:bg-banana/5 peer-checked:text-foreground cursor-pointer transition-all">
                    <span className="text-lg font-black">{m}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Months</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-base font-bold text-foreground">Purpose <span className="text-muted-foreground text-sm font-normal">(Optional)</span></Label>
            <textarea
              id="purpose"
              name="purpose"
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-banana focus-visible:border-banana disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What will this loan be used for?"
              value={formData.purpose}
              onChange={handleChange}
            />
          </div>
        </div>

        {formData.amountRequested && formData.repaymentPeriodMonths && (
          <Card className="border-none bg-muted/40 shadow-inner rounded-2xl overflow-hidden mt-6">
            <CardHeader className="pb-2 bg-muted/50 border-b border-border/50">
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-banana" /> Repayment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Principal</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(parseFloat(formData.amountRequested))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Interest ({selectedGroup.interestRate}%)</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(
                      (parseFloat(formData.amountRequested) * ((selectedGroup.interestRate / 100) * (parseInt(formData.repaymentPeriodMonths) / 12)))
                    )}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-foreground">Estimated Monthly</span>
                  <span className="text-2xl font-black text-banana-foreground">
                    {formatCurrency(
                      (parseFloat(formData.amountRequested) * (1 + (selectedGroup.interestRate / 100) * (parseInt(formData.repaymentPeriodMonths) / 12))) /
                      parseInt(formData.repaymentPeriodMonths)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderFormActions = () => (
    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-border/50">
      <Link href="/loans">
        <Button variant="ghost" type="button" className="rounded-xl font-bold hover:bg-muted text-muted-foreground">
          Cancel
        </Button>
      </Link>
      {eligibility?.eligible && (
        <Button type="submit" disabled={loading} className="bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all px-8 h-12">
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen py-8 animate-fade-in pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pl-1">
          <Link href="/loans" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Link>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">Request Loan</h1>
          <p className="text-lg text-muted-foreground font-medium mt-2">Apply for a new loan from your available groups.</p>
        </div>

        <Card className="bg-card border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-6 rounded-xl">
                  <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
              )}

              {renderGroupSelection()}
              {renderEligibilityInfo()}
              {renderLoanForm()}
              {renderFormActions()}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewLoanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-h3 animate-pulse text-muted-foreground">Loading form...</div>}>
      <NewLoanPageContent />
    </Suspense>
  )
}
