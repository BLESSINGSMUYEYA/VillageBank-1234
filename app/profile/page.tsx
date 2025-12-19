'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  DollarSign, 
  CreditCard, 
  Calendar,
  TrendingUp,
  Award,
  Users,
  Target
} from 'lucide-react'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  region: string
  joinedAt: string
  isActive: boolean
}

interface GroupMembership {
  id: string
  name: string
  role: string
  status: string
  joinedAt: string
  monthlyContribution: number
  memberCount: number
}

interface FinancialSummary {
  totalContributions: number
  totalLoans: number
  outstandingLoanBalance: number
  contributionStreak: number
  eligibilityScore: number
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [financials, setFinancials] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) throw new Error('Failed to fetch profile data')
      
      const data = await response.json()
      setProfile({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
        region: data.region,
        joinedAt: data.joinedAt,
        isActive: data.isActive
      })

      setMemberships(data.memberships || [])
      setFinancials(data.financialSummary || {
        totalContributions: 0,
        totalLoans: 0,
        outstandingLoanBalance: 0,
        contributionStreak: 0,
        eligibilityScore: 0
      })
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View your personal information and activity</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{profile?.role}</Badge>
                <Badge variant="outline">{profile?.region} Region</Badge>
                <Badge variant={profile?.isActive ? 'default' : 'secondary'}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">
                {new Date(profile?.joinedAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MWK {financials?.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MWK {financials?.totalLoans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount borrowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">MWK {financials?.outstandingLoanBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current debt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribution Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{financials?.contributionStreak}</div>
            <p className="text-xs text-muted-foreground">Months in a row</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Group Memberships</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loan History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Eligibility</CardTitle>
                <CardDescription>
                  Your current eligibility for new loans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Eligibility Score</span>
                    <span>{financials?.eligibilityScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${financials?.eligibilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contribution History</span>
                    <Badge variant="outline">Excellent</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Repayment</span>
                    <Badge variant="outline">Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Standing</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                <Button className="w-full">Check Loan Eligibility</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Your accomplishments and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-medium">Early Bird</p>
                    <p className="text-sm text-gray-500">First month member</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-medium">Consistent</p>
                    <p className="text-sm text-gray-500">12 month streak</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">Team Player</p>
                    <p className="text-sm text-gray-500">Group treasurer</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-medium">Rising Star</p>
                    <p className="text-sm text-gray-500">Top contributor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Group Memberships</CardTitle>
              <CardDescription>
                Groups you belong to and your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{membership.name}</h3>
                        <Badge variant="outline">{membership.role}</Badge>
                        <Badge variant={membership.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {membership.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>Members: {membership.memberCount}</div>
                        <div>Monthly: MWK {membership.monthlyContribution.toLocaleString()}</div>
                        <div>Joined: {new Date(membership.joinedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Group</Button>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                Your monthly contribution records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Contribution history interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan History</CardTitle>
              <CardDescription>
                Your loan applications and repayment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Loan history interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
