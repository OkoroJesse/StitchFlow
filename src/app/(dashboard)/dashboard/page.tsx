import { createClient } from '@/lib/supabase/server'
import { Users, ShoppingBag, CreditCard, Star, Clock, Inbox, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // FETCH REAL-WORLD BUSINESS ANALYTICS
  const [
    { count: clientCount },
    { count: fabricationCount },
    { count: billingCount },
    { data: activeStream }
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', user.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('business_id', user.id).neq('status', 'delivered'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('business_id', user.id).eq('status', 'unpaid'),
    supabase.from('jobs').select('*, customers(full_name)').eq('business_id', user.id).order('created_at', { ascending: false }).limit(5)
  ])

  const metrics = [
    { label: 'Real Customers', value: clientCount || 0, icon: Users, theme: 'text-pink-600', bgTheme: 'bg-pink-50 border-pink-100' },
    { label: 'Ongoing Work', value: fabricationCount || 0, icon: ShoppingBag, theme: 'text-gray-600', bgTheme: 'bg-gray-50 border-gray-100' },
    { label: 'Unpaid Invoices', value: billingCount || 0, icon: CreditCard, theme: 'text-gray-600', bgTheme: 'bg-gray-50 border-gray-100' },
    { label: 'Verified Reviews', value: '0', icon: Star, theme: 'text-gray-600', bgTheme: 'bg-gray-50 border-gray-100' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Live Metrics Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white border border-gray-200 p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${metric.bgTheme} ${metric.theme}`}>
              <metric.icon className="w-6 h-6 font-bold" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{metric.value}</p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Fabrication Insight Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Live Job Stream */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-white">
             <h3 className="text-xl font-bold text-gray-900 tracking-tight">Active Fabrication Stream</h3>
             <Link href="/dashboard/customers" className="text-[11px] font-bold text-pink-600 uppercase tracking-widest hover:text-pink-700 transition-colors">View Directory</Link>
          </div>
          <div className="p-0 overflow-x-auto">
            {activeStream && activeStream.length > 0 ? (
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                  <tr>
                    <th className="px-6 sm:px-8 py-4">Client</th>
                    <th className="px-6 sm:px-8 py-4">Project Reference</th>
                    <th className="px-6 sm:px-8 py-4">Workflow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeStream.map((job) => (
                    <tr key={job.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                      <td className="px-6 sm:px-8 py-5 font-bold text-gray-900 uppercase text-sm tracking-tight">{job.customers.full_name}</td>
                      <td className="px-6 sm:px-8 py-5 text-gray-500 text-sm italic">{job.title}</td>
                      <td className="px-6 sm:px-8 py-5">
                        <span className="px-3 py-1 text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200/50 rounded-full uppercase tracking-widest">
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center space-y-3">
                 <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                   <Inbox className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your fabrication stream is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Fabrication Summary Card */}
        <div className="bg-[#1e1b2e] rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[60px]" />
           <div className="space-y-3 relative z-10">
              <ShoppingBag className="w-10 h-10 text-pink-500/80 mb-2" />
              <h3 className="text-2xl font-black tracking-tight leading-tight">Ready to design something new?</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[200px]">Instantly launch a new project and capture measurements.</p>
           </div>
           <Link href="/dashboard/jobs/new" className="group relative z-10 mt-8">
              <div className="w-full bg-pink-500 text-white py-4 sm:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs text-center shadow-lg hover:bg-pink-400 hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2">
                Start New Project
                <ChevronRight className="w-4 h-4" />
              </div>
           </Link>
        </div>
      </div>
    </div>
  )
}
