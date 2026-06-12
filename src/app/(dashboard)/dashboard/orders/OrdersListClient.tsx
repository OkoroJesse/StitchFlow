'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ShoppingBag, Calendar, Clock, Scissors, CreditCard, ExternalLink, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { getStatusStyle, getStatusLabel, JOB_STATUSES } from '@/lib/constants'

interface Customer {
  id: string
  full_name: string
  phone_number: string
}

interface Job {
  id: string
  title: string
  status: string
  agreed_price: number
  delivery_date: string
  created_at: string
  customer_id: string
  fabric_image_url?: string | null
  style_image_url?: string | null
  customers?: Customer | null
}

interface Props {
  initialJobs: Job[]
}

export default function OrdersListClient({ initialJobs }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = initialJobs.filter((job) => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.customers?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Count helper for status tabs
  const getCount = (status: string) => {
    if (status === 'all') return initialJobs.length
    return initialJobs.filter(j => j.status === status).length
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight flex items-center gap-3">
            <span className="p-2 bg-[#e91e8c]/10 rounded-2xl text-[#e91e8c]">
              <ShoppingBag className="w-8 sm:w-9 h-8 sm:h-9" />
            </span>
            Orders
          </h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg font-medium">
            Track and update fabrication workflow streams for all active customer orders.
          </p>
        </div>
        <Link href="/dashboard/orders/new" className="w-full sm:w-auto">
          <Button icon={<Plus className="w-5 h-5" />} className="w-full sm:w-auto px-8 py-4 text-lg">
            New Order
          </Button>
        </Link>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col gap-6">
        <div className="relative group shadow-sm rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#e91e8c] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order title or client name..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4.5 pl-13 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#e91e8c]/10 focus:border-[#e91e8c] transition-all font-semibold text-lg"
          />
        </div>

        {/* Status Filters Horizontal List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm border-2 shrink-0 transition-all flex items-center gap-2 ${
              statusFilter === 'all'
                ? 'bg-[#1e1b2e] text-white border-[#1e1b2e] shadow-md shadow-[#1e1b2e]/10'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            }`}
          >
            <span>All Orders</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {getCount('all')}
            </span>
          </button>

          {JOB_STATUSES.map((status) => {
            const isActive = statusFilter === status.value
            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm border-2 shrink-0 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1e1b2e] text-white border-[#1e1b2e] shadow-md'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                }`}
              >
                <span>{status.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {getCount(status.value)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ORDERS DISPLAY GRID */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => {
            const isUrgent = job.status !== 'delivered' && new Date(job.delivery_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            
            return (
              <Link 
                key={job.id} 
                href={`/dashboard/customers/${job.customer_id}`}
                className="group block transition-all hover:-translate-y-1"
              >
                <div className={`bg-white border-2 rounded-[2rem] p-6.5 hover:border-[#e91e8c]/20 transition-all shadow-lg hover:shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isUrgent ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'
                }`}>
                  
                  {/* Left Column: Avatar/Status & Main text */}
                  <div className="flex items-start sm:items-center gap-5 min-w-0">
                    <div className="w-14 h-14 bg-[#1e1b2e] rounded-2xl flex items-center justify-center shrink-0 text-pink-500 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Scissors className="w-6 h-6" />
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl font-extrabold text-[#1e1b2e] tracking-tight group-hover:text-[#e91e8c] transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                        {isUrgent && (
                          <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">
                            Urgent
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 font-semibold">
                        <span className="text-[#e91e8c] font-bold uppercase tracking-wide">
                          {job.customers?.full_name || 'Anonymous Client'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Deadline: {new Date(job.delivery_date).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Action Button */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-gray-100 md:border-t-0">
                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Agreed Price</p>
                      <p className="text-2xl font-black text-[#1e1b2e] italic mt-0.5">₦{job.agreed_price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 font-bold text-[#e91e8c] text-sm md:opacity-0 group-hover:opacity-100 transition-all">
                      <span>View Client Hub</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white border-2 border-gray-100 border-dashed rounded-[3rem] space-y-6">
          <div className="w-20 h-20 bg-[#fbfbf9] rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2 max-w-md mx-auto px-4">
            <p className="text-[#1e1b2e] font-extrabold text-xl">No orders found</p>
            <p className="text-gray-500 text-base">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search query or status filters."
                : "Create an order workflow for one of your clients to get started."}
            </p>
          </div>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/dashboard/orders/new" className="inline-block">
              <Button icon={<Plus className="w-5 h-5" />}>Add Your First Order</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
