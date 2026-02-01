import SmartTransactionInput from "@/components/personal/SmartTransactionInput";
import TransactionList from "@/components/personal/TransactionList";
import { getTransactionStats, getTransactions } from "@/lib/transactions";
import { PersonalStatsCards } from "@/components/personal/PersonalStatsCards";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

export default async function PersonalFinancePage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    const stats = await getTransactionStats();
    const transactions = await getTransactions();

    return (
        <PageContainer className="relative">
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-y-[-50%]" />

            <PageHeader
                title={
                    <>
                        Personal <span className="text-gradient-primary">Finance</span>
                    </>
                }
                description={`Overview for ${format(new Date(), 'MMMM yyyy')}`}
                badge="Money Management"
                action={
                    <Link href="/personal/lendings">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowRightLeft className="w-4 h-4" />
                            Manage Lendings
                        </Button>
                    </Link>
                }
            />

            <div className="space-y-8 animate-fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Cards */}
                <PersonalStatsCards stats={stats} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Input Section (Left - 5 cols) */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                        <SmartTransactionInput />
                    </div>

                    {/* History Section (Right - 7 cols) */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <TransactionList initialTransactions={transactions} />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
