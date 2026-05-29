import { createClient } from '@/lib/supabase/server'
import { Ruler, Inbox } from 'lucide-react'

export default async function MeasurementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: measurements } = await supabase
    .from('measurements')
    .select('*, customers(full_name)')
    .eq('business_id', user?.id)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Ruler className="w-8 h-8 text-pink-600" />
          Client Measurements
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAF8]/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
            <tr>
              <th className="px-10 py-5">Customer</th>
              <th className="px-10 py-5">Version Name</th>
              <th className="px-10 py-5">Last Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {measurements && measurements.length > 0 ? (
              measurements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6 font-bold text-gray-900 tracking-tight uppercase text-sm">{m.customers.full_name}</td>
                  <td className="px-10 py-6 text-gray-500 text-sm italic">{m.label}</td>
                  <td className="px-10 py-6 text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-10 py-20 text-center text-slate-600 uppercase tracking-widest text-[10px] font-bold">
                  <Inbox className="w-8 h-8 mx-auto mb-4 opacity-20" />
                  No measurement logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
