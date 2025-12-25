'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, DollarSign, MessageSquare, UserX } from 'lucide-react'

interface Member {
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
}

interface GroupMembersListProps {
  members: Member[]
  groupId: string
  currentUserRole?: string
  currentUserId: string
}

export default function GroupMembersList({ members, groupId, currentUserRole, currentUserId }: GroupMembersListProps) {
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this member's role to ${newRole}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activeMembers = members.filter(m => m.status === 'ACTIVE')
  const pendingMembers = members.filter(m => m.status === 'PENDING')

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-black text-foreground">Active Members ({activeMembers.length})</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Members who can participate in group activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative group">
                        <Avatar className="relative w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-full border border-border shadow-sm overflow-hidden">
                          <AvatarFallback className="font-black text-blue-900 bg-blue-50 dark:text-blue-100 dark:bg-blue-900">
                            {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-black text-sm">
                          {member.user?.firstName || ''} {member.user?.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === 'ADMIN' ? 'default' :
                          member.role === 'TREASURER' ? 'secondary' :
                            member.role === 'SECRETARY' ? 'outline' : 'outline'
                      }
                      className="font-bold uppercase tracking-wider text-xs"
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentUserRole === 'ADMIN' && member.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'TREASURER')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Treasurer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'SECRETARY')}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Make Secretary
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'MEMBER')}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-black text-orange-700 dark:text-orange-400">Pending Members ({pendingMembers.length})</CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Members waiting to be approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <Avatar className="relative w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-full border border-border shadow-sm overflow-hidden">
                            <AvatarFallback className="font-black text-orange-700 bg-orange-50 dark:text-orange-100 dark:bg-orange-900">
                              {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-black text-sm">
                            {member.user?.firstName || ''} {member.user?.lastName || ''}
                          </p>
                          <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUserRole === 'ADMIN' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleRoleChange(member.id, 'MEMBER')}
                            disabled={loading}
                            className="rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={loading}
                            className="rounded-xl font-bold border-border hover:border-red-500 hover:text-red-600 transition-colors"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
