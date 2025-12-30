'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, DollarSign, CheckCircle, Upload, ScanLine, Loader2, Info, Shield, TrendingUp, Zap } from 'lucide-react'
import { CldUploadWidget } from 'next-cloudinary'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, itemFadeIn, staggerContainer } from '@/lib/motions'
import { cn } from '@/lib/utils'

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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-20"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Make Contribution"
          description="Record your monthly stake in the collective wealth"
          action={
            <Link href="/contributions">
              <Button variant="outline" className="rounded-xl font-black border-white/20 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pulse
              </Button>
            </Link>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-8" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-10">
                {error && (
                  <Alert variant="destructive" className="rounded-2xl">
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/30 rounded-2xl">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300 font-bold">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-8">
                  <SectionHeader
                    title="Financial Source"
                    icon={DollarSign}
                  />

                  <div className="grid gap-6">
                    <FormGroup label="Target Group *">
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
                              {group.name} - {group.region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormGroup>

                    {selectedGroup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-blue-500/5 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-500/10 space-y-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <h4 className="text-sm font-black uppercase tracking-wider text-blue-900 dark:text-blue-100">Live Member Standings</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                          <div className="p-3 bg-white/40 dark:bg-black/20 rounded-xl">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Monthly Plan</p>
                            <p className="text-lg font-black text-foreground">MWK {selectedGroup?.monthlyContribution.toLocaleString()}</p>
                          </div>
                          {memberDetails && (
                            <>
                              <div className="p-3 bg-white/40 dark:bg-black/20 rounded-xl">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Penalties Due</p>
                                <p className={cn("text-lg font-black", memberDetails.unpaidPenalties > 0 ? "text-red-500" : "text-emerald-500")}>
                                  MWK {memberDetails.unpaidPenalties.toLocaleString()}
                                </p>
                              </div>
                              <div className="p-3 bg-white/40 dark:bg-black/20 rounded-xl sm:col-span-2 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Effective Liability</p>
                                  <p className="text-2xl font-black text-blue-600 dark:text-banana">MWK {totalDue.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Current Balance</p>
                                  <p className={cn("font-bold", memberDetails.balance < 0 ? "text-red-500" : "text-emerald-500")}>
                                    MWK {memberDetails.balance.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}

                    <FormGroup label="Investment Amount (MWK) *">
                      <PremiumInput
                        id="amount"
                        name="amount"
                        type="number"
                        prefix="MWK"
                        placeholder="Enter amount"
                        value={formData.amount}
                        onChange={handleChange}
                      />
                      {selectedGroup && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            REMAINING AFTER: <span className={cn(remainingAfterPayment > 0 ? "text-orange-500" : "text-emerald-500")}>MWK {remainingAfterPayment.toLocaleString()}</span>
                          </p>
                          {isOverpaying && (
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> CREDITED: MWK {(amountToPay - totalDue).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </FormGroup>
                  </div>
                </div>

                <div className="space-y-8">
                  <SectionHeader
                    title="Transmission Verification"
                    icon={Upload}
                  />

                  <div className="grid gap-6">
                    <FormGroup label="Payment Architecture *">
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v }))}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                          <SelectValue placeholder="Identify transmission channel" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                          <SelectItem value="AIRTEL_MONEY" className="font-bold">Airtel Money</SelectItem>
                          <SelectItem value="MPAMBA" className="font-bold">Mpamba</SelectItem>
                          <SelectItem value="BANK_CARD" className="font-bold">Bank Card</SelectItem>
                          <SelectItem value="CASH" className="font-bold">Cash</SelectItem>
                          <SelectItem value="OTHER" className="font-bold">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>

                    <FormGroup label="System Transaction Reference">
                      <PremiumInput
                        id="transactionRef"
                        name="transactionRef"
                        placeholder="Enter network transaction hash"
                        value={formData.transactionRef}
                        onChange={handleChange}
                      />
                    </FormGroup>

                    <FormGroup label="Receipt Artifact (Optional)">
                      {cloudinaryConfig.cloudName ? (
                        <CldUploadWidget
                          uploadPreset={cloudinaryConfig.uploadPreset}
                          options={{
                            maxFiles: 1,
                            resourceType: 'image',
                            clientAllowedFormats: ['png', 'jpg', 'jpeg'],
                            maxFileSize: 5000000,
                            folder: 'village-banking/receipts',
                          }}
                          onSuccess={(result: any) => {
                            if (result?.info?.secure_url) {
                              setReceiptUrl(result.info.secure_url)
                              setShouldScan(true)
                            }
                          }}
                        >
                          {({ open }) => (
                            <div className="w-full">
                              {receiptUrl ? (
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-blue-500/20 bg-black/5">
                                  <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-contain" />
                                  <div className="absolute top-4 right-4">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setReceiptUrl('')}
                                      className="rounded-xl font-bold backdrop-blur-md bg-white/50"
                                    >
                                      Re-upload
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => open?.()}
                                  className="w-full h-40 flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                                >
                                  <div className="p-3 bg-white/5 dark:bg-black/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-blue-500" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-black text-foreground">Deploy Receipt Artifact</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">PNG, JPG, Screen Grabs</p>
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </CldUploadWidget>
                      ) : (
                        <div className="h-40 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                          <Upload className="w-8 h-8 mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest">Protocol Offline</p>
                        </div>
                      )}

                      <AnimatePresence>
                        {isScanning && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 overflow-hidden relative"
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                                  <ScanLine className="w-6 h-6 text-white animate-pulse" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-foreground">AI Neural Analysis</p>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Extracting Ledger Data</p>
                                </div>
                              </div>
                              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-600"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                style={{ width: '40%' }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                        Validating Stake...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Formalize Contribution
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div variants={itemFadeIn}>
            <GlassCard className="p-8 space-y-6" hover={false}>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-4">Protocol Insights</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-xs uppercase tracking-wider">Priority Settlement</p>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Contributions automatically settle active penalties before applying to your monthly target.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg h-fit">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-xs uppercase tracking-wider">Stake Accrual</p>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Any amount exceeding your current liability will be added to your member balance as future credit.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg h-fit">
                    <Zap className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-xs uppercase tracking-wider">AI Acceleration</p>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Uploading a receipt artifact allows our OCR engine to auto-populate critical financial fields.</p>
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

export default function NewContributionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewContributionPageContent />
    </Suspense>
  )
}
