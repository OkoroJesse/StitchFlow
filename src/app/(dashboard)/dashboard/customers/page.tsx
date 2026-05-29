import { getCustomers } from '@/actions/customers'
import { Plus, Search, User, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/shared/button'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-pink-600" />
          Customer Directory
        </h1>
        <Link href="/dashboard/customers/new">
          <Button icon={<Plus className="w-5 h-5" />}>Add New Client</Button>
        </Link>
      </div>

      {/* SEARCH & FILTERS (UX UPGRADE) */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-pink-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name, phone, or address..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customers && customers.length > 0 ? (
          customers.map((customer) => (
            <Link 
              key={customer.id} 
              href={`/dashboard/customers/${customer.id}`}
              className="block group"
            >
              <div className="bg-white border border-gray-200 p-6 rounded-[2rem] hover:border-[#ede9f6] transition-all shadow-xl hover:shadow-[#e91e8c]/5 relative overflow-hidden h-full">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#e91e8c]/5 blur-[50px] group-hover:bg-pink-50 transition-all" />
                 
                 <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#1e1b2e] rounded-2xl flex items-center justify-center text-xl font-black text-pink-500 shadow-lg shadow-[#e91e8c]/10 transition-transform group-hover:scale-110">
                      {customer.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate uppercase tracking-tight">{customer.full_name}</h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                           <Phone className="w-3 h-3 text-slate-700" />
                           {customer.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
                           <MapPin className="w-3 h-3 text-slate-700" />
                           {customer.address}
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white border border-gray-200 border-dashed rounded-[3rem] space-y-4">
             <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-slate-800" />
             </div>
             <div className="space-y-1">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your directory is empty</p>
                <p className="text-slate-600 text-sm">Add your first client to start creating projects.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
