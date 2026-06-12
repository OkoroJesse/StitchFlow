'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, User, Phone, MapPin, Scissors, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/button'

interface Customer {
  id: string
  full_name: string
  phone_number: string
  email: string | null
  address: string
  notes: string | null
  created_at: string
  jobs?: { id: string; status: string }[]
}

interface CustomerListClientProps {
  initialCustomers: Customer[]
}

export default function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = initialCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.full_name.toLowerCase().includes(query) ||
      customer.phone_number.toLowerCase().includes(query) ||
      (customer.address && customer.address.toLowerCase().includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER WITH MAIN ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight flex items-center gap-3">
            <span className="p-2 bg-[#e91e8c]/10 rounded-2xl text-[#e91e8c]">
              <User className="w-8 sm:w-9 h-8 sm:h-9" />
            </span>
            Clients
          </h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg">
            Manage your customer database, measurements, and active orders.
          </p>
        </div>
        <Link href="/dashboard/customers/new" className="w-full sm:w-auto">
          <Button icon={<Plus className="w-5 h-5" />} className="w-full sm:w-auto px-8 py-4 text-lg">
            Add New Client
          </Button>
        </Link>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="relative group shadow-sm rounded-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#e91e8c] transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, email, or address..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-4.5 pl-13 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#e91e8c]/10 focus:border-[#e91e8c] transition-all font-semibold text-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* CUSTOMERS GRID */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.map((customer) => {
            const activeJobs = customer.jobs?.filter((job) => job.status !== 'delivered') || []
            
            return (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="group block transition-all hover:-translate-y-1"
              >
                <div className="bg-white border-2 border-gray-100 p-8 rounded-[2rem] hover:border-[#e91e8c]/20 transition-all shadow-xl hover:shadow-2xl hover:shadow-[#e91e8c]/5 relative overflow-hidden h-full flex flex-col justify-between">
                  {/* Subtle Background Accent */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#e91e8c]/5 blur-[60px] group-hover:bg-[#e91e8c]/10 transition-all duration-500 rounded-full" />
                  
                  <div>
                    {/* Header: Initials Avatar + Quick Stats */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#1e1b2e] rounded-2xl flex items-center justify-center text-2xl font-black text-pink-500 shadow-md shadow-[#e91e8c]/10 group-hover:scale-105 transition-transform duration-300">
                        {customer.full_name.charAt(0).toUpperCase()}
                      </div>
                      
                      {activeJobs.length > 0 ? (
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-bold shadow-xs">
                          <Scissors className="w-3.5 h-3.5 animate-pulse" />
                          {activeJobs.length} {activeJobs.length === 1 ? 'Order' : 'Orders'}
                        </span>
                      ) : (
                        <span className="text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-extrabold text-[#1e1b2e] tracking-tight group-hover:text-[#e91e8c] transition-colors line-clamp-1">
                        {customer.full_name}
                      </h3>
                      
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-base text-gray-500 font-medium">
                          <Phone className="w-5 h-5 text-gray-400 group-hover:text-[#e91e8c] transition-colors" />
                          <span>{customer.phone_number}</span>
                        </div>
                        {customer.address && (
                          <div className="flex items-start gap-3 text-base text-gray-500 font-medium">
                            <MapPin className="w-5 h-5 text-gray-400 group-hover:text-[#e91e8c] transition-colors shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action / Footer */}
                  <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between text-base font-bold text-[#1e1b2e]/60 group-hover:text-[#e91e8c] transition-colors">
                    <span>View Profile</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white border-2 border-gray-100 border-dashed rounded-[3rem] space-y-6">
          <div className="w-20 h-20 bg-[#fbfbf9] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2 max-w-md mx-auto px-4">
            <p className="text-[#1e1b2e] font-extrabold text-xl">No clients found</p>
            <p className="text-gray-500 text-base">
              {searchQuery ? "Try refining your search query or clear the filter to see all clients." : "Add your first client to start recording measurements and jobs."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/dashboard/customers/new" className="inline-block">
              <Button icon={<Plus className="w-5 h-5" />}>Add Your First Client</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
