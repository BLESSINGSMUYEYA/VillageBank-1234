'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, CreditCard, TrendingUp, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface LoansClientProps {
    loans: any[]
    eligibilityChecks: any[]
}

export function LoansClient({ loans, eligibilityChecks }: LoansClientProps) {
    const { t } = useLanguage()

    // Calculate loan stats
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const pendingLoans = loans.filter(l => l.status === 'PENDING')
    const completedLoans = loans.filter(l => l.status === 'COMPLETED')

    const totalBorrowed = loans
        .filter(l => l.status === 'ACTIVE' || l.status === 'COMPLETED')
        .reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0)

    const totalRepaid = loans
        .filter(l => l.status === 'COMPLETED')
        .reduce((sum, l) => sum + l.repayments.reduce((repSum: number, rep: any) => repSum + Number(rep.amount), 0), 0)

    return (
        <div className="space-y-8 animate-fade-in relative pb-10">
            {/* Nano Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2">
                        {t('loans.title')}
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg">
                        {t('loans.subtitle')}
                    </p>
                </div>
                {eligibilityChecks.some(check => check.eligible) && (
                    <Link href="/loans/new">
                        <Button className="w-full sm:w-auto bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 px-6 h-12">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('loans.request_loan')}
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Cards - Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{t('loans.active_loans')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{activeLoans.length}</div>
                        <p className="text-xs text-blue-200 mt-1 font-medium opacity-80">
                            {formatCurrency(activeLoans.reduce((sum, l) => sum + Number(l.amountApproved || l.amountRequested), 0))} outstanding
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('loans.pending_approval')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{pendingLoans.length}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Applications under review</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('loans.total_borrowed')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-foreground">{formatCurrency(totalBorrowed)}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Lifetime volume</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('loans.total_repaid')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{formatCurrency(totalRepaid)}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Successfully repaid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loan Eligibility Offers */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-foreground px-1">{t('loans.eligibility_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {eligibilityChecks.map((check) => (
                        <div key={check.group.id} className={`relative rounded-3xl p-1 transition-all duration-300 ${check.eligible ? 'bg-gradient-to-br from-banana via-yellow-400 to-orange-400 shadow-xl' : 'bg-border/50'}`}>
                            {check.eligible && (
                                <div className="absolute -top-3 left-6 bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
                                    Pre-Approved
                                </div>
                            )}
                            <div className="bg-card h-full rounded-[1.4rem] p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/50">
                                            {check.eligible ? <CreditCard className="w-5 h-5 text-banana" /> : <AlertCircle className="w-5 h-5 text-muted-foreground" />}
                                        </div>
                                        {check.eligible && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shadow-none text-[10px] uppercase font-black tracking-wider">Eligible</Badge>}
                                    </div>
                                    <h3 className="text-lg font-black text-foreground mb-1">{check.group.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {check.eligible
                                            ? `You can borrow up to ${formatCurrency(check.maxLoanAmount)} based on your ${check.group.maxLoanMultiplier}x multiplier.`
                                            : `Increase your contributions to unlock borrowing power.`}
                                    </p>
                                </div>

                                {check.eligible ? (
                                    <Link href={`/loans/new?groupId=${check.group.id}`} className="mt-4 block">
                                        <Button className="w-full rounded-xl font-bold bg-banana hover:bg-yellow-400 text-banana-foreground shadow-sm">
                                            Apply Now <DollarSign className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-border/50 text-xs text-center text-muted-foreground font-medium">
                                        Make {3 - check.contributionsCount} more contributions
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loan History Table */}
            <Card className="bg-card border border-border/50 shadow-lg overflow-hidden rounded-3xl mt-8">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-xl font-black text-foreground">{t('loans.loan_history')}</CardTitle>
                    <CardDescription className="text-sm font-medium">{t('loans.history_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Group</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right">Amount</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right">Status</TableHead>
                                        <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loans.map((loan) => (
                                        <TableRow key={loan.id} className="hover:bg-muted/40 transition-colors border-border/50">
                                            <TableCell className="font-bold text-sm text-foreground py-4">{loan.group.name}</TableCell>
                                            <TableCell className="font-black text-sm text-foreground text-right">{formatCurrency(Number(loan.amountApproved || loan.amountRequested))}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className={`rounded-lg font-bold border-none px-2.5 py-1 ${loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        loan.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {loan.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-muted-foreground text-right">{formatDate(loan.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-foreground mb-2">{t('loans.no_loans')}</h3>
                            <p className="text-muted-foreground mb-8 text-sm max-w-sm mx-auto">{t('loans.no_loans_desc')}</p>
                            {eligibilityChecks.some(check => check.eligible) ? (
                                <Link href="/loans/new">
                                    <Button className="rounded-xl font-black bg-banana hover:bg-yellow-400 text-banana-foreground px-6 py-6 shadow-lg hover:scale-105 transition-all">{t('loans.apply_first')}</Button>
                                </Link>
                            ) : (
                                <Link href="/contributions">
                                    <Button variant="outline" className="rounded-xl font-bold">{t('loans.make_contributions_first')}</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
