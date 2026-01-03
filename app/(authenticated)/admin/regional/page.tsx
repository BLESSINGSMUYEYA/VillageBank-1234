'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Building2,
  DollarSign,
  Search,
  MoreVertical,
  Activity,
  ShieldAlert,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle
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
import { fadeIn, staggerContainer } from '@/lib/motions'
import { AdminStatsCard } from '@/components/admin/AdminStatsCard'
import { AdminGlassCard } from '@/components/admin/AdminGlassCard'

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
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('central')

  // User Management State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')

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
      setUsers(data.usersData || [])
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
      fetchRegionalData()
      toast.success('Group activated successfully')
    } catch (error) {
      console.error('Failed to approve group:', error)
      toast.error('Failed to activate group')
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
      fetchRegionalData()
      toast.success('Group suspended')
    } catch (error) {
      console.error('Failed to suspend group:', error)
      toast.error('Failed to suspend group')
    }
  }

  const handleManageUser = (user: UserData) => {
    setSelectedUser(user)
    setNewRole(user.role)
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
      fetchRegionalData()
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      /* eslint-enable @typescript-eslint/no-explicit-any */
      console.error('Failed to update role:', error)
      toast.error(error.message)
    }
  }

  const handleUserAction = async (action: 'suspend_user' | 'activate_user') => {
    if (!selectedUser) return
    console.log(`Performing ${action} on user ${selectedUser.id}`)
    setIsUserDialogOpen(false)
    toast.success(`User ${action === 'suspend_user' ? 'suspended' : 'activated'} successfully`)
  }

  if (user?.role !== 'REGIONAL_ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this area.</p>
          <Link href="/dashboard">
            <Button className="mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading command center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative z-10"
      >
        <motion.div variants={fadeIn} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 group mb-2">
              <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Return to Hub
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              <span className="text-gradient-primary">Regional Command</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Managing {user?.region?.toLowerCase() || selectedRegion} Territory
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'SUPER_ADMIN' ? (
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-white/20">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northern">Northern Region</SelectItem>
                  <SelectItem value="central">Central Region</SelectItem>
                  <SelectItem value="southern">Southern Region</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="px-4 py-2 bg-primary/5 border-primary/20 text-primary capitalize text-sm">
                {user?.region?.toLowerCase() || selectedRegion} Region
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminStatsCard
            title="Total Users"
            value={data?.users || 0}
            icon={Users}
            trend="+12%"
            trendDirection="up"
            delay={100}
            className="border-blue-200/50 dark:border-blue-800/50"
          />
          <AdminStatsCard
            title="Active Groups"
            value={data?.groups || 0}
            icon={Building2}
            trend="+2 New"
            trendDirection="up"
            delay={200}
            className="border-indigo-200/50 dark:border-indigo-800/50"
          />
          <AdminStatsCard
            title="Total Assets"
            value={`MWK ${(data?.totalContributions || 0).toLocaleString()}`}
            icon={DollarSign}
            trend="+18%"
            trendDirection="up"
            delay={300}
            className="border-emerald-200/50 dark:border-emerald-800/50"
          />
          <AdminStatsCard
            title="Pending Actions"
            value={data?.pendingApprovals || 0}
            icon={AlertTriangle}
            trend="Needs Attention"
            trendDirection="down"
            delay={400}
            className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10"
          />
        </div>

        {/* Main Content Areas */}
        <Tabs defaultValue="groups" className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-1 h-12 rounded-full border border-white/20">
              <TabsTrigger value="groups" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Groups</TabsTrigger>
              <TabsTrigger value="users" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Users</TabsTrigger>
              <TabsTrigger value="loans" className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Loans</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="groups" className="space-y-6">
            <AdminGlassCard
              title="Active Groups"
              description="Monitor and manage village banks in your territory."
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b border-primary/10">
                    <tr>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Group Name</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Metrics</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Financials</th>
                      <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Status</th>
                      <th className="text-right p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{group.name}</div>
                          <div className="text-xs text-muted-foreground">Est. {new Date(group.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="w-3.5 h-3.5" /> {group.members}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            MWK {group.totalContributions.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {group.monthlyContribution.toLocaleString()}/mo
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'} className={group.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200' : ''}>
                            {group.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {group.status === 'ACTIVE' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuspendGroup(group.id)}
                                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleApproveGroup(group.id)}
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Activate
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminGlassCard>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminGlassCard
              title="User Registry"
              description="Manage user roles and access."
              action={
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search users..." className="pl-9 bg-white/50 border-border/40" />
                </div>
              }
            >
              <table className="w-full">
                <thead className="bg-primary/5 border-b border-primary/10">
                  <tr>
                    <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">User</th>
                    <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider hidden md:table-cell">Contact</th>
                    <th className="text-left p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Role</th>
                    <th className="text-right p-4 text-xs font-black uppercase text-muted-foreground tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-md">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm">{user.email}</div>
                        {user.phoneNumber && <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            user.role === 'REGIONAL_ADMIN'
                              ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }
                          variant="outline"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageUser(user)}
                          className="h-8 hover:bg-primary/10 hover:text-primary"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminGlassCard>
          </TabsContent>

          <TabsContent value="loans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <AdminStatsCard title="Pending" value="12" icon={Clock} className="border-amber-200" trend="Requires Review" trendDirection="neutral" />
              <AdminStatsCard title="Active" value={data?.activeLoans || 0} icon={CheckCircle} className="border-emerald-200" trend="Healthy" trendDirection="up" />
              <AdminStatsCard title="Total Value" value="MK 1.2M" icon={Activity} className="border-blue-200" />
            </div>

            <AdminGlassCard title="Loan Applications">
              <div className="p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Loan Management Module</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                  Advanced loan analytics and approval workflows are currently being provisioned for your region.
                </p>
              </div>
            </AdminGlassCard>
          </TabsContent>
        </Tabs>

        {/* User Management Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px] glass-morphism border-white/20">
            <DialogHeader>
              <DialogTitle>Manage User Profile</DialogTitle>
              <DialogDescription>
                Modify access levels for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign New Role</label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member (Standard)</SelectItem>
                      <SelectItem value="REGIONAL_ADMIN">Regional Admin (Admin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="destructive" onClick={() => handleUserAction('suspend_user')} className="w-full sm:w-auto">
                Suspend
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setIsUserDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleChangeRole} disabled={newRole === selectedUser?.role} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
