'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Scissors, Calendar, ChevronRight, Layers, Tag } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { JOB_STATUSES } from '@/lib/constants'

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

export default function ProjectsList({ initialJobs }: Props) {
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
            <Scissors className="w-4 h-4 text-rose-400" />
            <span>Garment Production Workflow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Client Projects
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light">
            Monitor active commissions, garment fitting schedules, cutting steps, and delivery timelines across all atelier clients.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto shrink-0">
          <Link href="/dashboard/orders/new">
            <Button variant="primary" icon={<Plus className="w-5 h-5" />} className="w-full sm:w-auto shadow-rose-900/30">
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-[#4a1525] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by garment title, client name..."
            className="w-full bg-white border border-stone-200 rounded-2xl py-3.5 pl-12 pr-4 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a1525]/20 focus:border-[#4a1525] transition-all text-sm sm:text-base font-medium shadow-sm"
          />
        </div>

        {/* Status Filters Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all shrink-0 flex items-center gap-2 ${
              statusFilter === 'all'
                ? 'bg-[#18131d] text-white border-[#18131d] shadow-sm'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>All Projects</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
              statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
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
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#18131d] text-white border-[#18131d] shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{status.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                }`}>
                  {getCount(status.value)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PROJECTS GRID */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isUrgent = job.status !== 'delivered' && new Date(job.delivery_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            
            return (
              <Link 
                key={job.id} 
                href={`/dashboard/customers/${job.customer_id}`}
                className="group block transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`bg-white border rounded-2xl p-5 hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between h-full ${
                  isUrgent ? 'border-amber-300 bg-amber-50/10' : 'border-stone-200 hover:border-[#4a1525]/30'
                }`}>
                  
                  {/* Top Bar: Status Badge & Urgent Pill */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={job.status} size="sm" />
                      {isUrgent && (
                        <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Due Soon
                        </span>
                      )}
                    </div>

                    {/* Title & Client Name */}
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#4a1525] transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs font-medium text-[#4a1525] mt-0.5">
                        {job.customers?.full_name || 'Client Unassigned'}
                      </p>
                    </div>

                    {/* Image Preview Thumbnails (Fabric / Style) if present */}
                    {(job.fabric_image_url || job.style_image_url) && (
                      <div className="flex gap-2 pt-1">
                        {job.fabric_image_url && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                            <Image
                              src={job.fabric_image_url}
                              alt="Fabric preview"
                              fill
                              className="object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-medium py-0.5">
                              Fabric
                            </span>
                          </div>
                        )}
                        {job.style_image_url && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                            <Image
                              src={job.style_image_url}
                              alt="Style reference"
                              fill
                              className="object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-medium py-0.5">
                              Style
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Meta & Price */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(job.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="text-right">
                      <p className="font-serif text-base font-bold text-stone-900">
                        ₦{job.agreed_price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-dashed border-stone-200 rounded-3xl space-y-5 p-6">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            <Layers className="w-8 h-8 text-[#4a1525]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-stone-900 font-serif font-bold text-lg">No projects match filters</p>
            <p className="text-stone-500 text-xs sm:text-sm">
              {searchQuery || statusFilter !== 'all' 
                ? "Try adjusting your search query or status filters."
                : "Begin a new bespoke project for your clients."}
            </p>
          </div>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/dashboard/orders/new" className="inline-block">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>Create First Project</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
