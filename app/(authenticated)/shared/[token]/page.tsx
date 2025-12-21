'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, DollarSign, UserPlus, Eye, Shield, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface SharedGroupData {
  share: {
    sharedBy: {
      firstName: string
      lastName: string
    }
    permissions: string
    expiresAt?: string
    currentUses: number
  }
  group: {
    name: string
    description?: string
    _count: {
      members: number
      contributions: number
    }
    monthlyContribution?: number
    members?: Array<{
      user: {
        firstName?: string
        lastName?: string
      }
    }>
  }
}

export default function SharedGroupPage() {
  const params = useParams()
  const [groupData, setGroupData] = useState<SharedGroupData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSharedGroup = async () => {
      try {
        const response = await fetch(`/api/shared/${params.token}`)
        const data = await response.json()
        
        if (response.ok) {
          setGroupData(data)
        } else {
          toast.error(data.error || 'Failed to load shared group')
        }
      } catch (error) {
        console.error('Failed to load shared group:', error)
        toast.error('Failed to load shared group')
      } finally {
        setLoading(false)
      }
    }

    if (params.token) {
      fetchSharedGroup()
    }
  }, [params.token])

  const requestToJoin = async () => {
    // Implementation for joining request
    toast.success('Join request sent successfully!')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-sm sm:text-base">Loading...</div>
  }

  if (!groupData) {
    return <div className="flex justify-center items-center min-h-screen text-sm sm:text-base">Group not found</div>
  }

  const { share, group } = groupData

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl">{group.name}</CardTitle>
                {group.description && (
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">{group.description}</p>
                )}
              </div>
              <div className="self-start">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  Shared by {share.sharedBy.firstName} {share.sharedBy.lastName}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Share Info */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Access Level</span>
                  <Badge variant="outline" className="text-xs">
                    {share.permissions === 'VIEW_ONLY' && 'View Only'}
                    {share.permissions === 'REQUEST_JOIN' && 'Can Request to Join'}
                    {share.permissions === 'LIMITED_ACCESS' && 'Limited Access'}
                    {share.permissions === 'FULL_PREVIEW' && 'Full Preview'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {share.expiresAt 
                      ? `Expires ${new Date(share.expiresAt).toLocaleDateString()}`
                      : 'Never expires'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs sm:text-sm">{share.currentUses} views</span>
                </div>
              </div>
              
              {share.permissions !== 'VIEW_ONLY' && (
                <Button onClick={requestToJoin} className="flex items-center gap-2 w-full sm:w-auto">
                  <UserPlus className="h-4 w-4" />
                  Request to Join
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{group._count.members}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
                <div>
                  {group.monthlyContribution ? (
                    <>
                      <p className="text-xl sm:text-2xl font-bold">${group.monthlyContribution}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Monthly Contribution</p>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">Contribution info hidden</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{group._count.contributions}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Preview */}
        {group.members && group.members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Members ({group._count.members})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {group.members?.map((member, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Member</p>
                    </div>
                  </div>
                ))}
                {group._count.members > group.members.length && (
                  <div className="flex items-center justify-center p-3 border rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      +{group._count.members - group.members.length} more members
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission Info */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-2">
              <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
              <h3 className="font-medium text-sm sm:text-base">What you can see</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {share.permissions === 'VIEW_ONLY' && 'You can view basic group information'}
                {share.permissions === 'REQUEST_JOIN' && 'You can view group info and request to join'}
                {share.permissions === 'LIMITED_ACCESS' && 'You have limited access to group features'}
                {share.permissions === 'FULL_PREVIEW' && 'You can preview most group features'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
