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

const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'village_banking_receipts',
}

console.log('Cloudinary Config Check:', {
  hasCloudName: !!cloudinaryConfig.cloudName,
  hasPreset: !!cloudinaryConfig.uploadPreset,
  isUnsigned: !cloudinaryConfig.apiKey
})

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
  const [memberDetails, setMemberDetails] = useState<{ balance: number; unpaidPenalties: number } | null>(null)

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
          const member = group.members.find((m: any) => m.userId === 'user_current' || true) // The API should ideally filter this or we find the active one
          if (member) {
            setMemberDetails({
              balance: member.balance || 0,
              unpaidPenalties: member.unpaidPenalties || 0
            })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
    }
  }

  const handleGroupChange = (groupId: string) => {
    const group: any = groups.find(g => g.id === groupId)
    setSelectedGroup(group || null)
    if (group) {
      setFormData(prev => ({
        ...prev,
        amount: group.monthlyContribution.toString()
      }))
      const member = group.members?.find((m: any) => m.status === 'ACTIVE')
      if (member) {
        setMemberDetails({
          balance: member.balance || 0,
          unpaidPenalties: member.unpaidPenalties || 0
        })
      }
    } else {
      setMemberDetails(null)
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

    // We no longer check for duplicate monthly contributions as we allow multiple payments
    // We also remove strict amount comparison

    return true
  }

  const handleScanReceipt = async (url: string) => {
    // Give the Cloudinary widget a moment to close and clean up its DOM
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsScanning(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      })

      const data = await response.json()

      if (response.ok && data && (data.amount || data.transactionRef || data.paymentMethod)) {
        // Successfully extracted some data
        const updatedFields = []
        if (data.amount) {
          const parsedAmount = parseFloat(data.amount)
          if (!isNaN(parsedAmount) && parsedAmount > 0) {
            setFormData(prev => ({ ...prev, amount: parsedAmount.toString() }))
            updatedFields.push(`amount (MWK ${parsedAmount.toLocaleString()})`)
          }
        }
        if (data.transactionRef) {
          setFormData(prev => ({ ...prev, transactionRef: data.transactionRef }))
          updatedFields.push('transaction reference')
        }
        if (data.paymentMethod) {
          setFormData(prev => ({ ...prev, paymentMethod: data.paymentMethod }))
          updatedFields.push('payment method')
        }

        if (updatedFields.length > 0) {
          setSuccess(`Receipt scanned successfully! Auto-filled: ${updatedFields.join(', ')}`)
        } else {
          setError('Receipt uploaded but couldn\'t extract specific details. Please fill the form manually.')
        }
      } else {
        // OCR failed
        const errorMessage = data.error || 'Failed to scan receipt'
        setError(`${errorMessage}. Please fill the form manually or try uploading a clearer receipt.`)
      }
    } catch (err) {
      console.error('OCR scanning error:', err)
      setError('Network error while scanning receipt. Please fill the form manually.')
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
        const remainingPenalties = data.summary?.remainingPenalties ?? 0
        const newBalance = data.summary?.newBalance ?? 0

        setSuccess(`Contribution recorded successfully! ${data.summary?.penaltyPaid > 0 ? `MWK ${data.summary.penaltyPaid.toLocaleString()} paid towards penalties.` : ''} New Balance: MWK ${newBalance.toLocaleString()}`)

        // Update local state immediately
        setMemberDetails({
          balance: newBalance,
          unpaidPenalties: remainingPenalties
        })

        // Also refresh the groups list in the background
        fetchGroups()

        setTimeout(() => {
          router.push('/contributions?message=Contribution recorded successfully')
        }, 5000) // Longer delay to let them see the new balance
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate dynamic balance
  const currentMonthDate = new Date().getMonth() + 1
  const currentYearDate = new Date().getFullYear()
  const hasPaidThisMonth = userContributions.some(
    c => c.groupId === selectedGroup?.id &&
      c.month === currentMonthDate &&
      c.year === currentYearDate &&
      c.amount > 0 &&
      c.status !== 'FAILED'
  )

  const monthlyDue = (selectedGroup && !hasPaidThisMonth) ? selectedGroup.monthlyContribution : 0
  const totalDue = (memberDetails ? (monthlyDue + memberDetails.unpaidPenalties - (memberDetails.balance || 0)) : monthlyDue)
  const amountToPay = parseFloat(formData.amount) || 0
  const remainingAfterPayment = Math.max(0, totalDue - amountToPay)
  const isOverpaying = amountToPay > totalDue && totalDue > 0

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
                  {cloudinaryConfig.cloudName ? (
                    <CldUploadWidget
                      uploadPreset={cloudinaryConfig.uploadPreset}
                      options={{
                        maxFiles: 1,
                        resourceType: 'image',
                        clientAllowedFormats: ['png', 'jpg', 'jpeg'],
                        maxFileSize: 5000000, // 5MB
                        folder: 'village-banking/receipts',
                      }}
                      onSuccess={(result: any) => {
                        if (result?.info?.secure_url) {
                          const url = result.info.secure_url
                          setReceiptUrl(url)
                          setShouldScan(true)
                        } else {
                          console.error('Upload result is invalid:', result)
                          setError('Upload failed. Please try again.')
                        }
                      }}
                      onError={(error: any) => {
                        console.error('Cloudinary upload error detailed:', {
                          error,
                          message: error?.statusText || error?.message || 'Unknown error'
                        })
                        setError(`Upload failed: ${error?.statusText || 'Check console for details'}. Please ensure your upload preset is "Unsigned".`)
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
                              onClick={() => {
                                if (open) {
                                  open();
                                } else {
                                  console.error('Cloudinary upload widget is not ready');
                                  setError('Upload widget is still loading. Please try again in a moment.');
                                }
                              }}
                              className="w-full flex flex-col items-center space-y-2 text-gray-500 py-10"
                            >
                              <Upload className="w-8 h-8" />
                              <span className="text-sm font-medium">Upload receipt or screenshot</span>
                              <span className="text-xs">Supports PNG, JPG, screenshots & photos of other screens</span>
                            </button>
                          )}
                        </div>
                      )}
                    </CldUploadWidget>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">Upload temporarily unavailable</p>
                      <p className="text-xs">Please fill the form manually</p>
                    </div>
                  )}

                  {isScanning && (
                    <div className="mt-4 overflow-hidden relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <ScanLine className="w-5 h-5 text-white animate-pulse" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-900 leading-none">Scanning Receipt</p>
                            <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider mt-1">AI analyzing details</p>
                          </div>
                        </div>
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>

                      <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                      </div>

                      <style jsx>{`
                        @keyframes progress {
                          0% { transform: translateX(-100%); width: 30%; }
                          50% { width: 60%; }
                          100% { transform: translateX(400%); width: 30%; }
                        }
                      `}</style>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Flexible scanning: screenshots and photos of other screens are supported.
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
                    {memberDetails && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <p className="flex justify-between">
                          <span>Outstanding Penalties:</span>
                          <span className={memberDetails.unpaidPenalties > 0 ? "font-bold text-red-600" : "text-green-600"}>
                            MWK {memberDetails.unpaidPenalties.toLocaleString()}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Current Balance:</span>
                          <span className={memberDetails.balance < 0 ? "font-bold text-red-600" : "text-green-600"}>
                            MWK {memberDetails.balance.toLocaleString()}
                            {memberDetails.balance < 0 ? " (Owed)" : " (Credit)"}
                          </span>
                        </p>
                        <p className="flex justify-between pt-1 border-t border-blue-100 mt-1 font-semibold text-blue-900">
                          <span>Total Due Now:</span>
                          <span>MWK {totalDue.toLocaleString()}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> You can pay any amount. Contributions first pay off penalties, then the monthly amount. Remaining funds are added as credit.
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
                  <div className="space-y-1 mt-2">
                    <p className="text-sm text-gray-500 flex justify-between">
                      <span>Expected montly:</span>
                      <span>MWK {selectedGroup.monthlyContribution.toLocaleString()}</span>
                    </p>
                    <p className="text-sm font-medium flex justify-between">
                      <span>Remaining after this payment:</span>
                      <span className={remainingAfterPayment > 0 ? "text-orange-600" : "text-green-600"}>
                        MWK {remainingAfterPayment.toLocaleString()}
                      </span>
                    </p>
                    {isOverpaying && (
                      <p className="text-xs text-green-600 font-medium">
                        You are overpaying! MWK {(amountToPay - totalDue).toLocaleString()} will be added as credit.
                      </p>
                    )}
                  </div>
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
