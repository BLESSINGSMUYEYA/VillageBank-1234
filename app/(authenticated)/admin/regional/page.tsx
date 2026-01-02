'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'
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
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
import { PageHeader } from '@/components/layout/PageHeader'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  phoneNumber: string | null
  joinedAt: string
  status: string
}

interface RegionalData {
  users: number
  groups: number
  totalContributions: number
  activeLoans: number
  pendingApprovals: number
  region: string
  usersData?: UserData[]
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
  const { user } = useAuth()
  const [data, setData] = useState<RegionalData | null>(null)
  const [groups, setGroups] = useState<GroupData[]>([])
  const [users, setUsers] = useState<UserData[]>([]) // Added users state
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('central')

  // User Management State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('') // State for role modification

  useEffect(() => {
    if (user?.region) {
      setSelectedRegion(user.region.toLowerCase())
    }
  }, [user])

  const fetchRegionalData = useCallback(async () => {
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
        region: data.region,
        usersData: data.usersData
      })

      setGroups(data.groupsData || [])
      setUsers(data.usersData || []) // Set users state
    } catch (error) {
      console.error('Failed to fetch regional data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedRegion])

  useEffect(() => {
    fetchRegionalData()
  }, [selectedRegion, fetchRegionalData])

  const handleApproveGroup = async (groupId: string) => {
    try {
      const response = await fetch('/api/admin/regional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action: 'activate_group' })
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
        body: JSON.stringify({ groupId, action: 'suspend_group' })
      })
      if (!response.ok) throw new Error('Failed to suspend group')

      fetchRegionalData() // Refresh data
    } catch (error) {
      console.error('Failed to suspend group:', error)
    }
  }

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user)
    setNewRole(user.role) // Initialize with current role
    setIsUserDialogOpen(true)
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const response = await fetch('/api/admin/regional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'change_role',
          newRole
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user role')
      }

      toast.success(`User role updated to ${newRole}`)
      fetchRegionalData() // Refresh list
    } catch (error: any) {
      console.error('Failed to update role:', error)
      toast.error(error.message)
    }
  }

  const handleUserAction = async (action: 'suspend_user' | 'activate_user') => {
    if (!selectedUser) return

    // In a real app, you'd call the API here
    // For now, we'll just close the modal as backend support is pending
    console.log(`Performing ${action} on user ${selectedUser.id}`)
    setIsUserDialogOpen(false)
    toast.success(`User ${action === 'suspend_user' ? 'suspended' : 'activated'} successfully`)
  }

  if (user?.role !== 'REGIONAL_ADMIN' && user?.role !== 'SUPER_ADMIN') {
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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl mx-auto py-6"
    >
      <motion.div variants={fadeIn} className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-4">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Hub
        </Link>
        <PageHeader
          title="Regional Administration"
          description="Manage groups and users in your region"
        />
      </motion.div>

      <div className="mb-6">
        {user?.role === 'SUPER_ADMIN' ? (
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="northern">Northern Region</SelectItem>
              <SelectItem value="central">Central Region</SelectItem>
              <SelectItem value="southern">Southern Region</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-slate-100 dark:bg-slate-800 text-sm font-medium">
            <span className="text-gray-500 dark:text-gray-400">Current Region:</span>
            <span className="capitalize text-slate-900 dark:text-slate-100">
              {user?.region?.toLowerCase() || selectedRegion} Region
            </span>
          </div>
        )}
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
                  <Input placeholder="Search users by name or email..." className="max-w-sm" />
                </div>

                <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium hidden md:table-cell">Contact</th>
                        <th className="p-4 font-medium hidden md:table-cell">Role</th>
                        <th className="p-4 font-medium hidden md:table-cell">Joined</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No users found in this region.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                              <div className="text-xs text-muted-foreground md:hidden capitalize">{user.role}</div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <div className="text-xs">{user.email}</div>
                              {user.phoneNumber && <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <Badge variant={user.role === 'MEMBER' ? 'secondary' : 'default'}>
                                {user.role.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              {new Date(user.joinedAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageUser(user)}
                              >
                                Manage
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              View details and manage access for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Name:</span>
                <span className="col-span-3 text-sm">{selectedUser.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Email:</span>
                <span className="col-span-3 text-sm">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Phone:</span>
                <span className="col-span-3 text-sm">{selectedUser.phoneNumber || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Current Role:</span>
                <span className="col-span-3 text-sm flex items-center gap-2">
                  <Badge variant={selectedUser.role === 'MEMBER' ? 'secondary' : 'default'}>
                    {selectedUser.role}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">New Role:</span>
                <div className="col-span-3 flex gap-2">
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">MEMBER</SelectItem>
                      <SelectItem value="REGIONAL_ADMIN">REGIONAL ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleChangeRole} disabled={newRole === selectedUser.role}>
                    Update
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-right text-sm">Joined:</span>
                <span className="col-span-3 text-sm">
                  {new Date(selectedUser.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={() => handleUserAction('suspend_user')}>
              Suspend User
            </Button>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
