'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSignedUrlClient } from '@/lib/supabase/storage-client'
import {
  Home,
  Users,
  ShoppingBag,
  Calendar,
  Ruler,
  FileText,
  Star,
  BarChart3,
  Settings,
  Crown,
  LogOut,
  Bell,
  Plus,
  Menu,
  X,
  Loader2,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react'
import PWAInstallBanner from '@/components/shared/PWAInstallBanner'
import LocalNotificationManager from '@/components/shared/LocalNotificationManager'
import { QuickActionBottomSheet } from '@/components/shared/BottomSheet'
import { normalizePlanId, getPlanConfig } from '@/lib/plans'

// Grouped App Information Architecture
const WORK_NAV = [
  { icon: Users, label: 'Customers', href: '/dashboard/customers' },
  { icon: ShoppingBag, label: 'Projects', href: '/dashboard/orders' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/appointments' },
]

const BUSINESS_NAV = [
  { icon: Ruler, label: 'Measurements', href: '/dashboard/measurements' },
  { icon: FileText, label: 'Invoices', href: '/dashboard/invoices' },
  { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
]

const SETTINGS_NAV = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false)
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [profile, setProfile] = useState<{ business_name: string | null; subscription_tier: string; logo_url: string | null } | null>(null)
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; time: string }>>([])
  const [loadingProfile, setLoadingProfile] = useState(true)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        profileRes,
        { data: jobs },
        { data: invoices }
      ] = await Promise.all([
        supabase.from('profiles').select('business_name, subscription_tier, logo_url').eq('id', user.id).maybeSingle(),
        supabase.from('jobs').select('title, delivery_date').eq('business_id', user.id).neq('status', 'delivered'),
        supabase.from('invoices').select('id, total_amount').eq('business_id', user.id).eq('status', 'unpaid'),
      ])

      let finalProfile = profileRes.data
      const metaName = user.user_metadata?.business_name

      if (!finalProfile) {
        const defaultName = metaName || user.email?.split('@')[0] || 'My Studio'
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            business_name: defaultName,
            subscription_tier: 'basic'
          })
          .select('business_name, subscription_tier, logo_url')
          .single()
        if (newProfile) finalProfile = newProfile
      }

      setProfile(finalProfile)

      if (finalProfile?.logo_url) {
        try {
          const signed = await getSignedUrlClient(finalProfile.logo_url)
          setResolvedLogoUrl(signed)
        } catch (err) {
          console.error('Error resolving logo URL:', err)
        }
      }

      const notifs: Array<{ id: string; title: string; message: string; type: string; time: string }> = []
      // Date urgency check: jobs due within 3 days
      const now = new Date()
      jobs?.forEach((j) => {
        if (j.delivery_date) {
          const due = new Date(j.delivery_date)
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays >= 0 && diffDays <= 3) {
            notifs.push({
              id: `job-${j.title}`,
              title: 'Project Due Soon',
              message: `"${j.title}" is due in ${diffDays === 0 ? 'today' : diffDays + ' day(s)'}!`,
              type: 'urgent',
              time: 'Action Required',
            })
          }
        }
      })
      if (invoices && invoices.length > 0) {
        notifs.push({
          id: 'unpaid-inv',
          title: 'Unpaid Invoices',
          message: `You have ${invoices.length} outstanding invoice(s) awaiting payment.`,
          type: 'info',
          time: 'Payment',
        })
      }
      setNotifications(notifs)
      setLoadingProfile(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const userInitial = profile?.business_name ? profile.business_name.charAt(0).toUpperCase() : 'S'
  const isFreePlan = !profile || normalizePlanId(profile?.subscription_tier) === 'basic'

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] text-[#1C1917]">
      {/* Mobile Drawer Backdrop */}
      {(isSidebarOpen || isMobileMoreOpen) && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => {
            setIsSidebarOpen(false)
            setIsMobileMoreOpen(false)
          }}
        />
      )}

      {/* ── MOBILE MORE SHEET ── */}
      <div className={`
        fixed inset-x-0 bottom-0 z-50 lg:hidden
        bg-[#18131d] text-white rounded-t-3xl shadow-2xl
        transition-transform duration-300 ease-out
        ${isMobileMoreOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="flex flex-col max-h-[70vh]">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-stone-600" />
          </div>

          {/* Sheet header */}
          <div className="px-5 pt-3 pb-4 border-b border-[#2d2533] flex items-center justify-between">
            <span className="text-xs font-black text-stone-300 uppercase tracking-widest">More Options</span>
            <button
              onClick={() => setIsMobileMoreOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#2d2533] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation links */}
          <div className="px-4 py-4 space-y-1 overflow-y-auto">
            {[
              { icon: Calendar, label: 'Calendar & Fittings', href: '/dashboard/appointments' },
              { icon: Ruler, label: 'Measurements', href: '/dashboard/measurements' },
              { icon: FileText, label: 'Invoices', href: '/dashboard/invoices' },
              { icon: Star, label: 'Reviews & Ratings', href: '/dashboard/reviews' },
              { icon: BarChart3, label: 'Business Reports', href: '/dashboard/reports' },
              { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMoreOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  pathname.startsWith(item.href) ? 'bg-[#4a1525] text-white' : 'text-stone-300 hover:bg-[#241e2b] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
                {pathname.startsWith(item.href) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </Link>
            ))}

            {/* Upgrade card */}
            {isFreePlan && !loadingProfile && (
              <div className="mt-4 rounded-2xl p-4 bg-[#241e2b] border border-[#2d2533] space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black">Free Plan Active</span>
                </div>
                <p className="text-[11px] text-stone-400">Upgrade for unlimited clients, projects & custom branding.</p>
                <Link href="/dashboard/settings" onClick={() => setIsMobileMoreOpen(false)}>
                  <button className="w-full py-2.5 text-xs font-bold bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl transition-all">
                    Upgrade Workspace
                  </button>
                </Link>
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={() => { setIsMobileMoreOpen(false); handleLogout() }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all mt-2"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Safe area padding */}
          <div className="h-6 shrink-0" />
        </div>
      </div>

      {/* ── DESKTOP & MOBILE SIDEBAR ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300
        bg-[#18131d] text-white border-r border-[#2d2533]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Bar */}
        <div className="p-5 flex items-center justify-between border-b border-[#2d2533]">
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <Image src="/logo.png" alt="StitchFlow" width={32} height={32} className="object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate leading-tight tracking-tight">
                {loadingProfile ? 'Loading…' : (profile?.business_name || 'StitchFlow')}
              </p>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Fashion Studio</p>
            </div>
          </Link>

          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Quick Action Button */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            className="w-full py-3 px-4 bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto no-scrollbar">
          {/* HOME LINK */}
          <div>
            <Link
              href="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                pathname === '/dashboard' ? 'bg-[#4a1525] text-white' : 'text-stone-300 hover:bg-[#241e2b] hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Workspace</span>
            </Link>
          </div>

          {/* GROUP 1: WORK */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Work</p>
            {WORK_NAV.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    active ? 'bg-[#4a1525] text-white' : 'text-stone-300 hover:bg-[#241e2b] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* GROUP 2: BUSINESS */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Business</p>
            {BUSINESS_NAV.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    active ? 'bg-[#4a1525] text-white' : 'text-stone-300 hover:bg-[#241e2b] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* GROUP 3: SETTINGS */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Settings</p>
            {SETTINGS_NAV.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    active ? 'bg-[#4a1525] text-white' : 'text-stone-300 hover:bg-[#241e2b] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Subscription / Plan indicator */}
        {isFreePlan && !loadingProfile && (
          <div className="px-3 pb-3">
            <div className="rounded-2xl p-4 bg-[#241e2b] border border-[#2d2533] text-white space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black">Free Plan</span>
              </div>
              <p className="text-[11px] text-stone-400">Upgrade for unlimited customers & custom reports.</p>
              <Link href="/dashboard/settings" className="block">
                <button className="w-full py-2 text-xs font-bold bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl transition-all">
                  Upgrade Workspace
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* User Footer */}
        <div className="p-3 border-t border-[#2d2533]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-xs font-extrabold text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">StitchFlow Workspace</span>
              <h2 className="text-sm font-extrabold text-[#18131d]">
                {(() => {
                  const seg = pathname.split('/').filter(Boolean)
                  const page = seg[seg.length - 1] || 'dashboard'
                  const labels: Record<string, string> = {
                    dashboard: 'Home', customers: 'Clients', orders: 'Projects',
                    appointments: 'Calendar', measurements: 'Measurements',
                    invoices: 'Invoices', reviews: 'Reviews', reports: 'Reports',
                    settings: 'Settings', new: 'New Project', feedback: 'Feedback'
                  }
                  // Handle UUIDs in path (e.g. /dashboard/customers/[id])
                  const isUUID = /^[0-9a-f-]{36}$/i.test(page)
                  if (isUUID) {
                    const parentSeg = seg[seg.length - 2] || ''
                    const parentLabel: Record<string, string> = {
                      customers: 'Client Profile', orders: 'Project Detail', invoices: 'Invoice'
                    }
                    return parentLabel[parentSeg] || 'Detail'
                  }
                  return labels[page] || page.charAt(0).toUpperCase() + page.slice(1)
                })()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Trigger Button */}
            <button
              type="button"
              onClick={() => setIsQuickActionOpen(true)}
              className="py-2 px-3.5 bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Action</span>
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-stone-600 hover:text-stone-900 transition-all"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-[100]">
                  <div className="p-4 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-black text-[#18131d] uppercase tracking-wider">Notifications</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-4 space-y-1">
                          <p className="text-xs font-black text-[#18131d]">{n.title}</p>
                          <p className="text-xs text-stone-500">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-stone-400">No new notifications.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <Link href="/dashboard/settings" className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#4a1525] text-white flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                {resolvedLogoUrl ? (
                  <img src={resolvedLogoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 pb-24 lg:pb-8 bg-[#FAF8F5]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAVIGATION BAR (FIXED) ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18131d] text-white border-t border-[#2d2533] px-2 py-2 flex items-center justify-around pb-safe">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              pathname === '/dashboard' ? 'text-[#d9467c] font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link
            href="/dashboard/customers"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              pathname.startsWith('/dashboard/customers') ? 'text-[#d9467c] font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold">Clients</span>
          </Link>

          {/* Center Quick Action Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            className="w-10 h-10 rounded-full bg-[#4a1525] text-white flex items-center justify-center shadow-lg -mt-3 border-2 border-[#18131d]"
          >
            <Plus className="w-6 h-6" />
          </button>

          <Link
            href="/dashboard/orders"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              pathname.startsWith('/dashboard/orders') ? 'text-[#d9467c] font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-bold">Projects</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isMobileMoreOpen ? 'text-[#d9467c] font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </nav>
      </main>

      {/* Quick Action Bottom Sheet */}
      <QuickActionBottomSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />

      <PWAInstallBanner />
      <LocalNotificationManager />
    </div>
  )
}
