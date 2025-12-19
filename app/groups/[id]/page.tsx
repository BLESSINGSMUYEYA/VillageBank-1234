'use client'

import { useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, DollarSign, CreditCard, Settings, Plus, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import GroupMembersList from '@/components/groups/GroupMembersList'
import GroupContributions from '@/components/groups/GroupContributions'
import GroupLoans from '@/components/groups/GroupLoans'

interface Group {
  id: string
  name: string
  description?: string
  region: string
  monthlyContribution: number
  maxLoanMultiplier: number
  interestRate: number
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
  contributions: Array<{
    id: string
    amount: number
    month: number
    year: number
    paymentMethod?: string
    transactionRef?: string
    status: string
    createdAt: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  loans: Array<{
    id: string
    amountRequested: number
    amountApproved?: number
    interestRate: number
    repaymentPeriodMonths: number
    status: string
    approvedById?: string
    approvedAt?: string
    createdAt: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  _count: {
    members: number
    contributions: number
    loans: number
  }
}

export default function GroupDetailPage() {
  const { userId } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading) {
    return <div>Loading group details...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!group) {
    return <div>Group not found</div>
  }

  // Find current user's role in this group
  const currentUserMember = group.members.find(
    member => member.userId === userId
  )

  const isAdmin = currentUserMember?.role === 'ADMIN'
  const isTreasurer = currentUserMember?.role === 'TREASURER'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/groups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">{group.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline">{group.region}</Badge>
          {isAdmin && (
            <Link href={`/groups/${group.id}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group._count.members}</div>
            <p className="text-xs text-muted-foreground">
              {group.members.filter(m => m.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(group.monthlyContribution)}</div>
            <p className="text-xs text-muted-foreground">
              Per member
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.interestRate}%</div>
            <p className="text-xs text-muted-foreground">
              Annual rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Multiplier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.maxLoanMultiplier}x</div>
            <p className="text-xs text-muted-foreground">
              Max loan calculation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <GroupMembersList 
            members={group.members.map(member => ({
              ...member,
              joinedAt: member.joinedAt
            }))} 
            groupId={group.id}
            currentUserRole={currentUserMember?.role}
          />
        </TabsContent>

        <TabsContent value="contributions">
          <GroupContributions 
            contributions={group.contributions}
            groupId={group.id}
            currentUserRole={currentUserMember?.role}
          />
        </TabsContent>

        <TabsContent value="loans">
          <GroupLoans 
            loans={group.loans}
            groupId={group.id}
            currentUserRole={currentUserMember?.role}
            key={group.id} // Add key to force re-render when group changes
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
