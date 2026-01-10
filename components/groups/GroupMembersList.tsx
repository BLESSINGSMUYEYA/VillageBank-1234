'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
        <div className="px-5 sm:px-6 flex items-center justify-between">
          <h2 className="text-section-title text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Active Members
          </h2>
        </div>

        <div className="space-y-1">
          {activeMembers.map((member) => (
            <div
              key={member.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-border/10 last:border-0 gap-4"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 border-2 border-white/10 shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarFallback className="font-black text-xs text-blue-600 bg-blue-50 dark:text-blue-100 dark:bg-blue-900/50">
                    {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-body-primary font-black text-foreground tracking-tight">
                      {member.user?.firstName || ''} {member.user?.lastName || ''}
                    </p>
                    <Badge
                      className={cn(
                        "text-tab-label px-2 py-0 border-0",
                        member.role === 'ADMIN' ? 'bg-blue-600 text-white' :
                          member.role === 'TREASURER' ? 'bg-banana text-yellow-950' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      )}
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-micro font-bold text-muted-foreground uppercase tracking-wider opacity-70">
                    {member.user?.email || 'No email'} • Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-14 sm:pl-0">
                {currentUserRole === 'ADMIN' && member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900/90 backdrop-blur-xl border-white/10 rounded-xl p-1 shadow-2xl">
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'TREASURER')} className="rounded-lg font-bold text-xs gap-2 text-slate-300 focus:text-white focus:bg-white/10">
                        <Shield className="h-3.5 w-3.5" /> Make Treasurer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'SECRETARY')} className="rounded-lg font-bold text-xs gap-2 text-slate-300 focus:text-white focus:bg-white/10">
                        <MessageSquare className="h-3.5 w-3.5" /> Make Secretary
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'MEMBER')} className="rounded-lg font-bold text-xs gap-2 text-slate-300 focus:text-white focus:bg-white/10">
                        <UserX className="h-3.5 w-3.5" /> Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => handleRemoveMember(member.id)} className="rounded-lg font-bold text-xs gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10">
                        <UserX className="h-3.5 w-3.5" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-dashed border-white/10">
          <div className="px-5 sm:px-6 flex items-center justify-between">
            <h2 className="text-body-primary font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Requests
            </h2>
            <span className="text-micro font-black bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">
              {pendingMembers.length}
            </span>
          </div>

          <div className="space-y-1">
            {pendingMembers.map((member) => (
              <div key={member.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-orange-500/5 transition-colors border-b border-white/5 last:border-0 gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border-2 border-orange-500/20 shadow-sm">
                    <AvatarFallback className="font-black text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                      {(member.user?.firstName?.charAt(0) || '') + (member.user?.lastName?.charAt(0) || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-body-primary font-black text-foreground tracking-tight">
                      {member.user?.firstName || ''} {member.user?.lastName || ''}
                    </p>
                    <p className="text-micro font-bold text-muted-foreground uppercase tracking-wider opacity-70">
                      Requested {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-14 sm:pl-0">
                  {currentUserRole === 'ADMIN' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRoleChange(member.id, 'MEMBER')}
                        disabled={loading}
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-tab-label rounded-lg px-4"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                        className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 text-tab-label rounded-lg px-3"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
