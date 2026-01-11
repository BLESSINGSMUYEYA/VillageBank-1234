'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SettingsSidebarProps {
    items: {
        id: string
        label: string
        icon: LucideIcon
        description: string
    }[]
    activeTab: string
    onTabChange: (id: string) => void
}

export function SettingsSidebar({ items, activeTab, onTabChange }: SettingsSidebarProps) {
    return (
        <div className="space-y-1">
            {items.map((item) => {
                const isActive = activeTab === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden group",
                            isActive
                                ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
                                : "hover:bg-white/50 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}

                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive ? "bg-blue-500/20" : "bg-transparent group-hover:bg-white/50 dark:group-hover:bg-white/5"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>

                        <div>
                            <div className="font-bold text-sm tracking-tight">{item.label}</div>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] uppercase tracking-widest opacity-70"
                                >
                                    {item.description}
                                </motion.div>
                            )}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
