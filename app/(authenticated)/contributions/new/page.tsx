'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, DollarSign, CheckCircle, Upload, ScanLine, Loader2 } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'

interface Group {
  id: string
  name: string
  monthlyContribution: number
  region: string
}

function NewContributionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    transactionRef: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userContributions, setUserContributions] = useState<any[]>([])
  const [success, setSuccess] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')
  const [shouldScan, setShouldScan] = useState(false)

  useEffect(() => {
    // Ensure body scroll is restored when scanning is done
    if (!isScanning) {
      document.body.style.overflow = 'auto'
      document.body.style.pointerEvents = 'auto'
    }
  }, [isScanning])

  useEffect(() => {
    if (shouldScan && receiptUrl) {
      handleScanReceipt(receiptUrl)
      setShouldScan(false)
    }
  }, [shouldScan, receiptUrl])

  useEffect(() => {
    fetchGroups()
    fetchUserContributions()

    // Pre-select group if provided in URL
    const groupId = searchParams.get('groupId')
    if (groupId) {
      fetchGroupDetails(groupId)
    }
  }, [searchParams])

  const fetchUserContributions = async () => {
    try {
      const response = await fetch('/api/contributions')
      const data = await response.json()
      if (response.ok) {
        setUserContributions(data.contributions || [])
      }
    } catch (error) {
      console.error('Error fetching user contributions:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      if (response.ok) {
        setGroups(data.groups.filter((g: any) => g.members[0]?.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      if (response.ok) {
        const group = data.groups.find((g: any) => g.id === groupId)
        if (group) {
          setSelectedGroup(group)
          setFormData(prev => ({
            ...prev,
            amount: group.monthlyContribution.toString()
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
    }
  }

  const handleGroupChange = (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    setSelectedGroup(group || null)
    if (group) {
      setFormData(prev => ({
        ...prev,
        amount: group.monthlyContribution.toString()
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return false
    }

    if (!formData.paymentMethod) {
      setError('Please select a payment method')
      return false
    }

    // Check if amount matches expected monthly contribution
    if (selectedGroup && parseFloat(formData.amount) !== selectedGroup.monthlyContribution) {
      setError(`Amount must be exactly MWK ${selectedGroup.monthlyContribution.toLocaleString()} for this group`)
      return false
    }

    // Check for duplicate contribution for current month
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const existingContribution = userContributions.find(
      c => c.groupId === selectedGroup.id &&
        c.month === currentMonth &&
        c.year === currentYear
    )

    if (existingContribution) {
      setError(`You have already made a contribution for ${new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
      return false
    }

    return true
  }

  const handleScanReceipt = async (url: string) => {
    // Give the Cloudinary widget a moment to close and clean up its DOM
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsScanning(true)
    setError('')
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      })
      const data = await response.json()
      if (response.ok && data) {
        setFormData(prev => ({
          ...prev,
          amount: data.amount?.toString() || prev.amount,
          transactionRef: data.transactionRef || prev.transactionRef,
          paymentMethod: data.paymentMethod || prev.paymentMethod,
        }))
        setSuccess('Receipt scanned successfully!')
      } else {
        setError(data.error || 'Failed to scan receipt')
      }
    } catch (err) {
      setError('Error scanning receipt')
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const requestData = {
        groupId: selectedGroup!.id,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionRef: formData.transactionRef || undefined,
        receiptUrl: receiptUrl || undefined,
      }

      console.log('Sending contribution request:', requestData)
      console.log('Selected group:', selectedGroup)
      console.log('Form data:', formData)

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      const data = await response.json()
      console.log('Contribution response:', { status: response.status, data })

      if (!response.ok) {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          requestData: requestData
        })
        setError(data.error || 'Failed to create contribution')
      } else {
        setSuccess('Contribution created successfully! Redirecting...')
        setTimeout(() => {
          router.push('/contributions?message=Contribution created successfully')
        }, 2000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/contributions" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contributions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Make Contribution</h1>
          <p className="text-gray-600">Record your monthly contribution</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Details</CardTitle>
            <CardDescription>
              Fill in the information for your contribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 border-b pb-6">
                <Label>Receipt (Optional)</Label>
                <div className="w-full">
                  <CldUploadWidget
                    uploadPreset="village_banking_receipts"
                    onSuccess={(result: any) => {
                      const url = result.info.secure_url
                      setReceiptUrl(url)
                      setShouldScan(true)
                    }}
                  >
                    {({ open }) => (
                      <div className="flex flex-col items-center justify-center">
                        {receiptUrl ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                            <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-contain" />
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setReceiptUrl('')}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="w-full flex flex-col items-center space-y-2 text-gray-500 py-10"
                          >
                            <Upload className="w-8 h-8" />
                            <span className="text-sm font-medium">Upload transaction receipt</span>
                            <span className="text-xs">Supports PNG, JPG (Max 5MB)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>

                  {isScanning && (
                    <div className="mt-4 flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-semibold text-blue-700">AI is analyzing your receipt...</span>
                      </div>
                      <p className="text-xs text-blue-500 mt-1">This will only take a few seconds</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Scanning helps auto-fill the form and recorded as proof of payment.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupId">Select Group *</Label>
                <select
                  id="groupId"
                  name="groupId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedGroup?.id || ''}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  required
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - {group.region} (MWK {group.monthlyContribution.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedGroup && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Group Information</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Monthly Contribution:</strong> MWK {selectedGroup?.monthlyContribution.toLocaleString()}</p>
                    <p><strong>Region:</strong> {selectedGroup?.region}</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> You must contribute exactly MWK {selectedGroup.monthlyContribution.toLocaleString()} for this group
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (MWK) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
                {selectedGroup && (
                  <p className="text-sm text-gray-500">
                    Expected monthly contribution: MWK {selectedGroup.monthlyContribution.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="AIRTEL_MONEY">Airtel Money</option>
                  <option value="MPAMBA">Mpamba</option>
                  <option value="BANK_CARD">Bank Card</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionRef">Transaction Reference</Label>
                <Input
                  id="transactionRef"
                  name="transactionRef"
                  type="text"
                  placeholder="Enter transaction ID (optional)"
                  value={formData.transactionRef}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  Reference number from your payment confirmation
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/contributions">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Contribution'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewContributionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewContributionPageContent />
    </Suspense>
  )
}
