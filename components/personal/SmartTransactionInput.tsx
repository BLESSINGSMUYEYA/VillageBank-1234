"use client";

import { useState } from "react";
import { parseTransactionFromText, ParsedTransaction } from "@/lib/sms-parser";
import { createTransaction } from "@/lib/transactions";
import { TransactionType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type InputMode = "scan" | "manual";

export default function SmartTransactionInput() {
    const [mode, setMode] = useState<InputMode>("scan");
    const [text, setText] = useState("");
    const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
    const [loading, setLoading] = useState(false);

    // Manual Entry State
    const [manualEntry, setManualEntry] = useState({
        amount: "",
        type: "EXPENSE" as TransactionType,
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
    });

    const router = useRouter();

    const handleParse = () => {
        const result = parseTransactionFromText(text);
        setParsed(result);
    };

    const handleSaveParsed = async () => {
        if (!parsed || !parsed.amount || !parsed.type) return;
        setLoading(true);
        try {
            await createTransaction({
                amount: parsed.amount,
                type: parsed.type as TransactionType,
                description: parsed.description || "",
                date: parsed.date || new Date(),
                category: "General",
            });
            setText("");
            setParsed(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to save transaction", error);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveManual = async () => {
        if (!manualEntry.amount || !manualEntry.type) return;
        setLoading(true);
        try {
            await createTransaction({
                amount: parseFloat(manualEntry.amount),
                type: manualEntry.type,
                description: manualEntry.description,
                date: new Date(manualEntry.date),
                category: "General",
            });
            // Reset form
            setManualEntry({
                amount: "",
                type: "EXPENSE",
                description: "",
                date: format(new Date(), "yyyy-MM-dd"),
            });
            router.refresh();
        } catch (error) {
            console.error("Failed to save transaction", error);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Record Transaction</h3>
                <div className="flex bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setMode("scan")}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${mode === "scan" ? "bg-emerald-500 text-white shadow" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Scan SMS
                    </button>
                    <button
                        onClick={() => setMode("manual")}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${mode === "manual" ? "bg-emerald-500 text-white shadow" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Manual
                    </button>
                </div>
            </div>

            {mode === "scan" ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Paste your bank or mobile money SMS here, and we'll extract the details.
                    </p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste SMS here..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    />

                    {!parsed ? (
                        <button
                            onClick={handleParse}
                            disabled={!text}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Parse SMS
                        </button>
                    ) : (
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-emerald-400 font-medium">Parsed Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500">Amount</span>
                                    <span className="text-white font-medium">MWK {parsed.amount?.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Type</span>
                                    <select
                                        value={parsed.type || "EXPENSE"}
                                        onChange={(e) => setParsed({ ...parsed, type: e.target.value as any })}
                                        className="bg-black/20 text-white rounded px-2 py-1 mt-1 block w-full border border-white/10"
                                    >
                                        <option value="EXPENSE">Expense</option>
                                        <option value="INCOME">Income</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500">Description</span>
                                    <input
                                        type="text"
                                        value={parsed.description || ""}
                                        onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
                                        className="bg-black/20 text-white rounded px-2 py-1 mt-1 block w-full border border-white/10"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500">Date</span>
                                    <span className="text-white">{parsed.date?.toDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setParsed(null)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveParsed}
                                    disabled={loading}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Transaction"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Amount (MWK)</label>
                            <input
                                type="number"
                                value={manualEntry.amount}
                                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                            <select
                                value={manualEntry.type}
                                onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value as TransactionType })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            >
                                <option value="EXPENSE" className="bg-slate-900">Expense</option>
                                <option value="INCOME" className="bg-slate-900">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                            <input
                                type="date"
                                value={manualEntry.date}
                                onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                            <input
                                type="text"
                                value={manualEntry.description}
                                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                                placeholder="e.g. Groceries"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveManual}
                        disabled={loading || !manualEntry.amount}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Add Transaction"}
                    </button>
                </div>
            )}
        </div>
    );
}
