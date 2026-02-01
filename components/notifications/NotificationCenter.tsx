'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, ExternalLink, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PushNotificationManager } from '@/components/pwa/PushNotificationManager'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LoanRequestAction } from './LoanRequestAction'

interface Notification {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'LOAN_REQUEST'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

interface NotificationCenterProps {
  align?: 'left' | 'right'
  side?: 'top' | 'bottom'
}

export function NotificationCenter({
  align = 'right',
  side = 'bottom'
}: NotificationCenterProps) {

  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const intervalId = setInterval(() => {
        // Only fetch if the tab is visible to save resources
        if (document.visibilityState === 'visible') {
          fetchNotifications(true)
        }
      }, 30000)

      return () => clearInterval(intervalId)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  const fetchNotifications = async (isBackground = false) => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      // Only log errors if not a background poll to reduce noise
      if (!isBackground) {
        console.error('Failed to fetch notifications:', error)
      }
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const clearAll = async () => {
    try {
      await fetch('/api/notifications/clear-all', {
        method: 'DELETE'
      })

      setNotifications([])
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-rose-500" />
      default:
        return <Info className="w-5 h-5 text-emerald-500" />
    }
  }

  const NotificationList = () => (
    <>
      <div className="p-4 sm:p-5 border-b border-border bg-white dark:bg-slate-900 flex justify-between items-center relative z-10 gap-2">
        <div className="min-w-0 shrink">
          <h3 className="text-lg font-black text-foreground truncate">Notifications</h3>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-muted-foreground mt-0.5 truncate">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <div className="block">
            <PushNotificationManager />
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[10px] uppercase tracking-widest font-black h-8 px-2 sm:px-3 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-banana"
              title="Mark all read"
            >
              <CheckCheck className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-[10px] uppercase tracking-widest font-black h-8 px-2 sm:px-3 hover:bg-red-500/10 hover:text-red-600"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear All</span>
            </Button>
          )}
        </div>
      </div>

      <div className={cn("overflow-y-auto no-scrollbar", isMobile ? "h-[calc(100vh-180px)]" : "max-h-[80vh] sm:max-h-[450px]")}>
        {loading ? (
          <div className="p-10 text-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
            />
            <p className="text-xs font-bold text-muted-foreground">Loading your alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Bell className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-base font-black text-foreground">All Caught Up!</h3>
            <p className="text-sm font-medium text-muted-foreground mt-2 max-w-[200px] mx-auto">
              No new notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-4 transition-all relative group",
                  notification.actionUrl && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80",
                  !notification.actionUrl && "hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                  !notification.read && "bg-emerald-50/50 dark:bg-emerald-900/10"
                )}
                onClick={(e) => {
                  if (notification.actionUrl) {
                    const target = e.target as HTMLElement
                    if (!target.closest('button')) {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                      window.location.href = notification.actionUrl
                      setIsOpen(false)
                    }
                  }
                }}
              >
                {!notification.read && (
                  <div className="absolute left-1 top-4 bottom-4 w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0 p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className={cn(
                          "text-sm font-black truncate",
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed break-words">
                          {notification.message}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        {/* Interactive Action for Loan Requests */}
                        {(notification.type === 'LOAN_REQUEST' || (notification.actionUrl && notification.actionUrl.startsWith('verify-loan:'))) && notification.actionUrl?.startsWith('verify-loan:') && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <LoanRequestAction
                              lendingId={notification.actionUrl.split(':')[1]}
                              notificationId={notification.id}
                              onComplete={() => {
                                markAsRead(notification.id);
                                // reload notifications to show updated state if needed, or rely on polling
                                fetchNotifications();
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {notification.actionUrl && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ExternalLink className="w-3 h-3" />
                        <span className="uppercase tracking-widest">{notification.actionText || 'Click to view'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-t border-border relative z-10">
          <Link href="/profile" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800">
              View All Notifications
            </Button>
          </Link>
        </div>
      )}
    </>
  )

  const TriggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative rounded-2xl w-10 h-10 transition-all duration-300",
        isOpen ? "bg-white/20 dark:bg-slate-800/40 shadow-inner" : "hover:bg-white/10"
      )}
      onClick={() => isMobile ? undefined : setIsOpen(!isOpen)}
    >
      <Bell className={cn("w-5 h-5 transition-transform duration-300", isOpen && "scale-110")} />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {TriggerButton}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-[2.5rem] p-0 border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {/* Added a handle bar for sheer cue */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full z-50"></div>
          <NotificationList />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {TriggerButton}

      {/* Desktop Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className={cn(
              "absolute z-50 w-[450px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
              side === 'bottom' ? "mt-4 top-full" : "mb-4 bottom-full",
              align === 'right' ? "right-0" : "left-0"
            )}
          >
            <GlassCard
              className="p-0 border-white/40 dark:border-white/20 bg-white/95 dark:bg-slate-900/98 backdrop-blur-3xl shadow-none overflow-hidden"
              hover={false}
              gradient={false}
            >
              <NotificationList />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

