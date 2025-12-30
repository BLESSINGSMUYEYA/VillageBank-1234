'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, MessageSquare, UserX, Users, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

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

      window.location.reload()
    } catch (error) {
      console.error('Error updating role:', error)
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

      window.location.reload()
    } catch (error) {
      console.error('Error removing member:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeMembers = members.filter(m => m.status === 'ACTIVE')
  const pendingMembers = members.filter(m => m.status === 'PENDING')

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Active Members */}
      <div className="space-y-4">
        <div className="px-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Active Members
            <span className="text-sm font-bold bg-blue-500/10 text-blue-600 dark:text-banana dark:bg-banana/10 px-2.5 py-0.5 rounded-full">
              {activeMembers.length}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto scrollbar-premium">
          <Table>
            <TableHeader className="bg-white/30 dark:bg-slate-900/30">
              <TableRow className="hover:bg-transparent border-b border-white/20 dark:border-white/10">
                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Member</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Role</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest">Joined</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((member) => (
                <TableRow key={member.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 border-2 border-white/50 dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform">
                        <AvatarFallback className="font-black text-blue-900 bg-blue-50 dark:text-blue-100 dark:bg-blue-900">
                          {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm text-foreground">
                          {member.user?.firstName || ''} {member.user?.lastName || ''}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-bold opacity-70 truncate max-w-[150px] sm:max-w-none">
                          {member.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-lg",
                        member.role === 'ADMIN' ? 'bg-blue-600 text-white shadow-sm' :
                          member.role === 'TREASURER' ? 'bg-banana text-banana-foreground shadow-sm' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-muted-foreground italic">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {currentUserRole === 'ADMIN' && member.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-blue-500/10 hover:text-blue-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl">
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'TREASURER')} className="rounded-xl font-black text-xs gap-2 focus:bg-blue-500/10 focus:text-blue-600">
                            <Shield className="h-3.5 w-3.5" /> Make Treasurer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'SECRETARY')} className="rounded-xl font-black text-xs gap-2 focus:bg-blue-500/10 focus:text-blue-600">
                            <MessageSquare className="h-3.5 w-3.5" /> Make Secretary
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'MEMBER')} className="rounded-xl font-black text-xs gap-2 focus:bg-blue-500/10 focus:text-blue-600">
                            <UserX className="h-3.5 w-3.5" /> Make Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="rounded-xl font-black text-xs gap-2 text-red-600 focus:bg-red-500/10 focus:text-red-600">
                            <UserX className="h-3.5 w-3.5" /> Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10 dark:border-white/5">
          <div className="px-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-orange-600 dark:text-banana flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Requests
              <span className="text-sm font-bold bg-orange-500/10 text-orange-600 dark:text-banana dark:bg-banana/10 px-2.5 py-0.5 rounded-full">
                {pendingMembers.length}
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto scrollbar-premium">
            <Table>
              <TableHeader className="bg-orange-500/5 dark:bg-banana/5">
                <TableRow className="hover:bg-transparent border-b border-white/20 dark:border-white/10">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Person</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest">Requested</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMembers.map((member) => (
                  <TableRow key={member.id} className="border-b border-white/10 dark:border-white/5 hover:bg-orange-500/5 transition-colors group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-orange-200 dark:border-banana/20 shadow-sm">
                          <AvatarFallback className="font-black text-orange-700 bg-orange-50 dark:text-banana dark:bg-banana/10">
                            {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-sm text-foreground">
                            {member.user?.firstName || ''} {member.user?.lastName || ''}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-bold opacity-70">
                            {member.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-muted-foreground italic">
                      {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {currentUserRole === 'ADMIN' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRoleChange(member.id, 'MEMBER')}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-4"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={loading}
                            className="rounded-xl font-black border-2 border-border hover:border-red-500 hover:text-red-600 transition-colors px-4"
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
          </div>
        </div>
      )}
    </div>
  )
}
