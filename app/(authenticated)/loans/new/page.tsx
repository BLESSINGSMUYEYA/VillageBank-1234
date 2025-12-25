'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
        <Label htmlFor="group">Group</Label>
        {selectedGroup ? (
          <div className="mt-1 p-3 border rounded-md bg-muted/50 border-border">
            <p className="font-medium text-foreground">{selectedGroup.name}</p>
            <p className="text-sm text-muted-foreground">{selectedGroup.region}</p>
            <p className="text-sm text-muted-foreground">
              Monthly Contribution: {formatCurrency(selectedGroup.monthlyContribution)}
            </p>
          </div>
        ) : (
          <select
            id="group"
            name="group"
            className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring p-2"
            value={(selectedGroup as Group | null)?.id || ''}
            onChange={(e) => handleGroupChange(e.target.value)}
          >
            <option value="" className="bg-background text-foreground">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id} className="bg-background text-foreground">
                {group.name} ({group.region}) - {formatCurrency(group.monthlyContribution)}/month
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
      <Card className="mt-4 bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-foreground">
            {eligibility.eligible ? (
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            )}
            Loan Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eligibility.eligible ? (
            <>
              <div className="space-y-2 text-sm">
                <p className="text-green-700 dark:text-green-400 font-medium">You are eligible for a loan!</p>
                <div className="grid grid-cols-2 gap-4 text-green-600 dark:text-green-500">
                  <div>
                    <strong>Contributions:</strong> {eligibility.contributionsCount} months
                  </div>
                  <div>
                    <strong>Total Contributed:</strong> {formatCurrency(eligibility.totalContributions || 0)}
                  </div>
                  <div className="col-span-2">
                    <strong>Maximum Loan Amount:</strong> {formatCurrency(eligibility.maxAmount || 0)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-yellow-700 dark:text-yellow-400">
                <p className="font-medium">{eligibility.reason || 'You are not eligible for a loan at this time.'}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLoanForm = () => {
    if (!selectedGroup || !eligibility?.eligible) return null

    return (
      <div className="space-y-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Group Information</h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Interest Rate:</strong> {selectedGroup.interestRate}% per year</p>
            <p><strong>Loan Multiplier:</strong> {selectedGroup.maxLoanMultiplier}x contributions</p>
            <p><strong>Monthly Contribution:</strong> {formatCurrency(selectedGroup.monthlyContribution)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountRequested">Loan Amount (MWK) *</Label>
          <Input
            id="amountRequested"
            name="amountRequested"
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={formData.amountRequested}
            onChange={handleChange}
            required
            className="bg-background text-foreground"
          />
          {eligibility?.maxAmount && (
            <p className="text-sm text-muted-foreground">
              Maximum amount: {formatCurrency(eligibility.maxAmount)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="repaymentPeriodMonths">Repayment Period (months) *</Label>
          <select
            id="repaymentPeriodMonths"
            name="repaymentPeriodMonths"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            value={formData.repaymentPeriodMonths}
            onChange={handleChange}
            required
          >
            <option value="3" className="bg-background text-foreground">3 months</option>
            <option value="6" className="bg-background text-foreground">6 months</option>
            <option value="9" className="bg-background text-foreground">9 months</option>
            <option value="12" className="bg-background text-foreground">12 months</option>
            <option value="18" className="bg-background text-foreground">18 months</option>
            <option value="24" className="bg-background text-foreground">24 months</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose of Loan</Label>
          <textarea
            id="purpose"
            name="purpose"
            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe how you plan to use this loan (optional)"
            value={formData.purpose}
            onChange={handleChange}
          />
        </div>

        {formData.amountRequested && formData.repaymentPeriodMonths && (
          <Card className="border-border mt-4 bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Principal Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(parseFloat(formData.amountRequested))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span>{selectedGroup.interestRate}% per year</span>
                </div>
                <div className="flex justify-between">
                  <span>Repayment Period:</span>
                  <span>{formData.repaymentPeriodMonths} months</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Estimated Monthly Payment:</span>
                  <span>
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
    <div className="flex justify-end space-x-4 pt-4">
      <Link href="/loans">
        <Button variant="outline" type="button" className="border-border text-foreground hover:bg-muted">
          Cancel
        </Button>
      </Link>
      {eligibility?.eligible && (
        <Button type="submit" disabled={loading} className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white">
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/loans" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Request Loan</h1>
          <p className="text-muted-foreground">Apply for a loan from your village banking group</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Loan Application</CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in the details for your loan request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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
    <Suspense fallback={<div>Loading...</div>}>
      <NewLoanPageContent />
    </Suspense>
  )
}
