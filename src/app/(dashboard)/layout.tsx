'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, Users, Ruler, Calendar, FileText, Star, 
  BarChart3, Settings, LogOut, Menu, X, Bell, Crown, Search, Loader2
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Customers', href: '/dashboard/customers' },
  { icon: Ruler, label: 'Measurements', href: '/dashboard/measurements' },
  { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: FileText, label: 'Invoices', href: '/dashboard/invoices' },
  { icon: Star, label: 'Feedback', href: '/dashboard/feedback' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [profile, setProfile] = useState<{ business_name: string | null, subscription_tier: string } | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
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
        supabase.from('jobs').select('title, target_date').eq('business_id', user.id).neq('status', 'delivered'),
        supabase.from('invoices').select('invoice_number, total_amount').eq('business_id', user.id).eq('status', 'unpaid')
      ])

      setProfile(profileData)

      const notifs = []
      
      if (profileData?.subscription_tier === 'free') {
        notifs.push({
          id: 'upgrade-reminder',
          title: 'Upgrade to Pro',
          message: 'Unlock unlimited clients, projects, and advanced analytics.',
          type: 'alert',
          time: 'Just now'
        })
      } else if (profileData) {
        notifs.push({
          id: 'pro-welcome',
          title: 'Premium Active ✨',
          message: `You're enjoying the full benefits of the ${profileData.subscription_tier} plan.`,
          type: 'success',
          time: 'Active'
        })
      }

      if (invoices && invoices.length > 0) {
        notifs.push({
          id: 'unpaid-invoices',
          title: 'Unpaid Invoices',
          message: `You have ${invoices.length} unpaid invoice(s) requiring attention.`,
          type: 'warning',
          time: 'Pending'
        })
      }

      if (jobs) {
        const soon = new Date()
        soon.setDate(soon.getDate() + 7)
        const dueJobs = jobs.filter(j => j.target_date && new Date(j.target_date) <= soon)
        if (dueJobs.length > 0) {
          notifs.push({
            id: 'due-jobs',
            title: 'Approaching Deadlines',
            message: `${dueJobs.length} project(s) are due within the next 7 days.`,
            type: 'warning',
            time: 'Urgent'
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f7fc' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(26,22,37,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-52 flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ background: '#1a1625', borderRight: '1px solid #2d2540' }}>

        {/* Brand + Business Name */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #2d2540' }}>
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            {/* Mannequin icon */}
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ background: '#e91e8c' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="white" stroke="none"/>
                <path d="M8.5 6.5C7 7.5 6 9 6 11c0 2 1 3.5 2.5 4.5L8 20h8l-.5-4.5C17 14.5 18 13 18 11c0-2-1-3.5-2.5-4.5" />
                <path d="M9 20v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {loadingProfile ? 'Loading…' : (profile?.business_name || 'StitchFlow')}
              </p>
              <p className="text-[10px]" style={{ color: '#8b7fa8' }}>Fashion Designer</p>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1" style={{ color: '#8b7fa8' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium"
                style={isActive
                  ? { background: '#e91e8c', color: '#ffffff' }
                  : { color: '#a89cc0' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#261f35'; (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89cc0' } }}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Upgrade Box for Free Users */}
        {isFreePlan && !loadingProfile && (
          <div className="px-3 pb-3">
            <div className="rounded-xl p-4 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #c4177a, #7c3aed)' }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                <Crown className="w-3.5 h-3.5 text-yellow-300" />
                <h4 className="text-xs font-bold text-white">Upgrade to Pro</h4>
              </div>
              <p className="text-[10px] leading-tight mb-3 relative z-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Unlock more features and grow your fashion business.
              </p>
              <Link href="/dashboard/settings">
                <button className="w-full bg-white text-xs font-bold py-1.5 rounded-lg transition-colors relative z-10" style={{ color: '#c4177a' }}>
                  Upgrade Now
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-2" style={{ borderTop: '1px solid #2d2540' }}>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg transition-all text-xs font-medium"
            style={{ color: '#a89cc0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3d1a2e'; (e.currentTarget as HTMLElement).style.color = '#f472b6' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89cc0' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-12 flex items-center justify-between px-4 shrink-0" style={{ background: 'white', borderBottom: '1px solid #ede9f6' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1 rounded-lg transition-colors"
              style={{ color: '#6b7280' }}
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Search bar */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg w-60 transition-all" style={{ background: '#f8f7fc', border: '1px solid #ede9f6' }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Search customers, jobs…" 
                className="bg-transparent border-none outline-none text-xs w-full"
                style={{ color: '#1a1625' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 rounded-full transition-colors"
                style={{ color: '#6b7280' }}
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center" style={{ background: '#e91e8c' }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl overflow-hidden z-50" style={{ background: 'white', border: '1px solid #ede9f6', animation: 'fadeSlideDown 0.15s ease' }}>
                  <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f3f0fa', background: '#fdf2f8' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#1a1625' }}>Notifications</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fce7f3', color: '#e91e8c' }}>{notifications.length}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#f3f0fa]">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="p-3 cursor-default" style={{ borderBottom: '1px solid #f3f0fa' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${notifColorMap[notif.type] || 'text-gray-500'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px]" style={{ color: '#9ca3af' }}>{notif.time}</span>
                        </div>
                        <p className="text-xs leading-tight" style={{ color: '#6b7280' }}>{notif.message}</p>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-xs" style={{ color: '#9ca3af' }}>No new notifications.</div>
                    )}
                  </div>
                  {isFreePlan && (
                    <div className="p-2" style={{ borderTop: '1px solid #f3f0fa', background: '#fdf2f8' }}>
                      <Link href="/dashboard/settings" onClick={() => setIsNotificationsOpen(false)}>
                        <button className="w-full py-1.5 text-xs font-bold transition-colors" style={{ color: '#e91e8c' }}>
                          Upgrade Workspace →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Avatar + Business Name */}
            <Link href="/dashboard/settings" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-colors cursor-pointer" style={{ border: '1px solid transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fdf2f8'; (e.currentTarget as HTMLElement).style.borderColor = '#fce7f3' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #e91e8c, #7c3aed)' }}>
                {loadingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : userInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight truncate max-w-[110px]" style={{ color: '#1a1625' }}>
                  {loadingProfile ? 'Loading…' : (profile?.business_name || 'Designer')}
                </p>
                <p className="text-[10px] leading-tight" style={{ color: '#9ca3af' }}>Fashion Designer</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6" style={{ background: '#f8f7fc' }}>
          <div className="max-w-5xl mx-auto pb-10">
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
