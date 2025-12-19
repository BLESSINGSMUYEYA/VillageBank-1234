'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'

export default function CreateGroupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    monthlyContribution: '',
    maxLoanMultiplier: '3',
    interestRate: '10',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Real-time validation
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}
    
    switch (name) {
      case 'name':
        if (value && value.length < 3) {
          errors.name = 'Group name must be at least 3 characters long'
        } else if (value && value.length > 50) {
          errors.name = 'Group name must be less than 50 characters'
        }
        break
      case 'monthlyContribution':
        const contribution = parseFloat(value)
        if (value && (isNaN(contribution) || contribution <= 0)) {
          errors.monthlyContribution = 'Monthly contribution must be a positive number'
        } else if (value && contribution > 1000000) {
          errors.monthlyContribution = 'Monthly contribution seems too high'
        }
        break
      case 'maxLoanMultiplier':
        const multiplier = parseInt(value)
        if (value && (isNaN(multiplier) || multiplier < 1 || multiplier > 10)) {
          errors.maxLoanMultiplier = 'Loan multiplier must be between 1 and 10'
        }
        break
      case 'interestRate':
        const interest = parseFloat(value)
        if (value && (isNaN(interest) || interest < 0 || interest > 100)) {
          errors.interestRate = 'Interest rate must be between 0 and 100'
        }
        break
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.region || !formData.monthlyContribution) {
      setError('All required fields must be filled')
      return false
    }

    if (formData.name.length < 3) {
      setError('Group name must be at least 3 characters long')
      return false
    }

    const contribution = parseFloat(formData.monthlyContribution)
    if (isNaN(contribution) || contribution <= 0) {
      setError('Monthly contribution must be a positive number')
      return false
    }

    const multiplier = parseInt(formData.maxLoanMultiplier)
    if (isNaN(multiplier) || multiplier < 1 || multiplier > 10) {
      setError('Loan multiplier must be between 1 and 10')
      return false
    }

    const interest = parseFloat(formData.interestRate)
    if (isNaN(interest) || interest < 0 || interest > 100) {
      setError('Interest rate must be between 0 and 100')
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
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          region: formData.region,
          monthlyContribution: parseFloat(formData.monthlyContribution),
          maxLoanMultiplier: parseInt(formData.maxLoanMultiplier),
          interestRate: parseFloat(formData.interestRate),
        }),
      })

     const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create group')
      } else {
        // Add a small delay to ensure database transaction is complete
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push(`/groups/${data.groupId}`)
      }
    } catch (error) {
      console.error('Group creation error:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Network error. Please check your internet connection and try again.')
        } else if (error.message.includes('timeout')) {
          setError('Request timed out. Please try again.')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Creating your group...</span>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/groups" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
          <p className="text-gray-600">Set up a new village banking group</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>
              Fill in the information for your new village banking group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the purpose of this group (optional)"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <select
                  id="region"
                  name="region"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select region</option>
                  <option value="NORTHERN">Northern</option>
                  <option value="SOUTHERN">Southern</option>
                  <option value="CENTRAL">Central</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution (MWK) *</Label>
                <Input
                  id="monthlyContribution"
                  name="monthlyContribution"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 10000"
                  value={formData.monthlyContribution}
                  onChange={handleChange}
                  required
                  className={fieldErrors.monthlyContribution ? 'border-red-500' : ''}
                />
                {fieldErrors.monthlyContribution && (
                  <p className="text-sm text-red-500">{fieldErrors.monthlyContribution}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoanMultiplier">Loan Multiplier</Label>
                  <Input
                    id="maxLoanMultiplier"
                    name="maxLoanMultiplier"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={formData.maxLoanMultiplier}
                    onChange={handleChange}
                    className={fieldErrors.maxLoanMultiplier ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum loan = contributions × multiplier
                  </p>
                  {fieldErrors.maxLoanMultiplier && (
                    <p className="text-sm text-red-500">{fieldErrors.maxLoanMultiplier}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    name="interestRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={formData.interestRate}
                    onChange={handleChange}
                    className={fieldErrors.interestRate ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    Annual interest rate on loans
                  </p>
                  {fieldErrors.interestRate && (
                    <p className="text-sm text-red-500">{fieldErrors.interestRate}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/groups">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="min-w-30">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Group'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
