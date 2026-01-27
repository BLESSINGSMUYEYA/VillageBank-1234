import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rouned-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-1 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
