'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, ShoppingBag, Settings,
  LogOut, Menu, X, Bell, Crown, Plus, Loader2, ChevronRight,
  FileText, Star
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',  href: '/dashboard' },
  { icon: Users,           label: 'Clients',   href: '/dashboard/customers' },
  { icon: ShoppingBag,     label: 'Orders',    href: '/dashboard/orders' },
  { icon: FileText,        label: 'Invoices',  href: '/dashboard/invoices' },
  { icon: Star,            label: 'Reviews',   href: '/dashboard/reviews' },
  { icon: Settings,        label: 'Settings',  href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [profile, setProfile] = useState<{ business_name: string | null; subscription_tier: string } | null>(null)
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
        { data: profileData },
        { data: jobs },
        { data: invoices }
      ] = await Promise.all([
        supabase.from('profiles').select('business_name, subscription_tier').eq('id', user.id).single(),
        // Fixed: was using target_date — correct column is delivery_date
        supabase.from('jobs').select('title, delivery_date').eq('business_id', user.id).neq('status', 'delivered'),
        supabase.from('invoices').select('id, total_amount').eq('business_id', user.id).eq('status', 'unpaid'),
      ])

      setProfile(profileData)

      const notifs: Array<{ id: string; title: string; message: string; type: string; time: string }> = []

      if (profileData?.subscription_tier === 'free') {
        notifs.push({
          id: 'upgrade-reminder',
          title: 'Upgrade to Pro',
          message: 'Unlock unlimited clients, orders, and analytics.',
          type: 'alert',
          time: 'Now',
        })
      }

      if (invoices && invoices.length > 0) {
        notifs.push({
          id: 'unpaid-invoices',
          title: 'Unpaid Invoices',
          message: `${invoices.length} unpaid invoice(s) need attention.`,
          type: 'warning',
          time: 'Pending',
        })
      }

      if (jobs) {
        const soon = new Date()
        soon.setDate(soon.getDate() + 7)
        // Fixed: use delivery_date not target_date
        const dueJobs = jobs.filter(j => j.delivery_date && new Date(j.delivery_date) <= soon)
        if (dueJobs.length > 0) {
          notifs.push({
            id: 'due-jobs',
            title: 'Deadlines Approaching',
            message: `${dueJobs.length} order(s) are due within 7 days.`,
            type: 'warning',
            time: 'Urgent',
          })
        }
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
  const isFreePlan = !profile || profile?.subscription_tier === 'free'

  const notifColorMap: Record<string, string> = {
    alert: 'text-pink-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
  }

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f3fb' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(26,22,37,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: '#1a1625', borderRight: '1px solid #2d2540' }}>

        {/* Brand */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #2d2540' }}>
          <Link href="/" className="flex items-center gap-1 group min-w-0">
            <Image
              src="/logo.png"
              alt="StitchFlow"
              width={48}
              height={48}
              className="object-contain flex-shrink-0"
              style={{ filter: 'brightness(1.15) drop-shadow(0 2px 6px rgba(233,30,140,0.4))' }}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {loadingProfile ? 'Loading…' : (profile?.business_name || 'StitchFlow')}
              </p>
              <p className="text-[11px]" style={{ color: '#8b7fa8' }}>Fashion Designer</p>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg" style={{ color: '#8b7fa8' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isNavActive(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold"
                style={active
                  ? { background: '#e91e8c', color: '#ffffff' }
                  : { color: '#a89cc0' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#261f35'; (e.currentTarget as HTMLElement).style.color = '#ffffff' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89cc0' } }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </Link>
            )
          })}

          {/* Quick Action */}
          <div className="pt-4">
            <Link
              href="/dashboard/orders/new"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold w-full"
              style={{ background: 'rgba(233,30,140,0.12)', color: '#e91e8c', border: '1px solid rgba(233,30,140,0.2)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,30,140,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(233,30,140,0.12)' }}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              <span>New Order</span>
            </Link>
          </div>
        </nav>

        {/* Upgrade Box for Free Users */}
        {isFreePlan && !loadingProfile && (
          <div className="px-3 pb-3">
            <div className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c4177a, #7c3aed)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-center gap-2 mb-1.5 relative z-10">
                <Crown className="w-4 h-4 text-yellow-300" />
                <h4 className="text-xs font-bold text-white">Upgrade to Pro</h4>
              </div>
              <p className="text-[11px] leading-relaxed mb-3 relative z-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Unlimited clients, orders, and analytics.
              </p>
              <Link href="/dashboard/settings">
                <button className="w-full bg-white text-xs font-bold py-2 rounded-xl transition-colors relative z-10" style={{ color: '#c4177a' }}>
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid #2d2540' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-sm font-semibold"
            style={{ color: '#a89cc0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3d1a2e'; (e.currentTarget as HTMLElement).style.color = '#f472b6' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89cc0' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-5 shrink-0" style={{ background: 'white', borderBottom: '1px solid #ede9f6' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: '#6b7280', background: '#f5f3fb' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb / Page Title hint */}
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a89cc0' }}>Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* New Order quick button — desktop */}
            <Link
              href="/dashboard/orders/new"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: '#e91e8c', color: 'white' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Order
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl transition-colors"
                style={{ color: '#6b7280', background: '#f5f3fb' }}
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center" style={{ background: '#e91e8c' }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: 'white', border: '1px solid #ede9f6', animation: 'fadeSlideDown 0.15s ease' }}>
                  <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f3f0fa', background: '#fdf2f8' }}>
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#1a1625' }}>Notifications</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fce7f3', color: '#e91e8c' }}>{notifications.length}</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#f3f0fa]">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${notifColorMap[notif.type] || 'text-gray-500'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px]" style={{ color: '#9ca3af' }}>{notif.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{notif.message}</p>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-xs" style={{ color: '#9ca3af' }}>No new notifications.</div>
                    )}
                  </div>
                  {isFreePlan && (
                    <div className="p-3" style={{ borderTop: '1px solid #f3f0fa', background: '#fdf2f8' }}>
                      <Link href="/dashboard/settings" onClick={() => setIsNotificationsOpen(false)}>
                        <button className="w-full py-2 text-xs font-bold transition-colors" style={{ color: '#e91e8c' }}>
                          Upgrade Workspace →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar */}
            <Link href="/dashboard/settings" className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fdf2f8' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)' }}>
                {loadingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : userInitial}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold leading-tight truncate max-w-[120px]" style={{ color: '#1a1625' }}>
                  {loadingProfile ? 'Loading…' : (profile?.business_name || 'Designer')}
                </p>
                <p className="text-[10px] leading-tight" style={{ color: '#9ca3af' }}>Fashion Designer</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-5 sm:p-8" style={{ background: '#f5f3fb' }}>
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
