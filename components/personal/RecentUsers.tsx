"use client";

import { memo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RecentUser {
    name: string;
    displayName: string;
    ubankId?: string;
    initials: string;
    netBalance: number;
    lastTransactionDate: Date;
}

interface RecentUsersProps {
    users: RecentUser[];
}

export const RecentUsers = memo(function RecentUsers({ users }: RecentUsersProps) {
    if (users.length === 0) {
        return null; // Don't render if no users
    }

    return (
        <GlassCard
            className="rounded-[2rem] sm:rounded-[2.5rem] bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-emerald-900/5 p-5"
            blur="xl"
            variant="premium"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent
                </h3>
            </div>

            {/* Scrollable User List */}
            <ScrollArea className="w-full whitespace-nowrap pb-2" orientation="horizontal">
                <div className="flex w-max space-x-4">
                    {users.map((user, i) => {
                        const isPositive = user.netBalance > 0;
                        const isNegative = user.netBalance < 0;

                        return (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            >
                                {/* Avatar with Balance Badge */}
                                <div className="relative">
                                    <Avatar className="w-14 h-14 border-2 border-white dark:border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                                            {user.initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Balance Badge */}
                                    <div
                                        className={cn(
                                            "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border-2 border-white dark:border-slate-900",
                                            isPositive && "bg-emerald-500 text-white", // They owe you
                                            isNegative && "bg-rose-500 text-white", // You owe them
                                            user.netBalance === 0 && "bg-slate-400 text-white"
                                        )}
                                    >
                                        {isPositive && "+"}
                                        {isNegative && "-"}
                                        {Math.abs(user.netBalance).toLocaleString()}
                                    </div>
                                </div>

                                {/* User Name */}
                                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 max-w-[4.5rem] truncate text-center">
                                    {user.displayName.split(" ")[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </GlassCard>
    );
});
