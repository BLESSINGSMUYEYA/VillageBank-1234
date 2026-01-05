'use client'

import Link from 'next/link'
import { Github, Mail, Download } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { showInstallPrompt, promptToInstall } = useInstallPrompt()

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                uBank Platform
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
              Empowering communities with transparent, accessible, and modern financial tools. Built for the future of Malawi.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-banana/10 text-muted-foreground hover:text-banana transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-banana/10 text-muted-foreground hover:text-banana transition-colors">
                <Mail className="w-5 h-5" />
              </a>

              {/* Install App Button */}
              {showInstallPrompt && (
                <Button
                  onClick={promptToInstall}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-lg shadow-amber-500/25 ml-2"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Install App
                </Button>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-foreground mb-4 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Groups
                </Link>
              </li>
              <li>
                <Link href="/contributions" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Contributions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black text-foreground mb-4 uppercase tracking-widest">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs font-medium">
            © {new Date().getFullYear()} uBank. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Install button for bottom section (alternative placement) */}
            {showInstallPrompt && (
              <button
                onClick={promptToInstall}
                className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
