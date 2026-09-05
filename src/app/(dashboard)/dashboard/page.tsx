import { createClient } from '@/lib/supabase/server'
import {
  Users,
  ShoppingBag,
  FileText,
  Star,
  Clock,
  Plus,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch business profile & studio name
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name')
    .eq('id', user.id)
    .maybeSingle()

  const studioName = profile?.business_name || 'Studio'

  const today = new Date()
  const in3Days = new Date(); in3Days.setDate(today.getDate() + 3)

  // Get job IDs for review query
  const { data: bizJobs } = await supabase
    .from('jobs').select('id, fabric_image_url, style_image_url').eq('business_id', user.id)
  const bizJobIds = (bizJobs || []).map(j => j.id)

  const [
    { count: clientCount },
    { count: activeProjectCount },
    { count: unpaidInvoiceCount },
    { count: reviewCount },
    { data: activeProjects },
    { data: urgentProjects },
    { data: recentCustomers },
    { data: recentReviews },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', user.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', user.id).neq('status', 'delivered'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('business_id', user.id).eq('status', 'unpaid'),
    bizJobIds.length > 0
      ? supabase.from('reviews').select('*', { count: 'exact', head: true }).in('job_id', bizJobIds)
      : Promise.resolve({ count: 0 }),
    supabase.from('jobs')
      .select('id, title, status, agreed_price, delivery_date, fabric_image_url, style_image_url, customers(id, full_name)')
      .eq('business_id', user.id)
      .neq('status', 'delivered')
      .order('delivery_date', { ascending: true })
      .limit(6),
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
    bizJobIds.length > 0
      ? supabase.from('reviews')
          .select('id, rating_fitting, comment, created_at, jobs(title, customers(full_name))')
          .in('job_id', bizJobIds)
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
  ])

  // Resolve signed image URLs for project cards
  if (activeProjects) {
    const { getSignedUrl } = await import('@/lib/supabase/storage')
    for (const proj of activeProjects) {
      if (proj.fabric_image_url) {
        try {
          const signed = await getSignedUrl(proj.fabric_image_url)
          if (signed) proj.fabric_image_url = signed
        } catch (e) {
          // fallback
        }
      }
      if (proj.style_image_url) {
        try {
          const signed = await getSignedUrl(proj.style_image_url)
          if (signed) proj.style_image_url = signed
        } catch (e) {
          // fallback
        }
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* 1. GREETING & TODAY'S FOCUS BANNER */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#fbf0f3] blur-[80px] rounded-full pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-[#4a1525] uppercase tracking-widest bg-[#fbf0f3] px-3 py-1 rounded-full inline-block">
              Daily Studio Briefing
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18131d] tracking-tight">
              Welcome back, {studioName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Here is what needs your attention in the studio today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/orders/new"
              className="py-3 px-5 bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
            <Link
              href="/dashboard/customers?action=new"
              className="py-3 px-4 bg-[#FAF8F5] hover:bg-[#F4F0EA] text-[#1C1917] border border-stone-200 rounded-xl text-xs font-bold transition-all"
            >
              Add Client
            </Link>
          </div>
        </div>

        {/* Studio Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-stone-100">
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Active Projects</span>
            <span className="text-2xl font-black text-[#18131d] italic mt-1 block">{activeProjectCount ?? 0}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Total Clients</span>
            <span className="text-2xl font-black text-[#18131d] italic mt-1 block">{clientCount ?? 0}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Unpaid Invoices</span>
            <span className="text-2xl font-black text-[#18131d] italic mt-1 block">{unpaidInvoiceCount ?? 0}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Client Reviews</span>
            <span className="text-2xl font-black text-[#18131d] italic mt-1 block">{reviewCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 2. URGENT DEADLINES BANNER */}
      {urgentProjects && urgentProjects.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
              {urgentProjects.length} Project{urgentProjects.length > 1 ? 's' : ''} Due Within 3 Days
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {urgentProjects.map((p) => {
                const cust = (Array.isArray(p.customers) ? p.customers[0] : p.customers) as any
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/customers/${cust?.id}?tab=orders`}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    {cust?.full_name} — {p.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. YOUR PROJECTS & WORKSPACE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[#18131d] tracking-tight">Active Studio Projects</h3>
            <Link
              href="/dashboard/orders"
              className="text-xs font-extrabold text-[#4a1525] hover:underline flex items-center gap-1"
            >
              View All Projects <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeProjects && activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProjects.map((p) => {
                const cust = (Array.isArray(p.customers) ? p.customers[0] : p.customers) as any
                const img = p.style_image_url || p.fabric_image_url
                const daysLeft = p.delivery_date
                  ? Math.ceil((new Date(p.delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/customers/${cust?.id}?tab=orders`}
                    className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={p.status} />
                        {daysLeft !== null && (
                          <span
                            className={`text-[10px] font-bold flex items-center gap-1 ${
                              daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-stone-400'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
                          </span>
                        )}
                      </div>

                      {/* Optional Photo or Fallback Graphic */}
                      {img ? (
                        <div className="h-32 rounded-xl overflow-hidden bg-stone-100 relative">
                          <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-24 rounded-xl bg-[#FAF8F5] border border-dashed border-stone-200 flex items-center justify-center text-stone-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[#18131d] group-hover:text-[#4a1525] transition-colors truncate">
                          {p.title}
                        </h4>
                        <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                          Client: <strong className="text-stone-800">{cust?.full_name || 'Client'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="font-black text-[#18131d]">₦{(p.agreed_price || 0).toLocaleString()}</span>
                      <span className="text-[11px] text-[#4a1525] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Open Spec →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-800">Your next creation starts here</h4>
              <p className="text-xs text-stone-500">Create your first project and keep every stage of tailoring organized.</p>
              <Link
                href="/dashboard/orders/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4a1525] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Project
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Clients & Feedback */}
        <div className="space-y-6">
          {/* Recent Clients */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#18131d] uppercase tracking-wider">Recent Clients</h3>
              <Link href="/dashboard/customers" className="text-xs font-bold text-[#4a1525] hover:underline">
                View All
              </Link>
            </div>

            {recentCustomers && recentCustomers.length > 0 ? (
              <div className="space-y-2.5">
                {recentCustomers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/customers/${c.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FAF8F5] transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#4a1525] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-[#18131d] group-hover:text-[#4a1525] transition-colors truncate">
                        {c.full_name}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">{c.phone_number}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-2 text-center">No clients added yet</p>
            )}
          </div>

          {/* Recent Customer Feedback */}
          {recentReviews && (recentReviews as any[]).length > 0 && (
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#18131d] uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Client Reviews
                </h3>
                <Link href="/dashboard/reviews" className="text-xs font-bold text-[#4a1525] hover:underline">
                  All
                </Link>
              </div>

              <div className="space-y-3">
                {(recentReviews as any[]).map((rev) => {
                  const job = rev.jobs
                  const custName = job?.customers?.full_name || 'Client'
                  return (
                    <div key={rev.id} className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#18131d]">{custName}</span>
                        <span className="text-[10px] font-bold text-amber-600">★ {rev.rating_fitting || 5}.0</span>
                      </div>
                      {rev.comment && <p className="text-[11px] text-stone-600 italic">"{rev.comment}"</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
