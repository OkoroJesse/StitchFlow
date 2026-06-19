import { createClient } from '@/lib/supabase/server'
import { Users, ShoppingBag, CreditCard, Star, Clock, Plus, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const in3Days = new Date(); in3Days.setDate(today.getDate() + 3)

  // Get all job IDs for this business (needed for review count)
  const { data: bizJobs } = await supabase
    .from('jobs').select('id').eq('business_id', user.id)
  const bizJobIds = (bizJobs || []).map(j => j.id)

  const [
    { count: clientCount },
    { count: activeOrderCount },
    { count: unpaidCount },
    { count: reviewCount },
    { data: recentJobs },
    { data: urgentJobs },
    { data: recentCustomers },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', user.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', user.id).neq('status', 'delivered'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('business_id', user.id).eq('status', 'unpaid'),
    bizJobIds.length > 0
      ? supabase.from('reviews').select('*', { count: 'exact', head: true }).in('job_id', bizJobIds)
      : Promise.resolve({ count: 0 }),
    supabase.from('jobs')
      .select('id, title, status, agreed_price, delivery_date, customers(id, full_name)')
      .eq('business_id', user.id)
      .neq('status', 'delivered')
      .order('delivery_date', { ascending: true })
      .limit(5),
    supabase.from('jobs')
      .select('id, title, delivery_date, customers(id, full_name)')
      .eq('business_id', user.id)
      .neq('status', 'delivered')
      .lte('delivery_date', in3Days.toISOString())
      .order('delivery_date', { ascending: true }),
    supabase.from('customers')
      .select('id, full_name, phone_number, created_at')
      .eq('business_id', user.id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const metrics = [
    { label: 'Clients', value: clientCount ?? 0, icon: Users, href: '/dashboard/customers', color: '#e91e8c', bg: 'rgba(233,30,140,0.08)' },
    { label: 'Active Orders', value: activeOrderCount ?? 0, icon: ShoppingBag, href: '/dashboard/orders', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
    { label: 'Unpaid Invoices', value: unpaidCount ?? 0, icon: CreditCard, href: '/dashboard/invoices', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Reviews', value: reviewCount ?? 0, icon: Star, href: '/dashboard/reviews', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  ]

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    cutting:   'bg-blue-50 text-blue-700 border-blue-200',
    sewing:    'bg-purple-50 text-purple-700 border-purple-200',
    fitting:   'bg-orange-50 text-orange-700 border-orange-200',
    ready:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    delivered: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Urgent Deadlines Banner */}
      {urgentJobs && urgentJobs.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700">
              {urgentJobs.length} order{urgentJobs.length > 1 ? 's' : ''} due within 3 days
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {urgentJobs.map((job) => {
                const customer = (Array.isArray(job.customers) ? job.customers[0] : job.customers) as any
                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/customers/${customer?.id}`}
                    className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309' }}
                  >
                    {customer?.full_name} — {job.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href}>
            <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: metric.bg }}>
                <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none">{metric.value}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{metric.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Active Orders */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Active Orders</h3>
            <Link href="/dashboard/orders" className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors" style={{ color: '#e91e8c' }}>
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentJobs && recentJobs.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentJobs.map((job) => {
                const customer = (Array.isArray(job.customers) ? job.customers[0] : job.customers) as any
                const daysLeft = job.delivery_date
                  ? Math.ceil((new Date(job.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null
                return (
                  <Link key={job.id} href={`/dashboard/customers/${customer?.id}?tab=orders`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: '#f5f3fb', color: '#e91e8c' }}>
                      {customer?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">{customer?.full_name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{job.title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {daysLeft !== null && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#9ca3af' }}>
                          <Clock className="w-3 h-3" />
                          {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d`}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${statusColors[job.status] ?? 'bg-gray-50 text-gray-500'}`}>
                        {job.status}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto border border-gray-100" style={{ background: '#f5f3fb' }}>
                <ShoppingBag className="w-5 h-5" style={{ color: '#c4b5fd' }} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs">No active orders yet</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Create your first order to get started</p>
              </div>
              <Link href="/dashboard/orders/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all text-white" style={{ background: '#e91e8c' }}>
                <Plus className="w-3 h-3" /> New Order
              </Link>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link href="/dashboard/orders/new" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-bold text-xs" style={{ background: '#e91e8c', color: 'white' }}>
                <Plus className="w-4 h-4 flex-shrink-0" />
                Create New Order
              </Link>
              <Link href="/dashboard/customers/new" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-bold text-xs border" style={{ background: '#f5f3fb', color: '#1a1625', borderColor: '#ede9f6' }}>
                <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#e91e8c' }} />
                Add New Client
              </Link>
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Recent Clients</h3>
              <Link href="/dashboard/customers" className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#e91e8c' }}>
                View All
              </Link>
            </div>
            {recentCustomers && recentCustomers.length > 0 ? (
              <div className="space-y-2">
                {recentCustomers.map((c) => (
                  <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style={{ background: '#1e1b2e', color: '#e91e8c' }}>
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate leading-none">{c.full_name}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-1 leading-none">{c.phone_number}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-3">No clients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
