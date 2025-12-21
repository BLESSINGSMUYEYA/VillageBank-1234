'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Settings, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface GroupsContentProps {
    userGroups: any[]
}

export function GroupsContent({ userGroups }: GroupsContentProps) {
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{t('groups.my_groups')}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">{t('groups.manage_desc')}</p>
                </div>
                <Link href="/groups/new">
                    <Button className="w-full sm:w-auto rounded-2xl font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('groups.create_group')}
                    </Button>
                </Link>
            </div>

            {/* Groups Grid */}
            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {userGroups.map((groupMember) => (
                        <Card key={groupMember.id} className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6c47ff]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="relative z-10">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base sm:text-lg font-black truncate">{groupMember.group.name}</CardTitle>
                                        <CardDescription className="mt-1 text-sm line-clamp-2">
                                            {groupMember.group.description || 'No description'}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            groupMember.status === 'ACTIVE' ? 'default' :
                                                groupMember.status === 'PENDING' ? 'secondary' : 'destructive'
                                        }
                                        className="shrink-0 text-xs font-bold uppercase tracking-wider"
                                    >
                                        {groupMember.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                {/* Group Role */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{t('groups.your_role')}</span>
                                    <Badge variant="outline" className="text-xs font-bold bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20">{groupMember.role}</Badge>
                                </div>

                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
                                            <Users className="w-4 h-4 text-green-600 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate">{groupMember.group._count.members}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('groups.members')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                            <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate">{formatCurrency(groupMember.group.monthlyContribution)}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('dashboard.monthly_contribution')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Group Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groups.region')}:</span>
                                        <span className="font-black truncate text-right">{groupMember.group.region}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groups.interest_rate')}:</span>
                                        <span className="font-black">{groupMember.group.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groups.multiplier')}:</span>
                                        <span className="font-black">{groupMember.group.maxLoanMultiplier}x</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Link href={`/groups/${groupMember.groupId}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#6c47ff] hover:text-[#6c47ff] transition-colors">
                                            <Eye className="w-4 h-4 mr-2" />
                                            {t('groups.view')}
                                        </Button>
                                    </Link>
                                    {groupMember.role === 'ADMIN' && (
                                        <Link href={`/groups/${groupMember.groupId}/settings`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full rounded-2xl font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:text-blue-500 transition-colors">
                                                <Settings className="w-4 h-4 mr-2" />
                                                {t('common.settings')}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-lg bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                    <CardContent className="text-center py-8 sm:py-12 px-4">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2">{t('groups.no_groups')}</h3>
                        <p className="text-gray-500 mb-6 text-sm sm:text-base">
                            {t('groups.no_groups_desc')}
                        </p>
                        <Link href="/groups/new">
                            <Button className="w-full sm:w-auto rounded-2xl font-bold">
                                <Plus className="w-4 h-4 mr-2" />
                                {t('groups.create_group')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
