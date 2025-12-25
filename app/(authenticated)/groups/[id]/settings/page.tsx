'use client'

import { useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Settings, Users, DollarSign, CreditCard, TrendingUp, AlertCircle, Save } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Group {
  id: string
  name: string
  description?: string
  region: string
  monthlyContribution: number
  maxLoanMultiplier: number
  interestRate: number
  penaltyAmount: number
  contributionDueDay: number
  isActive: boolean
  createdAt: string
  members: Array<{
    id: string
    userId: string
    role: string
    status: string
    joinedAt: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phoneNumber: string
    }
  }>
  _count: {
    members: number
    contributions: number
    loans: number
  }
}

export default function GroupSettingsPage() {
  const { userId } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    monthlyContribution: '',
    maxLoanMultiplier: '',
    interestRate: '',
    penaltyAmount: '',
    contributionDueDay: '',
    isActive: true
  })

  useEffect(() => {
    if (!userId) return

    fetchGroupData()
  }, [userId, params.id])

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/groups')
          return
        }
        throw new Error('Failed to fetch group data')
      }

      const data = await response.json()
      setGroup(data)

      // Initialize form data
      setFormData({
        name: data.name,
        description: data.description || '',
        region: data.region,
        monthlyContribution: data.monthlyContribution.toString(),
        maxLoanMultiplier: data.maxLoanMultiplier.toString(),
        interestRate: data.interestRate.toString(),
        penaltyAmount: data.penaltyAmount.toString(),
        contributionDueDay: data.contributionDueDay.toString(),
        isActive: data.isActive
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!group) return

    try {
      setSaving(true)
      setError('')
      setSuccess(false)

      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          region: formData.region,
          monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
          maxLoanMultiplier: parseFloat(formData.maxLoanMultiplier) || 1,
          interestRate: parseFloat(formData.interestRate) || 0,
          penaltyAmount: parseFloat(formData.penaltyAmount) || 0,
          contributionDueDay: parseInt(formData.contributionDueDay) || 5,
          isActive: formData.isActive
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update group settings')
      }

      const updatedGroup = await response.json()
      setGroup(updatedGroup)
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!userId) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading) {
    return <div>Loading group settings...</div>
  }

  if (error && !group) {
    return <div>Error: {error}</div>
  }

  if (!group) {
    return <div>Group not found</div>
  }

  // Find current user's role in this group
  const currentUserMember = group?.members?.find(
    member => member.userId === userId
  )

  const isAdmin = currentUserMember?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Only group administrators can access settings.
            </p>
            <Link href={`/groups/${group.id}`}>
              <Button variant="outline" className="w-full sm:w-auto rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                Back to Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-3">
          <Link href={`/groups/${group.id}`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold border-border hover:border-blue-700 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Group
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-100">Group Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium">Manage your group configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={group.isActive ? 'default' : 'secondary'} className={`font-bold uppercase tracking-wider text-xs px-3 py-1 ${group.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' : 'bg-muted text-muted-foreground'}`}>
            {group.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {success && (
        <Alert className="bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/30 backdrop-blur-md border-none shadow-xl">
          <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 backdrop-blur-md border-none shadow-xl">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100">Basic Information</CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Update your group&apos;s basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-bold text-foreground">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-bold text-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  placeholder="Describe your group's purpose"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="region" className="text-sm font-bold text-foreground">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => handleInputChange('region', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORTHERN">Northern</SelectItem>
                    <SelectItem value="CENTRAL">Central</SelectItem>
                    <SelectItem value="SOUTHERN">Southern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100">Financial Settings</CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Configure contribution and loan parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyContribution" className="text-sm font-bold text-foreground">Monthly Contribution</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={formData.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                    className="mt-1"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate" className="text-sm font-bold text-foreground">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    className="mt-1"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxLoanMultiplier" className="text-sm font-bold text-foreground">Loan Multiplier</Label>
                <Input
                  id="maxLoanMultiplier"
                  type="number"
                  value={formData.maxLoanMultiplier}
                  onChange={(e) => handleInputChange('maxLoanMultiplier', e.target.value)}
                  className="mt-1"
                  placeholder="1"
                  min="1"
                  max="10"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum loan amount = (Total contributions × Multiplier)
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-black mb-3">Penalty Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="penaltyAmount" className="text-sm font-bold text-foreground">Late Penalty Amount</Label>
                    <Input
                      id="penaltyAmount"
                      type="number"
                      value={formData.penaltyAmount}
                      onChange={(e) => handleInputChange('penaltyAmount', e.target.value)}
                      className="mt-1"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Charged for late contributions</p>
                  </div>

                  <div>
                    <Label htmlFor="contributionDueDay" className="text-sm font-bold text-foreground">Due Day of Month (1-31)</Label>
                    <Input
                      id="contributionDueDay"
                      type="number"
                      value={formData.contributionDueDay}
                      onChange={(e) => handleInputChange('contributionDueDay', e.target.value)}
                      className="mt-1"
                      placeholder="5"
                      min="1"
                      max="31"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Deadline for contributions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Settings */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100">Group Status</CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Control group activity and membership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isActive" className="text-sm font-bold text-foreground">
                  Group is active
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Inactive groups cannot receive new contributions or loan applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Stats */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-100">Group Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Members</span>
                <span className="font-black text-foreground">{group._count.members}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Members</span>
                <span className="font-black text-foreground">
                  {group.members.filter(m => m.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Contributions</span>
                <span className="font-black text-foreground">{group._count.contributions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Loans</span>
                <span className="font-black text-foreground">{group._count.loans}</span>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-xl font-bold border-border hover:border-orange-500 hover:text-orange-600 transition-colors"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/groups/${group.id}/penalties`, { method: 'POST' })
                      if (res.ok) {
                        const data = await res.json()
                        alert(`Penalty check completed. Applied ${data.penaltiesApplied} penalties.`)
                      } else {
                        alert('Failed to run penalty check.')
                      }
                    } catch (e) {
                      alert('An error occurred.')
                    }
                  }}
                >
                  <AlertCircle className="w-3 h-3 mr-2" />
                  Run Penalty Check Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-black text-blue-900 dark:text-blue-100">Save Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl font-bold bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Link href={`/groups/${group.id}`}>
                <Button variant="outline" className="w-full rounded-xl font-bold border-border hover:border-red-500 hover:text-red-600 transition-colors">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
