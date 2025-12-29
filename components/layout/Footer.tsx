import Link from 'next/link'
import { Github, Mail, Phone, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Village Banking System
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
              Empowering communities with transparent, accessible, and modern financial tools. Built for the future of Malawi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-banana/10 text-muted-foreground hover:text-banana transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted/50 hover:bg-banana/10 text-muted-foreground hover:text-banana transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-foreground mb-4 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-banana text-sm font-medium transition-colors inline-flex items-center group">
                  Dashboard
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            © {new Date().getFullYear()} Village Banking System. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
