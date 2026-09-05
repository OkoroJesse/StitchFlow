import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Ruler, Users, Layers, ArrowRight, Inbox } from 'lucide-react'

export default async function MeasurementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: measurements } = await supabase
    .from('measurements')
    .select('*, customers(id, full_name)')
    .eq('business_id', user?.id)
    .order('created_at', { ascending: false })

  const totalProfiles = measurements?.length ?? 0
  const uniqueClients = new Set(measurements?.map((m) => m.customer_id)).size
  const garmentTypes = new Set(
    measurements?.map((m: any) => m.garment_type).filter(Boolean)
  ).size

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
            <Ruler className="w-4 h-4 text-rose-400" />
            <span>Measurement Profiles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Body Measurement Engine
          </h1>
          <p className="text-stone-400 text-sm max-w-lg">
            Categorized garment profiles for every client. Reusable across all projects.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="relative z-10 flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Ruler className="w-5 h-5 text-rose-300 shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Total Profiles</p>
              <p className="text-xl font-black text-white">{totalProfiles}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Users className="w-5 h-5 text-rose-300 shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Clients Measured</p>
              <p className="text-xl font-black text-white">{uniqueClients}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Layers className="w-5 h-5 text-rose-300 shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Garment Types</p>
              <p className="text-xl font-black text-white">{garmentTypes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* INFO CALLOUT */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-black text-amber-900 uppercase tracking-wider">How Measurements Work</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            Measurement profiles are managed directly from each{' '}
            <span className="font-bold">Client Profile</span>. Navigate to a client and open
            the <span className="font-bold">Measurements</span> tab to add or edit garment profiles.
          </p>
        </div>
        <Link
          href="/dashboard/customers"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Go to Client Directory
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* MEASUREMENTS TABLE / EMPTY STATE */}
      {measurements && measurements.length > 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-stone-200/80 text-[10px] text-stone-400 uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Profile Name</th>
                  <th className="px-6 py-4">Garment Type</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {measurements.map((m: any) => {
                  const customer = Array.isArray(m.customers) ? m.customers[0] : m.customers
                  const profileName = m.profile_name || m.label || 'Unnamed Profile'
                  const garmentType = m.garment_type || null
                  const gender = m.gender || null
                  const unit = m.unit || null

                  return (
                    <tr key={m.id} className="hover:bg-[#FAF8F5]/60 transition-colors text-xs text-stone-700 group">
                      {/* Client */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/customers/${customer?.id}`}
                          className="flex items-center gap-3 group/link"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#4a1525] text-white flex items-center justify-center font-black text-xs shrink-0">
                            {(customer?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-[#18131d] group-hover/link:text-[#4a1525] transition-colors">
                            {customer?.full_name || 'Unknown Client'}
                          </span>
                        </Link>
                      </td>

                      {/* Profile Name */}
                      <td className="px-6 py-4">
                        <span className="italic text-stone-600 font-medium">{profileName}</span>
                      </td>

                      {/* Garment Type */}
                      <td className="px-6 py-4">
                        {garmentType ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                            {garmentType}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Gender */}
                      <td className="px-6 py-4">
                        {gender ? (
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            gender === 'WOMEN'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {gender}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="px-6 py-4">
                        {unit ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                            {unit}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-stone-400 font-medium">
                        {new Date(m.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: '2-digit', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white border-2 border-dashed border-stone-200 rounded-3xl space-y-5">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto border border-stone-200">
            <Ruler className="w-8 h-8 text-stone-300" />
          </div>
          <div className="space-y-2 max-w-md mx-auto px-6">
            <p className="text-[#18131d] font-extrabold text-base">No measurement profiles yet</p>
            <p className="text-stone-500 text-xs leading-relaxed">
              Add measurements from a client profile to start tracking body measurements and garment specifications.
            </p>
          </div>
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4a1525] hover:bg-[#5c1d30] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Go to Client Directory
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
