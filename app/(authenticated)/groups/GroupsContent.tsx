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
                    <h1 className="text-display text-gray-900">{t('groups.my_groups')}</h1>
                    <p className="text-body text-gray-600">{t('groups.manage_desc')}</p>
                </div>
                <Link href="/groups/new">
                    <Button className="w-full sm:w-auto rounded-xl font-black">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('groups.create_group')}
                    </Button>
                </Link>
            </div>

            {/* Groups Grid */}
            {userGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {userGroups.map((groupMember) => (
                        <Card key={groupMember.id} className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-none bg-white/60 dark:bg-gray-900/60 backdrop-blur-md overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <CardHeader className="relative z-10 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-h3 truncate">{groupMember.group.name}</CardTitle>
                                        <CardDescription className="text-body line-clamp-2 mt-1">
                                            {groupMember.group.description || t('common.no_description')}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            groupMember.status === 'ACTIVE' ? 'default' :
                                                groupMember.status === 'PENDING' ? 'secondary' : 'destructive'
                                        }
                                        className="shrink-0 font-black text-[10px] uppercase tracking-wider px-2 py-0.5"
                                    >
                                        {groupMember.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                {/* Group Role */}
                                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('groups.your_role')}</span>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider">{groupMember.role}</Badge>
                                </div>

                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
                                            <Users className="w-4 h-4 text-green-600 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate">{groupMember.group._count.members}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('groups.members')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                            <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black truncate">{formatCurrency(groupMember.group.monthlyContribution)}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dashboard.monthly_contribution')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Group Info */}
                                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('groups.region')}</span>
                                        <span className="text-xs font-black truncate text-right">{groupMember.group.region}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('groups.interest_rate')}</span>
                                        <span className="text-xs font-black">{groupMember.group.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('groups.multiplier')}</span>
                                        <span className="text-xs font-black">{groupMember.group.maxLoanMultiplier}x</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Link href={`/groups/${groupMember.groupId}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full rounded-xl font-black bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:text-blue-500 transition-colors">
                                            <Eye className="w-4 h-4 mr-2" />
                                            {t('groups.view')}
                                        </Button>
                                    </Link>
                                    {groupMember.role === 'ADMIN' && (
                                        <Link href={`/groups/${groupMember.groupId}/settings`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full rounded-xl font-black bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-600 hover:text-blue-600 transition-colors">
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
                <Card className="border-none shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md">
                    <CardContent className="text-center py-8 sm:py-12 px-4">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-h3 text-gray-900 mb-2">{t('groups.no_groups')}</h3>
                        <p className="text-body text-gray-500 mb-6">
                            {t('groups.no_groups_desc')}
                        </p>
                        <Link href="/groups/new">
                            <Button className="w-full sm:w-auto rounded-xl font-black px-8">
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
