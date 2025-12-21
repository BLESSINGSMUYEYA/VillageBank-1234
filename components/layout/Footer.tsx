import Link from 'next/link'
import { Github, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-none shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
              Village Banking System
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Community banking management system designed for Malawi villages and groups. 
              Empowering local communities through transparent financial management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#6c47ff] transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#6c47ff] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#6c47ff] transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Groups
                </Link>
              </li>
              <li>
                <Link href="/contributions" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Contributions
                </Link>
              </li>
              <li>
                <Link href="/loans" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Village Banking System. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-[#6c47ff] text-sm font-medium transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
