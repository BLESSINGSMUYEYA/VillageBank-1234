import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Settings, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function GroupsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Please sign in to access groups.</div>
  }

  // Get user's groups
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: userId,
    },
    include: {
      group: {
        include: {
          _count: {
            select: { 
              members: true,
              contributions: true,
              loans: true
            }
          }
        }
      }
    },
    orderBy: {
      joinedAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600">Manage your village banking groups</p>
        </div>
        <Link href="/groups/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Groups Grid */}
      {userGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userGroups.map((groupMember) => (
            <Card key={groupMember.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{groupMember.group.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {groupMember.group.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      groupMember.status === 'ACTIVE' ? 'default' :
                      groupMember.status === 'PENDING' ? 'secondary' : 'destructive'
                    }
                  >
                    {groupMember.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Group Role */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Your Role</span>
                  <Badge variant="outline">{groupMember.role}</Badge>
                </div>

                {/* Group Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{groupMember.group._count.members}</p>
                      <p className="text-xs text-gray-500">Members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(groupMember.group.monthlyContribution)}</p>
                      <p className="text-xs text-gray-500">Monthly</p>
                    </div>
                  </div>
                </div>

                {/* Group Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Region:</span>
                    <span>{groupMember.group.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span>{groupMember.group.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Loan Multiplier:</span>
                    <span>{groupMember.group.maxLoanMultiplier}x</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Link href={`/groups/${groupMember.groupId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  {groupMember.role === 'ADMIN' && (
                    <Link href={`/groups/${groupMember.groupId}/settings`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't joined any village banking groups yet.
            </p>
            <Link href="/groups/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
