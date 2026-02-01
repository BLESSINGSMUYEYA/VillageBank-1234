import SmartTransactionInput from "@/components/personal/SmartTransactionInput";
import TransactionList from "@/components/personal/TransactionList";
import { getTransactionStats } from "@/lib/transactions";
import { PersonalStatsCards } from "@/components/personal/PersonalStatsCards";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PersonalFinancePage() {
    const session = await getSession();
    if (!session?.userId) redirect("/login");

    const stats = await getTransactionStats();

    return (
        <div className="relative min-h-screen pb-20">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                            Personal Finance
                        </h1>
                        <p className="text-slate-400 font-medium">
                            Overview for <span className="text-emerald-400 font-bold">{format(new Date(), 'MMMM yyyy')}</span>
                        </p>
                    </div>
                </div>

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
        </div>
    );
}
