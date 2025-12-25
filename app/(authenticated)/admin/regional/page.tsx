'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Building2,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface RegionalData {
  users: number
  groups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  region: string
}

interface GroupData {
  id: string
  name: string
  members: number
  monthlyContribution: number
  totalContributions: number
  status: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
}

export default function RegionalAdminPage() {
  const { user } = useUser()
  const [data, setData] = useState<RegionalData | null>(null)
  const [groups, setGroups] = useState<GroupData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('central')

  useEffect(() => {
    fetchRegionalData()
  }, [selectedRegion])

  const fetchRegionalData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/regional?region=${selectedRegion}`)
      if (!response.ok) throw new Error('Failed to fetch regional data')

      const data = await response.json()
      setData({
        users: data.users,
        groups: data.groups,
        totalContributions: data.totalContributions,
        activeLoans: data.activeLoans,
        pendingApprovals: data.pendingApprovals,
        region: data.region
      })

      setGroups(data.groupsData || [])
    } catch (error) {
      console.error('Failed to fetch regional data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/admin/regional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action: 'activate' })
      })
      if (!response.ok) throw new Error('Failed to approve group')

      fetchRegionalData() // Refresh data
    } catch (error) {
      console.error('Failed to approve group:', error)
    }
  }

  const handleSuspendGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/admin/regional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action: 'suspend' })
      })
      if (!response.ok) throw new Error('Failed to suspend group')

      fetchRegionalData() // Refresh data
    } catch (error) {
      console.error('Failed to suspend group:', error)
    }
  }

  if (user?.publicMetadata?.role !== 'REGIONAL_ADMIN' && user?.publicMetadata?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading regional data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Regional Administration</h1>
        <p className="text-gray-600">Manage groups and users in your region</p>
      </div>

      <div className="mb-6">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="northern">Northern Region</SelectItem>
            <SelectItem value="central">Central Region</SelectItem>
            <SelectItem value="southern">Southern Region</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.users}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.groups}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MWK {data?.totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data?.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Groups in {data?.region}</CardTitle>
              <CardDescription>
                Manage and monitor village banking groups in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{group.name}</h3>
                        <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {group.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.members} members
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          MWK {group.monthlyContribution.toLocaleString()}/month
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          MWK {group.totalContributions.toLocaleString()} total
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {group.status === 'ACTIVE' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendGroup(group.id)}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApproveGroup(group.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users in {data?.region}</CardTitle>
              <CardDescription>
                View and manage user accounts in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center py-8 text-gray-500">
                  User management interface coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan Management</CardTitle>
              <CardDescription>
                Review and approve loan applications in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Active</p>
                          <p className="text-2xl font-bold text-green-600">{data?.activeLoans}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Total Value</p>
                          <p className="text-2xl font-bold">MWK 1.2M</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Loan management interface coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Regional Reports</CardTitle>
              <CardDescription>
                Generate and view reports for your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Report generation interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
