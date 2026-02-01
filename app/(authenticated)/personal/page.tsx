import SmartTransactionInput from "@/components/personal/SmartTransactionInput";
import TransactionList from "@/components/personal/TransactionList";
import { getTransactionStats } from "@/lib/transactions";

export default async function PersonalFinancePage() {
    const stats = await getTransactionStats();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Personal Finance</h1>
                <p className="text-gray-400">Track your personal income and expenses.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 font-medium mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-white">MWK {stats.income.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400 font-medium mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-white">MWK {stats.expense.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400 font-medium mb-1">Net Balance</p>
                    <p className="text-2xl font-bold text-white">MWK {stats.net.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <SmartTransactionInput />
                </div>
                <div>
                    <TransactionList />
                </div>
            </div>
        </div>
    );
}
