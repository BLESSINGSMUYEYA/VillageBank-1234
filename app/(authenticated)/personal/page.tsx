import SmartTransactionInput from "@/components/personal/SmartTransactionInput";
import TransactionList from "@/components/personal/TransactionList";
import { getTransactionStats } from "@/lib/transactions";
import { PersonalStatsCards } from "@/components/personal/PersonalStatsCards";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function PersonalFinancePage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    const stats = await getTransactionStats();

    return (
        <PageContainer>
            <PageHeader
                title={
                    <>
                        Personal <span className="text-gradient-primary">Finance</span>
                    </>
                }
                description={`Overview for ${format(new Date(), 'MMMM yyyy')}`}
                badge="Money Management"
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
                        <TransactionList />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
