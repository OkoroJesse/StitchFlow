'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, User, Phone, MapPin, MoreVertical, Copy, Check, Trash2, ExternalLink, Mail, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { deleteCustomer } from '@/actions/customers'

interface Customer {
  id: string
  full_name: string
  phone_number: string
  email: string | null
  address: string
  notes: string | null
  created_at: string
  jobs?: { id: string; title: string; status: string; agreed_price?: number; created_at?: string; delivery_date?: string }[]
}

interface CustomerListClientProps {
  initialCustomers: Customer[]
}

export default function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCustomers = initialCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.full_name.toLowerCase().includes(query) ||
      (customer.phone_number && customer.phone_number.toLowerCase().includes(query)) ||
      (customer.address && customer.address.toLowerCase().includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    )
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client "${name}"? This action cannot be undone.`)) {
      try {
        await deleteCustomer(id)
        router.refresh()
      } catch (err: any) {
        alert(err.message || 'Failed to delete customer')
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  const getJobsAmount = (customer: Customer) => {
    if (!customer.jobs || customer.jobs.length === 0) return '₦0'
    const total = customer.jobs.reduce((sum, job) => sum + (job.agreed_price || 0), 0)
    return `₦${total.toLocaleString()}`
  }

  const getCustomerStatus = (customer: Customer) => {
    const activeJobs = customer.jobs?.filter(j => j.status !== 'delivered') || []
    return activeJobs.length > 0 ? 'Active Project' : 'Client Profile'
  }

  const getLatestProjectTitle = (customer: Customer) => {
    if (!customer.jobs || customer.jobs.length === 0) return 'No active projects'
    const sorted = [...customer.jobs].sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    })
    return sorted[0].title || 'Untitled Project'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* HEADER WITH TITLE & ACTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black text-[#4a1525] uppercase tracking-widest bg-[#fbf0f3] px-3 py-1 rounded-full inline-block mb-1">
            Fashion CRM
          </span>
          <h1 className="text-2xl font-extrabold text-[#18131d] tracking-tight">
            Client Directory ({initialCustomers.length})
          </h1>
          <p className="text-stone-500 text-xs">
            Manage your client profiles, body measurements, and active fashion projects.
          </p>
        </div>
        <Link href="/dashboard/customers/new" className="w-full sm:w-auto">
          <Button icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto">
            Add New Client
          </Button>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search client name, phone number, email, or address..."
          className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-[#18131d] focus:border-[#4a1525] focus:outline-none transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* CLIENTS TABLE / CARDS */}
      {filteredCustomers.length > 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-stone-200/80 text-[10px] text-stone-400 uppercase tracking-widest font-black">
                  <th className="px-6 py-4 font-black">Client</th>
                  <th className="px-6 py-4 font-black">Contact & Email</th>
                  <th className="px-6 py-4 font-black">Total Value</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black">Latest Project</th>
                  <th className="px-6 py-4 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((customer) => {
                  const status = getCustomerStatus(customer)
                  const isCopied = copiedId === customer.id

                  return (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-[#FAF8F5]/60 transition-colors text-xs text-stone-700 group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#4a1525] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {customer.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-[#18131d] group-hover:text-[#4a1525] transition-colors block text-sm">
                              {customer.full_name}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium">
                              Client since {formatDate(customer.created_at)}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Phone & Email */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#18131d] flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {customer.phone_number || 'No phone'}
                          </p>
                          {customer.email && (
                            <p className="text-[11px] text-stone-400 flex items-center gap-1">
                              <span>{customer.email}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(customer.email || '', customer.id)}
                                className="text-[#4a1525] hover:underline text-[10px] font-bold ml-1"
                              >
                                {isCopied ? 'Copied' : 'Copy'}
                              </button>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Total Projects Value */}
                      <td className="px-6 py-4 font-black text-sm text-[#18131d]">
                        {getJobsAmount(customer)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          status === 'Active Project'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Latest Project */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-stone-800 line-clamp-1 max-w-[180px]">
                          {getLatestProjectTitle(customer)}
                        </span>
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === customer.id ? null : customer.id)
                            }}
                            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdown === customer.id && (
                            <div 
                              ref={dropdownRef}
                              className="absolute right-6 mt-2 w-40 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 text-left overflow-hidden py-1"
                              style={{ top: '70%' }}
                            >
                              <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-[#FAF8F5] text-stone-800 text-xs font-bold"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                                View Profile
                              </Link>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null)
                                  handleDelete(customer.id, customer.full_name)
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-xs font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Client
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-white border-2 border-dashed border-stone-200 rounded-3xl space-y-4">
          <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-stone-400">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <p className="text-[#18131d] font-bold text-base">No client profiles found</p>
            <p className="text-stone-500 text-xs">
              {searchQuery ? "Try refining your search query to find your client." : "Add your first client to start recording body measurements and fashion projects."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/dashboard/customers/new" className="inline-block">
              <Button icon={<Plus className="w-4 h-4" />}>Add Your First Client</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
