import { Users, Database, Globe, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminGlassCard } from '@/components/admin/AdminGlassCard'

export function QuickActionsWidget() {
    return (
        <AdminGlassCard title="Quick Actions" description="Common administrative tasks">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 p-3 md:p-6">
                <Button variant="outline" className="h-14 sm:h-24 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-2 px-6 sm:px-0 hover:bg-primary/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-[0.97] group">
                    <Users className="w-5 h-5 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Add User</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-24 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-2 px-6 sm:px-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 active:scale-[0.97] group">
                    <Database className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Run Backup</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-24 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-2 px-6 sm:px-0 hover:bg-purple-5 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 active:scale-[0.97] group">
                    <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Regions</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-24 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-2 px-6 sm:px-0 hover:bg-rose-5 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 active:scale-[0.97] group">
                    <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-rose-600 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Security</span>
                </Button>
            </div>
        </AdminGlassCard>
    )
}
